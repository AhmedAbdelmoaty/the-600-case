import type { Mood } from "./content";

// All illustration colors come from --art-* tokens in styles.css (swap art by editing this file only).
const v = (n: string) => `var(--art-${n})`;

export function Manager({ mood = "confident", size = 130 }: { mood?: Mood; size?: number }) {
  const brow = { confident: "M44 50 l14 -3 M76 47 l14 3", thinking: "M44 46 l14 4 M76 48 l14 -4", surprised: "M44 44 l14 -4 M76 40 l14 4", happy: "M44 47 l14 -2 M76 45 l14 2", facepalm: "M44 50 l14 2 M76 52 l14 -2" }[mood];
  const mouth = { confident: "M56 82 q11 7 22 0", thinking: "M58 84 q8 -3 18 2", surprised: "", happy: "M54 79 q13 14 26 0 z", facepalm: "M58 86 q9 -6 18 0" }[mood];
  return (
    <svg viewBox="0 0 134 150" width={size} height={size * 1.12} aria-hidden className="art-char">
      <path d="M17 150 q4 -42 50 -46 q46 4 50 46z" fill={v("suit")} />
      <path d="M55 104 l12 22 l12 -22z" fill={v("shirt")} />
      <path d="M64 108 l3 30 l3 -30z" fill={v("tie")} />
      <ellipse cx="67" cy="62" rx="34" ry="38" fill={v("skin")} />
      <path d="M33 54 q2 -34 34 -34 q34 0 34 34 q-6 -16 -34 -18 q-26 2 -34 18z" fill={v("hair")} />
      <path d="M44 88 q23 22 46 0 q-4 16 -23 16 q-19 0 -23 -16z" fill={v("hair")} opacity=".85" />
      <path d={brow} stroke={v("hair")} strokeWidth="4" strokeLinecap="round" />
      {mood === "facepalm" ? (
        <rect x="40" y="52" width="54" height="22" rx="10" fill={v("skin-dark")} />
      ) : (
        <g fill={v("ink")}>
          <circle cx="51" cy="62" r={mood === "surprised" ? 5 : 3.6} />
          <circle cx="83" cy="62" r={mood === "surprised" ? 5 : 3.6} />
        </g>
      )}
      {mood === "surprised" ? <ellipse cx="67" cy="84" rx="6" ry="7" fill={v("ink")} /> : <path d={mouth} stroke={v("ink")} strokeWidth="3" fill={mood === "happy" ? v("mouth") : "none"} strokeLinecap="round" />}
      {mood === "thinking" && <circle cx="108" cy="30" r="5" fill={v("paper")} stroke={v("ink")} />}
    </svg>
  );
}

export function HR({ size = 110 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 150" width={size} height={size * 1.25} aria-hidden className="art-char">
      <path d="M14 150 q4 -42 46 -46 q42 4 46 46z" fill={v("hr-top")} />
      <ellipse cx="60" cy="62" rx="30" ry="34" fill={v("skin-light")} />
      <path d="M28 66 q-6 -44 32 -44 q38 0 32 44 q-4 -26 -32 -28 q-26 2 -32 28z" fill={v("hr-hair")} />
      <circle cx="48" cy="64" r="3.4" fill={v("ink")} /><circle cx="72" cy="64" r="3.4" fill={v("ink")} />
      <path d="M50 80 q10 9 20 0" stroke={v("ink")} strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="64" y="108" width="44" height="34" rx="4" fill={v("folder")} transform="rotate(-8 86 125)" />
      <rect x="68" y="104" width="18" height="8" rx="2" fill={v("folder")} transform="rotate(-8 86 125)" />
    </svg>
  );
}

export function FolderArt({ opened }: { opened: boolean }) {
  return (
    <svg viewBox="0 0 100 76" width="100%" aria-hidden>
      <path d="M6 14 h30 l8 8 h50 v48 h-88z" fill={v("folder-back")} />
      <rect x="14" y={opened ? 6 : 18} width="72" height="44" rx="2" fill={v("paper")} className="folder-paper" />
      <path d="M20 26 h50 M20 34 h40" stroke={v("line")} strokeWidth="3" />
      <path d="M4 30 h92 l-4 40 h-84z" fill={v("folder")} />
    </svg>
  );
}

export function Desk({ stamp, penFrozen }: { stamp?: "good" | "bad" | null; penFrozen?: boolean }) {
  return (
    <div className="desk">
      <div className="desk-paper">
        <div className="desk-paper-title">طلب زيادة ميزانية التدريب</div>
        <div className="desk-lines" />
        <div className="desk-sign">التوقيع: ____________</div>
        {stamp && <div className={`stamp ${stamp}`}>{stamp === "good" ? "قرار محسوب" : "اتسرّعنا!"}</div>}
      </div>
      <div className={`pen ${penFrozen ? "frozen" : ""}`} aria-hidden />
    </div>
  );
}

// Illustrative points with a positive trend (fictional, not real employee data).
const PTS = [[4,38],[7,45],[9,40],[12,52],[14,47],[16,58],[18,50],[21,62],[23,55],[25,66],[28,60],[30,70],[32,64],[35,74],[37,68],[40,79],[42,72],[45,82],[47,77],[50,86]];
export function Scatter() {
  return (
    <figure className="scatter">
      <svg viewBox="0 0 220 150" width="100%" role="img" aria-label="رسم نقاط: ساعات التدريب مقابل تقييم الأداء، النقاط بتطلع لفوق">
        <line x1="30" y1="120" x2="210" y2="120" stroke={v("ink")} />
        <line x1="30" y1="10" x2="30" y2="120" stroke={v("ink")} />
        {PTS.map(([x, y], i) => (
          <circle key={i} cx={30 + x * 3.5} cy={130 - y * 1.3} r="4" fill={v("dot")} className="dot" style={{ animationDelay: `${i * 40}ms` }} />
        ))}
        <text x="120" y="140" textAnchor="middle" fontSize="10" fill={v("ink")}>ساعات التدريب ←</text>
        <text x="12" y="65" textAnchor="middle" fontSize="10" fill={v("ink")} transform="rotate(-90 12 65)">تقييم الأداء ←</text>
      </svg>
      <figcaption>بيانات توضيحية داخل اللعبة</figcaption>
    </figure>
  );
}

export function Confetti() {
  return (
    <div className="confetti" aria-hidden>
      {Array.from({ length: 28 }).map((_, i) => (
        <span key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 7) * 90}ms`, background: `var(--art-c${i % 4})` }} />
      ))}
    </div>
  );
}
