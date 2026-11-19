import { motion } from "framer-motion";
import { createElement } from "react";

// 24 illustrative employees: [training hours, performance 1-5, last-year rating 1-5]
export const POINTS: [number, number, number][] = [
  [4, 1.6, 1], [6, 2.1, 2], [8, 1.9, 1], [9, 2.4, 2], [11, 2.2, 2], [13, 2.7, 2],
  [14, 2.5, 2], [16, 3.0, 3], [18, 2.9, 3], [20, 3.3, 3], [21, 3.1, 3], [23, 3.5, 3],
  [25, 3.4, 3], [27, 3.7, 3], [29, 3.6, 4], [31, 3.9, 4], [33, 4.1, 4], [35, 3.95, 4],
  [37, 4.3, 4], [39, 4.2, 5], [41, 4.5, 5], [43, 4.4, 5], [46, 4.7, 5], [48, 4.8, 5],
];
export function Chart({ stagger = 0.06 }: { stagger?: number }) {
  const width = 520;
  const height = 260;
  const left = 48;
  const bottom = 218;
  const plotWidth = 440;
  const plotHeight = 170;
  const x = (hours: number) => left + (hours / 50) * plotWidth;
  const y = (rating: number) => bottom - ((rating - 1) / 4) * plotHeight;
  return createElement(
    "figure",
    { className: "g-chart", dir: "ltr" },
    createElement(
      "svg",
      { viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": "ساعات التدريب مقابل تقييم الأداء" },
      [0, 10, 20, 30, 40, 50].map((tick) => createElement("g", { key: `x-${tick}` },
        createElement("line", { x1: x(tick), y1: 48, x2: x(tick), y2: bottom, className: "g-grid" }),
        createElement("text", { x: x(tick), y: 242, textAnchor: "middle" }, tick))),
      [1, 2, 3, 4, 5].map((tick) => createElement("g", { key: `y-${tick}` },
        createElement("line", { x1: left, y1: y(tick), x2: left + plotWidth, y2: y(tick), className: "g-grid" }),
        createElement("text", { x: 34, y: y(tick) + 4, textAnchor: "end" }, tick))),
      createElement("line", { x1: left, y1: bottom, x2: left + plotWidth, y2: bottom, className: "g-axis" }),
      createElement("line", { x1: left, y1: 48, x2: left, y2: bottom, className: "g-axis" }),
      POINTS.map(([hours, rating], index) => createElement(motion.circle, {
        key: `${hours}-${rating}`,
        cx: x(hours),
        cy: y(rating),
        r: 6,
        className: "g-dot",
        initial: { opacity: 0, scale: 0 },
        animate: { opacity: 1, scale: 1 },
        transition: { delay: index * stagger, duration: 0.25 },
      })),
      createElement("text", { x: 265, y: 258, textAnchor: "middle", className: "g-axis-label" }, "ساعات التدريب"),
      createElement("text", { x: 12, y: 140, textAnchor: "middle", className: "g-axis-label", transform: "rotate(-90 12 140)" }, "تقييم الأداء"),
    )
  );
}
