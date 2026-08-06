export type Direction = "up" | "down" | "left" | "right";

export interface Tile {
  readonly id: number;
  readonly value: number;
  readonly row: number;
  readonly col: number;
  readonly merged?: boolean;
  readonly spawned?: boolean;
}

export interface TileMotion {
  readonly id: number;
  readonly fromRow: number;
  readonly fromCol: number;
  readonly toRow: number;
  readonly toCol: number;
  readonly mergedInto?: number;
}

export interface MoveResult {
  readonly tiles: readonly Tile[];
  readonly motions: readonly TileMotion[];
  readonly scoreDelta: number;
  readonly changed: boolean;
  readonly nextTileId: number;
}
