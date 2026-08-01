import type { BoardConfig, Difficulty, GeometryKind } from "./types";

export const geometryLabels: Record<GeometryKind, string> = {
  square: "方格",
  triangle: "三角",
  hex: "六边形",
};

export const difficultyLabels: Record<Difficulty, string> = {
  easy: "轻松",
  normal: "标准",
  hard: "挑战",
};

export const presets: Record<GeometryKind, Record<Difficulty, BoardConfig>> = {
  square: {
    easy: { geometry: "square", difficulty: "easy", rows: 9, columns: 9, mines: 10 },
    normal: { geometry: "square", difficulty: "normal", rows: 16, columns: 16, mines: 40 },
    hard: { geometry: "square", difficulty: "hard", rows: 16, columns: 30, mines: 99 },
  },
  triangle: {
    easy: { geometry: "triangle", difficulty: "easy", rows: 4, mines: 16 },
    normal: { geometry: "triangle", difficulty: "normal", rows: 7, mines: 55 },
    hard: { geometry: "triangle", difficulty: "hard", rows: 10, mines: 110 },
  },
  hex: {
    easy: { geometry: "hex", difficulty: "easy", radius: 4, mines: 8 },
    normal: { geometry: "hex", difficulty: "normal", radius: 7, mines: 30 },
    hard: { geometry: "hex", difficulty: "hard", radius: 11, mines: 80 },
  },
};

export function getPreset(geometry: GeometryKind, difficulty: Difficulty): BoardConfig {
  return presets[geometry][difficulty];
}
