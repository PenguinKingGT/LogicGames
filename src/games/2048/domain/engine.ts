import type { Direction, MoveResult, Tile, TileMotion } from "./types";

export const BOARD_SIZE = 4;

export function isTileValue(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 2
    && (value & (value - 1)) === 0;
}

export function boardValues(tiles: readonly Tile[]): number[] {
  const values = Array<number>(16).fill(0);
  for (const tile of tiles) values[tile.row * BOARD_SIZE + tile.col] = tile.value;
  return values;
}

function lineCoordinates(direction: Direction, line: number): Array<[number, number]> {
  const coordinates: Array<[number, number]> = [];
  for (let index = 0; index < BOARD_SIZE; index += 1) {
    if (direction === "left") coordinates.push([line, index]);
    if (direction === "right") coordinates.push([line, BOARD_SIZE - 1 - index]);
    if (direction === "up") coordinates.push([index, line]);
    if (direction === "down") coordinates.push([BOARD_SIZE - 1 - index, line]);
  }
  return coordinates;
}

export function moveTiles(
  tiles: readonly Tile[],
  direction: Direction,
  firstNewId: number,
): MoveResult {
  const byPosition = new Map(tiles.map((tile) => [`${tile.row}:${tile.col}`, tile]));
  const nextTiles: Tile[] = [];
  const motions: TileMotion[] = [];
  let scoreDelta = 0;
  let nextTileId = firstNewId;

  for (let line = 0; line < BOARD_SIZE; line += 1) {
    const coordinates = lineCoordinates(direction, line);
    const source = coordinates
      .map(([row, col]) => byPosition.get(`${row}:${col}`))
      .filter((tile): tile is Tile => tile !== undefined);
    let targetIndex = 0;
    for (let index = 0; index < source.length; index += 1) {
      const tile = source[index]!;
      const partner = source[index + 1];
      const [row, col] = coordinates[targetIndex]!;
      if (partner && partner.value === tile.value) {
        const mergedId = nextTileId++;
        nextTiles.push({ id: mergedId, value: tile.value * 2, row, col, merged: true });
        motions.push(
          { id: tile.id, fromRow: tile.row, fromCol: tile.col, toRow: row, toCol: col, mergedInto: mergedId },
          { id: partner.id, fromRow: partner.row, fromCol: partner.col, toRow: row, toCol: col, mergedInto: mergedId },
        );
        scoreDelta += tile.value * 2;
        index += 1;
      } else {
        nextTiles.push({ id: tile.id, value: tile.value, row, col });
        motions.push({ id: tile.id, fromRow: tile.row, fromCol: tile.col, toRow: row, toCol: col });
      }
      targetIndex += 1;
    }
  }

  const changed = motions.some((motion) =>
    motion.fromRow !== motion.toRow || motion.fromCol !== motion.toCol || motion.mergedInto !== undefined,
  );
  return { tiles: nextTiles, motions, scoreDelta, changed, nextTileId };
}

export function spawnTile(
  tiles: readonly Tile[],
  id: number,
  positionRandom: number,
  valueRandom: number,
): Tile | null {
  const occupied = new Set(tiles.map((tile) => tile.row * BOARD_SIZE + tile.col));
  const empty = Array.from({ length: 16 }, (_, index) => index).filter((index) => !occupied.has(index));
  if (empty.length === 0) return null;
  const safeRandom = Math.min(Math.max(positionRandom, 0), 0.999999999);
  const position = empty[Math.floor(safeRandom * empty.length)]!;
  return {
    id,
    value: valueRandom < 0.9 ? 2 : 4,
    row: Math.floor(position / BOARD_SIZE),
    col: position % BOARD_SIZE,
    spawned: true,
  };
}

export function hasWon(tiles: readonly Tile[]): boolean {
  return tiles.some((tile) => tile.value >= 2048);
}

export function isGameOver(tiles: readonly Tile[]): boolean {
  if (tiles.length < 16) return false;
  const values = boardValues(tiles);
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const value = values[row * BOARD_SIZE + col];
      if (col < 3 && value === values[row * BOARD_SIZE + col + 1]) return false;
      if (row < 3 && value === values[(row + 1) * BOARD_SIZE + col]) return false;
    }
  }
  return true;
}

export function createOpening(random: () => number): { tiles: readonly Tile[]; nextTileId: number } {
  const first = spawnTile([], 1, random(), random())!;
  const second = spawnTile([first], 2, random(), random())!;
  return { tiles: [first, second], nextTileId: 3 };
}
