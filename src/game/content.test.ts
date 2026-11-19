import { describe, expect, it } from "vitest";
import { MEETING, NOTEBOOK, RECS } from "./content";

describe("V2 script", () => {
  it("has the 8-line meeting and 5 meeting-note lines", () => {
    expect(MEETING).toHaveLength(8);
    expect(NOTEBOOK).toHaveLength(5);
  });
  it("never names the hidden explanation in the notebook", () => {
    for (const n of NOTEBOOK) expect(n).not.toMatch(/سبب|تحيّز|يعني إن|دليل/);
  });
  it("offers exactly the three agreed recommendations", () => {
    expect(Object.keys(RECS).sort()).toEqual(["expand", "pilot", "stop"]);
  });
});
