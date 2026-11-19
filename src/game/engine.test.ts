import { describe, expect, it } from "vitest";
import { MEETING_LENGTH, initialState, rankOf, reduce, type Action, type RecId, type State } from "./engine";

const run = (as: Action[], s: State = initialState()) => as.reduce(reduce, s);
const toOffice: Action[] = [{ type: "start", rng: () => 0.3 }, ...Array.from({ length: MEETING_LENGTH }, () => ({ type: "next" }) as Action)];
const send = (id: RecId, extra: Action[] = []): Action[] => [...toOffice, ...extra, { type: "toEmail" }, { type: "pick", id }, { type: "send" }];

describe("The 600 Case V2 engine", () => {
  it("goes meeting → office after all 8 lines, with no questions in the meeting", () => {
    expect(run(toOffice.slice(0, -1)).phase).toBe("meeting");
    expect(run(toOffice).phase).toBe("office");
  });
  it("cannot send without picking", () => {
    expect(run([...toOffice, { type: "toEmail" }, { type: "send" }]).phase).toBe("email");
  });
  it("pilot on two similar groups wins; expand and stop lose", () => {
    expect(rankOf(run(send("pilot")))).toBe("calculated");
    expect(rankOf(run(send("expand")))).toBeNull();
    expect(rankOf(run(send("stop")))).toBeNull();
  });
  it("expert rank needs both the notebook and last-year check", () => {
    expect(rankOf(run(send("pilot", [{ type: "openNotebook" }])))).toBe("calculated");
    expect(rankOf(run(send("pilot", [{ type: "openNotebook" }, { type: "checkLastYear" }])))).toBe("expert");
  });
  it("a loss can go back to the office keeping what was checked; a win cannot", () => {
    const back = reduce(run(send("expand", [{ type: "checkLastYear" }])), { type: "reviewAgain" });
    expect(back.phase).toBe("office");
    expect(back.lastYearChecked).toBe(true);
    expect(back.picked).toBeNull();
    expect(reduce(run(send("pilot")), { type: "reviewAgain" }).phase).toBe("verdict");
  });
});
