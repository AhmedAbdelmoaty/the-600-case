import { describe, expect, it } from "vitest";
import { BRIEF_LENGTH, MEETING_LENGTH, SUPPORTS, claimsFor, initialState, isCorrect, reduce, supports, timeLeft, type Action, type State } from "./engine";

const run = (as: Action[], s: State = initialState()) => as.reduce(reduce, s);
const nexts = (n: number) => Array.from({ length: n }, () => ({ type: "next" }) as Action);
const office: Action[] = [{ type: "start", rng: () => 0.3 }, ...nexts(BRIEF_LENGTH + 1 + MEETING_LENGTH), { type: "enterOffice" }];

describe("Training Evaluation engine", () => {
  it("moves brief → road → meeting → office", () => {
    const s = run(office);
    expect(s.phase).toBe("office");
    expect(s.view).toBe("think");
  });
  it("uses exclusive evidence support rules", () => {
    expect(SUPPORTS).toEqual({ aBetter: ["complaints", "complaintsRate"], bBetter: ["attendance"], equal: ["assignments"], notRep: ["respondents"] });
    expect(supports("aBetter", "satisfaction")).toBe(false);
    expect(supports("bBetter", "projects")).toBe(false);
  });
  it("only notRep + respondents is correct", () => {
    expect(isCorrect("notRep", "respondents")).toBe(true);
    expect(isCorrect("notRep", "attendance")).toBe(false);
    expect(isCorrect("aBetter", "respondents")).toBe(false);
  });
  it("trainer/trainees guesses produce lossGuess", () => {
    for (const id of ["trainer", "trainees"] as const) expect(run([...office, { type: "think", to: "guess" }, { type: "guess", id }, { type: "send" }]).outcome).toBe("lossGuess");
  });
  it("supported superficial claims produce lossData", () => {
    for (const [claim, evidence] of [["aBetter", "complaints"], ["bBetter", "attendance"], ["equal", "assignments"]] as const) {
      expect(run([...office, { type: "think", to: "data" }, { type: "claim", id: claim }, { type: "evidence", id: evidence }, { type: "confirm" }, { type: "send" }]).outcome).toBe("lossData");
    }
  });
  it("notRep backed by respondents wins", () => {
    expect(run([...office, { type: "think", to: "data" }, { type: "claim", id: "notRep" }, { type: "evidence", id: "respondents" }, { type: "confirm" }, { type: "send" }]).outcome).toBe("win");
  });
  it("rejects mismatched evidence", () => {
    const s = run([...office, { type: "think", to: "data" }, { type: "claim", id: "aBetter" }, { type: "evidence", id: "attendance" }, { type: "confirm" }]);
    expect(s.mismatch).toBe(true);
    expect(s.view).toBe("data");
  });
  it("ask path exposes exactly three claims", () => {
    const s = run([...office, { type: "think", to: "ask" }]);
    expect(claimsFor(s)).toHaveLength(3);
    expect(claimsFor(s)).not.toContain("equal");
  });
  it("resetAsk clears the unavailable question", () => {
    const s = run([...office, { type: "think", to: "ask" }, { type: "ask", id: "complaintsOfAll" }, { type: "resetAsk" }]);
    expect(s.asked).toEqual([]);
    expect(s.claim).toBeNull();
    expect(s.evidence).toBeNull();
  });
  it("penalties and timeout remain deterministic", () => {
    expect(run([...office, { type: "think", to: "guess" }, { type: "guess", id: "data" }]).penalty).toBe(10);
    expect(run([...office, { type: "think", to: "data" }]).penalty).toBe(5);
    expect(timeLeft(30, 15)).toBe(75);
    expect(run([...office, { type: "timeout" }]).timedOut).toBe(true);
  });
});
