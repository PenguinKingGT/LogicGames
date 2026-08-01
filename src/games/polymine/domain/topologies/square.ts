import type { CellId, Point } from "../types";
import { polygonCenter, scaled, type Topology } from "./topology";

const OFFSETS = [-1, 0, 1] as const;

export function squareId(row: number, column: number): CellId {
  return `s:${row}:${column}`;
}

export function createSquareTopology(rows: number, columns: number): Topology {
  const ids = Array.from({ length: rows * columns }, (_, index) =>
    squareId(Math.floor(index / columns), index % columns),
  );
  const idSet = new Set(ids);

  const polygonAt = (cell: CellId): readonly Point[] => {
    const [, rowText, columnText] = cell.split(":");
    const row = Number(rowText);
    const column = Number(columnText);
    return [
      { x: column, y: row },
      { x: column + 1, y: row },
      { x: column + 1, y: row + 1 },
      { x: column, y: row + 1 },
    ];
  };

  return {
    kind: "square",
    cells: () => ids,
    neighbors(cell) {
      const [, rowText, columnText] = cell.split(":");
      const row = Number(rowText);
      const column = Number(columnText);
      const neighbors: CellId[] = [];
      for (const rowOffset of OFFSETS) {
        for (const columnOffset of OFFSETS) {
          if (rowOffset === 0 && columnOffset === 0) continue;
          const candidate = squareId(row + rowOffset, column + columnOffset);
          if (idSet.has(candidate)) neighbors.push(candidate);
        }
      }
      return neighbors;
    },
    polygon(cell, size = 1) {
      return scaled(polygonAt(cell), size);
    },
    center(cell, size = 1) {
      return polygonCenter(scaled(polygonAt(cell), size));
    },
    cellAt(point, size = 1) {
      const row = Math.floor(point.y / size);
      const column = Math.floor(point.x / size);
      const candidate = squareId(row, column);
      return idSet.has(candidate) ? candidate : null;
    },
  };
}
