import type { CellId, Point } from "../types";
import { pointInPolygon, polygonCenter, scaled, type Topology } from "./topology";

const DIRECTIONS = [
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
] as const;

function hexId(q: number, r: number): CellId {
  return `h:${q}:${r}`;
}

function parseHexId(cell: CellId): [number, number] {
  const [, qText, rText] = cell.split(":");
  return [Number(qText), Number(rText)];
}

export function createHexTopology(radius: number): Topology {
  const ids: CellId[] = [];
  for (let q = -radius; q <= radius; q += 1) {
    const minimumR = Math.max(-radius, -q - radius);
    const maximumR = Math.min(radius, -q + radius);
    for (let r = minimumR; r <= maximumR; r += 1) ids.push(hexId(q, r));
  }
  const idSet = new Set(ids);

  const polygonAt = (cell: CellId): readonly Point[] => {
    const [q, r] = parseHexId(cell);
    const center = { x: Math.sqrt(3) * (q + r / 2), y: 1.5 * r };
    return Array.from({ length: 6 }, (_, index) => {
      const angle = ((60 * index - 30) * Math.PI) / 180;
      return { x: center.x + Math.cos(angle), y: center.y + Math.sin(angle) };
    });
  };

  return {
    kind: "hex",
    cells: () => ids,
    neighbors(cell) {
      const [q, r] = parseHexId(cell);
      return DIRECTIONS.map(([dq, dr]) => hexId(q + dq, r + dr)).filter((id) => idSet.has(id));
    },
    polygon(cell, size = 1) {
      return scaled(polygonAt(cell), size);
    },
    center(cell, size = 1) {
      return polygonCenter(scaled(polygonAt(cell), size));
    },
    cellAt(point, size = 1) {
      for (const id of ids) {
        if (pointInPolygon(point, scaled(polygonAt(id), size))) return id;
      }
      return null;
    },
  };
}

