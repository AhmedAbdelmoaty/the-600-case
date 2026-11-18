// Pure, deterministic game engine for "The 600 Case". No rendering here.
export type FolderId = "selection" | "ambition" | "design";
export type D1Id = "approve_now" | "reject_now" | "inspect_first";
export type TestId = "compare_raw" | "before_after_only" | "fair_test";
export type FinalId = "final_expand" | "final_cancel" | "final_evaluate";

export type Phase =
  "intro" | "dialogueA" | "d1" | "d1fb" | "desk" | "test" | "testFb" | "final" | "end";

export interface State {
  phase: Phase;
  dialogueIndex: number;
  stars: number;
  opened: FolderId[];
  openFolder: FolderId | null;
  decisions: {
    d1?: D1Id | undefined;
    test?: TestId | undefined;
    final?: FinalId | undefined;
  };
  outcome: "win" | "loss" | null;
  order: {
    d1: D1Id[];
    folders: FolderId[];
    test: TestId[];
    final: FinalId[];
  };
}

export const MAX_STARS = 3;
export const FOLDERS: FolderId[] = ["selection", "ambition", "design"];
const D1: D1Id[] = ["approve_now", "reject_now", "inspect_first"];
const TEST: TestId[] = ["compare_raw", "before_after_only", "fair_test"];
const FINAL: FinalId[] = ["final_expand", "final_cancel", "final_evaluate"];

export const DIALOGUE_LENGTH = { dialogueA: 2 } as const;

export function shuffle<T>(arr: T[], rng: () => number): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled;
}

export function initialState(): State {
  return {
    phase: "intro",
    dialogueIndex: 0,
    stars: MAX_STARS,
    opened: [],
    openFolder: null,
    decisions: {},
    outcome: null,
    order: { d1: D1, folders: FOLDERS, test: TEST, final: FINAL },
  };
}

export type Action =
  | { type: "start"; rng?: () => number }
  | { type: "advance" }
  | { type: "chooseD1"; id: D1Id }
  | { type: "openFolder"; id: FolderId }
  | { type: "closeFolder" }
  | { type: "leaveDesk" }
  | { type: "chooseTest"; id: TestId }
  | { type: "chooseFinal"; id: FinalId }
  | { type: "continue" }
  | { type: "retryFinal" }
  | { type: "restart" };

export const isD1Mistake = (id: D1Id) => id !== "inspect_first";
export const isTestMistake = (id: TestId) => id !== "fair_test";

export function reduce(state: State, action: Action): State {
  switch (action.type) {
    case "start": {
      if (state.phase !== "intro") return state;
      const rng = action.rng ?? Math.random;
      return {
        ...initialState(),
        phase: "dialogueA",
        order: {
          d1: shuffle(D1, rng),
          folders: FOLDERS,
          test: shuffle(TEST, rng),
          final: shuffle(FINAL, rng),
        },
      };
    }
    case "advance":
      if (state.phase !== "dialogueA") return state;
      if (state.dialogueIndex + 1 < DIALOGUE_LENGTH.dialogueA) {
        return { ...state, dialogueIndex: state.dialogueIndex + 1 };
      }
      return { ...state, phase: "d1", dialogueIndex: 0 };
    case "chooseD1":
      if (state.phase !== "d1") return state;
      return {
        ...state,
        phase: "d1fb",
        decisions: { ...state.decisions, d1: action.id },
        stars: state.stars - (isD1Mistake(action.id) ? 1 : 0),
      };
    case "openFolder":
      if (state.phase !== "desk" || state.openFolder) return state;
      return {
        ...state,
        openFolder: action.id,
        opened: state.opened.includes(action.id) ? state.opened : [...state.opened, action.id],
      };
    case "closeFolder":
      return state.phase === "desk" ? { ...state, openFolder: null } : state;
    case "leaveDesk":
      if (state.phase !== "desk" || state.opened.length < FOLDERS.length) {
        return state;
      }
      return { ...state, phase: "test", openFolder: null };
    case "chooseTest":
      if (state.phase !== "test") return state;
      return {
        ...state,
        phase: "testFb",
        decisions: { ...state.decisions, test: action.id },
        stars: state.stars - (isTestMistake(action.id) ? 1 : 0),
      };
    case "chooseFinal": {
      if (state.phase !== "final") return state;
      const win = action.id === "final_evaluate" && state.stars >= 1;
      return {
        ...state,
        phase: "end",
        decisions: { ...state.decisions, final: action.id },
        outcome: win ? "win" : "loss",
      };
    }
    case "continue":
      if (state.phase === "d1fb") return { ...state, phase: "desk" };
      if (state.phase === "testFb") return { ...state, phase: "final" };
      return state;
    case "retryFinal":
      if (state.phase !== "end" || state.outcome !== "loss") return state;
      return {
        ...state,
        phase: "final",
        outcome: null,
        decisions: { ...state.decisions, final: undefined },
      };
    case "restart":
      return initialState();
  }
}

export const STAGE_OF: Record<Phase, number> = {
  intro: 1,
  dialogueA: 1,
  d1: 1,
  d1fb: 1,
  desk: 2,
  test: 3,
  testFb: 3,
  final: 4,
  end: 4,
};
