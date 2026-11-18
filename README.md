# The 600 Case

Implement the attached Case 2 Game Master Brief as a complete standalone game in THIS NEW Lovable project.

Use The Analyst (project 1641615b-02f7-490b-a5f3-f60bd965f807) as a READ-ONLY reference to inspect and reuse relevant gameplay patterns, dialogue components, charts, animations, sounds, and UI ideas where accessible.

Do NOT modify the original The Analyst project.

Follow the attached specification precisely, especially the Egyptian Arabic script, scientific reasoning, fair win/loss logic, no-answer-leak rules, mobile-first UX, and polished cartoon game feel.

Prioritize a fully playable, logically correct V1. Use temporary CSS/SVG characters and environments where needed to save credits and implementation time.

Implement directly, perform focused verification, and leave the game ready to test in this project's preview. Do not publish or deploy.

### Locked Decisions and Game Specification:
- **Title:** "The 600 Case" (Arabic subtitle: "قضية الـ 600 موظف" - "تقرير تدريب على مكتب المدير العام وقرار مستني رأيك"). Replaces any leaking title like "إمضي ولا استنى؟".
- **Credibility & Stars System:** 3 Management Credibility Stars (مؤشر مصداقية الإدارة / 3 نجوم). Each hasty or flawed choice loses 1 star. On winning, the player receives 1 to 3 stars based on remaining credibility.
- **Fairness & Logic:**
  - Scene A (Decision 1): Hasty approval or cancellation loses 1 star with immediate comic consequence; inspecting first is sound (0 loss).
  - Scene B (Evidence Desk): 3 interactive tactile folders (الترشيحات، التقييمات السابقة، طريقة المقارنة) + SVG scatterplot. Opening all 3 is required.
  - Scene C (Evidence Confrontation): Presenting ANY of the 3 folders is scientifically valid counter-evidence to the claim "Trained employees were smarter because of training"; each has custom dialogue from Manager and HR with 0 star loss.
  - Scene D (Better Test Design): Raw comparison loses 1 star; Before/after only loses 1 star; Balanced comparison with randomized rollout is correct (0 loss).
  - Scene E (Final Signature Decision): Hasty expansion = Loss; Cancelling training = Loss; Evaluating rigorously before expanding = WIN (1-3 stars awarded).
- **Zero Asset Failures:** Self-contained inline SVG/CSS illustrations (Manager with expressive states: confident, thinking, surprised, happy, facepalm; HR with folder; office desk with contract and pen; 3 folders; ink stamps "قرار محسوب" and "اتسرّعنا!"; confetti effect). Web Audio API synthesizer for tactile sound effects (paper slide, pen scratch, stamp thud, chime, failure wobble) with mute toggle.
- **Mobile First UX:** Portrait view (390×844) with sticky/responsive top HUD, upper visual stage, middle dialogue/evidence, and large accessible bottom touch choices (>48px) with RTL Cairo typography and zero pre-choice color hints.
- **Entry Route:** Launches directly and playably at `/`.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/57e8817b-e58f-4570-be82-7f3b4fd33288).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
