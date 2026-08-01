import type { CellId, Point } from "../types";
import { pointInPolygon, polygonCenter, scaled, type Topology } from "./topology";

const HEIGHT = Math.sqrt(3) / 2;
const EPSILON = 1e-9;

function vertex(i: number, j: number): Point {
  return { x: i + j / 2, y: j * HEIGHT };
}

function vertexId(i: number, j: number): string {
  return `${i}:${j}`;
}

/**
 * Builds a regular hexagon tiled by congruent equilateral triangles.
 * A board of side length `side` contains exactly `6 * side²` cells.
 */
export function createTriangleTopology(side: number): Topology {
  const ids: CellId[] = [];
  const polygons = new Map<CellId, readonly Point[]>();
  const verticesByCell = new Map<CellId, readonly string[]>();
  const cellsByVertex = new Map<string, CellId[]>();

  const isInsideHex = (point: Point): boolean => {
    const absoluteY = Math.abs(point.y);
    return (
      absoluteY <= side * HEIGHT + EPSILON &&
      Math.abs(point.x) <= side - absoluteY / (2 * HEIGHT) + EPSILON
    );
  };

  const addCell = (id: CellId, points: readonly Point[], vertexIds: readonly string[]) => {
    ids.push(id);
    polygons.set(id, points);
    verticesByCell.set(id, vertexIds);
    for (const currentVertex of vertexIds) {
      const attached = cellsByVertex.get(currentVertex) ?? [];
      attached.push(id);
      cellsByVertex.set(currentVertex, attached);
    }
  };

  for (let j = -side - 1; j <= side; j += 1) {
    for (let i = -2 * side - 1; i <= 2 * side + 1; i += 1) {
      const a = vertex(i, j);
      const b = vertex(i + 1, j);
      const c = vertex(i, j + 1);
      const d = vertex(i + 1, j + 1);

      if ([a, b, c].every(isInsideHex)) {
        addCell(
          `t:${i}:${j}:a`,
          [a, b, c],
          [vertexId(i, j), vertexId(i + 1, j), vertexId(i, j + 1)],
        );
      }
      if ([b, d, c].every(isInsideHex)) {
        addCell(
          `t:${i}:${j}:b`,
          [b, d, c],
          [vertexId(i + 1, j), vertexId(i + 1, j + 1), vertexId(i, j + 1)],
        );
      }
    }
  }

  const polygonAt = (cell: CellId): readonly Point[] => {
    const polygon = polygons.get(cell);
    if (!polygon) throw new Error(`Unknown triangle cell: ${cell}`);
    return polygon;
  };

  return {
    kind: "triangle",
    cells: () => ids,
    neighbors(cell) {
      const vertexIds = verticesByCell.get(cell);
      if (!vertexIds) return [];
      const neighbors = new Set<CellId>();
      for (const currentVertex of vertexIds) {
        for (const candidate of cellsByVertex.get(currentVertex) ?? []) {
          if (candidate !== cell) neighbors.add(candidate);
        }
      }
      return [...neighbors];
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
