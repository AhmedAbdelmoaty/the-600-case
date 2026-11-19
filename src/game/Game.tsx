import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { ArrowRight, BookOpen, Laptop, Mail, RotateCcw, Send, Volume2, VolumeX, X } from "lucide-react";
import { CHART_FROM_LINE, STATION_OF, initialState, isWin, rankOf, reduce, type Action, type State } from "./engine";
import { MEETING, NAMES, NOTEBOOK, RANKS, RECS, SUBTITLE_AR, TAGLINE, TAKEAWAYS, TITLE, VERDICTS, type Line } from "./content";
import { Confetti, LDLead, Manager, PaperStorm } from "./art";
import { Chart } from "./Chart";
import { setMuted, sfx, whoosh } from "./audio";
import "./case.css";

const STATIONS = ["قاعة الاجتماع", "مكتبك", "الإيميل", "مكتب المدير"];

function sound(a: Action, s: State) {
  if (a.type === "send" || (a.type === "pick" && s.picked === a.id)) return;
  if (a.type === "openNotebook" || a.type === "toEmail") sfx.paper();
  else if (a.type === "checkLastYear") sfx.chime();
  else sfx.tap();
}

export default function Game() {
  const [state, raw] = useReducer(reduce, undefined, initialState);
  const [muted, setMute] = useState(false);
  const ref = useRef(state);
  ref.current = state;
  const dispatch = useCallback((a: Action) => {
    sound(a, ref.current);
    raw(a);
  }, []);
  useEffect(() => setMuted(muted), [muted]);
  useEffect(() => window.scrollTo({ top: 0 }), [state.phase]);

  if (state.phase === "intro") return <Intro go={() => dispatch({ type: "start" })} />;
  const station = STATION_OF[state.phase];
  return (
    <div className="cs" dir="rtl">
      <header className="cs-hud">
        <ol className="cs-steps">
          {STATIONS.map((n, i) => (
            <li key={n} className={i + 1 === station ? "now" : i + 1 < station ? "done" : ""}>
              <b>{(i + 1).toLocaleString("ar-EG")}</b>
              <span>{n}</span>
            </li>
          ))}
        </ol>
        <button className="cs-icon" onClick={() => setMute((m) => !m)} aria-label={muted ? "تشغيل الصوت" : "كتم الصوت"}>
          {muted ? <VolumeX /> : <Volume2 />}
        </button>
      </header>
      <div key={state.phase} className="cs-screen">
        {state.phase === "meeting" && <Meeting state={state} dispatch={dispatch} />}
        {state.phase === "office" && <Office state={state} dispatch={dispatch} />}
        {state.phase === "email" && <Email state={state} dispatch={dispatch} />}
        {state.phase === "verdict" && <Verdict state={state} dispatch={dispatch} />}
      </div>
    </div>
  );
}

function Intro({ go }: { go: () => void }) {
  return (
    <div className="cs cs-intro" dir="rtl">
      <div className="cs-intro-card">
        <div className="cs-intro-cast" aria-hidden>
          <span className="cs-breathe"><LDLead size={84} /></span>
          <span className="cs-breathe d2"><Manager mood="confident" size={100} /></span>
        </div>
        <h1 dir="ltr">{TITLE}</h1>
        <h2>{SUBTITLE_AR}</h2>
        <p>{TAGLINE}</p>
        <div className="cs-badge">أنت مدير الـ HR</div>
        <button className="cs-btn primary big" onClick={go}>ادخل الاجتماع</button>
      </div>
    </div>
  );
}

function Bubble({ line, k }: { line: Line; k: number | string }) {
  return (
    <div key={k} className={`cs-bubble ${line.who}`} aria-live="polite">
      <span className="cs-who">{NAMES[line.who]}</span>
      <p>{line.text}</p>
    </div>
  );
}

function Cast({ line, sherifMood, showTarek = true }: { line?: Line | undefined; sherifMood?: Line["mood"]; showTarek?: boolean }) {
  return (
    <div className="cs-cast" aria-hidden>
      {showTarek && (
        <div className={`cs-actor tarek ${line?.who === "tarek" ? "talking" : ""}`}>
          <LDLead size={86} />
        </div>
      )}
      <div className={`cs-actor sherif ${line?.who === "sherif" ? "talking" : ""}`}>
        <Manager mood={sherifMood ?? "confident"} size={100} />
      </div>
    </div>
  );
}

function Meeting({ state, dispatch }: { state: State; dispatch: (a: Action) => void }) {
  const line = MEETING[state.line]!;
  const chartOn = state.line >= CHART_FROM_LINE;
  const last = state.line === MEETING.length - 1;
  return (
    <main className="cs-panel">
      <section className="cs-room">
        <div className={`cs-screen-board ${chartOn ? "on" : ""}`}>
          {chartOn ? <Chart /> : <span>تقرير برنامج التدريب · ٦٠٠ موظف</span>}
        </div>
        <Bubble line={line} k={state.line} />
        <Cast line={line} sherifMood={line.who === "sherif" ? line.mood : "confident"} />
        <div className="cs-table" />
      </section>
      <div className="cs-dots" aria-hidden>
        {MEETING.map((_, i) => <i key={i} className={i <= state.line ? "on" : ""} />)}
      </div>
      <button className="cs-btn primary big" onClick={() => dispatch({ type: "next" })}>
        {last ? <>ارجع مكتبك <ArrowRight /></> : "كمّل"}
      </button>
    </main>
  );
}

function Office({ state, dispatch }: { state: State; dispatch: (a: Action) => void }) {
  const [book, setBook] = useState(false);
  return (
    <main className="cs-panel">
      <section className="cs-desk">
        <div className="cs-laptop">
          <div className="cs-laptop-bar"><Laptop /> تقرير_التدريب.xlsx</div>
          <Chart colored={state.lastYearChecked} />
          <button
            className="cs-btn small"
            disabled={state.lastYearChecked}
            onClick={() => dispatch({ type: "checkLastYear" })}
          >
            اعرض تقييم السنة اللي فاتت
          </button>
        </div>
        <button
          className="cs-notebook"
          onClick={() => {
            setBook(true);
            dispatch({ type: "openNotebook" });
          }}
        >
          <BookOpen /> محضر الاجتماع
        </button>
      </section>
      <button className="cs-btn primary big" onClick={() => dispatch({ type: "toEmail" })}>
        <Mail /> اكتب توصيتك لـ م. شريف
      </button>
      {book && (
        <div className="cs-overlay" role="dialog" aria-modal="true" onClick={() => setBook(false)}>
          <article className="cs-paper" onClick={(e) => e.stopPropagation()}>
            <button className="cs-icon close" onClick={() => setBook(false)} aria-label="اقفل المحضر"><X /></button>
            <h3>محضر الاجتماع</h3>
            <ul>{NOTEBOOK.map((n) => <li key={n}>{n}</li>)}</ul>
          </article>
        </div>
      )}
    </main>
  );
}

function Email({ state, dispatch }: { state: State; dispatch: (a: Action) => void }) {
  const [flying, setFlying] = useState(false);
  return (
    <main className="cs-panel">
      <article className={`cs-mail ${flying ? "fly" : ""}`}>
        <div className="cs-mail-head">
          <p><b>إلى:</b> م. شريف</p>
          <p><b>الموضوع:</b> توصية بخصوص ميزانية التدريب</p>
        </div>
        <p className="cs-mail-hi">م. شريف، بعد مراجعة التقرير، توصيتي:</p>
        <div className="cs-recs" role="radiogroup">
          {state.order.map((id) => (
            <button
              key={id}
              role="radio"
              aria-checked={state.picked === id}
              className={`cs-rec ${state.picked === id ? "on" : ""}`}
              onClick={() => dispatch({ type: "pick", id })}
            >
              {RECS[id]}
            </button>
          ))}
        </div>
      </article>
      <button
        className="cs-btn primary big"
        disabled={!state.picked || flying}
        onClick={() => {
          setFlying(true);
          whoosh();
          setTimeout(() => dispatch({ type: "send" }), 800);
        }}
      >
        <Send /> ابعت
      </button>
      <button className="cs-btn ghost" disabled={flying} onClick={() => dispatch({ type: "backToOffice" })}>
        ارجع للمكتب
      </button>
    </main>
  );
}

function Verdict({ state, dispatch }: { state: State; dispatch: (a: Action) => void }) {
  const sent = state.sent!;
  const v = VERDICTS[sent];
  const won = isWin(sent);
  const rank = rankOf(state);
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const [why, setWhy] = useState(won);
  const line = v.lines[Math.min(i, v.lines.length - 1)]!;
  return (
    <main className={`cs-panel ${won ? "win" : "loss"}`}>
      {done && (won ? <Confetti /> : <PaperStorm />)}
      <section className={`cs-room office ${done && !won ? "shake" : ""}`}>
        {!done && <Bubble line={line} k={i} />}
        <Cast line={line} sherifMood={v.lines[0]!.mood} showTarek={won} />
        <div className="cs-table" />
        {done && <div className={`cs-stamp ${won ? "good" : "bad"}`}>{v.stamp}</div>}
      </section>
      {!done ? (
        <button
          className="cs-btn primary big"
          onClick={() => (i + 1 < v.lines.length ? setI(i + 1) : (setDone(true), sfx.stamp(), won ? sfx.win() : sfx.lose()))}
        >
          كمّل
        </button>
      ) : (
        <>
          <section className={`cs-result ${won ? "good" : "bad"}`}>
            <small>النتيجة</small>
            <h2>{won && rank ? RANKS[rank] : v.stamp}</h2>
          </section>
          {!why && (
            <button className="cs-btn ghost" onClick={() => setWhy(true)}>اعرض الخلاصة</button>
          )}
          {why && <div className="cs-takeaways">
            {TAKEAWAYS.map((t, n) => (
              <article key={t.q} style={{ animationDelay: `${n * 180}ms` }}>
                <strong>{t.q}</strong>
                <p>{t.a}</p>
              </article>
            ))}
          </div>}
          {!won && (
            <button className="cs-btn primary big" onClick={() => dispatch({ type: "reviewAgain" })}>
              راجع التقرير تاني
            </button>
          )}
          <button className={`cs-btn big ${won ? "primary" : ""}`} onClick={() => dispatch({ type: "restart" })}>
            <RotateCcw /> ابدأ من الأول
          </button>
        </>
      )}
    </main>
  );
}
