import { describe, expect, it } from "vitest";
import { createTopology } from ".";
import { createHexTopology } from "./hex";
import { createSquareTopology, squareId } from "./square";
import { createTriangleTopology } from "./triangle";
import type { Topology } from "./topology";

function expectValidTopology(topology: Topology): void {
  const cells = new Set(topology.cells());
  for (const cell of cells) {
    const neighbors = topology.neighbors(cell);
    expect(new Set(neighbors).size).toBe(neighbors.length);
    expect(neighbors).not.toContain(cell);
    for (const neighbor of neighbors) {
      expect(cells.has(neighbor)).toBe(true);
      expect(topology.neighbors(neighbor)).toContain(cell);
    }
    expect(topology.cellAt(topology.center(cell))).toBe(cell);
    expect(topology.polygon(cell, 2)).toHaveLength(topology.polygon(cell).length);
  }
  expect(topology.cellAt({ x: -10_000, y: -10_000 })).toBeNull();
}

describe("polygon topologies", () => {
  it("builds a square grid with eight center neighbors", () => {
    const topology = createSquareTopology(5, 5);
    expect(topology.cells()).toHaveLength(25);
    expect(topology.neighbors(squareId(2, 2))).toHaveLength(8);
    expect(topology.neighbors(squareId(0, 0))).toHaveLength(3);
    expectValidTopology(topology);
  });

  it("builds a triangular grid with twelve interior vertex-sharing neighbors", () => {
    const topology = createTriangleTopology(4);
    const maximum = Math.max(...topology.cells().map((cell) => topology.neighbors(cell).length));
    expect(topology.cells()).toHaveLength(96);
    expect(maximum).toBe(12);
    const centers = new Set(
      topology.cells().map((cell) => {
        const center = topology.center(cell);
        return `${center.x.toFixed(6)}:${center.y.toFixed(6)}`;
      }),
    );
    for (const cell of topology.cells()) {
      const center = topology.center(cell);
      expect(centers.has(`${(-center.x).toFixed(6)}:${center.y.toFixed(6)}`)).toBe(true);
    }
    expect(topology.neighbors("missing")).toEqual([]);
    expectValidTopology(topology);
  });

  it("builds a radius-four hex board with six center neighbors", () => {
    const topology = createHexTopology(4);
    expect(topology.cells()).toHaveLength(61);
    expect(topology.neighbors("h:0:0")).toHaveLength(6);
    expectValidTopology(topology);
  });

  it("provides safe default dimensions for custom configurations", () => {
    expect(createTopology({ geometry: "square", difficulty: "easy", mines: 1 }).cells()).toHaveLength(81);
    expect(createTopology({ geometry: "triangle", difficulty: "easy", mines: 1 }).cells()).toHaveLength(96);
    expect(createTopology({ geometry: "hex", difficulty: "easy", mines: 1 }).cells()).toHaveLength(61);
  });
});
