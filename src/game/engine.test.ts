import { describe, it, expect } from "vitest";
import { reduce, initialState, type Action, type State } from "./engine";

const run = (actions: Action[], s: State = initialState()) => actions.reduce(reduce, s);
const adv = (n: number): Action[] => Array.from({ length: n }, () => ({ type: "advance" }) as Action);
const toDesk = (d1: any): Action[] => [{ type: "start", rng: () => 0.3 }, { type: "rulesOk" }, ...adv(6), { type: "chooseD1", id: d1 }, { type: "continue" }];
const openAll: Action[] = (["selection", "baseline", "design"] as const).flatMap((id) => [{ type: "openFolder", id }, { type: "closeFolder" }] as Action[]);
const toFinal = (d1: any, ev: any, test: any): Action[] => [
  ...toDesk(d1), ...openAll, { type: "leaveDesk" }, ...adv(3), { type: "presentEvidence", id: ev }, { type: "continue" },
  ...adv(1), { type: "chooseTest", id: test }, { type: "continue" }, ...adv(1),
];

describe("The 600 Case rules", () => {
  it("hasty approve or reject costs exactly one star; inspecting costs none", () => {
    expect(run(toDesk("approve_now")).stars).toBe(2);
    expect(run(toDesk("reject_now")).stars).toBe(2);
    expect(run(toDesk("inspect_first")).stars).toBe(3);
  });
  it("double tap on D1 does not double-charge", () => {
    const s = run([...toDesk("approve_now").slice(0, -1), { type: "chooseD1", id: "reject_now" }]);
    expect(s.stars).toBe(2);
  });
  it("cannot leave desk before opening all three folders", () => {
    const s = run([...toDesk("inspect_first"), { type: "openFolder", id: "selection" }, { type: "closeFolder" }, { type: "leaveDesk" }]);
    expect(s.phase).toBe("desk");
  });
  it("every folder is valid evidence (no star loss)", () => {
    for (const ev of ["selection", "baseline", "design"]) {
      expect(run(toFinal("inspect_first", ev, "fair_test")).stars).toBe(3);
    }
  });
  it("raw comparison and before/after each cost one star", () => {
    expect(run(toFinal("inspect_first", "design", "compare_raw")).stars).toBe(2);
    expect(run(toFinal("inspect_first", "design", "before_after_only")).stars).toBe(2);
  });
  it("evaluate wins even with two earlier mistakes (1 star)", () => {
    const s = run([...toFinal("approve_now", "selection", "compare_raw"), { type: "chooseFinal", id: "final_evaluate" }]);
    expect(s.outcome).toBe("win");
    expect(s.stars).toBe(1);
  });
  it("expand or cancel always loses, even with 3 stars", () => {
    expect(run([...toFinal("inspect_first", "selection", "fair_test"), { type: "chooseFinal", id: "final_expand" }]).outcome).toBe("loss");
    expect(run([...toFinal("inspect_first", "selection", "fair_test"), { type: "chooseFinal", id: "final_cancel" }]).outcome).toBe("loss");
  });
  it("retrying final keeps stars, restart resets", () => {
    const lost = run([...toFinal("approve_now", "selection", "fair_test"), { type: "chooseFinal", id: "final_cancel" }]);
    const retry = reduce(lost, { type: "retryFinal" });
    expect(retry.phase).toBe("final");
    expect(retry.stars).toBe(2);
    expect(reduce(lost, { type: "restart" }).stars).toBe(3);
  });
});
