import type { BoardConfig } from "../types";
import { createHexTopology } from "./hex";
import { createSquareTopology } from "./square";
import { createTriangleTopology } from "./triangle";
import type { Topology } from "./topology";

export function createTopology(config: BoardConfig): Topology {
  switch (config.geometry) {
    case "square":
      return createSquareTopology(config.rows ?? 9, config.columns ?? 9);
    case "triangle":
      return createTriangleTopology(config.rows ?? 4);
    case "hex":
      return createHexTopology(config.radius ?? 4);
  }
}

export type { Topology } from "./topology";
