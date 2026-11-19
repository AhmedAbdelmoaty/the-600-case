import { describe, expect, it } from "vitest";
import { MEETING_LENGTH, initialState, rankOf, reduce, type Action, type RecId, type State } from "./engine";

const run = (as: Action[], s: State = initialState()) => as.reduce(reduce, s);
const toOffice: Action[] = [{ type: "start", rng: () => 0.3 }, ...Array.from({ length: MEETING_LENGTH }, () => ({ type: "next" }) as Action)];
const send = (id: RecId, extra: Action[] = []): Action[] => [...toOffice, ...extra, { type: "toDecision" }, { type: "pick", id }, { type: "composeEmail" }, { type: "send" }];

describe("The 600 Case engine", () => {
  it("goes meeting → office after all 8 lines, with no questions in the meeting", () => {
    expect(run(toOffice.slice(0, -1)).phase).toBe("meeting");
    expect(run(toOffice).phase).toBe("office");
  });
  it("cannot compose the email without picking", () => {
    expect(run([...toOffice, { type: "toDecision" }, { type: "composeEmail" }]).phase).toBe("decision");
  });
  it("pilot on two similar groups wins; expand and stop lose", () => {
    expect(rankOf(run(send("pilot")))).toBe("calculated");
    expect(rankOf(run(send("expand")))).toBeNull();
    expect(rankOf(run(send("stop")))).toBeNull();
  });
  it("expert rank needs the meeting summary opened", () => {
    expect(rankOf(run(send("pilot", [{ type: "openNotebook" }])))).toBe("expert");
  });
  it("a loss can go back to the office keeping what was checked; a win cannot", () => {
    const back = reduce(run(send("expand", [{ type: "openNotebook" }])), { type: "reviewAgain" });
    expect(back.phase).toBe("office");
    expect(back.notebookOpened).toBe(true);
    expect(back.picked).toBeNull();
    expect(reduce(run(send("pilot")), { type: "reviewAgain" }).phase).toBe("verdict");
  });
});
