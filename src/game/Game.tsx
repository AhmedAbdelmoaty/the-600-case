import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, ChevronLeft, DoorOpen, FileText, Home, Lightbulb, Mail, MonitorSmartphone, RotateCcw, Send, Star, Trophy, Volume2, VolumeX, X } from "lucide-react";
import { CHART_FROM_LINE, initialState, isWin, rankOf, reduce, type Action, type State } from "./engine";
import { EMAIL_BODIES, MEETING, NOTEBOOK, RANKS, RECS, SUBTITLE_AR, TAKEAWAYS, TITLE, VERDICTS, type Line, type Speaker } from "./content";
import { PORTRAITS, SCENES, type SceneKey } from "./assets";
import { Chart } from "./Chart";
import { setMuted, sfx, whoosh } from "./audio";
import "./game.css";

const WHO: Record<Speaker, { name: string; role: string; tone: "dark" | "light" }> = {
  tarek: { name: "طارق", role: "رئيس التدريب والتطوير", tone: "dark" },
  sherif: { name: "م. شريف", role: "المدير العام", tone: "light" },
};
const STATION: Record<State["phase"], string> = { intro: "", meeting: "قاعة الاجتماعات", office: "مكتبك", decision: "قرار الميزانية", email: "صياغة الإيميل", verdict: "مكتب المدير العام" };

export default function Game() {
  const [state, raw] = useReducer(reduce, undefined, initialState);
  const [muted, setMute] = useState(false);
  const [fade, setFade] = useState(false);
  const dispatch = useCallback((a: Action) => raw(a), []);
  useEffect(() => {
    setMuted(muted);
  }, [muted]);

  // Black-dip transition between places, like The Analyst's ScreenTransition.
  const travel = useCallback((a: Action) => {
    setFade(true);
    whoosh();
    window.setTimeout(() => {
      raw(a);
      window.setTimeout(() => setFade(false), 120);
    }, 420);
  }, []);

  const scene: SceneKey =
    state.phase === "intro" ? "cover" : state.phase === "meeting" ? (state.line >= CHART_FROM_LINE ? "meeting" : "brief") : state.phase === "verdict" ? "ceo" : "desk";

  return (
    <div className="g600" dir="rtl">
      <Scene k={scene} />
      {state.phase !== "intro" && (
        <header className="g-hud">
          <div className="g-hud-tools">
            <button aria-label="ابدأ من الأول" onClick={() => travel({ type: "restart" })}><Home /></button>
            <button aria-label={muted ? "تشغيل الصوت" : "كتم الصوت"} onClick={() => setMute((m) => !m)}>{muted ? <VolumeX /> : <Volume2 />}</button>
          </div>
          <motion.div key={state.phase} className="g-hud-place" initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <small>{TITLE}</small>
            <b>{STATION[state.phase]}</b>
          </motion.div>
          <span />
        </header>
      )}
      <AnimatePresence mode="wait">
        <motion.div key={state.phase} className="g-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          {state.phase === "intro" && <Cover go={() => { sfx.tap(); travel({ type: "start" }); }} />}
          {state.phase === "meeting" && <Meeting state={state} next={() => (state.line + 1 < MEETING.length ? (sfx.tap(), dispatch({ type: "next" })) : travel({ type: "next" }))} />}
      {state.phase === "office" && <Office state={state} dispatch={dispatch} />}
      {state.phase === "decision" && <Decision state={state} dispatch={dispatch} />}
          {state.phase === "email" && <Email state={state} dispatch={dispatch} travel={travel} />}
          {state.phase === "verdict" && <Verdict state={state} dispatch={dispatch} travel={travel} />}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>{fade && <motion.div className="g-dip" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.38 }} />}</AnimatePresence>
    </div>
  );
}

function Scene({ k }: { k: SceneKey }) {
  const s = SCENES[k];
  return (
    <div className={`g-scene scene-${k}`} aria-hidden>
      <AnimatePresence initial={false}>
        <motion.picture key={k} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
          <source media="(max-width: 640px)" srcSet={s.p} />
          <img src={s.l} alt="" />
        </motion.picture>
      </AnimatePresence>
      <div className={`g-wash ${k === "cover" ? "cover" : ""}`} />
    </div>
  );
}

function Cover({ go }: { go: () => void }) {
  return (
    <section className="g-cover">
      <motion.h1 dir="ltr" initial={{ opacity: 0, y: 20, letterSpacing: "0.3em" }} animate={{ opacity: 1, y: 0, letterSpacing: "0em" }} transition={{ duration: 0.7 }}>{TITLE}</motion.h1>
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>{SUBTITLE_AR}</motion.h2>
      <motion.button className="g-btn primary big" onClick={go} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
        ابدأ الآن
      </motion.button>
      <motion.small className="g-role" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}>دورك: مدير الموارد البشرية</motion.small>
    </section>
  );
}

/** Typewriter dialogue box modelled on The Analyst's DialoguePanel. */
function Dialogue({ line, index, total, onNext, nextLabel = "التالي" }: { line: Line; index: number; total: number; onNext: () => void; nextLabel?: string }) {
  const who = WHO[line.who];
  const chars = useMemo(() => Array.from(line.text), [line.text]);
  const [shown, setShown] = useState(0);
  const done = shown >= chars.length;
  useEffect(() => {
    setShown(0);
  }, [line.text]);
  useEffect(() => {
    if (done) return;
    const t = window.setTimeout(() => setShown((n) => n + 2), 26);
    return () => window.clearTimeout(t);
  }, [shown, done]);
  return (
    <motion.section key={`${index}-${line.who}`} className={`g-dialogue ${who.tone} s-${line.who}`} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 24 }}>
      <motion.span className="g-portrait" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
        <img src={PORTRAITS[line.who]} alt="" />
      </motion.span>
      <div>
        <header>
          <span>{who.name}</span>
          <small>{who.role}</small>
          <em>{(index + 1).toLocaleString("ar-EG")}/{total.toLocaleString("ar-EG")}</em>
        </header>
        <button className="g-copy" onClick={() => (done ? onNext() : setShown(chars.length))} aria-label={done ? nextLabel : "إظهار النص كاملًا"}>
          <p>{chars.slice(0, shown).join("")}{!done && <i aria-hidden />}</p>
        </button>
        <footer>
          {done ? (
            <motion.button className="g-btn primary" onClick={onNext} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              {nextLabel} <ChevronLeft />
            </motion.button>
          ) : (
            <button className="g-btn quiet" onClick={() => setShown(chars.length)}>إظهار النص كاملًا</button>
          )}
        </footer>
      </div>
    </motion.section>
  );
}

function Meeting({ state, next }: { state: State; next: () => void }) {
  const line = MEETING[state.line]!;
  const chartOn = state.line >= CHART_FROM_LINE;
  const last = state.line === MEETING.length - 1;
  return (
    <div className="g-stage">
      <AnimatePresence>
        {chartOn && (
          <motion.div className="g-board" initial={{ y: -30, opacity: 0, rotateX: 25 }} animate={{ y: 0, opacity: 1, rotateX: 0 }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 140, damping: 18 }}>
            <header><MonitorSmartphone /> شاشة العرض · تقرير برنامج التدريب · ٦٠٠ موظف</header>
            <Chart stagger={state.line === CHART_FROM_LINE ? 0.07 : 0} />
          </motion.div>
        )}
      </AnimatePresence>
      <Dialogue line={line} index={state.line} total={MEETING.length} onNext={next} nextLabel={last ? "ارجع مكتبك" : "التالي"} />
    </div>
  );
}

function Office({ state, dispatch }: { state: State; dispatch: (a: Action) => void }) {
  const [open, setOpen] = useState<"chart" | "notes" | null>(null);
  if (!state.officeEntered)
    return (
      <div className="g-stage center">
        <motion.section className="g-arrive" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <small>بعد الاجتماع</small>
          <h2>رجعت مكتبك</h2>
          <p>التقرير على اللابتوب، وملخص الاجتماع على المكتب. م. شريف مستني توصيتك.</p>
          <button className="g-btn primary big" onClick={() => { sfx.door(); dispatch({ type: "enterOffice" }); }}><DoorOpen /> ادخل المكتب</button>
        </motion.section>
      </div>
    );
  return (
    <div className="g-stage">
      <section className="g-locations">
        <header><small>مكتب مدير الموارد البشرية</small><h2>تحب تبدأ بإيه؟</h2></header>
        <div className="g-location-row">
          {[
            { id: "chart" as const, Icon: MonitorSmartphone, t: "شاشة اللابتوب", s: "شارت الـ ٦٠٠ موظف", seen: false },
            { id: "notes" as const, Icon: BookOpen, t: "ملخص الاجتماع", s: "اللي اتقال في القاعة", seen: state.notebookOpened },
            { id: "mail" as const, Icon: Mail, t: "اكتب التوصية", s: "إيميل لـ م. شريف", seen: false },
          ].map((o, i) => (
            <motion.button
              key={o.id}
              className={`g-location station-${o.id} ${o.id === "mail" ? "is-main" : ""}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                if (o.id === "mail") { sfx.paper(); dispatch({ type: "toDecision" }); return; }
                sfx.paper();
                if (o.id === "notes") dispatch({ type: "openNotebook" });
                setOpen(o.id);
              }}
            >
              <span className="g-location-icon"><o.Icon /></span>
              <span className="g-location-text"><b>{o.t}</b><small>{o.s}</small></span>
              {o.seen && <span className="g-location-done">اتراجع</span>}
            </motion.button>
          ))}
        </div>
      </section>
      <AnimatePresence>
        {open && (
          <motion.div className="g-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)} role="dialog" aria-modal="true">
            <motion.article className="g-doc" onClick={(e) => e.stopPropagation()} initial={{ y: 60, rotate: -3, opacity: 0 }} animate={{ y: 0, rotate: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: "spring", stiffness: 220, damping: 22 }}>
              <button className="g-close" aria-label="إغلاق" onClick={() => setOpen(null)}><X /></button>
              {open === "chart" ? (
                <>
                  <header className="g-doc-head"><span><FileText /> تقرير رسمي</span><h3>ساعات التدريب مقابل تقييم الأداء</h3><small>صادر عن: إدارة التدريب والتطوير · عيّنة من ٦٠٠ موظف</small></header>
                  <Chart stagger={0.03} />
                  <footer className="g-doc-foot">
                    <motion.span className="g-seal" initial={{ scale: 2.2, rotate: -30, opacity: 0 }} animate={{ scale: 1, rotate: -10, opacity: 1 }} transition={{ delay: 0.6, type: "spring", damping: 9 }}>معتمد</motion.span>
                  </footer>
                </>
              ) : (
                <>
                  <header className="g-doc-head"><span><BookOpen /> ملخص الاجتماع</span><h3>اجتماع ميزانية التدريب</h3><small>الحضور: م. شريف · أ. طارق · مدير الموارد البشرية</small></header>
                  <ol className="g-notes">
                    {NOTEBOOK.map((n, i) => (
                      <motion.li key={n} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.12 }}>{n}</motion.li>
                    ))}
                  </ol>
                </>
              )}
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Decision({ state, dispatch }: { state: State; dispatch: (a: Action) => void }) {
  return (
    <div className="g-stage center">
      <motion.section className="g-decision" initial={{ y: 28, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <small>قرار تنفيذي</small>
        <h2>م. شريف مستني رأيك بخصوص ميزانية التدريب.. ما هي توصيتك؟</h2>
        <div className="g-recs" role="radiogroup">
          {state.order.map((id) => (
            <button key={id} role="radio" aria-checked={state.picked === id} className={`g-rec ${state.picked === id ? "on" : ""}`} onClick={() => { sfx.pen(); dispatch({ type: "pick", id }); }}>
              <i aria-hidden />{RECS[id]}
            </button>
          ))}
        </div>
        <div className="g-mail-actions">
          <button className="g-btn primary big" disabled={!state.picked} onClick={() => dispatch({ type: "composeEmail" })}><FileText /> صياغة التوصية</button>
          <button className="g-btn secondary" onClick={() => dispatch({ type: "backToOffice" })}>ارجع للمكتب</button>
        </div>
      </motion.section>
    </div>
  );
}

function Email({ state, dispatch, travel }: { state: State; dispatch: (a: Action) => void; travel: (a: Action) => void }) {
  const [flying, setFlying] = useState(false);
  return (
    <div className="g-stage center">
      <motion.article className="g-mail" initial={{ y: 40, opacity: 0 }} animate={flying ? { x: "-60vw", y: "-70vh", scale: 0.2, rotate: -20, opacity: 0 } : { y: 0, opacity: 1 }} transition={flying ? { duration: 0.8, ease: "easeIn" } : { type: "spring", stiffness: 200, damping: 22 }}>
        <div className="g-mail-bar"><Mail /> رسالة جديدة</div>
        <div className="g-mail-head">
          <p><b>إلى:</b> م. شريف — المدير العام</p>
          <p><b>الموضوع:</b> توصية بخصوص ميزانية التدريب</p>
        </div>
        <p className="g-mail-hi">م. شريف،</p>
        <p className="g-mail-body">{EMAIL_BODIES[state.picked!]}</p>
        <p className="g-mail-sign">وتفضلوا بقبول فائق الاحترام،<br />مدير الموارد البشرية</p>
        <div className="g-mail-actions">
          <button className="g-btn primary big" disabled={!state.picked || flying} onClick={() => { setFlying(true); whoosh(); window.setTimeout(() => travel({ type: "send" }), 700); }}>
            <Send /> إرسال الإيميل
          </button>
          <button className="g-btn secondary" disabled={flying} onClick={() => { sfx.tap(); dispatch({ type: "backToOffice" }); }}>ارجع للمكتب</button>
        </div>
      </motion.article>
    </div>
  );
}

function Verdict({ state, dispatch, travel }: { state: State; dispatch: (a: Action) => void; travel: (a: Action) => void }) {
  const sent = state.sent!;
  const v = VERDICTS[sent];
  const won = isWin(sent);
  const [i, setI] = useState(0);
  const [stage, setStage] = useState<"talk" | "stamp" | "result">("talk");
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const finish = () => {
    setStage("stamp");
    sfx.stamp();
    timer.current = window.setTimeout(() => { setStage("result"); won ? sfx.win() : sfx.lose(); }, 1500);
  };
  if (stage === "talk")
    return (
      <div className="g-stage">
        <Dialogue line={v.lines[i]!} index={i} total={v.lines.length} onNext={() => (i + 1 < v.lines.length ? (sfx.tap(), setI(i + 1)) : finish())} nextLabel={i + 1 < v.lines.length ? "التالي" : "القرار"} />
      </div>
    );
  if (stage === "stamp")
    return (
      <div className="g-stage center">
        <motion.div className={`g-stamp ${won ? "good" : "bad"}`} initial={{ scale: 3, rotate: -25, opacity: 0 }} animate={{ scale: 1, rotate: -12, opacity: 1 }} transition={{ type: "spring", damping: 8, stiffness: 200 }}>
          {v.stamp}
        </motion.div>
      </div>
    );
  return <Results state={state} travel={travel} />;
}

function Results({ state, travel }: { state: State; travel: (a: Action) => void }) {
  const won = isWin(state.sent!);
  const rank = rankOf(state);
  const stars = won ? (rank === "expert" ? 3 : 2) : 0;
  const [why, setWhy] = useState(won);
  const confetti = useMemo(() => (won ? Array.from({ length: 34 }, (_, i) => ({ i, x: (i * 37) % 100, d: 2.6 + (i % 5) * 0.45, delay: (i % 7) * 0.18, r: (i * 53) % 360, c: i % 3 })) : []), [won]);
  return (
    <div className="g-stage center scroll">
      {confetti.map((p) => (
        <motion.i key={p.i} className={`g-confetti c${p.c}`} style={{ left: `${p.x}%` }} initial={{ y: -40, rotate: p.r, opacity: 0 }} animate={{ y: "105vh", rotate: p.r + 540, opacity: [0, 1, 1, 0] }} transition={{ duration: p.d, delay: p.delay, ease: "easeIn" }} aria-hidden />
      ))}
      <motion.section className={`g-results ${won ? "is-win" : "is-loss"}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div className="g-status" initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{won ? "التوصية اتعتمدت" : "التوصية اتنفذت.. والنتيجة ما كانتش مطمّنة"}</motion.div>
        <motion.h2 initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 14 }}>
          {won && rank ? RANKS[rank] : VERDICTS[state.sent!].stamp}
        </motion.h2>
        <div className="g-trophy-wrap">
          {won && <span className="g-rays" aria-hidden />}
          <motion.div className="g-trophy" initial={{ y: 60, opacity: 0, scale: 0.6 }} animate={won ? { y: 0, opacity: 1, scale: 1 } : { y: 0, opacity: 1, scale: 0.92, rotate: [0, -6, 6, -3, 0] }} transition={{ delay: 0.3, duration: won ? 0.6 : 1.1 }}>
            {won ? <Trophy /> : <FileText />}
          </motion.div>
          <div className="g-stars" aria-label={`${stars} من ٣ نجوم`}>
            {[0, 1, 2].map((n) => (
              <motion.span key={n} className={n < stars ? "lit" : ""} initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.8 + n * 0.22, type: "spring", stiffness: 300 }}><Star /></motion.span>
            ))}
          </div>
        </div>
        {!why && <button className="g-btn quiet" onClick={() => setWhy(true)}><Lightbulb /> اعرض الخلاصة</button>}
        {why && (
          <div className="g-takeaways">
            {TAKEAWAYS.map((t, n) => (
              <motion.article key={t.q} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 + n * 0.18 }}>
                <strong>{t.q}</strong>
                <p>{t.a}</p>
              </motion.article>
            ))}
          </div>
        )}
        <div className="g-result-actions">
          {!won && <button className="g-btn primary big" onClick={() => travel({ type: "reviewAgain" })}>راجع التقرير تاني</button>}
          <button className={`g-btn big ${won ? "primary" : "secondary"}`} onClick={() => travel({ type: "restart" })}><RotateCcw /> العب من الأول</button>
        </div>
      </motion.section>
    </div>
  );
}
