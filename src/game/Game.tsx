import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ChevronDown, ChevronLeft, Clock, DoorOpen, Home, Lightbulb, Mail, RotateCcw, Send, Smartphone, Trophy, Volume2, VolumeX, FileText } from "lucide-react";
import { DEADLINE_SECONDS, EVIDENCE, claimsFor, initialState, reduce, timeLeft, type Action, type State } from "./engine";
import { BRIEF, CLAIMS, EMAIL_BODIES, GUESSES, LOSS, MEETING, METRICS, MISMATCH, QUESTIONS, ROAD, SHERIF_MESSAGES, SUBTITLE_AR, TAKEAWAYS, THOUGHTS, TIMEOUT, TITLE, WIN, type Line, type Speaker } from "./content";
import { PORTRAITS, SCENES, type SceneKey } from "./assets";
import { BarCard } from "./Chart";
import { setMuted, sfx, tick, whoosh } from "./audio";
import "./game.css";

const WHO: Record<Speaker, { name: string; role: string; tone: "dark" | "light" }> = {
  tarek: { name: "أ. طارق", role: "مدير التدريب والتطوير", tone: "dark" },
  sherif: { name: "م. شريف", role: "المدير العام", tone: "light" },
  player: { name: "أنت", role: "محلل الـ HR", tone: "light" },
};
const STATION: Record<State["phase"], string> = { intro: "", brief: "مكتب المدير العام", road: "في الطريق", meeting: "مكتب التدريب", office: "مكتبك", verdict: "مكتب المدير العام" };
const ending = (s: State) => (s.timedOut ? TIMEOUT : s.outcome === "win" ? WIN : LOSS);

export default function Game() {
  const [state, raw] = useReducer(reduce, undefined, initialState);
  const [muted, setMute] = useState(false);
  const [fade, setFade] = useState(false);
  const dispatch = useCallback((a: Action) => raw(a), []);
  useEffect(() => { setMuted(muted); }, [muted]);
  const travel = useCallback((a: Action) => {
    setFade(true); whoosh();
    window.setTimeout(() => { raw(a); window.setTimeout(() => setFade(false), 120); }, 420);
  }, []);

  const timerOn = state.phase === "office" && state.officeEntered;
  const penalty = useRef(0);
  penalty.current = state.penalty;
  const [left, setLeft] = useState(DEADLINE_SECONDS);
  const [lastLeft, setLastLeft] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [phoneOpen, setPhoneOpen] = useState(true);
  const [phoneBuzz, setPhoneBuzz] = useState(false);
  useEffect(() => {
    if (!timerOn) { setMessageCount(0); setPhoneOpen(true); return; }
    const start = Date.now();
    let m1 = false, m2 = false;
    const receive = (n: number) => { setMessageCount(n); setPhoneOpen(true); setPhoneBuzz(true); sfx.chime(); window.setTimeout(() => setPhoneBuzz(false), 450); };
    const step = () => {
      const l = timeLeft(Math.floor((Date.now() - start) / 1000), penalty.current);
      setLeft(l); setLastLeft(l);
      if (l <= 60 && !m1) { m1 = true; receive(1); }
      if (l <= 25 && !m2) { m2 = true; receive(2); }
      if (l > 0 && l < 20) tick(l < 10);
      if (l === 0) { window.clearInterval(id); travel({ type: "timeout" }); }
    };
    const id = window.setInterval(step, 1000);
    setLeft(DEADLINE_SECONDS);
    return () => window.clearInterval(id);
  }, [timerOn, travel]);
  const urgency = left < 25 ? "red" : left < 60 ? "amber" : "calm";

  const scene: SceneKey = state.phase === "intro" ? "cover" : state.phase === "brief" || state.phase === "verdict" ? "ceo" : state.phase === "road" ? "corridor" : state.phase === "meeting" ? "meeting" : "desk";
  const lines = state.phase === "brief" ? BRIEF : state.phase === "road" ? [ROAD] : MEETING;
  const next = () => {
    const lastLine = state.line + 1 >= lines.length;
    if (lastLine) { if (state.phase === "meeting") sfx.door(); travel({ type: "next" }); } else { sfx.tap(); dispatch({ type: "next" }); }
  };

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
            <small>{TITLE}</small><b>{STATION[state.phase]}</b>
          </motion.div>
          {timerOn ? (
            <div className={`g-timer ${urgency}`} role="timer" aria-label="المهلة">
              <b>{`${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`}</b>
              <i><motion.em animate={{ width: `${(left / DEADLINE_SECONDS) * 100}%` }} transition={{ ease: "linear", duration: 1 }} /></i>
            </div>
          ) : <span />}
        </header>
      )}
      {timerOn && <PhoneNotifier count={messageCount} open={phoneOpen} buzzing={phoneBuzz} onToggle={() => setPhoneOpen((v) => !v)} />}
      <AnimatePresence mode="wait">
        <motion.div key={state.phase} className="g-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          {state.phase === "intro" && <Cover go={() => { sfx.tap(); travel({ type: "start" }); }} />}
          {(state.phase === "brief" || state.phase === "road" || state.phase === "meeting") && (
            <div className="g-stage">
              <Dialogue line={lines[state.line]!} index={state.line} total={lines.length} onNext={next} nextLabel={state.line + 1 >= lines.length ? (state.phase === "meeting" ? "على مكتبك" : "يلا بينا") : "التالي"} />
            </div>
          )}
          {state.phase === "office" && <Office state={state} dispatch={dispatch} travel={travel} />}
          {state.phase === "verdict" && <Verdict state={state} travel={travel} left={lastLeft} />}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>{fade && <motion.div className="g-dip" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.38 }} />}</AnimatePresence>
    </div>
  );
}

function PhoneNotifier({ count, open, buzzing, onToggle }: { count: number; open: boolean; buzzing: boolean; onToggle: () => void }) {
  if (!count) return null;
  if (!open) {
    return <button className="g-phone-mini" onClick={onToggle} aria-label="فتح رسائل م. شريف"><Smartphone /><b>{count}</b></button>;
  }
  return (
    <motion.div className={`g-phone-device ${buzzing ? "g-phone-buzz" : ""}`} initial={{ y: 120, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 120, opacity: 0, scale: 0.9 }} transition={{ type: "spring", stiffness: 260, damping: 24 }}>
      <i className="g-phone-btn g-phone-btn-power" aria-hidden />
      <i className="g-phone-btn g-phone-btn-vol" aria-hidden />
      <section className="g-phone-screen" aria-label="رسائل واتساب من م. شريف">
        <div className="g-phone-island" aria-hidden><span className="g-phone-camera" /><span className="g-phone-speaker" /></div>
        <div className="g-phone-status-bar"><span>12:44</span><span className="g-phone-status-icons"><span>5G</span><span>📶</span><span>🔋 85%</span></span></div>
        <button className="g-phone-head" onClick={onToggle} aria-label="تصغير الرسائل">
          <img src={PORTRAITS.sherif} alt="م. شريف" />
          <span className="g-phone-meta"><b>م. شريف (المدير العام)</b><small>متصل الآن 🟢</small></span>
          <ChevronDown />
        </button>
        <div className="g-phone-body" aria-live="polite">
          <AnimatePresence initial={false}>
            {SHERIF_MESSAGES.slice(0, count).map((message) => (
              <motion.article key={message} className="g-msg-bubble" initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.22, ease: "easeOut" }}>
                {message}
                <span className="g-msg-footer"><time>الآن</time><i className="g-msg-ticks">✓✓</i></span>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
        <div className="g-phone-home-bar" aria-hidden><i className="g-home-pill" /></div>
      </section>
    </motion.div>
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
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.key !== "Enter") return;
      e.preventDefault();
      if (done) onNext(); else setShown(chars.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, onNext, chars.length]);
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
          <p className={line.thought ? "is-thought" : ""}>{chars.slice(0, shown).join("")}{!done && <i aria-hidden />}</p>
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

function Office({ state, dispatch, travel }: { state: State; dispatch: (a: Action) => void; travel: (a: Action) => void }) {
  const [flash, setFlash] = useState<string | null>(null);
  const prevPenalty = useRef(state.penalty);
  useEffect(() => {
    const d = state.penalty - prevPenalty.current;
    prevPenalty.current = state.penalty;
    if (d > 0) { setFlash(`-${d} ثانية`); const t = window.setTimeout(() => setFlash(null), 1400); return () => window.clearTimeout(t); }
    return undefined;
  }, [state.penalty]);
  if (!state.officeEntered)
    return (
      <div className="g-stage center">
        <motion.section className="g-arrive" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <small>بعد الاجتماع</small><h2>رجعت مكتبك</h2>
          <p>م. شريف مستني قرارك.. والساعة هتبدأ تعد أول ما تقعد.</p>
          <button className="g-btn primary big" onClick={() => { sfx.door(); dispatch({ type: "enterOffice" }); }}><DoorOpen /> اقعد على مكتبك</button>
        </motion.section>
      </div>
    );
  const back = <button className="g-btn secondary" onClick={() => { sfx.tap(); dispatch({ type: "backToThink" }); }}>ارجع فكّر تاني</button>;
  return (
    <div className="g-stage center g-office">
      <AnimatePresence>{flash && <motion.div className="g-penalty" initial={{ y: -10, opacity: 0, scale: 0.8 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ opacity: 0 }}><Clock /> {flash}</motion.div>}</AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.div key={state.view} className="g-office-view" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
          {state.view === "think" && (
            <section className="g-think">
              <img className="g-thinker" src={PORTRAITS.player} alt="" />
              <h2>بتفكر في إيه؟</h2>
              {(["guess", "data", "ask"] as const).map((k, i) => (
                <motion.button key={k} className="g-bubble" initial={{ opacity: 0, scale: 0.6, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.15, type: "spring", stiffness: 260, damping: 18 }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { sfx.pen(); dispatch({ type: "think", to: k }); }}>
                  💭 {THOUGHTS[k]}
                </motion.button>
              ))}
            </section>
          )}
          {state.view === "guess" && (
            <section className="g-panel">
              <small>💭 {THOUGHTS.guess}</small><h2>إيه السبب في رأيك؟</h2>
              <div className="g-recs">{GUESSES.map((g) => <button key={g.id} className="g-rec" onClick={() => { sfx.pen(); dispatch({ type: "guess", id: g.id }); }}><i aria-hidden />{g.text}</button>)}</div>
              <div className="g-mail-actions">{back}</div>
            </section>
          )}
          {state.view === "ask" && <Ask state={state} dispatch={dispatch} back={back} />}
          {state.view === "data" && (
            <section className="g-panel wide">
              <small>تقارير الـ LMS والاستبيان</small><h2>الداتا المتاحة</h2>
              <div className="g-bars">{EVIDENCE.map((k, i) => <BarCard key={k} m={METRICS[k]} delay={i * 0.06} />)}</div>
              <Claim state={state} dispatch={dispatch} />
              <div className="g-mail-actions">{back}</div>
            </section>
          )}
          {state.view === "email" && <Email state={state} dispatch={dispatch} travel={travel} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Ask({ state, dispatch, back }: { state: State; dispatch: (a: Action) => void; back: React.ReactNode }) {
  const [deciding, setDeciding] = useState(false);
  const last = state.asked[state.asked.length - 1];
  return (
    <section className="g-panel wide">
      <small>💭 {THOUGHTS.ask}</small><h2>{deciding ? "قرارك إيه؟" : "تسأل عن إيه؟"}</h2>
      {!deciding ? (
        <>
          <div className="g-recs">{QUESTIONS.map((q) => (
            <button key={q.id} className={`g-rec ${state.asked.includes(q.id) ? "on" : ""}`} onClick={() => { sfx.paper(); dispatch({ type: "ask", id: q.id }); }}><i aria-hidden />{q.text}</button>
          ))}</div>
          <div className="g-answers">
            {QUESTIONS.filter((q) => state.asked.includes(q.id)).map((q) => q.na ? (
              <motion.div key={q.id} className="g-na" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} dir="ltr"><AlertTriangle /> Data Not Available</motion.div>
            ) : <BarCard key={q.id} m={METRICS[q.shows!]} of={q.id === "respondents"} delay={q.id === last ? 0 : 0} />)}
          </div>
          <div className="g-mail-actions">
            <button className="g-btn primary big" disabled={!state.asked.length} onClick={() => { sfx.tap(); setDeciding(true); }}>خلاص، هاخد القرار</button>
            {back}
          </div>
        </>
      ) : (
        <>
          <div className="g-answers">{QUESTIONS.filter((q) => state.asked.includes(q.id) && !q.na).map((q) => <BarCard key={q.id} m={METRICS[q.shows!]} of={q.id === "respondents"} />)}</div>
          <Claim state={state} dispatch={dispatch} />
          <div className="g-mail-actions"><button className="g-btn secondary" onClick={() => setDeciding(false)}>ارجع للأسئلة</button></div>
        </>
      )}
    </section>
  );
}

function Claim({ state, dispatch }: { state: State; dispatch: (a: Action) => void }) {
  useEffect(() => { if (state.mismatch) sfx.wobble(); }, [state.mismatch, state.evidence]);
  return (
    <div className="g-claim">
      <h3>1. اختار استنتاجك</h3>
      <div className="g-chips">{claimsFor(state).map((c) => <button key={c} className={`g-chip ${state.claim === c ? "on" : ""}`} onClick={() => { sfx.pen(); dispatch({ type: "claim", id: c }); }}>{CLAIMS[c]}</button>)}</div>
      {state.claim && (<>
        <h3>2. اختار الدليل اللي يسنده</h3>
        <div className="g-chips" dir="ltr">{EVIDENCE.map((e) => <button key={e} className={`g-chip ev ${state.evidence === e ? (state.mismatch ? "bad" : "on") : ""}`} onClick={() => dispatch({ type: "evidence", id: e })}>{METRICS[e].label}: {METRICS[e].a}{METRICS[e].unit ?? ""} vs {METRICS[e].b}{METRICS[e].unit ?? ""}</button>)}</div>
      </>)}
      <AnimatePresence>{state.mismatch && <motion.p className="g-mismatch" key={state.evidence} initial={{ x: 0 }} animate={{ x: [0, -8, 8, -5, 5, 0] }} exit={{ opacity: 0 }}>⛔ {MISMATCH}</motion.p>}</AnimatePresence>
      <button className="g-btn primary big" disabled={!state.claim || !state.evidence || state.mismatch} onClick={() => { sfx.paper(); dispatch({ type: "confirm" }); }}><FileText /> اكتب التوصية</button>
    </div>
  );
}

function Email({ state, dispatch, travel }: { state: State; dispatch: (a: Action) => void; travel: (a: Action) => void }) {
  const [flying, setFlying] = useState(false);
  return (
    <motion.article className="g-mail" animate={flying ? { x: "-60vw", y: "-70vh", scale: 0.2, rotate: -20, opacity: 0 } : { y: 0, opacity: 1 }} transition={flying ? { duration: 0.8, ease: "easeIn" } : { duration: 0.2 }}>
      <div className="g-mail-bar"><Mail /> رسالة جديدة</div>
      <div className="g-mail-head"><p><b>إلى:</b> م. شريف — المدير العام</p><p><b>الموضوع:</b> توصية بخصوص تقييم كورسين A و B</p></div>
      <p className="g-mail-hi">م. شريف،</p>
      <p className="g-mail-body">{EMAIL_BODIES[state.claim!]}</p>
      <p className="g-mail-sign">مع خالص التحية،<br />محلل الموارد البشرية</p>
      <div className="g-mail-actions">
        <button className="g-btn primary big" disabled={flying} onClick={() => { setFlying(true); whoosh(); window.setTimeout(() => travel({ type: "send" }), 700); }}><Send /> إرسال الإيميل</button>
        <button className="g-btn secondary" disabled={flying} onClick={() => { sfx.tap(); dispatch({ type: "backToThink" }); }}>ارجع فكّر تاني</button>
      </div>
    </motion.article>
  );
}

function Verdict({ state, travel, left }: { state: State; travel: (a: Action) => void; left: number }) {
  const v = ending(state);
  const won = state.outcome === "win";
  const [i, setI] = useState(0);
  const [stage, setStage] = useState<"talk" | "stamp" | "result">("talk");
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const finish = () => { setStage("stamp"); sfx.stamp(); timer.current = window.setTimeout(() => { setStage("result"); if (won) sfx.win(); else sfx.lose(); }, 1500); };
  if (stage === "talk")
    return <div className="g-stage"><Dialogue line={v.lines[i]!} index={i} total={v.lines.length} onNext={() => (i + 1 < v.lines.length ? (sfx.tap(), setI(i + 1)) : finish())} nextLabel={i + 1 < v.lines.length ? "التالي" : "النتيجة"} /></div>;
  if (stage === "stamp")
    return (
      <motion.div className="g-stage center" animate={{ x: [0, -6, 6, -4, 4, 0], y: [0, 3, -3, 2, 0] }} transition={{ delay: 0.25, duration: 0.4 }}>
        <motion.div className={`g-stamp ${won ? "good" : "bad"}`} initial={{ scale: 3, rotate: -25, opacity: 0 }} animate={{ scale: 1, rotate: -12, opacity: 1 }} transition={{ type: "spring", damping: 8, stiffness: 200 }}>{v.stamp}</motion.div>
      </motion.div>
    );
  const confetti = won ? Array.from({ length: 34 }, (_, n) => ({ n, x: (n * 37) % 100, d: 2.6 + (n % 5) * 0.45, delay: (n % 7) * 0.18, r: (n * 53) % 360, c: n % 3 })) : [];
  return (
    <div className="g-stage center">
      {confetti.map((p) => <motion.i key={p.n} className={`g-confetti c${p.c}`} style={{ left: `${p.x}%` }} initial={{ y: -40, rotate: p.r, opacity: 0 }} animate={{ y: "105vh", rotate: p.r + 540, opacity: [0, 1, 1, 0] }} transition={{ duration: p.d, delay: p.delay, ease: "easeIn" }} aria-hidden />)}
      <motion.section className={`g-results ${won ? "is-win" : "is-loss"}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="g-res-main">
          <motion.div className="g-status" initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{v.stamp}</motion.div>
          <div className="g-trophy-wrap">
            {won && <span className="g-rays" aria-hidden />}
            <motion.div className="g-trophy" initial={{ y: 60, opacity: 0, scale: 0.6 }} animate={won ? { y: 0, opacity: 1, scale: 1 } : { y: 0, opacity: 1, scale: 0.92, rotate: [0, -6, 6, -3, 0] }} transition={{ delay: 0.3, duration: won ? 0.6 : 1.1 }}>{won ? <Trophy /> : <FileText />}</motion.div>
          </div>
          <motion.h2 initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.4 }}>«{v.title}»</motion.h2>
          <motion.p className="g-rank-desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>{v.desc}</motion.p>
          {won && <p className="g-rank-stat"><Clock /> فاضل في الوقت: {left} ثانية</p>}
        </div>
        <div className="g-takeaways">
          <h3><Lightbulb /> الخلاصة</h3>
          {TAKEAWAYS.map((t, n) => <motion.article key={t.q} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 + n * 0.18 }}><strong>{t.q}</strong><p>{t.a}</p></motion.article>)}
        </div>
        <div className="g-result-actions">
          {!won && <button className="g-btn primary big" onClick={() => travel({ type: "retry" })}>حاول تاني</button>}
          <button className={`g-btn big ${won ? "primary" : "secondary"}`} onClick={() => travel({ type: "restart" })}><RotateCcw /> العب من الأول</button>
        </div>
      </motion.section>
    </div>
  );
}
