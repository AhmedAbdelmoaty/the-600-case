import { motion } from "framer-motion";
import { CheckCircle, FileText, X } from "lucide-react";
import type { Metric } from "./content";

export function OfficialReportModal({ metric, onClose }: { metric: Metric; onClose: () => void }) {
  const hA = Math.max(12, Math.round((metric.a / metric.max) * 100));
  const hB = Math.max(12, Math.round((metric.b / metric.max) * 100));
  const fmt = (v: number) => (metric.unit ? `${v}${metric.unit}` : `${v}`);
  return (
    <div className="g-report-backdrop" onClick={onClose}>
      <motion.div className="g-report-sheet" dir="rtl" onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, scale: .92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .92, y: 20 }} transition={{ duration: .24, ease: "easeOut" }}>
        <button className="g-report-close" onClick={onClose} aria-label="إغلاق التقرير"><X /></button>
        <header className="g-report-header">
          <span className="g-report-badge"><FileText size={14} /> تقرير رسمي معتمد</span>
          <h3>{metric.labelAr}</h3>
          <p className="g-report-origin">صادر عن: <b>إدارة الموارد البشرية والتدريب</b> · المصدر: <b>{metric.source}</b></p>
          <small className="g-report-sub">{metric.label} — مقارنة مجموعة A مع مجموعة B</small>
        </header>
        <div className="g-report-chart-area" dir="ltr">
          <div className="g-report-grid-lines"><span /><span /><span /><span /></div>
          <div className="g-report-columns">
            <div className="g-report-col col-a"><span className="g-report-val">{fmt(metric.a)}</span><motion.div className="g-report-bar bar-a" initial={{ height: 0 }} animate={{ height: `${hA}%` }} transition={{ duration: .5, ease: "easeOut" }} /><span className="g-report-col-label">Group A</span></div>
            <div className="g-report-col col-b"><span className="g-report-val">{fmt(metric.b)}</span><motion.div className="g-report-bar bar-b" initial={{ height: 0 }} animate={{ height: `${hB}%` }} transition={{ duration: .5, delay: .1, ease: "easeOut" }} /><span className="g-report-col-label">Group B</span></div>
          </div>
        </div>
        <footer className="g-report-footer"><div className="g-report-stamp"><CheckCircle size={15} /><span>معتمد</span></div><p className="g-report-note">{metric.note}</p></footer>
      </motion.div>
    </div>
  );
}

export function MiniEvidenceChip({ metric, selected, onClick }: { metric: Metric; selected?: boolean; onClick: () => void }) {
  const fmt = (v: number) => (metric.unit ? `${v}${metric.unit}` : `${v}`);
  return (
    <button className={`g-mini-chip ${selected ? "is-selected" : ""}`} onClick={onClick} dir="rtl">
      <div className="g-mini-top"><span className={`g-source-tag tag-${metric.source.toLowerCase()}`}>{metric.source}</span><b>{metric.labelAr}</b></div>
      <div className="g-mini-nums" dir="ltr"><span className="val-a">A: {fmt(metric.a)}</span><span className="val-sep">|</span><span className="val-b">B: {fmt(metric.b)}</span></div>
    </button>
  );
}
