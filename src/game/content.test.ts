import { describe, expect, it } from "vitest";
import { BRIEF, CLAIM_LABELS, EMAIL_BODIES, emailBody, MEETING, METRICS, METRICS_LIST, QUESTIONS, SEIF_MESSAGES, TAKEAWAYS } from "./content";
import { BRIEF_LENGTH, EVIDENCE, MEETING_LENGTH } from "./engine";

describe("Training Evaluation content", () => {
  it("dialogue lengths match the engine", () => {
    expect(BRIEF).toHaveLength(BRIEF_LENGTH);
    expect(MEETING).toHaveLength(MEETING_LENGTH);
  });
  it("contains all eight metrics in progressive order", () => {
    expect(METRICS_LIST.map((m) => m.id)).toEqual(["participants", "complaintsRate", "complaints", "satisfaction", "attendance", "assignments", "projects", "respondents"]);
    expect(Object.keys(METRICS).sort()).toEqual([...EVIDENCE].sort());
  });
  it("uses the agreed values", () => {
    expect([METRICS.participants.a, METRICS.participants.b]).toEqual([50, 50]);
    expect([METRICS.respondents.a, METRICS.respondents.b]).toEqual([30, 45]);
    expect([METRICS.attendance.a, METRICS.attendance.b]).toEqual([75, 95]);
    expect([METRICS.satisfaction.a, METRICS.satisfaction.b]).toEqual([90, 78]);
    expect([METRICS.complaints.a, METRICS.complaints.b]).toEqual([3, 10]);
    expect([METRICS.complaintsRate.a, METRICS.complaintsRate.b]).toEqual([10, 22]);
  });
  it("marks unavailable question and has two Seif nudges", () => {
    expect(QUESTIONS.find((q) => q.id === "complaintsOfAll")?.na).toBe(true);
    expect(SEIF_MESSAGES).toHaveLength(2);
  });
  it("keeps compact claim labels separate from full email copy", () => {
    expect(CLAIM_LABELS.notRep.length).toBeLessThan(EMAIL_BODIES.notRep.length);
    expect(EMAIL_BODIES.notRep).toContain("Survivorship Bias");
  });
  it("preserves existing recommendations for supported pairs", () => {
    for (const [claim, evidence] of [["aBetter", "complaints"], ["aBetter", "complaintsRate"], ["bBetter", "attendance"], ["equal", "assignments"], ["notRep", "respondents"]] as const) {
      expect(emailBody(claim, evidence)).toBe(EMAIL_BODIES[claim]);
    }
  });
  it("uses the same generic recommendation across unrelated evidence", () => {
    expect(emailBody("bBetter", "complaints")).toBe(emailBody("bBetter", "projects"));
    expect(emailBody("notRep", "assignments")).toBe(emailBody("notRep", "attendance"));
    expect(emailBody("trainer", null)).toBe(EMAIL_BODIES.trainer);
  });
  it("provides three takeaways for win and loss", () => {
    expect(TAKEAWAYS.win).toHaveLength(3);
    expect(TAKEAWAYS.loss).toHaveLength(3);
  });
});
