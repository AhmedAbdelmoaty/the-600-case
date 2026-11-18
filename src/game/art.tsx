import type { Line, Mood } from "./content";

const v = (name: string) => `var(--art-${name})`;

export function Manager({ mood = "confident", size = 130 }: { mood?: Mood; size?: number }) {
  const brow = {
    confident: "M44 50 l14 -3 M76 47 l14 3",
    thinking: "M44 46 l14 4 M76 48 l14 -4",
    surprised: "M44 44 l14 -4 M76 40 l14 4",
    happy: "M44 47 l14 -2 M76 45 l14 2",
    facepalm: "M44 50 l14 2 M76 52 l14 -2",
  }[mood];
  const mouth = {
    confident: "M56 82 q11 7 22 0",
    thinking: "M58 84 q8 -3 18 2",
    surprised: "",
    happy: "M54 79 q13 14 26 0 z",
    facepalm: "M58 86 q9 -6 18 0",
  }[mood];

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
        <g>
          <rect x="39" y="51" width="56" height="23" rx="11" fill={v("skin-dark")} />
          <path
            d="M91 60 C118 72 112 103 102 126"
            stroke={v("suit")}
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      ) : (
        <g fill={v("ink")}>
          <circle cx="51" cy="62" r={mood === "surprised" ? 5 : 3.6} />
          <circle cx="83" cy="62" r={mood === "surprised" ? 5 : 3.6} />
        </g>
      )}
      {mood === "surprised" ? (
        <ellipse cx="67" cy="84" rx="6" ry="7" fill={v("ink")} />
      ) : (
        <path
          d={mouth}
          stroke={v("ink")}
          strokeWidth="3"
          fill={mood === "happy" ? v("mouth") : "none"}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export function LDLead({ size = 110 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 150" width={size} height={size * 1.25} aria-hidden className="art-char">
      <path d="M14 150 q4 -42 46 -46 q42 4 46 46z" fill={v("hr-top")} />
      <ellipse cx="60" cy="62" rx="30" ry="34" fill={v("skin-light")} />
      <path
        d="M28 66 q-6 -44 32 -44 q38 0 32 44 q-4 -26 -32 -28 q-26 2 -32 28z"
        fill={v("hr-hair")}
      />
      <circle cx="48" cy="64" r="3.4" fill={v("ink")} />
      <circle cx="72" cy="64" r="3.4" fill={v("ink")} />
      <path
        d="M50 80 q10 9 20 0"
        stroke={v("ink")}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <rect
        x="64"
        y="108"
        width="44"
        height="34"
        rx="4"
        fill={v("folder")}
        transform="rotate(-8 86 125)"
      />
      <rect
        x="68"
        y="104"
        width="18"
        height="8"
        rx="2"
        fill={v("folder")}
        transform="rotate(-8 86 125)"
      />
    </svg>
  );
}

// The full illustration is one scene so the manager, arms, pen, paper and desk
// always remain aligned across screen sizes.
export function ExecutiveScene({
  mood = "confident",
  line,
  stamp,
  shake,
  showLD = true,
}: {
  mood?: Mood;
  line?: Line | undefined;
  stamp?: "good" | "bad" | undefined;
  shake?: boolean | undefined;
  showLD?: boolean | undefined;
}) {
  return (
    <section className={`scene ${shake ? "shake" : ""}`} aria-label="مكتب المدير التنفيذي">
      <div className="window" aria-hidden />
      {line && (
        <div className={`scene-bubble ${line.who}`} aria-live="polite">
          <span>{line.who === "ld" ? "رئيس التدريب (L&D)" : "المدير التنفيذي"}</span>
          <p>{line.text}</p>
        </div>
      )}
      <div className="scene-cast" aria-hidden>
        <div className="scene-ld">{showLD && <LDLead size={92} />}</div>
        <div className="manager-rig">
          <Manager mood={mood} size={128} />
          {mood !== "facepalm" && (
            <>
              <i className="manager-arm arm-left" />
              <i className="manager-arm arm-right" />
              <i className="manager-hand pen-hand" />
            </>
          )}
        </div>
      </div>
      <div className="executive-desk" aria-hidden>
        <div className="budget-paper">
          <strong>طلب زيادة ميزانية التدريب</strong>
          <div className="paper-lines" />
          <small>التوقيع: __________________</small>
          {stamp && (
            <div className={`stamp ${stamp}`}>{stamp === "good" ? "قرار محسوب" : "اتسرّعنا!"}</div>
          )}
        </div>
        <i className="scene-pen" />
      </div>
    </section>
  );
}

export function FolderArt({ opened }: { opened: boolean }) {
  return (
    <svg viewBox="0 0 100 76" width="100%" aria-hidden>
      <path d="M6 14 h30 l8 8 h50 v48 h-88z" fill={v("folder-back")} />
      <rect
        x="14"
        y={opened ? 6 : 18}
        width="72"
        height="44"
        rx="2"
        fill={v("paper")}
        className="folder-paper"
      />
      <path d="M20 26 h50 M20 34 h40" stroke={v("line")} strokeWidth="3" />
      <path d="M4 30 h92 l-4 40 h-84z" fill={v("folder")} />
    </svg>
  );
}

const PTS = [
  [4, 1.6],
  [7, 1.9],
  [9, 1.7],
  [12, 2.3],
  [14, 2.1],
  [16, 2.7],
  [18, 2.35],
  [21, 3.0],
  [23, 2.7],
  [25, 3.2],
  [28, 3.0],
  [30, 3.6],
  [32, 3.3],
  [35, 3.9],
  [37, 3.55],
  [40, 4.2],
  [42, 3.85],
  [45, 4.6],
  [47, 4.25],
  [50, 4.75],
] as const;

export function Scatter() {
  const xTicks = [0, 10, 20, 30, 40, 50];
  const yTicks = [1, 2, 3, 4, 5];
  return (
    <figure className="scatter">
      <svg
        viewBox="0 0 300 210"
        width="100%"
        role="img"
        aria-label="رسم نقاط: ساعات التدريب مقابل تقييم الأداء"
      >
        <g className="chart-grid">
          {xTicks.map((tick) => {
            const x = 46 + tick * 4.6;
            return (
              <g key={tick}>
                <line x1={x} y1="20" x2={x} y2="166" />
                <text x={x} y="184" textAnchor="middle">
                  {tick}{" "}
                </text>
              </g>
            );
          })}
          {yTicks.map((tick) => {
            const y = 166 - (tick - 1) * 36.5;
            return (
              <g key={tick}>
                <line x1="46" y1={y} x2="276" y2={y} />
                <text x="35" y={y + 4} textAnchor="end">
                  {tick}{" "}
                </text>
              </g>
            );
          })}
        </g>
        <line x1="46" y1="166" x2="280" y2="166" className="chart-axis" />
        <line x1="46" y1="16" x2="46" y2="166" className="chart-axis" />
        {PTS.map(([x, y], i) => (
          <circle
            key={i}
            cx={46 + x * 4.6}
            cy={166 - (y - 1) * 36.5}
            r="4.5"
            fill={v("dot")}
            className="dot"
            style={{ animationDelay: `${i * 35}ms` }}
          />
        ))}
        <text x="162" y="205" textAnchor="middle" className="axis-label">
          ساعات التدريب
        </text>
        <text
          x="13"
          y="92"
          textAnchor="middle"
          className="axis-label"
          transform="rotate(-90 13 92)"
        >
          تقييم الأداء
        </text>
      </svg>
      <figcaption>العلاقة واضحة في الأرقام.. لكن مين سبّب مين؟</figcaption>
    </figure>
  );
}

export function Confetti() {
  return (
    <div className="confetti" aria-hidden>
      {Array.from({ length: 72 }).map((_, i) => (
        <span
          key={i}
          style={{
            left: `${(i * 37) % 100}%`,
            animationDelay: `${(i % 12) * 70}ms`,
            animationDuration: `${1.7 + (i % 5) * 0.2}s`,
            background: `var(--art-c${i % 4})`,
          }}
        />
      ))}
    </div>
  );
}

export function PaperStorm() {
  return (
    <div className="paper-storm" aria-hidden>
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          style={{
            left: `${(i * 29) % 100}%`,
            animationDelay: `${(i % 7) * 90}ms`,
          }}
        />
      ))}
    </div>
  );
}
