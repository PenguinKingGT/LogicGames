import { hasWon, isGameOver, isTileValue } from "../domain/engine";
import type { GameState, UndoSnapshot } from "../app/game-reducer";
import type { Tile } from "../domain/types";

export const GAME_2048_STORAGE_KEY = "2048:v1";

function validInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function parseTiles(value: unknown): Tile[] | null {
  if (!Array.isArray(value) || value.length > 16) return null;
  const positions = new Set<string>();
  const ids = new Set<number>();
  const tiles: Tile[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") return null;
    const item = entry as Record<string, unknown>;
    if (!validInteger(item.id) || item.id === 0 || !isTileValue(item.value)
      || !validInteger(item.row) || item.row > 3 || !validInteger(item.col) || item.col > 3) return null;
    const position = `${item.row}:${item.col}`;
    if (positions.has(position) || ids.has(item.id)) return null;
    positions.add(position); ids.add(item.id);
    tiles.push({ id: item.id, value: item.value, row: item.row, col: item.col });
  }
  return tiles;
}

function parseUndo(value: unknown): UndoSnapshot | null {
  if (value === null) return null;
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const tiles = parseTiles(item.tiles);
  if (!tiles || !validInteger(item.score) || typeof item.victoryAcknowledged !== "boolean") return null;
  return { tiles, score: item.score, victoryAcknowledged: item.victoryAcknowledged };
}

export function readGame(storage?: Pick<Storage, "getItem">): GameState | null {
  const target = storage ?? (typeof window === "undefined" ? undefined : window.localStorage);
  if (!target) return null;
  try {
    const raw = target.getItem(GAME_2048_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const item = parsed as Record<string, unknown>;
    const tiles = parseTiles(item.tiles);
    const undo = parseUndo(item.undo);
    if (item.version !== 1 || !tiles || tiles.length < 2 || !validInteger(item.score)
      || !validInteger(item.bestScore) || !validInteger(item.nextTileId)
      || !validInteger(item.roundId) || !validInteger(item.moveId) || !validInteger(item.moves)
      || typeof item.victoryAcknowledged !== "boolean" || (item.undo !== null && !undo)) return null;
    const maxId = Math.max(0, ...tiles.map((tile) => tile.id));
    if (item.nextTileId <= maxId) return null;
    return {
      tiles, score: item.score, bestScore: Math.max(item.bestScore, item.score),
      phase: isGameOver(tiles) ? "lost" : !item.victoryAcknowledged && hasWon(tiles) ? "won" : item.victoryAcknowledged ? "continued" : "playing",
      victoryAcknowledged: item.victoryAcknowledged, undo, motions: [],
      nextTileId: item.nextTileId, roundId: Math.max(1, item.roundId), moveId: item.moveId, moves: item.moves,
    };
  } catch { return null; }
}

export function writeGame(state: GameState, storage?: Pick<Storage, "setItem">): void {
  const target = storage ?? (typeof window === "undefined" ? undefined : window.localStorage);
  if (!target) return;
  try {
    target.setItem(GAME_2048_STORAGE_KEY, JSON.stringify({
      version: 1, tiles: state.tiles, score: state.score, bestScore: state.bestScore,
      victoryAcknowledged: state.victoryAcknowledged, undo: state.undo,
      nextTileId: state.nextTileId, roundId: state.roundId, moveId: state.moveId, moves: state.moves,
    }));
  } catch { /* Local saves are optional. */ }
}
