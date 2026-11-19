import { describe, expect, it } from "vitest";
import * as content from "./content";

const { D1_OPTIONS, DIALOGUE, FINAL_OPTIONS, FOLDER_CONTENT, SUBTITLE_AR, TAGLINE, TEST_OPTIONS } =
  content;
const INTRO_MISSION = (content as Record<string, unknown>)["INTRO_MISSION"];
const TEST_PROMPT = (content as Record<string, unknown>)["TEST_PROMPT"];

describe("canonical Egyptian Arabic game script", () => {
  it("uses the specified intro copy and two-line opening", () => {
    expect(SUBTITLE_AR).toBe("قضية الـ ٦٠٠ موظف");
    expect(TAGLINE).toBe("تقرير تدريب على مكتب المدير التنفيذي.. وقرار مصيري مستني رأيك كمدير HR.");
    expect(INTRO_MISSION).toEqual(expect.stringContaining("معاك ٣ نجوم ثقة ومصداقية"));
    expect(DIALOGUE.dialogueA).toHaveLength(2);
  });

  it("keeps all canonical choices and the zero-leak test prompt", () => {
    expect(D1_OPTIONS.inspect_first.label).toBe("أراجع التقرير وبيانات الـ ٦٠٠ موظف الأول");
    expect(Object.keys(FOLDER_CONTENT)).toEqual(["selection", "ambition", "design"]);
    expect(TEST_PROMPT).toEqual(expect.not.stringContaining("عشوائ"));
    expect(TEST_OPTIONS.fair_test.label).toContain("A/B Test");
    expect(FINAL_OPTIONS.final_evaluate.label).toBe(
      "نعمل تجربة منضبطة الأول ونقيس الأثر الحقيقي قبل أي توسع",
    );
  });

  it("contains neither the removed disclaimer nor the old HR role", () => {
    const script = JSON.stringify({
      D1_OPTIONS,
      DIALOGUE,
      FINAL_OPTIONS,
      FOLDER_CONTENT,
      INTRO_MISSION,
      TAGLINE,
      TEST_OPTIONS,
      TEST_PROMPT,
    });
    expect(script).not.toContain(["سيناريو تدريبي افتراضي", "مبني على حالة HR"].join(" "));
    expect(script).not.toContain(["مسؤول", "الـHR"].join(" "));
  });
});
