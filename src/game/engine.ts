// Pure, deterministic game engine for "The 600 Case" (V2). No rendering here.
export type Phase = "intro" | "meeting" | "office" | "decision" | "email" | "verdict";
export type RecId = "expand" | "stop" | "pilot";
export type Rank = "expert" | "calculated";

export interface State {
  phase: Phase;
  line: number;
  notebookOpened: boolean;
  officeEntered: boolean;
  picked: RecId | null;
  sent: RecId | null;
  order: RecId[];
  timedOut: boolean;
}

export const DEADLINE_SECONDS = 90;
export const MEETING_LENGTH = 8;
export const CHART_FROM_LINE = 2;
const RECS: RecId[] = ["expand", "stop", "pilot"];

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
    phase: "intro",
    line: 0,
    notebookOpened: false,
    officeEntered: false,
    picked: null,
    sent: null,
    order: RECS,
    timedOut: false,
  };
}

export type Action =
  | { type: "start"; rng?: () => number }
  | { type: "next" }
  | { type: "enterOffice" }
  | { type: "openNotebook" }
  | { type: "toDecision" }
  | { type: "composeEmail" }
  | { type: "backToOffice" }
  | { type: "pick"; id: RecId }
  | { type: "send" }
  | { type: "timeout" }
  | { type: "reviewAgain" }
  | { type: "restart" };

export const isWin = (id: RecId) => id === "pilot";

export function rankOf(state: State): Rank | null {
  if (!state.sent || !isWin(state.sent)) return null;
  return state.notebookOpened ? "expert" : "calculated";
}

export function reduce(state: State, action: Action): State {
  switch (action.type) {
    case "start":
      if (state.phase !== "intro") return state;
      return { ...initialState(), phase: "meeting", order: shuffle(RECS, action.rng ?? Math.random) };
    case "next":
      if (state.phase !== "meeting") return state;
      return state.line + 1 < MEETING_LENGTH
        ? { ...state, line: state.line + 1 }
        : { ...state, phase: "office" };
    case "openNotebook":
      return state.phase === "office" ? { ...state, notebookOpened: true } : state;
    case "enterOffice":
      return state.phase === "office" ? { ...state, officeEntered: true } : state;
    case "toDecision":
      return state.phase === "office" ? { ...state, phase: "decision" } : state;
    case "composeEmail":
      return state.phase === "decision" && state.picked ? { ...state, phase: "email" } : state;
    case "backToOffice":
      return state.phase === "email" || state.phase === "decision" ? { ...state, phase: "office" } : state;
    case "pick":
      return state.phase === "decision" ? { ...state, picked: action.id } : state;
    case "send":
      if (state.phase !== "email" || !state.picked) return state;
      return { ...state, phase: "verdict", sent: state.picked };
    case "timeout":
      if (!state.officeEntered || !["office", "decision", "email"].includes(state.phase)) return state;
      return { ...state, phase: "verdict", sent: null, timedOut: true };
    case "reviewAgain":
      if (state.phase === "verdict" && state.timedOut) return { ...state, phase: "office", picked: null, timedOut: false };
      if (state.phase !== "verdict" || !state.sent || isWin(state.sent)) return state;
      return { ...state, phase: "office", picked: null, sent: null };
    case "restart":
      return initialState();
  }
}

export const STATION_OF: Record<Phase, number> = {
  intro: 1,
  meeting: 1,
  office: 2,
  decision: 3,
  email: 3,
  verdict: 4,
};
