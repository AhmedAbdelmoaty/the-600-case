import { describe, expect, it } from "vitest";
import {
  FOLDERS,
  STAGE_OF,
  initialState,
  reduce,
  type Action,
  type D1Id,
  type FinalId,
  type State,
  type TestId,
} from "./engine";

const run = (actions: Action[], state: State = initialState()) => actions.reduce(reduce, state);

const toD1: Action[] = [
  { type: "start", rng: () => 0.3 },
  { type: "advance" },
  { type: "advance" },
];

const toDesk = (decision: D1Id): Action[] => [
  ...toD1,
  { type: "chooseD1", id: decision },
  { type: "continue" },
];

const openAll: Action[] = FOLDERS.flatMap((id) => [
  { type: "openFolder", id },
  { type: "closeFolder" },
]);

const toTest = (decision: D1Id = "inspect_first"): Action[] => [
  ...toDesk(decision),
  ...openAll,
  { type: "leaveDesk" },
];

const toFinal = (d1: D1Id = "inspect_first", test: TestId = "fair_test"): Action[] => [
  ...toTest(d1),
  { type: "chooseTest", id: test },
  { type: "continue" },
];

describe("The 600 Case four-milestone engine", () => {
  it("starts at intro and enters the two-line opening dialogue", () => {
    const start = reduce(initialState(), { type: "start", rng: () => 0.3 });
    expect(initialState().phase).toBe("intro");
    expect(start.phase).toBe("dialogueA");
    expect(run(toD1).phase).toBe("d1");
  });

  it.each([
    ["approve_now", 2],
    ["reject_now", 2],
    ["inspect_first", 3],
  ] as const)("charges the correct D1 cost for %s", (id, stars) => {
    expect(run(toDesk(id)).stars).toBe(stars);
  });

  it("cannot charge a second D1 choice", () => {
    const state = run([
      ...toD1,
      { type: "chooseD1", id: "approve_now" },
      { type: "chooseD1", id: "reject_now" },
    ]);
    expect(state.stars).toBe(2);
    expect(state.decisions.d1).toBe("approve_now");
  });

  it("cannot leave the evidence desk before all three folders are opened", () => {
    const state = run([
      ...toDesk("inspect_first"),
      { type: "openFolder", id: "selection" },
      { type: "closeFolder" },
      { type: "openFolder", id: "ambition" },
      { type: "closeFolder" },
      { type: "leaveDesk" },
    ]);
    expect(state.phase).toBe("desk");
  });

  it("leaves the completed desk directly for test design", () => {
    expect(run(toTest()).phase).toBe("test");
  });

  it.each([
    ["compare_raw", 2],
    ["before_after_only", 2],
    ["fair_test", 3],
  ] as const)("charges the correct test-design cost for %s", (id, stars) => {
    const state = run([...toTest(), { type: "chooseTest", id }, { type: "continue" }]);
    expect(state.phase).toBe("final");
    expect(state.stars).toBe(stars);
  });

  it("wins by evaluating with at least one remaining star", () => {
    const state = run([
      ...toFinal("approve_now", "compare_raw"),
      { type: "chooseFinal", id: "final_evaluate" },
    ]);
    expect(state.stars).toBe(1);
    expect(state.phase).toBe("end");
    expect(state.outcome).toBe("win");
  });

  it.each(["final_expand", "final_cancel"] as FinalId[])(
    "%s always loses even with three stars",
    (id) => {
      const state = run([...toFinal(), { type: "chooseFinal", id }]);
      expect(state.outcome).toBe("loss");
    },
  );

  it("retries only the final milestone without restoring stars", () => {
    const loss = run([
      ...toFinal("approve_now", "fair_test"),
      { type: "chooseFinal", id: "final_cancel" },
    ]);
    const retry = reduce(loss, { type: "retryFinal" });
    expect(retry.phase).toBe("final");
    expect(retry.stars).toBe(2);
    expect(retry.outcome).toBeNull();
    expect(retry.decisions.final).toBeUndefined();
  });

  it("maps every phase onto the four HUD stages", () => {
    expect(STAGE_OF).toEqual({
      intro: 1,
      dialogueA: 1,
      d1: 1,
      d1fb: 1,
      desk: 2,
      test: 3,
      testFb: 3,
      final: 4,
      end: 4,
    });
  });
});
