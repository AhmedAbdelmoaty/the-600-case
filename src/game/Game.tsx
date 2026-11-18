import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Star, Volume2, VolumeX, FolderOpen } from "lucide-react";
import { reduce, initialState, STAGE_OF, FOLDERS, isD1Mistake, isTestMistake, type Action, type State } from "./engine";
import { CLAIM, D1_OPTIONS, DEBRIEF, DIALOGUE, FICTION_NOTE, FINAL_OPTIONS, FOLDER_CONTENT, RULES, SUBTITLE_AR, TAGLINE, TEST_OPTIONS, TITLE, type Line, type Mood } from "./content";
import { Confetti, Desk, FolderArt, HR, Manager, Scatter } from "./art";
import { sfx, setMuted } from "./audio";

const AR = (n: number) => n.toLocaleString("ar-EG");

function soundFor(a: Action, s: State) {
  switch (a.type) {
    case "start": case "rulesOk": case "advance": case "closeFolder": case "continue": return sfx.tap();
    case "openFolder": return sfx.paper();
    case "leaveDesk": return sfx.paper();
    case "chooseD1": return isD1Mistake(a.id) ? sfx.wobble() : sfx.chime();
    case "presentEvidence": return sfx.chime();
    case "chooseTest": return isTestMistake(a.id) ? sfx.wobble() : sfx.chime();
    case "chooseFinal": sfx.stamp(); return a.id === "final_evaluate" && s.stars >= 1 ? setTimeout(sfx.win, 250) : setTimeout(sfx.lose, 250);
    default: return sfx.tap();
  }
}

export default function Game() {
  const [s, raw] = useReducer(reduce, undefined, initialState);
  const [muted, setMute] = useState(false);
  const [paused, setPaused] = useState(false);
  const lock = useRef(0);
  const sRef = useRef(s); sRef.current = s;

  const dispatch = useCallback((a: Action) => {
    const now = Date.now();
    if (now - lock.current < 260) return; // prevents double taps skipping steps
    lock.current = now;
    soundFor(a, sRef.current);
    raw(a);
  }, []);

  useEffect(() => { setMuted(muted); }, [muted]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [s.phase]);

  if (s.phase === "intro") return <Intro onStart={() => dispatch({ type: "start" })} />;

  return (
    <div className="game" dir="rtl">
      <header className="hud">
        <div className="stars" aria-label={`مؤشر مصداقية الإدارة: ${s.stars} من ٣`}>
          {[0, 1, 2].map((i) => <Star key={i} className={i < s.stars ? "on" : "off"} />)}
        </div>
        <div className="stage-label">المرحلة {AR(Math.max(1, STAGE_OF[s.phase]))}/٥</div>
        <div className="hud-btns">
          <button className="icon-btn" onClick={() => setMute((m) => !m)} aria-label={muted ? "تشغيل الصوت" : "كتم الصوت"}>{muted ? <VolumeX /> : <Volume2 />}</button>
          <button className="icon-btn" onClick={() => setPaused(true)} aria-label="إيقاف مؤقت"><Pause /></button>
        </div>
      </header>

      <Body s={s} dispatch={dispatch} />

      {paused && (
        <div className="overlay" role="dialog" aria-modal>
          <div className="sheet">
            <h2>اللعبة متوقفة</h2>
            <button className="btn primary" onClick={() => setPaused(false)}><Play /> كمّل</button>
            <button className="btn" onClick={() => { if (confirm("متأكد؟ هتبدأ القضية من الأول.")) { setPaused(false); raw({ type: "restart" }); } }}><RotateCcw /> ابدأ من الأول</button>
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
        <div className="intro-art"><HR size={90} /><Manager mood="happy" size={110} /></div>
        <h1 className="title" dir="ltr">{TITLE}</h1>
        <h2 className="subtitle">{SUBTITLE_AR}</h2>
        <p className="tagline">{TAGLINE}</p>
        <button className="btn primary big" onClick={onStart}>ابدأ القضية</button>
        <p className="fiction">{FICTION_NOTE}</p>
      </div>
    </div>
  );
}

function Scene({ mood, stamp, penFrozen, shake, showHR = true }: { mood: Mood; stamp?: "good" | "bad" | null | undefined; penFrozen?: boolean | undefined; shake?: boolean | undefined; showHR?: boolean }) {
  return (
    <section className={`scene ${shake ? "shake" : ""}`} aria-hidden>
      <div className="window" />
      <div className="chars">
        <div className="char-hr">{showHR && <HR size={78} />}</div>
        <div className="char-mgr"><Manager mood={mood} size={104} /></div>
      </div>
      <Desk stamp={stamp} penFrozen={penFrozen} />
    </section>
  );
}

function Bubble({ line }: { line: Line }) {
  return (
    <div className={`bubble ${line.who}`} aria-live="polite">
      <span className="who">{line.who === "hr" ? "مسؤول الـHR" : "المدير العام"}</span>
      <p>{line.text}</p>
    </div>
  );
}

function Choices<T extends string>({ ids, label, onPick, picked }: { ids: T[]; label: (id: T) => string; onPick: (id: T) => void; picked?: T | undefined }) {
  return (
    <div className="choices">
      {ids.map((id) => (
        <button key={id} className={`choice ${picked ? (picked === id ? "picked" : "dim") : ""}`} disabled={!!picked} onClick={() => onPick(id)}>
          {label(id)}
        </button>
      ))}
    </div>
  );
}

function Body({ s, dispatch }: { s: State; dispatch: (a: Action) => void }) {
  const lastMood = useRef<Mood>("confident");
  switch (s.phase) {
    case "rules":
      return (
        <main className="panel">
          <Scene mood="confident" />
          <div className="card rules"><p>{RULES}</p></div>
          <button className="btn primary big" onClick={() => dispatch({ type: "rulesOk" })}>تمام، يلا</button>
        </main>
      );
    case "dialogueA": case "dialogueC": case "dialogueD": case "dialogueE": {
      const lines = DIALOGUE[s.phase];
      const line: Line = lines[s.dialogueIndex]!;
      if (line.mood) lastMood.current = line.mood;
      return (
        <main className="panel">
          <Scene mood={line.mood ?? lastMood.current} penFrozen={s.phase === "dialogueE"} />
          <Bubble line={line} />
          {s.phase === "dialogueA" && s.dialogueIndex >= 4 && <Scatter />}
          <button className="btn primary big" onClick={() => dispatch({ type: "advance" })}>التالي ←</button>
        </main>
      );
    }
    case "d1": case "d1fb": {
      const picked = s.decisions.d1;
      const opt = picked ? D1_OPTIONS[picked] : null;
      return (
        <main className="panel">
          <Scene mood={opt?.reaction.mood ?? "confident"} penFrozen={picked === "approve_now"} shake={!!picked && isD1Mistake(picked)} />
          {!picked && <><Scatter /><p className="prompt">الطلب قدامك. هتعمل إيه؟</p></>}
          {opt && <Bubble line={opt.reaction} />}
          <Choices ids={s.order.d1} label={(id) => D1_OPTIONS[id].label} picked={picked} onPick={(id) => dispatch({ type: "chooseD1", id })} />
          {opt?.note && <div className="feedback bad"><Star className="lost" /> خسرت نجمة مصداقية — {opt.note}</div>}
          {picked && <button className="btn primary big" onClick={() => dispatch({ type: "continue" })}>كمّل</button>}
        </main>
      );
    }
    case "desk": {
      if (s.openFolder) {
        const f = FOLDER_CONTENT[s.openFolder];
        return (
          <main className="panel">
            <article className="doc rise">
              <h3><FolderOpen /> {f.title}</h3>
              {s.openFolder === "baseline" ? (
                <div className="mini-cards">{f.body.map((b) => <div key={b} className="mini">{b}</div>)}</div>
              ) : f.body.map((b) => <p key={b}>{b}</p>)}
              <p className="doc-note">{f.note}</p>
              <p className="fiction">{FICTION_NOTE}</p>
            </article>
            <button className="btn primary big" onClick={() => dispatch({ type: "closeFolder" })}>رجوع للملفات</button>
          </main>
        );
      }
      const done = s.opened.length === FOLDERS.length;
      return (
        <main className="panel">
          <div className="card"><p className="prompt">اضغط على الملفات لفتحها</p><p className="muted">افتح الملفات التلاتة عشان تعرف الصورة كاملة</p></div>
          <div className="folders">
            {s.order.folders.map((id) => (
              <button key={id} className={`folder ${s.opened.includes(id) ? "opened" : ""}`} onClick={() => dispatch({ type: "openFolder", id })} aria-label={`افتح ملف ${FOLDER_CONTENT[id].title}`}>
                <FolderArt opened={s.opened.includes(id)} />
                <span>{FOLDER_CONTENT[id].title}</span>
              </button>
            ))}
          </div>
          <p className="progress">ملفات اتفتحت: {AR(s.opened.length)}/٣</p>
          <Scatter />
          <button className="btn primary big" disabled={!done} onClick={() => dispatch({ type: "leaveDesk" })}>ارجع للاجتماع</button>
          {!done && <p className="muted center">لازم تراجع الملفات التلاتة الأول.</p>}
        </main>
      );
    }
    case "evidence": case "evidenceFb": {
      const picked = s.decisions.evidence;
      const f = picked ? FOLDER_CONTENT[picked] : null;
      return (
        <main className="panel">
          <Scene mood={f ? "surprised" : "confident"} />
          <div className="card"><p className="prompt">اختار الملف اللي يرد على الجملة دي:</p><blockquote className="claim">«{CLAIM}»</blockquote></div>
          {!f && <Choices ids={s.order.folders} label={(id) => `ملف: ${FOLDER_CONTENT[id].title}`} onPick={(id) => dispatch({ type: "presentEvidence", id })} />}
          {f && <>
            <Bubble line={{ who: "hr", text: f.hr }} />
            <Bubble line={{ who: "manager", text: f.manager }} />
            <div className="feedback good">دليل في محلّه.</div>
            <button className="btn primary big" onClick={() => dispatch({ type: "continue" })}>كمّل</button>
          </>}
        </main>
      );
    }
    case "test": case "testFb": {
      const picked = s.decisions.test;
      const opt = picked ? TEST_OPTIONS[picked] : null;
      return (
        <main className="panel">
          <Scene mood={opt?.mood ?? "thinking"} shake={!!picked && isTestMistake(picked)} />
          {!picked && <p className="prompt">اختار أقوى خطة من التلاتة:</p>}
          <Choices ids={s.order.test} label={(id) => TEST_OPTIONS[id].label} picked={picked} onPick={(id) => dispatch({ type: "chooseTest", id })} />
          {picked && opt && (isTestMistake(picked)
            ? <div className="feedback bad"><Star className="lost" /> خسرت نجمة مصداقية — {opt.feedback}</div>
            : <Bubble line={{ who: "manager", text: opt.feedback, mood: "happy" }} />)}
          {picked && <button className="btn primary big" onClick={() => dispatch({ type: "continue" })}>كمّل</button>}
        </main>
      );
    }
    case "final":
      return (
        <main className="panel">
          <Scene mood="confident" penFrozen />
          <p className="prompt">إيه توصيتك النهائية بناءً على الأدلة المتاحة؟</p>
          <Choices ids={s.order.final} label={(id) => FINAL_OPTIONS[id].label} onPick={(id) => dispatch({ type: "chooseFinal", id })} />
        </main>
      );
    case "end":
      return <Ending s={s} dispatch={dispatch} />;
    default:
      return null;
  }
}

function Ending({ s, dispatch }: { s: State; dispatch: (a: Action) => void }) {
  const win = s.outcome === "win";
  const cancel = s.decisions.final === "final_cancel";
  return (
    <main className="panel">
      {win && <Confetti />}
      <Scene mood={win ? "happy" : cancel ? "thinking" : "facepalm"} stamp={win ? "good" : cancel ? null : "bad"} shake={!win} />
      {win
        ? <Bubble line={{ who: "manager", text: "تمام. نكمّل التقييم صح، وبعدها ناخد قرار يستاهل التوقيع.", mood: "happy" }} />
        : cancel ? <Bubble line={{ who: "manager", text: "نلغي؟ طب وإحنا نعرف منين إنه مالوش تأثير؟", mood: "thinking" }} />
        : <Bubble line={{ who: "hr", text: "يا فندم… إحنا لسه ما عرفناش إن التدريب هو السبب!" }} />}
      <div className={`result ${win ? "win" : "loss"}`}>
        <h2>{win ? "قرار محسوب!" : "وقعت في الفخ!"}</h2>
        <p>{win ? "ما حكمتش على السبب من مجرد علاقة." : "العلاقة وحدها لا تثبت إن التدريب هو السبب… ولا تثبت إنه مالوش تأثير."}</p>
        {win && <div className="big-stars" aria-label={`${s.stars} نجوم`}>{[0, 1, 2].map((i) => <Star key={i} className={i < s.stars ? "on" : "off"} />)}</div>}
        {win && s.decisions.final && <p className="muted">الطلب بقى: «محتاج تقييم أدق»</p>}
      </div>
      <div className="debrief">
        {DEBRIEF.map((d) => <div key={d.q} className="mini"><strong>{d.q}</strong> {d.a}</div>)}
        <p className="muted center" dir="ltr">Correlation ≠ Causation — الارتباط لا يعني السببية</p>
      </div>
      {!win && <button className="btn primary big" onClick={() => dispatch({ type: "retryFinal" })}>جرّب القرار تاني</button>}
      <button className={`btn big ${win ? "primary" : ""}`} onClick={() => dispatch({ type: "restart" })}>{win ? "العب تاني" : "ابدأ القضية من الأول"}</button>
    </main>
  );
}
