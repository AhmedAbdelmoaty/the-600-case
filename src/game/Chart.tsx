import { POINTS, tierOf } from "./chart";

const AR = (n: number) => n.toLocaleString("ar-EG");
const X = (h: number) => 46 + h * 4.6;
const Y = (p: number) => 166 - (p - 1) * 36.5;

export function Chart({ colored = false, visible = POINTS.length }: { colored?: boolean; visible?: number }) {
  return (
    <figure className="cs-chart">
      <svg viewBox="0 0 300 212" width="100%" role="img" aria-label="ساعات التدريب مقابل تقييم الأداء">
        {[0, 10, 20, 30, 40, 50].map((t) => (
          <g key={t} className="cs-grid">
            <line x1={X(t)} y1="16" x2={X(t)} y2="166" />
            <text x={X(t)} y="182" textAnchor="middle">{AR(t)}</text>
          </g>
        ))}
        {[1, 2, 3, 4, 5].map((t) => (
          <g key={t} className="cs-grid">
            <line x1="46" y1={Y(t)} x2="276" y2={Y(t)} />
            <text x="36" y={Y(t) + 4} textAnchor="end">{AR(t)}</text>
          </g>
        ))}
        <line x1="46" y1="166" x2="280" y2="166" className="cs-axis" />
        <line x1="46" y1="12" x2="46" y2="166" className="cs-axis" />
        {POINTS.slice(0, visible).map(([h, p, prior], i) => (
          <circle
            key={i}
            cx={X(h)}
            cy={Y(p)}
            r="5"
            className={`cs-dot ${colored ? `t-${tierOf(prior)}` : ""}`}
            style={{ animationDelay: `${i * 60}ms` }}
          />
        ))}
        <text x="162" y="204" textAnchor="middle" className="cs-label">ساعات التدريب</text>
        <text x="12" y="92" textAnchor="middle" className="cs-label" transform="rotate(-90 12 92)">تقييم الأداء</text>
      </svg>
      {colored && (
        <figcaption className="cs-legend">
          <span>تقييم السنة اللي فاتت:</span>
          <i className="t-high" /> ٤–٥ <i className="t-mid" /> ٣ <i className="t-low" /> ١–٢
        </figcaption>
      )}
    </figure>
  );
}
