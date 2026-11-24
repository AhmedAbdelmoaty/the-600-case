import { describe, expect, it } from "vitest";
import { BRIEF_LENGTH, MEETING_LENGTH, DATA_PREPARATION_SECONDS, DATA_CLAIMS, EVIDENCE, SUPPORTS, claimsFor, initialState, isCorrect, reduce, supports, timeLeft, type Action, type State } from "./engine";

const run = (as: Action[], s: State = initialState()) => as.reduce(reduce, s);
const nexts = (n: number) => Array.from({ length: n }, () => ({ type: "next" }) as Action);
const office: Action[] = [{ type: "start", rng: () => 0.3 }, ...nexts(BRIEF_LENGTH + 1 + MEETING_LENGTH), { type: "enterOffice" }];
const data: Action[] = [...office, { type: "think", to: "data" }, { type: "dataReady" }];

describe("Training Evaluation engine", () => {
  it("keeps both briefing messages before leaving and five meeting messages", () => {
    expect(BRIEF_LENGTH).toBe(2);
    expect(MEETING_LENGTH).toBe(5);
    expect(run([{ type: "start" }, { type: "next" }]).phase).toBe("brief");
    expect(run(office).view).toBe("think");
    expect(run(office).phase).toBe("office");
  });
  it("preserves supporting evidence mapping for recommendation copy", () => {
    expect(SUPPORTS).toEqual({ aBetter: ["complaints", "complaintsRate"], bBetter: ["attendance"], equal: ["assignments"], notRep: ["respondents"] });
    expect(supports("aBetter", "satisfaction")).toBe(false);
  });
  it("requires evidence before a conclusion", () => {
    expect(run([...data, { type: "claim", id: "equal" }]).claim).toBeNull();
    const s = run([...data, { type: "evidence", id: "assignments" }, { type: "claim", id: "equal" }]);
    expect(s.evidence).toBe("assignments");
    expect(s.claim).toBe("equal");
    expect(claimsFor(s)).not.toContain("notRep");
  });
  it("allows every pair to reach the email and only respondents plus notRep wins", () => {
    for (const evidence of EVIDENCE) for (const claim of DATA_CLAIMS) {
      const email = run([...data, { type: "evidence", id: evidence }, { type: "claim", id: claim }, { type: "confirm" }]);
      expect(email.view).toBe("email");
      expect(email.mismatch).toBe(false);
      expect(reduce(email, { type: "send" }).outcome).toBe("lossData");
    }
    expect(isCorrect("notRep", "attendance")).toBe(false);
  });
  it("review analysis returns one step back, keeping choices", () => {
    const email = run([...data, { type: "evidence", id: "assignments" }, { type: "claim", id: "equal" }, { type: "confirm" }]);
    const back = reduce(email, { type: "backFromEmail" });
    expect(back.view).toBe("data");
    expect(back.claim).toBe("equal");
  });

  it("clears the conclusion when replacing evidence", () => {
    expect(run([...data, { type: "evidence", id: "assignments" }, { type: "claim", id: "equal" }, { type: "evidence", id: "attendance" }]).claim).toBeNull();
  });
  it("guesses keep their loss outcome", () => {
    for (const id of ["trainer", "trainees"] as const) expect(run([...office, { type: "think", to: "guess" }, { type: "guess", id }, { type: "send" }]).outcome).toBe("lossGuess");
    const trainerWithObs = run([...office, { type: "think", to: "guess" }, { type: "guess", id: "trainer", evidence: "complaints" }]);
    expect(trainerWithObs.claim).toBe("trainer");
    expect(trainerWithObs.evidence).toBe("complaints");
    expect(run([...office, { type: "think", to: "guess" }, { type: "guess", id: "trainer", evidence: "complaints" }, { type: "send" }]).outcome).toBe("lossGuess");
    const back = run([...office, { type: "think", to: "guess" }, { type: "guess", id: "trainer", evidence: "complaints" }, { type: "backFromEmail" }]);
    expect(back.view).toBe("guess");
    expect(back.claim).toBeNull();
    expect(back.evidence).toBeNull();
    const traineesWithObs = run([...office, { type: "think", to: "guess" }, { type: "guess", id: "trainees", evidence: "attendance" }]);
    expect(traineesWithObs.claim).toBe("trainees");
    expect(traineesWithObs.evidence).toBe("attendance");
    expect(run([...office, { type: "think", to: "guess" }, { type: "guess", id: "trainees", evidence: "attendance" }, { type: "send" }]).outcome).toBe("lossGuess");
  });
  it("prepares data for five seconds on all three entry paths without double penalty", () => {
    expect(DATA_PREPARATION_SECONDS).toBe(5);
    const paths: Action[][] = [
      [{ type: "think", to: "data" }],
      [{ type: "think", to: "guess" }, { type: "guess", id: "data" }],
      [{ type: "think", to: "ask" }, { type: "ask", id: "allData" }],
    ];
    for (const path of paths) {
      const s = run([...office, ...path]);
      expect(s.view).toBe("preparingData");
      expect(s.penalty).toBe(0);
      expect(timeLeft(5, s.penalty)).toBe(115);
      expect(reduce(s, { type: "dataReady" }).view).toBe("data");
    }
  });
  it("question answers keep one evidence and three unrestricted conclusions", () => {
    for (const [question, evidence] of [["respondents", "respondents"], ["attendance", "attendance"], ["complaintsCount", "complaints"]] as const) {
      const s = run([...office, { type: "think", to: "ask" }, { type: "ask", id: question }]);
      expect(s.evidence).toBe(evidence);
      expect(claimsFor(s)).toHaveLength(3);
      expect(claimsFor(s)).not.toContain("equal");
      for (const claim of claimsFor(s)) {
        const email = run([{ type: "claim", id: claim }, { type: "confirm" }], s);
        expect(email.view).toBe("email");
        expect(reduce(email, { type: "send" }).outcome).toBe(isCorrect(claim, evidence) ? "win" : "lossData");
      }
    }
  });
  it("returning to questions clears the previous answer and allows another", () => {
    const s = run([...office, { type: "think", to: "ask" }, { type: "ask", id: "attendance" }, { type: "claim", id: "bBetter" }, { type: "resetAsk" }]);
    expect(s.asked).toEqual([]);
    expect(s.claim).toBeNull();
    expect(s.evidence).toBeNull();
    expect(reduce(s, { type: "ask", id: "respondents" }).evidence).toBe("respondents");
  });
  it("unavailable data does not preselect evidence", () => {
    expect(run([...office, { type: "think", to: "ask" }, { type: "ask", id: "complaintsOfAll" }]).evidence).toBeNull();
  });
  it("test navigation remains available after an ending", () => {
    const end = run([...data, { type: "evidence", id: "respondents" }, { type: "claim", id: "notRep" }, { type: "confirm" }, { type: "send" }]);
    const s = reduce(end, { type: "backToThink" });
    expect(s.phase).toBe("office");
    expect(s.view).toBe("think");
    expect(s.outcome).toBeNull();
  });
  it("retains timeout handling for when testing is disabled", () => {
    expect(timeLeft(120, 0)).toBe(0);
    expect(run([...office, { type: "timeout" }]).timedOut).toBe(true);
  });
});
