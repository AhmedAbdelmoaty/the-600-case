import { describe, expect, it } from "vitest";
import { BRIEF_LENGTH, MEETING_LENGTH, claimsFor, initialState, reduce, timeLeft, type Action, type State } from "./engine";

const run = (as: Action[], s: State = initialState()) => as.reduce(reduce, s);
const nexts = (n: number) => Array.from({ length: n }, () => ({ type: "next" }) as Action);
const office: Action[] = [{ type: "start", rng: () => 0.3 }, ...nexts(BRIEF_LENGTH + 1 + MEETING_LENGTH), { type: "enterOffice" }];

describe("Training Budget Case engine", () => {
  it("brief → road → meeting → office", () => {
    expect(run(office).phase).toBe("office");
    expect(run(office).view).toBe("think");
  });
  it("blaming the trainer or the trainees without data loses", () => {
    expect(run([...office, { type: "think", to: "guess" }, { type: "guess", id: "trainer" }, { type: "send" }]).outcome).toBe("loss");
    expect(run([...office, { type: "think", to: "guess" }, { type: "guess", id: "trainees" }, { type: "send" }]).outcome).toBe("loss");
  });
  it("guessing then asking for data costs 10 seconds and opens the data", () => {
    const s = run([...office, { type: "think", to: "guess" }, { type: "guess", id: "data" }]);
    expect(s.view).toBe("data");
    expect(s.penalty).toBe(10);
  });
  it("opening all data costs 5 seconds", () => {
    expect(run([...office, { type: "think", to: "data" }]).penalty).toBe(5);
    expect(run([...office, { type: "think", to: "ask" }, { type: "ask", id: "allData" }]).penalty).toBe(5);
  });
  it("evidence that does not support the claim is rejected", () => {
    const s = run([...office, { type: "think", to: "data" }, { type: "claim", id: "aBetter" }, { type: "evidence", id: "attendance" }, { type: "confirm" }]);
    expect(s.mismatch).toBe(true);
    expect(s.view).toBe("data");
  });
  it.each([
    ["aBetter", "complaints"],
    ["bBetter", "attendance"],
    ["equal", "assignments"],
  ] as const)("%s backed by %s still loses", (claim, evidence) => {
    const s = run([...office, { type: "think", to: "data" }, { type: "claim", id: claim }, { type: "evidence", id: evidence }, { type: "confirm" }, { type: "send" }]);
    expect(s.outcome).toBe("loss");
  });
  it("survey not representative + respondents 30 vs 45 wins", () => {
    const s = run([...office, { type: "think", to: "data" }, { type: "claim", id: "notRep" }, { type: "evidence", id: "respondents" }, { type: "confirm" }, { type: "send" }]);
    expect(s.outcome).toBe("win");
  });
  it("the ask path shows only 3 claims (no 'teams are equal')", () => {
    const s = run([...office, { type: "think", to: "ask" }]);
    expect(claimsFor(s)).toHaveLength(3);
    expect(claimsFor(s)).not.toContain("equal");
  });
  it("deadline is 120 seconds minus penalties, and timeout ends the game", () => {
    expect(timeLeft(30, 15)).toBe(75);
    expect(run([...office, { type: "timeout" }]).timedOut).toBe(true);
  });
});
