import { motion } from "framer-motion";
import { CheckCircle, FileText, X } from "lucide-react";
import type { Metric } from "./content";

export function InlineReportCard({ metric }: { metric: Metric }) {
  const hA = Math.max(15, Math.round((metric.a / metric.max) * 100));
  const hB = Math.max(15, Math.round((metric.b / metric.max) * 100));
  const fmt = (v: number) => (metric.unit ? `${v}${metric.unit}` : `${v}`);
  return (
    <motion.article className="g-inline-report" dir="rtl" initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: .28, ease: "easeOut" }}>
      <header className="g-inline-head">
        <div className="g-inline-tags"><span className={`g-source-tag tag-${metric.source.toLowerCase()}`}>{metric.source}</span><span className="g-badge-official"><FileText size={12} /> تقرير معتمد</span></div>
        <h3 dir="ltr" className="g-metric-en">{metric.label}</h3>
        <p className="g-metric-ar">{metric.labelAr}</p>
      </header>
      <div className="g-inline-chart" dir="ltr">
        <div className="g-report-grid-lines"><span /><span /><span /></div>
        <div className="g-report-columns">
          <div className="g-report-col col-a"><span className="g-report-val">{fmt(metric.a)}</span><motion.div className="g-report-bar bar-a" initial={{ height: 0 }} animate={{ height: `${hA}%` }} transition={{ duration: .45, ease: "easeOut" }} /><span className="g-report-col-label">Group A</span></div>
          <div className="g-report-col col-b"><span className="g-report-val">{fmt(metric.b)}</span><motion.div className="g-report-bar bar-b" initial={{ height: 0 }} animate={{ height: `${hB}%` }} transition={{ duration: .45, delay: .1, ease: "easeOut" }} /><span className="g-report-col-label">Group B</span></div>
        </div>
      </div>
      <footer className="g-inline-foot"><div className="g-report-stamp mini"><CheckCircle size={13} /><span>معتمد</span></div><p className="g-inline-note">{metric.note}</p></footer>
    </motion.article>
  );
}

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

export function DashChart({ metric, onZoom, selected, onSelect }: { metric: Metric; onZoom?: () => void; selected?: boolean; onSelect?: () => void }) {
  const hA = Math.max(10, Math.round((metric.a / metric.max) * 100));
  const hB = Math.max(10, Math.round((metric.b / metric.max) * 100));
  const fmt = (v: number) => (metric.unit ? `${v}${metric.unit}` : `${v}`);
  const body = <><header dir="ltr"><b>{metric.label}</b><span className={`g-source-tag tag-${metric.source.toLowerCase()}`}>{metric.source}</span></header>
    <div className="g-dash-bars" dir="ltr">
      <div><em>{fmt(metric.a)}</em><motion.i className="bar-a" initial={{ height: 0 }} animate={{ height: `${hA}%` }} transition={{ duration: .45 }} /><small>A</small></div>
      <div><em>{fmt(metric.b)}</em><motion.i className="bar-b" initial={{ height: 0 }} animate={{ height: `${hB}%` }} transition={{ duration: .45, delay: .08 }} /><small>B</small></div>
    </div></>;
  return <div className={`g-dash-chart ${onSelect ? "is-pick" : ""} ${selected ? "is-selected" : ""}`}>
    {onSelect ? <button className="g-dash-hit" aria-pressed={selected} onClick={onSelect}>{body}</button> : body}
    {onZoom && <button className="g-dash-zoom" aria-label={`تكبير ${metric.label}`} onClick={onZoom}>⤢</button>}
  </div>;
}

export function MiniEvidenceChip({ metric, selected, onClick }: { metric: Metric; selected?: boolean; onClick: () => void }) {
  const fmt = (v: number) => (metric.unit ? `${v}${metric.unit}` : `${v}`);
  return (
    <button className={`g-mini-chip ${selected ? "is-selected" : ""}`} onClick={onClick} dir="rtl">
      <div className="g-mini-top"><span className={`g-source-tag tag-${metric.source.toLowerCase()}`}>{metric.source}</span><b dir="ltr" className="g-chip-title-en">{metric.label}</b><small className="g-chip-title-ar">{metric.labelAr}</small></div>
      <div className="g-mini-nums" dir="ltr"><span className="val-a">A: {fmt(metric.a)}</span><span className="val-sep">|</span><span className="val-b">B: {fmt(metric.b)}</span></div>
    </button>
  );
}
