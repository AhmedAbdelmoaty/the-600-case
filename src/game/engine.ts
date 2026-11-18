// Pure, deterministic game engine for "The 600 Case". No rendering here.
export type FolderId = "selection" | "baseline" | "design";
export type D1Id = "approve_now" | "reject_now" | "inspect_first";
export type TestId = "compare_raw" | "before_after_only" | "fair_test";
export type FinalId = "final_expand" | "final_cancel" | "final_evaluate";

export type Phase =
  | "intro" | "rules" | "dialogueA" | "d1" | "d1fb" | "desk"
  | "dialogueC" | "evidence" | "evidenceFb" | "dialogueD" | "test" | "testFb"
  | "dialogueE" | "final" | "end";

export interface State {
  phase: Phase;
  dialogueIndex: number;
  stars: number;
  opened: FolderId[];
  openFolder: FolderId | null;
  decisions: { d1?: D1Id | undefined; evidence?: FolderId | undefined; test?: TestId | undefined; final?: FinalId | undefined };
  outcome: "win" | "loss" | null;
  order: { d1: D1Id[]; folders: FolderId[]; test: TestId[]; final: FinalId[] };
}

export const MAX_STARS = 3;
export const FOLDERS: FolderId[] = ["selection", "baseline", "design"];
const D1: D1Id[] = ["approve_now", "reject_now", "inspect_first"];
const TEST: TestId[] = ["compare_raw", "before_after_only", "fair_test"];
const FINAL: FinalId[] = ["final_expand", "final_cancel", "final_evaluate"];

export const DIALOGUE_LENGTH = { dialogueA: 6, dialogueC: 3, dialogueD: 1, dialogueE: 1 } as const;

export function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(): State {
  return {
    phase: "intro", dialogueIndex: 0, stars: MAX_STARS, opened: [], openFolder: null,
    decisions: {}, outcome: null,
    order: { d1: D1, folders: FOLDERS, test: TEST, final: FINAL },
  };
}

export type Action =
  | { type: "start"; rng?: () => number }
  | { type: "rulesOk" }
  | { type: "advance" }
  | { type: "chooseD1"; id: D1Id }
  | { type: "openFolder"; id: FolderId }
  | { type: "closeFolder" }
  | { type: "leaveDesk" }
  | { type: "presentEvidence"; id: FolderId }
  | { type: "chooseTest"; id: TestId }
  | { type: "chooseFinal"; id: FinalId }
  | { type: "continue" }
  | { type: "retryFinal" }
  | { type: "restart" };

export const isD1Mistake = (id: D1Id) => id !== "inspect_first";
export const isTestMistake = (id: TestId) => id !== "fair_test";

const DIALOGUE_NEXT: Partial<Record<Phase, Phase>> = {
  dialogueA: "d1", dialogueC: "evidence", dialogueD: "test", dialogueE: "final",
};

export function reduce(s: State, a: Action): State {
  switch (a.type) {
    case "start": {
      if (s.phase !== "intro") return s;
      const rng = a.rng ?? Math.random;
      return {
        ...initialState(), phase: "rules",
        order: { d1: shuffle(D1, rng), folders: FOLDERS, test: shuffle(TEST, rng), final: shuffle(FINAL, rng) },
      };
    }
    case "rulesOk":
      return s.phase === "rules" ? { ...s, phase: "dialogueA", dialogueIndex: 0 } : s;
    case "advance": {
      const next = DIALOGUE_NEXT[s.phase];
      if (!next) return s;
      const len = DIALOGUE_LENGTH[s.phase as keyof typeof DIALOGUE_LENGTH];
      if (s.dialogueIndex + 1 < len) return { ...s, dialogueIndex: s.dialogueIndex + 1 };
      return { ...s, phase: next, dialogueIndex: 0 };
    }
    case "chooseD1":
      if (s.phase !== "d1") return s;
      return { ...s, phase: "d1fb", decisions: { ...s.decisions, d1: a.id }, stars: s.stars - (isD1Mistake(a.id) ? 1 : 0) };
    case "openFolder":
      if (s.phase !== "desk" || s.openFolder) return s;
      return { ...s, openFolder: a.id, opened: s.opened.includes(a.id) ? s.opened : [...s.opened, a.id] };
    case "closeFolder":
      return s.phase === "desk" ? { ...s, openFolder: null } : s;
    case "leaveDesk":
      if (s.phase !== "desk" || s.opened.length < FOLDERS.length) return s;
      return { ...s, phase: "dialogueC", dialogueIndex: 0, openFolder: null };
    case "presentEvidence":
      // All three folders are valid counter-evidence: never costs a star.
      if (s.phase !== "evidence") return s;
      return { ...s, phase: "evidenceFb", decisions: { ...s.decisions, evidence: a.id } };
    case "chooseTest":
      if (s.phase !== "test") return s;
      return { ...s, phase: "testFb", decisions: { ...s.decisions, test: a.id }, stars: s.stars - (isTestMistake(a.id) ? 1 : 0) };
    case "chooseFinal": {
      if (s.phase !== "final") return s;
      const win = a.id === "final_evaluate" && s.stars >= 1;
      return { ...s, phase: "end", decisions: { ...s.decisions, final: a.id }, outcome: win ? "win" : "loss" };
    }
    case "continue":
      if (s.phase === "d1fb") return { ...s, phase: "desk" };
      if (s.phase === "evidenceFb") return { ...s, phase: "dialogueD", dialogueIndex: 0 };
      if (s.phase === "testFb") return { ...s, phase: "dialogueE", dialogueIndex: 0 };
      return s;
    case "retryFinal":
      if (s.phase !== "end" || s.outcome !== "loss") return s;
      return { ...s, phase: "final", outcome: null, decisions: { ...s.decisions, final: undefined } };
    case "restart":
      return initialState();
  }
}

export const STAGE_OF: Record<Phase, number> = {
  intro: 0, rules: 0, dialogueA: 1, d1: 1, d1fb: 1, desk: 2, dialogueC: 3, evidence: 3, evidenceFb: 3,
  dialogueD: 4, test: 4, testFb: 4, dialogueE: 5, final: 5, end: 5,
};
