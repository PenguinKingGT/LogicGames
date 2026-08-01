import { describe, expect, it } from "vitest";
import { cellId, neighbors } from "./grid";
import { chooseCatStep, distancesToEdge } from "./pathfinding";

describe("circle cat pathfinding", () => {
  it("moves to an adjacent cell closer to an edge", () => {
    const cat = { row: 5, col: 5 };
    const blocked = new Set<string>();
    const distances = distancesToEdge(blocked);
    const step = chooseCatStep(cat, blocked, 0)!;
    expect(neighbors(cat)).toContainEqual(step);
    expect(distances.get(cellId(step))).toBe(distances.get(cellId(cat))! - 1);
  });

  it("uses the random value only to break equal shortest choices", () => {
    const cat = { row: 5, col: 5 };
    expect(chooseCatStep(cat, new Set(), 0)).not.toEqual(chooseCatStep(cat, new Set(), 0.999999));
  });

  it("returns null when every route is blocked", () => {
    const cat = { row: 5, col: 5 };
    const blocked = new Set(neighbors(cat).map(cellId));
    expect(chooseCatStep(cat, blocked, 0.5)).toBeNull();
    expect(distancesToEdge(blocked).has(cellId(cat))).toBe(false);
  });

  it("follows a forced corridor", () => {
    const cat = { row: 5, col: 5 };
    const allowed = new Set([cellId(cat), "r5-c6", "r5-c7", "r5-c8", "r5-c9", "r5-c10"]);
    const blocked = new Set<string>();
    for (let row = 0; row < 11; row += 1) {
      for (let col = 0; col < 11; col += 1) {
        const id = cellId({ row, col });
        if (!allowed.has(id)) blocked.add(id);
      }
    }
    expect(chooseCatStep(cat, blocked, 0.8)).toEqual({ row: 5, col: 6 });
  });
});

