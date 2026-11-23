import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BarChart3, ChevronDown, ChevronLeft, DoorOpen, FileQuestion, Home, Mail, RotateCcw, Send, Smartphone, Volume2, VolumeX } from "lucide-react";
import { DEADLINE_SECONDS, claimsFor, initialState, reduce, timeLeft, type Action, type ClaimId, type State } from "./engine";
import { BRIEF, CLAIMS, EMAIL_BODIES, GUESSES, LOSS_GUESS, LOSS_SUPERFICIAL, MEETING, METRICS, METRICS_LIST, MISMATCH, QUESTIONS, SEIF_MESSAGES, SUBTITLE_AR, THOUGHTS, TIMEOUT, TITLE, WIN, type Ending, type Line, type Metric, type Speaker } from "./content";
import { PORTRAITS, SCENES, type SceneKey } from "./assets";
import { MiniEvidenceChip, OfficialReportModal } from "./Chart";
import { setMuted, sfx, startBgm, tick, whoosh } from "./audio";
import "./game.css";

const WHO: Record<Speaker, { name: string; role: string; tone: "dark" | "light" }> = {
  tarek: { name: "أ. طارق", role: "مدير التدريب والتطوير", tone: "dark" },
  seif: { name: "مستر سيف", role: "المدير العام", tone: "light" },
  player: { name: "أنت", role: "محلل الـ HR", tone: "light" },
};

const STATION: Record<State["phase"], string> = { intro: "", brief: "مكتب المدير العام", road: "ممر الإدارة", meeting: "مكتب التدريب", office: "مكتب التحليل", verdict: "القرار النهائي" };

const ending = (s: State): Ending => {
  if (s.timedOut) return TIMEOUT;
  if (s.outcome === "win") return WIN;
  if (s.outcome === "lossGuess") return LOSS_GUESS;
  return LOSS_SUPERFICIAL;
};

export default function Game() {
  const [state, raw] = useReducer(reduce, undefined, initialState);
  const [muted, setMute] = useState(false);
  const [fade, setFade] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [phoneOpen, setPhoneOpen] = useState(true);
  const timeoutSent = useRef(false);
  const dispatch = useCallback((a: Action) => raw(a), []);

  useEffect(() => { setMuted(muted); }, [muted]);
  useEffect(() => {
    const begin = () => startBgm();
    window.addEventListener("pointerdown", begin, { once: true });
    return () => window.removeEventListener("pointerdown", begin);
  }, []);

  const travel = useCallback((a: Action) => {
    setFade(true);
    whoosh();
    window.setTimeout(() => { raw(a); window.setTimeout(() => setFade(false), 120); }, 420);
  }, []);

  const timerOn = state.phase === "office" && state.officeEntered;
  const remaining = timeLeft(elapsed, state.penalty);
  useEffect(() => {
    if (!timerOn) return;
    const id = window.setInterval(() => setElapsed((v) => v + 1), 1000);
    return () => window.clearInterval(id);
  }, [timerOn]);
  useEffect(() => {
    if (!timerOn) { timeoutSent.current = false; return; }
    if (remaining < 20 && remaining > 0) tick(remaining < 10);
    if (remaining === 0 && !timeoutSent.current) { timeoutSent.current = true; travel({ type: "timeout" }); }
  }, [remaining, timerOn, travel]);
  useEffect(() => {
    if (state.phase === "office" && !state.officeEntered) setElapsed(0);
  }, [state.phase, state.officeEntered]);

  const messageCount = remaining <= 20 ? 2 : remaining <= 45 ? 1 : 0;
  const scene: SceneKey = state.phase === "intro" ? "cover" : state.phase === "brief" || state.phase === "verdict" ? "ceo" : state.phase === "road" ? "corridor" : state.phase === "meeting" ? "meeting" : "desk";

  return (
    <div className="g600 g-training-eval" dir="rtl">
      <Scene k={scene} />
      {state.phase !== "intro" && <Hud state={state} muted={muted} remaining={remaining} timerOn={timerOn} onMute={() => setMute((v) => !v)} onRestart={() => travel({ type: "restart" })} />}
      {timerOn && messageCount > 0 && <PhoneNotifier count={messageCount} open={phoneOpen} onToggle={() => setPhoneOpen((v) => !v)} />}
      {timerOn && remaining < 15 && <div className="g-urgency-vignette" aria-hidden />}
      <AnimatePresence mode="wait">
        <motion.main key={`${state.phase}-${state.view}`} className="g-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .25 }}>
          {state.phase === "intro" && <Cover go={() => { startBgm(); sfx.tap(); travel({ type: "start" }); }} />}
          {state.phase === "brief" && <Dialogue line={BRIEF[state.line]!} index={state.line} total={BRIEF.length} onNext={() => travel({ type: "next" })} nextLabel="روح لمكتب التدريب" />}
          {state.phase === "road" && <Road next={() => travel({ type: "next" })} />}
          {state.phase === "meeting" && <Dialogue line={MEETING[state.line]!} index={state.line} total={MEETING.length} onNext={() => state.line + 1 < MEETING.length ? dispatch({ type: "next" }) : travel({ type: "next" })} nextLabel={state.line + 1 < MEETING.length ? "التالي" : "ادخل مكتبك"} />}
          {state.phase === "office" && <Office state={state} dispatch={dispatch} onSend={() => raw({ type: "send" })} />}
          {state.phase === "verdict" && <Verdict state={state} dispatch={dispatch} travel={travel} />}
        </motion.main>
      </AnimatePresence>
      <AnimatePresence>{fade && <motion.div className="g-dip" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .35 }} />}</AnimatePresence>
    </div>
  );
}

function Scene({ k }: { k: SceneKey }) {
  const s = SCENES[k];
  return <div className={`g-scene scene-${k}`} aria-hidden><motion.picture key={k} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><source media="(max-width:640px)" srcSet={s.p} /><img src={s.l} alt="" /></motion.picture><div className={`g-wash ${k === "cover" ? "cover" : ""}`} /></div>;
}

function Hud({ state, muted, remaining, timerOn, onMute, onRestart }: { state: State; muted: boolean; remaining: number; timerOn: boolean; onMute: () => void; onRestart: () => void }) {
  const urgency = remaining < 20 ? "red" : remaining < 45 ? "amber" : "calm";
  return <header className="g-hud"><div className="g-hud-tools"><button aria-label="ابدأ من الأول" onClick={onRestart}><Home /></button><button aria-label={muted ? "تشغيل الصوت" : "كتم الصوت"} onClick={onMute}>{muted ? <VolumeX /> : <Volume2 />}</button></div><div className="g-hud-place"><small>{TITLE}</small><b>{STATION[state.phase]}</b></div>{timerOn ? <div className={`g-timer ${urgency}`} role="timer"><b>{`${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`}</b><i><em style={{ width: `${(remaining / DEADLINE_SECONDS) * 100}%` }} /></i></div> : <span />}</header>;
}

function Cover({ go }: { go: () => void }) {
  return <section className="g-cover"><motion.h1 dir="ltr" initial={{ y: 22, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{TITLE}</motion.h1><motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .2 }}>{SUBTITLE_AR}</motion.h2><motion.button className="g-btn primary big" onClick={go} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .4 }}>ابدأ القضية</motion.button><small className="g-role">دورك: محلل الموارد البشرية</small></section>;
}

function Road({ next }: { next: () => void }) {
  return <div className="g-stage center"><motion.button className="g-road-cta" onClick={() => { sfx.door(); next(); }} initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} whileHover={{ scale: 1.04 }}><DoorOpen /> الدخول لمكتب التدريب <ArrowLeft /></motion.button></div>;
}

function Dialogue({ line, index, total, onNext, nextLabel }: { line: Line; index: number; total: number; onNext: () => void; nextLabel: string }) {
  const who = WHO[line.who];
  const chars = useMemo(() => Array.from(line.text), [line.text]);
  const [shown, setShown] = useState(0);
  const done = shown >= chars.length;
  useEffect(() => { setShown(0); }, [line.text]);
  useEffect(() => { if (done) return; const id = window.setTimeout(() => setShown((n) => Math.min(chars.length, n + 3)), 22); return () => window.clearTimeout(id); }, [shown, done, chars.length]);
  return <div className="g-stage"><motion.section className={`g-dialogue ${who.tone}`} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}><span className="g-portrait"><img src={PORTRAITS[line.who]} alt="" /></span><div><header><span>{who.name}</span><small>{who.role}</small><em>{index + 1}/{total}</em></header><button className="g-copy" onClick={() => done ? onNext() : setShown(chars.length)}><p>{chars.slice(0, shown).join("")}{!done && <i />}</p></button><footer>{done && <button className="g-btn primary" onClick={onNext}>{nextLabel}<ChevronLeft /></button>}</footer></div></motion.section></div>;
}

function PhoneNotifier({ count, open, onToggle }: { count: number; open: boolean; onToggle: () => void }) {
  if (!open) return <button className="g-phone-mini" onClick={onToggle} aria-label="فتح رسائل مستر سيف"><Smartphone /><b>{count}</b></button>;
  return <motion.div className="g-phone-device g-phone-buzz" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><i className="g-phone-btn g-phone-btn-power" /><i className="g-phone-btn g-phone-btn-vol" /><section className="g-phone-screen"><div className="g-phone-island"><span className="g-phone-camera" /><span className="g-phone-speaker" /></div><div className="g-phone-status-bar"><span>12:44</span><span className="g-phone-status-icons">5G 📶 🔋85%</span></div><button className="g-phone-head g-phone-header" onClick={onToggle}><img src={PORTRAITS.seif} alt="مستر سيف" /><span className="g-phone-meta"><b>مستر سيف (المدير العام)</b><small>متصل الآن 🟢</small></span><ChevronDown /></button><div className="g-phone-body">{SEIF_MESSAGES.slice(0, count).map((message) => <motion.article className="g-msg-bubble" key={message} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{message}<span className="g-msg-footer">الآن <i className="g-msg-ticks">✓✓</i></span></motion.article>)}</div><div className="g-phone-home-bar"><i className="g-home-pill" /></div></section></motion.div>;
}

function Office({ state, dispatch, onSend }: { state: State; dispatch: (a: Action) => void; onSend: () => void }) {
  const [report, setReport] = useState<Metric | null>(null);
  const [step, setStep] = useState(0);
  const [dataComplete, setDataComplete] = useState(false);
  if (!state.officeEntered) return <div className="g-stage center"><section className="g-arrive"><small>بعد مقابلة طارق</small><h2>مكتب التحليل مستنيك</h2><p>قدامك دقيقتين تختار طريق التحليل وتبعت التوصية.</p><button className="g-btn primary big" onClick={() => { sfx.door(); dispatch({ type: "enterOffice" }); }}>ادخل المكتب</button></section></div>;
  return <div className="g-stage g-office-stage"><section className="g-workspace">
    {state.view === "think" && <Think dispatch={dispatch} />}
    {state.view === "guess" && <Guess dispatch={dispatch} />}
    {state.view === "data" && <DataView state={state} dispatch={dispatch} step={step} setStep={setStep} complete={dataComplete} setComplete={setDataComplete} openReport={setReport} />}
    {state.view === "ask" && <AskView state={state} dispatch={dispatch} openReport={setReport} />}
    {state.view === "email" && <Email state={state} dispatch={dispatch} onSend={onSend} />}
  </section><AnimatePresence>{report && <OfficialReportModal metric={report} onClose={() => setReport(null)} />}</AnimatePresence></div>;
}

function Think({ dispatch }: { dispatch: (a: Action) => void }) {
  return <><header className="g-work-head"><small>لحظة التفكير</small><h2>هتبدأ منين؟</h2><p>كل طريق له تكلفة في الوقت، واختيار البداية جزء من التحليل.</p></header><div className="g-path-grid">{(["guess", "data", "ask"] as const).map((to, i) => <button key={to} className={`g-path-card path-${to}`} onClick={() => { sfx.tap(); dispatch({ type: "think", to }); }}><span>{i === 0 ? "⚡" : i === 1 ? "📊" : "❓"}</span><b>{THOUGHTS[to]}</b><small>{to === "guess" ? "تخمين سريع" : to === "data" ? "خصم ٥ ثوانٍ" : "سؤال واحد ذكي"}</small></button>)}</div></>;
}

function Guess({ dispatch }: { dispatch: (a: Action) => void }) {
  return <><header className="g-work-head"><small>طريق التخمين</small><h2>إيه تفسيرك الأول؟</h2></header><div className="g-choice-list">{GUESSES.map((g) => <button key={g.id} onClick={() => { sfx.pen(); dispatch({ type: "guess", id: g.id }); }}>{g.text}</button>)}</div><button className="g-btn quiet" onClick={() => dispatch({ type: "backToThink" })}>ارجع وفكر تاني</button></>;
}

function DataView({ state, dispatch, step, setStep, complete, setComplete, openReport }: { state: State; dispatch: (a: Action) => void; step: number; setStep: (n: number) => void; complete: boolean; setComplete: (v: boolean) => void; openReport: (m: Metric) => void }) {
  const metric = METRICS_LIST[step]!;
  if (!complete) return <><header className="g-work-head"><small>كشف البيانات التدريجي</small><h2>تقرير {step + 1} من 8</h2></header><section className="g-progressive-card"><span className={`g-source-tag tag-${metric.source.toLowerCase()}`}>{metric.source}</span><h3>{metric.labelAr}</h3><div className="g-ab-numbers" dir="ltr"><b>A: {metric.a}{metric.unit}</b><i /><b>B: {metric.b}{metric.unit}</b></div><p>{metric.note}</p><button className="g-btn secondary" onClick={() => openReport(metric)}><BarChart3 /> افتح التقرير الرسمي</button></section><div className="g-step-actions"><button className="g-btn secondary" disabled={step === 0} onClick={() => setStep(step - 1)}><ArrowRight /> السابق</button><button className="g-btn primary" onClick={() => step < 7 ? setStep(step + 1) : setComplete(true)}>{step < 7 ? "التقرير التالي" : "افتح لوحة الأدلة"}<ArrowLeft /></button></div><button className="g-btn quiet" onClick={() => dispatch({ type: "backToThink" })}>ارجع للبداية</button></>;
  return <><header className="g-work-head compact"><small>Evidence Dock</small><h2>اختار استنتاجًا ثم الدليل اللي يسنده</h2></header><div className="g-evidence-dock">{METRICS_LIST.map((m) => <MiniEvidenceChip key={m.id} metric={m} selected={state.evidence === m.id} onClick={() => { openReport(m); if (state.claim) dispatch({ type: "evidence", id: m.id }); }} />)}</div><ClaimPicker state={state} dispatch={dispatch} /><button className="g-btn quiet" onClick={() => setComplete(false)}>راجع التقارير بالتتابع</button></>;
}

function AskView({ state, dispatch, openReport }: { state: State; dispatch: (a: Action) => void; openReport: (m: Metric) => void }) {
  const asked = QUESTIONS.find((q) => q.id === state.asked[0]);
  if (!asked) return <><header className="g-work-head"><small>اسأل صح</small><h2>عندك سؤال واحد.. اختاره بعناية</h2></header><div className="g-choice-list">{QUESTIONS.map((q) => <button key={q.id} onClick={() => { sfx.tap(); dispatch({ type: "ask", id: q.id }); }}>{q.text}</button>)}</div><button className="g-btn quiet" onClick={() => dispatch({ type: "backToThink" })}>ارجع للبداية</button></>;
  if (asked.na) return <section className="g-na-card"><span>غير متاح</span><h2>Data Not Available</h2><p>نسبة الشكاوى المسجلة خاصة باللي ملوا الاستبيان فقط، مفيش أي بيانات مسجلة لنسبة الشكاوى من إجمالي الحضور!</p><button className="g-btn primary" onClick={() => dispatch({ type: "resetAsk" })}>اختر سؤالاً آخر</button></section>;
  if (!asked.shows) return null;
  const metric = METRICS[asked.shows];
  return <><header className="g-work-head compact"><small>إجابة السؤال</small><h2>{asked.text}</h2></header><MiniEvidenceChip metric={metric} selected={state.evidence === metric.id} onClick={() => openReport(metric)} /><ClaimPicker state={state} dispatch={dispatch} boundEvidence={metric.id} /></>;
}

function ClaimPicker({ state, dispatch, boundEvidence }: { state: State; dispatch: (a: Action) => void; boundEvidence?: Metric["id"] }) {
  const claims = claimsFor(state);
  return <section className="g-claim-zone"><h3>إيه استنتاجك؟</h3><div className="g-claims">{claims.map((id) => <button key={id} className={state.claim === id ? "is-selected" : ""} onClick={() => { dispatch({ type: "claim", id }); if (boundEvidence) dispatch({ type: "evidence", id: boundEvidence }); }}>{CLAIMS[id]}</button>)}</div>{state.mismatch && <p className="g-mismatch">{MISMATCH}</p>}<button className="g-btn primary big" disabled={!state.claim || !state.evidence || state.mismatch} onClick={() => dispatch({ type: "confirm" })}><Mail /> اكتب التوصية</button></section>;
}

function Email({ state, dispatch, onSend }: { state: State; dispatch: (a: Action) => void; onSend: () => void }) {
  const [flying, setFlying] = useState(false);
  const claim = state.claim!;
  return <motion.article className="g-mail" initial={{ y: 30, opacity: 0 }} animate={flying ? { y: "-90vh", x: "-25vw", scale: .2, rotate: -18, opacity: 0 } : { y: 0, opacity: 1 }} transition={flying ? { duration: .8, ease: "easeIn" } : { duration: .25 }}><div className="g-mail-bar"><Mail /> رسالة جديدة</div><div className="g-mail-head"><p><b>إلى:</b> مستر سيف — المدير العام</p><p><b>الموضوع:</b> توصية تقييم كورس التدريب والتجديد</p></div><p className="g-mail-hi">مستر سيف،</p><p className="g-mail-body">{EMAIL_BODIES[claim]}</p><p className="g-mail-sign">وتفضلوا بقبول فائق الاحترام،<br />محلل الموارد البشرية</p><div className="g-mail-actions"><button className="g-btn primary big" disabled={flying} onClick={() => { setFlying(true); whoosh(); window.setTimeout(onSend, 800); }}><Send /> {flying ? "التوصية في الطريق" : "إرسال التوصية"}</button><button className="g-btn secondary" disabled={flying} onClick={() => dispatch({ type: "backToThink" })}>راجع التحليل</button></div></motion.article>;
}

function Verdict({ state, dispatch, travel }: { state: State; dispatch: (a: Action) => void; travel: (a: Action) => void }) {
  const result = ending(state);
  const [showResult, setShowResult] = useState(false);
  if (!showResult) return <Dialogue line={result.lines[0]!} index={0} total={1} nextLabel="شوف النتيجة" onNext={() => { state.outcome === "win" ? sfx.win() : sfx.lose(); setShowResult(true); }} />;
  const won = state.outcome === "win";
  return <div className="g-stage center scroll"><motion.section className={`g-ending-card ${won ? "is-win" : "is-loss"}`} initial={{ scale: .9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><div className="g-ending-stamp">{result.stamp}</div><span className="g-ending-icon">{won ? "🏆" : state.timedOut ? "⏳" : state.outcome === "lossGuess" ? "⚡" : "📉"}</span><h2>{result.title}</h2><p>{result.desc}</p><div className="g-ending-actions">{!won && <button className="g-btn primary" onClick={() => dispatch({ type: "retry" })}>حاول تاني</button>}<button className="g-btn secondary" onClick={() => travel({ type: "restart" })}><RotateCcw /> ابدأ من الأول</button></div></motion.section></div>;
}
