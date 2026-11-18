import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { FolderOpen, Pause, Play, RotateCcw, Star, Volume2, VolumeX } from "lucide-react";
import {
  FOLDERS,
  STAGE_OF,
  initialState,
  isD1Mistake,
  isTestMistake,
  reduce,
  type Action,
  type State,
} from "./engine";
import {
  D1_OPTIONS,
  D1_PROMPT,
  DEBRIEF,
  DIALOGUE,
  FINAL_OPTIONS,
  FINAL_PROMPT,
  FOLDER_CONTENT,
  INTRO_MISSION,
  LOSS_EXPLANATIONS,
  SUBTITLE_AR,
  TAGLINE,
  TEST_OPTIONS,
  TEST_PROMPT,
  TITLE,
  WIN_RANKS,
  type Line,
} from "./content";
import { Confetti, ExecutiveScene, FolderArt, LDLead, Manager, PaperStorm, Scatter } from "./art";
import { setMuted, sfx } from "./audio";

const AR = (number: number) => number.toLocaleString("ar-EG");
const STAGE_NAMES = ["", "التقرير المبدئي", "فحص الأدلة", "تصميم الاختبار", "القرار النهائي"];

function soundFor(action: Action, state: State) {
  switch (action.type) {
    case "start":
    case "advance":
    case "closeFolder":
    case "continue":
      return sfx.tap();
    case "openFolder":
    case "leaveDesk":
      return sfx.paper();
    case "chooseD1":
      return isD1Mistake(action.id) ? sfx.wobble() : sfx.chime();
    case "chooseTest":
      return isTestMistake(action.id) ? sfx.wobble() : sfx.chime();
    case "chooseFinal":
      sfx.stamp();
      return action.id === "final_evaluate" && state.stars >= 1
        ? setTimeout(sfx.win, 250)
        : setTimeout(sfx.lose, 250);
    default:
      return sfx.tap();
  }
}

export default function Game() {
  const [state, rawDispatch] = useReducer(reduce, undefined, initialState);
  const [muted, setMute] = useState(false);
  const [paused, setPaused] = useState(false);
  const lock = useRef(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  const dispatch = useCallback((action: Action) => {
    const now = Date.now();
    if (now - lock.current < 260) return;
    lock.current = now;
    soundFor(action, stateRef.current);
    rawDispatch(action);
  }, []);

  useEffect(() => setMuted(muted), [muted]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state.phase]);

  if (state.phase === "intro") {
    return <Intro onStart={() => dispatch({ type: "start" })} />;
  }

  const stage = STAGE_OF[state.phase];
  return (
    <div className="game" dir="rtl">
      <header className="hud">
        <div className="stars" aria-label={`الثقة والمصداقية: ${state.stars} من ٣`}>
          {[0, 1, 2].map((index) => (
            <Star key={index} className={index < state.stars ? "on" : "off"} />
          ))}
        </div>
        <div className="stage-copy">
          <strong>المرحلة {AR(stage)} / ٤</strong>
          <span>{STAGE_NAMES[stage]}</span>
        </div>
        <div className="hud-btns">
          <button
            className="icon-btn"
            onClick={() => setMute((value) => !value)}
            aria-label={muted ? "تشغيل الصوت" : "كتم الصوت"}
          >
            {muted ? <VolumeX /> : <Volume2 />}
          </button>
          <button className="icon-btn" onClick={() => setPaused(true)} aria-label="إيقاف مؤقت">
            <Pause />
          </button>
        </div>
      </header>

      <Body state={state} dispatch={dispatch} />

      {paused && (
        <div className="overlay" role="dialog" aria-modal="true">
          <div className="sheet">
            <h2>اللعبة متوقفة</h2>
            <button className="btn primary" onClick={() => setPaused(false)}>
              <Play /> كمّل
            </button>
            <button
              className="btn"
              onClick={() => {
                if (confirm("متأكد؟ هتبدأ القضية من الأول.")) {
                  setPaused(false);
                  rawDispatch({ type: "restart" });
                }
              }}
            >
              <RotateCcw /> ابدأ من الأول
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="game intro" dir="rtl">
      <div className="intro-card">
        <div className="intro-art" aria-hidden>
          <LDLead size={90} />
          <Manager mood="happy" size={110} />
        </div>
        <p className="case-file">ملف عاجل على مكتب الإدارة</p>
        <h1 className="title" dir="ltr">
          {TITLE}
        </h1>
        <h2 className="subtitle">{SUBTITLE_AR}</h2>
        <p className="tagline">{TAGLINE}</p>
        <div className="mission-note">
          <div className="mission-stars" aria-hidden>
            ★★★
          </div>
          <p>{INTRO_MISSION}</p>
        </div>
        <button className="btn primary big" onClick={onStart}>
          ادخل الاجتماع
        </button>
      </div>
    </div>
  );
}

function Choices<T extends string>({
  ids,
  label,
  onPick,
  picked,
}: {
  ids: T[];
  label: (id: T) => string;
  onPick: (id: T) => void;
  picked?: T | undefined;
}) {
  return (
    <div className="choices">
      {ids.map((id) => (
        <button
          key={id}
          className={`choice ${picked ? (picked === id ? "picked" : "dim") : ""}`}
          disabled={Boolean(picked)}
          onClick={() => onPick(id)}
        >
          {label(id)}
        </button>
      ))}
    </div>
  );
}

function Body({ state, dispatch }: { state: State; dispatch: (action: Action) => void }) {
  switch (state.phase) {
    case "dialogueA": {
      const line = DIALOGUE.dialogueA[state.dialogueIndex]!;
      return (
        <main className="panel">
          <ExecutiveScene mood={line.mood} line={line} />
          <Scatter />
          <button className="btn primary big" onClick={() => dispatch({ type: "advance" })}>
            {state.dialogueIndex === 0 ? "اسمع رد المدير" : "شوف الطلب"}
          </button>
        </main>
      );
    }
    case "d1":
    case "d1fb": {
      const picked = state.decisions.d1;
      const option = picked ? D1_OPTIONS[picked] : null;
      return (
        <main className="panel">
          <ExecutiveScene
            mood={option?.reaction.mood ?? "confident"}
            line={option?.reaction}
            shake={Boolean(picked && isD1Mistake(picked))}
          />
          {!picked && <p className="prompt card">{D1_PROMPT}</p>}
          <Choices
            ids={state.order.d1}
            label={(id) => D1_OPTIONS[id].label}
            picked={picked}
            onPick={(id) => dispatch({ type: "chooseD1", id })}
          />
          {picked && option?.note && (
            <div className="feedback bad">
              <Star className="lost" />
              <span>{option.note}</span>
            </div>
          )}
          {picked && !option?.note && (
            <div className="feedback good">قرار هادي: الأول نفهم البيانات، وبعدها نحكم.</div>
          )}
          {picked && (
            <button className="btn primary big" onClick={() => dispatch({ type: "continue" })}>
              افتح ملفات الأدلة
            </button>
          )}
        </main>
      );
    }
    case "desk": {
      if (state.openFolder) {
        const folder = FOLDER_CONTENT[state.openFolder];
        return (
          <main className="panel evidence-view">
            <article className="doc rise">
              <p className="doc-tab">{folder.label}</p>
              <h3>
                <FolderOpen /> {folder.title}
              </h3>
              <p>{folder.body}</p>
              <p className="doc-note">{folder.note}</p>
            </article>
            <button className="btn primary big" onClick={() => dispatch({ type: "closeFolder" })}>
              رجوع لمكتب الأدلة
            </button>
          </main>
        );
      }

      const complete = state.opened.length === FOLDERS.length;
      return (
        <main className="panel">
          <div className="desk-heading">
            <div>
              <h2>مكتب الأدلة</h2>
              <p>افتح الملفات التلاتة قبل ما ترجع للمدير.</p>
            </div>
            <span>{AR(state.opened.length)} / ٣</span>
          </div>
          <div className="folders">
            {state.order.folders.map((id) => (
              <button
                key={id}
                className={`folder ${state.opened.includes(id) ? "opened" : ""}`}
                onClick={() => dispatch({ type: "openFolder", id })}
                aria-label={`افتح ${FOLDER_CONTENT[id].title}`}
              >
                <FolderArt opened={state.opened.includes(id)} />
                <span>{FOLDER_CONTENT[id].label}</span>
              </button>
            ))}
          </div>
          <Scatter />
          <button
            className="btn primary big"
            disabled={!complete}
            onClick={() => dispatch({ type: "leaveDesk" })}
          >
            رجعت أفهم الصورة كاملة
          </button>
          {!complete && <p className="muted center">لسه فيه دليل ما اتراجعش.</p>}
        </main>
      );
    }
    case "test":
    case "testFb": {
      const picked = state.decisions.test;
      const option = picked ? TEST_OPTIONS[picked] : null;
      const line: Line =
        picked && option
          ? { who: "manager", text: option.feedback, mood: option.mood }
          : { who: "manager", text: TEST_PROMPT, mood: "thinking" };
      return (
        <main className="panel">
          <ExecutiveScene
            mood={line.mood}
            line={line}
            shake={Boolean(picked && isTestMistake(picked))}
          />
          <Choices
            ids={state.order.test}
            label={(id) => TEST_OPTIONS[id].label}
            picked={picked}
            onPick={(id) => dispatch({ type: "chooseTest", id })}
          />
          {picked && isTestMistake(picked) && (
            <div className="feedback bad">
              <Star className="lost" /> خسرت نجمة مصداقية
            </div>
          )}
          {picked && (
            <button className="btn primary big" onClick={() => dispatch({ type: "continue" })}>
              قدّم توصيتك النهائية
            </button>
          )}
        </main>
      );
    }
    case "final":
      return (
        <main className="panel">
          <ExecutiveScene
            mood="confident"
            line={{ who: "manager", text: FINAL_PROMPT, mood: "confident" }}
          />
          <Choices
            ids={state.order.final}
            label={(id) => FINAL_OPTIONS[id].label}
            onPick={(id) => dispatch({ type: "chooseFinal", id })}
          />
        </main>
      );
    case "end":
      return <Ending state={state} dispatch={dispatch} />;
    default:
      return null;
  }
}

function Ending({ state, dispatch }: { state: State; dispatch: (action: Action) => void }) {
  const won = state.outcome === "win";
  const finalDecision = state.decisions.final;
  const rank = WIN_RANKS[Math.max(1, Math.min(3, state.stars)) as 1 | 2 | 3];
  const failure =
    finalDecision === "final_expand" || finalDecision === "final_cancel"
      ? LOSS_EXPLANATIONS[finalDecision]
      : "القرار محتاج قياس منضبط قبل ما نغامر بالميزانية.";

  return (
    <main className={`panel ending ${won ? "victory" : "defeat shake"}`}>
      {won ? <Confetti /> : <PaperStorm />}
      <ExecutiveScene
        mood={won ? "happy" : "facepalm"}
        stamp={won ? "good" : "bad"}
        shake={!won}
        showLD={!won}
      />

      {won ? (
        <>
          <section className="result win">
            <div className="big-stars" aria-label={`${state.stars} نجوم`}>
              {[0, 1, 2].map((index) => (
                <Star key={index} className={index < state.stars ? "on" : "off"} />
              ))}
            </div>
            <h2>{rank.title}</h2>
            {rank.note && <p className="rank-note">{rank.note}</p>}
          </section>
          <article className="decision-document good-document">
            <div className="document-stamp">قرار محسوب</div>
            <strong>توصية إدارة الموارد البشرية</strong>
            <p>القرار: تعليق التوسع لحين إجراء تجربة A/B عادلة</p>
          </article>
          <div className="debrief">
            {DEBRIEF.map((item) => (
              <article key={item.q} className="takeaway">
                <strong>{item.q}</strong>
                <p>{item.a}</p>
              </article>
            ))}
          </div>
          <button className="btn primary big replay" onClick={() => dispatch({ type: "restart" })}>
            العب تاني وحافظ على نجومك
          </button>
        </>
      ) : (
        <>
          <article className="decision-document bad-document">
            <div className="document-stamp">اتسرّعنا!</div>
            <strong>طلب زيادة ميزانية التدريب</strong>
            <p>القرار اتاخد قبل ما الدليل يكتمل.</p>
          </article>
          <section className="failure-card">
            <h2>القرار وقعنا في الفخ</h2>
            <p>{failure}</p>
          </section>
          <button className="btn primary big" onClick={() => dispatch({ type: "retryFinal" })}>
            جرّب القرار النهائي تاني
          </button>
          <button className="btn big" onClick={() => dispatch({ type: "restart" })}>
            ابدأ القضية من الأول
          </button>
        </>
      )}
    </main>
  );
}
