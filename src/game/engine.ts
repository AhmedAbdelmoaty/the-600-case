export type Phase = "intro" | "brief" | "road" | "meeting" | "office" | "verdict";
export type View = "think" | "guess" | "data" | "ask" | "email";
export type Path = "data" | "ask";
export type ClaimId = "aBetter" | "bBetter" | "equal" | "notRep" | "trainer" | "trainees";
export type EvidenceId = "participants" | "complaintsRate" | "complaints" | "satisfaction" | "attendance" | "assignments" | "projects" | "respondents";
export type QuestionId = "respondents" | "complaintsOfAll" | "attendance" | "complaintsCount" | "allData";
export type Outcome = "win" | "lossGuess" | "lossData";

export const DEADLINE_SECONDS = 120;
export const GUESS_PENALTY = 10;
export const DATA_PENALTY = 5;
export const BRIEF_LENGTH = 1;
export const MEETING_LENGTH = 4;

export const DATA_CLAIMS: ClaimId[] = ["aBetter", "bBetter", "equal", "notRep"];
export const ASK_CLAIMS: ClaimId[] = ["aBetter", "bBetter", "notRep"];
export const EVIDENCE: EvidenceId[] = ["participants", "complaintsRate", "complaints", "satisfaction", "attendance", "assignments", "projects", "respondents"];

export const SUPPORTS: Record<"aBetter" | "bBetter" | "equal" | "notRep", EvidenceId[]> = {
  aBetter: ["complaints", "complaintsRate"],
  bBetter: ["attendance"],
  equal: ["assignments"],
  notRep: ["respondents"],
};

export interface State {
  phase: Phase;
  line: number;
  officeEntered: boolean;
  view: View;
  path: Path | null;
  penalty: number;
  asked: QuestionId[];
  claim: ClaimId | null;
  evidence: EvidenceId | null;
  mismatch: boolean;
  outcome: Outcome | null;
  timedOut: boolean;
  order: ClaimId[];
}

export function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

const officeReset = { view: "think" as View, path: null, asked: [], claim: null, evidence: null, mismatch: false };

export function initialState(): State {
  return { phase: "intro", line: 0, officeEntered: false, penalty: 0, outcome: null, timedOut: false, order: DATA_CLAIMS, ...officeReset };
}

export type Action =
  | { type: "start"; rng?: () => number }
  | { type: "next" }
  | { type: "enterOffice" }
  | { type: "think"; to: "guess" | "data" | "ask" }
  | { type: "guess"; id: "trainer" | "trainees" | "data" }
  | { type: "ask"; id: QuestionId }
  | { type: "resetAsk" }
  | { type: "claim"; id: ClaimId }
  | { type: "evidence"; id: EvidenceId }
  | { type: "confirm" }
  | { type: "backToThink" }
  | { type: "send" }
  | { type: "timeout" }
  | { type: "retry" }
  | { type: "restart" };

export const isCorrect = (claim: ClaimId | null, evidence: EvidenceId | null) => claim === "notRep" && evidence === "respondents";
export const supports = (claim: ClaimId, ev: EvidenceId) => claim in SUPPORTS && SUPPORTS[claim as keyof typeof SUPPORTS].includes(ev);
export const claimsFor = (s: State) => (s.path === "ask" ? s.order.filter((c) => ASK_CLAIMS.includes(c)) : s.order);
export const timeLeft = (elapsed: number, penalty: number) => Math.max(0, DEADLINE_SECONDS - elapsed - penalty);

function toData(s: State, cost: number): State {
  return { ...s, view: "data", path: "data", penalty: s.penalty + cost, claim: null, evidence: null, mismatch: false };
}

export function reduce(s: State, a: Action): State {
  const inOffice = s.phase === "office" && s.officeEntered;
  switch (a.type) {
    case "start":
      return s.phase === "intro" ? { ...initialState(), phase: "brief", order: shuffle(DATA_CLAIMS, a.rng ?? Math.random) } : s;
    case "next":
      if (s.phase === "brief") return { ...s, phase: "road", line: 0 };
      if (s.phase === "road") return { ...s, phase: "meeting", line: 0 };
      if (s.phase === "meeting") return s.line + 1 < MEETING_LENGTH ? { ...s, line: s.line + 1 } : { ...s, phase: "office", line: 0 };
      return s;
    case "enterOffice":
      return s.phase === "office" ? { ...s, officeEntered: true } : s;
    case "think":
      if (!inOffice || s.view !== "think") return s;
      if (a.to === "data") return toData(s, DATA_PENALTY);
      return { ...s, view: a.to, path: a.to === "ask" ? "ask" : null };
    case "guess":
      if (!inOffice || s.view !== "guess") return s;
      if (a.id === "data") return toData(s, GUESS_PENALTY);
      return { ...s, claim: a.id, evidence: null, view: "email" };
    case "ask":
      if (!inOffice || s.view !== "ask") return s;
      if (a.id === "allData") return toData(s, DATA_PENALTY);
      return s.asked.length ? s : { ...s, asked: [a.id] };
    case "resetAsk":
      if (!inOffice || s.view !== "ask") return s;
      return { ...s, asked: [], claim: null, evidence: null, mismatch: false };
    case "claim":
      if (!inOffice || (s.view !== "data" && s.view !== "ask") || !claimsFor(s).includes(a.id)) return s;
      if (s.path === "ask" && s.evidence) return { ...s, claim: a.id, mismatch: !supports(a.id, s.evidence) };
      return { ...s, claim: a.id, evidence: null, mismatch: false };
    case "evidence":
      if (!inOffice || !s.claim || (s.view !== "data" && s.view !== "ask")) return s;
      return { ...s, evidence: a.id, mismatch: !supports(s.claim, a.id) };
    case "confirm":
      if (!inOffice || !s.claim || !s.evidence || s.mismatch) return s;
      return { ...s, view: "email" };
    case "backToThink":
      return {
        ...s,
        phase: "office",
        officeEntered: true,
        penalty: 0,
        outcome: null,
        timedOut: false,
        ...officeReset,
      };
    case "send": {
      if (!inOffice || s.view !== "email" || !s.claim) return s;
      let outcome: Outcome = "lossData";
      if (s.claim === "trainer" || s.claim === "trainees") outcome = "lossGuess";
      else if (isCorrect(s.claim, s.evidence)) outcome = "win";
      return { ...s, phase: "verdict", outcome };
    }
    case "timeout":
      return inOffice ? { ...s, phase: "verdict", outcome: null, timedOut: true } : s;
    case "retry":
      if (s.phase !== "verdict" || s.outcome === "win") return s;
      return { ...s, phase: "office", officeEntered: false, penalty: 0, outcome: null, timedOut: false, ...officeReset };
    case "restart":
      return initialState();
  }
}
