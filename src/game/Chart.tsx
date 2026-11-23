import { motion } from "framer-motion";
import type { Metric } from "./content";

/** Grouped A/B bar card in The Analyst style; bars grow in on mount. */
export function BarCard({ m, delay = 0, of }: { m: Metric; delay?: number; of?: boolean }) {
  const fmt = (v: number) => (m.unit ? `${v}${m.unit}` : of ? `${v} / ${m.max}` : `${v}`);
  return (
    <motion.figure className="g-bar" dir="ltr" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.25 }}>
      <figcaption><b>{m.label}</b><small>{m.source}</small></figcaption>
      {(["a", "b"] as const).map((k, i) => (
        <div className={`g-bar-row t-${k}`} key={k}>
          <span>Team {k.toUpperCase()}</span>
          <i><motion.em initial={{ width: 0 }} animate={{ width: `${(m[k] / m.max) * 100}%` }} transition={{ delay: delay + 0.15 + i * 0.1, duration: 0.6, ease: "easeOut" }} /></i>
          <strong>{fmt(m[k])}</strong>
        </div>
      ))}
    </motion.figure>
  );
}
