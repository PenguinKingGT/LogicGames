import type { CellId, GeometryKind, Point } from "../types";

export interface Topology {
  readonly kind: GeometryKind;
  cells(): readonly CellId[];
  neighbors(cell: CellId): readonly CellId[];
  polygon(cell: CellId, size?: number): readonly Point[];
  center(cell: CellId, size?: number): Point;
  cellAt(point: Point, size?: number): CellId | null;
}

export function pointInPolygon(point: Point, polygon: readonly Point[]): boolean {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const currentPoint = polygon[index];
    const previousPoint = polygon[previous];
    if (!currentPoint || !previousPoint) continue;
    const intersects =
      currentPoint.y > point.y !== previousPoint.y > point.y &&
      point.x <
        ((previousPoint.x - currentPoint.x) * (point.y - currentPoint.y)) /
          (previousPoint.y - currentPoint.y) +
          currentPoint.x;
    if (intersects) inside = !inside;
  }
  return inside;
}

export function polygonCenter(points: readonly Point[]): Point {
  const total = points.reduce(
    (sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }),
    { x: 0, y: 0 },
  );
  return { x: total.x / points.length, y: total.y / points.length };
}

export function scaled(points: readonly Point[], size: number): readonly Point[] {
  return points.map((point) => ({ x: point.x * size, y: point.y * size }));
}

