// 24 illustrative employees: [training hours, performance 1-5, last-year rating 1-5]
export const POINTS: [number, number, number][] = [
  [4, 1.6, 1], [6, 2.1, 2], [8, 1.9, 1], [9, 2.4, 2], [11, 2.2, 2], [13, 2.7, 2],
  [14, 2.5, 2], [16, 3.0, 3], [18, 2.9, 3], [20, 3.3, 3], [21, 3.1, 3], [23, 3.5, 3],
  [25, 3.4, 3], [27, 3.7, 3], [29, 3.6, 4], [31, 3.9, 4], [33, 4.1, 4], [35, 3.95, 4],
  [37, 4.3, 4], [39, 4.2, 5], [41, 4.5, 5], [43, 4.4, 5], [46, 4.7, 5], [48, 4.8, 5],
];
export const tierOf = (prior: number) => (prior >= 4 ? "high" : prior === 3 ? "mid" : "low");
