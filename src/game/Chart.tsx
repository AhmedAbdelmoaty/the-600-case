import { motion } from "framer-motion";
import { POINTS, tierOf } from "./chart";

const AR = (n: number) => n.toLocaleString("ar-EG");
const X = (h: number) => 46 + h * 4.6;
const Y = (p: number) => 166 - (p - 1) * 36.5;

/** Scatter plot in The Analyst's document style; dots pop in one by one. */
export function Chart({ colored = false, stagger = 0.06 }: { colored?: boolean; stagger?: number }) {
  return (
    <figure className="g-chart">
      <svg viewBox="0 0 300 212" width="100%" role="img" aria-label="ساعات التدريب مقابل تقييم الأداء">
        {[0, 10, 20, 30, 40, 50].map((t) => (
          <g key={t} className="g-grid">
            <line x1={X(t)} y1="16" x2={X(t)} y2="166" />
            <text x={X(t)} y="182" textAnchor="middle">{AR(t)}</text>
          </g>
        ))}
        {[1, 2, 3, 4, 5].map((t) => (
          <g key={t} className="g-grid">
            <line x1="46" y1={Y(t)} x2="276" y2={Y(t)} />
            <text x="36" y={Y(t) + 4} textAnchor="end">{AR(t)}</text>
          </g>
        ))}
        <line x1="46" y1="166" x2="280" y2="166" className="g-axis" />
        <line x1="46" y1="12" x2="46" y2="166" className="g-axis" />
        {POINTS.map(([h, p, prior], i) => (
          <motion.circle
            key={i}
            cx={X(h)}
            cy={Y(p)}
            className={`g-dot ${colored ? `t-${tierOf(prior)}` : ""}`}
            initial={{ r: 0, opacity: 0 }}
            animate={{ r: 5, opacity: 1 }}
            transition={{ delay: 0.25 + i * stagger, type: "spring", stiffness: 380, damping: 14 }}
          />
        ))}
        <text x="162" y="204" textAnchor="middle" className="g-label">ساعات التدريب</text>
        <text x="12" y="92" textAnchor="middle" className="g-label" transform="rotate(-90 12 92)">تقييم الأداء</text>
      </svg>
      {colored && (
        <motion.figcaption className="g-legend" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <span>تقييم السنة اللي فاتت:</span>
          <i className="t-high" /> ٤–٥ <i className="t-mid" /> ٣ <i className="t-low" /> ١–٢
        </motion.figcaption>
      )}
    </figure>
  );
}
