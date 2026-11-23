import { describe, expect, it } from "vitest";
import { BRIEF, MEETING, METRICS, QUESTIONS, ROAD } from "./content";
import { BRIEF_LENGTH, MEETING_LENGTH } from "./engine";

describe("script", () => {
  it("dialogue lengths match the engine", () => {
    expect(BRIEF).toHaveLength(BRIEF_LENGTH);
    expect(MEETING).toHaveLength(MEETING_LENGTH);
  });
  it("uses the agreed numbers", () => {
    expect([METRICS.respondents.a, METRICS.respondents.b]).toEqual([30, 45]);
    expect([METRICS.attendance.a, METRICS.attendance.b]).toEqual([75, 95]);
    expect([METRICS.satisfaction.a, METRICS.satisfaction.b]).toEqual([90, 80]);
  });
  it("never explains the missing respondents before the choice", () => {
    const pre = [...BRIEF, ...MEETING, ROAD].map((l) => l.text).join(" ") + QUESTIONS.map((q) => q.text).join(" ");
    for (const w of ["لم يشارك", "20 موظف", "تحيز", "لا يمثل"]) expect(pre).not.toContain(w);
  });
});
