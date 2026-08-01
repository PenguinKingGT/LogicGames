import { createSeededRandom } from "./rng";
import { createTopology, type Topology } from "./topologies";
import type {
  ActionResult,
  BoardConfig,
  CellId,
  CellSnapshot,
  CellState,
  GameEffect,
  GamePhase,
  GameSnapshot,
} from "./types";

interface InternalCell {
  state: CellState;
  hasMine: boolean;
  adjacentMines: number | null;
  triggered: boolean;
}

const noChange: ActionResult = { changed: false, effects: [] };

export class GameSession {
  readonly topology: Topology;
  readonly config: BoardConfig;
  readonly seed: string;
  private readonly board = new Map<CellId, InternalCell>();
  private phase: GamePhase = "ready";
  private startedAt: number | null = null;
  private completedElapsedMs = 0;

  constructor(config: BoardConfig, seed: string) {
    this.config = config;
    this.seed = seed;
    this.topology = createTopology(config);
    for (const id of this.topology.cells()) {
      this.board.set(id, { state: "hidden", hasMine: false, adjacentMines: null, triggered: false });
    }
  }

  reveal(cellId: CellId, now = performance.now()): ActionResult {
    if (this.phase === "paused" || this.phase === "won" || this.phase === "lost") return noChange;
    const cell = this.board.get(cellId);
    if (!cell || cell.state === "flagged") return noChange;
    if (cell.state === "revealed") return this.chord(cellId, now);

    if (this.phase === "ready") {
      this.placeMines(cellId);
      this.phase = "playing";
      this.startedAt = now;
    }

    if (cell.hasMine) {
      cell.state = "revealed";
      cell.triggered = true;
      this.finish("lost", now);
      return { changed: true, effects: [{ type: "sound", cue: "mine" }] };
    }

    const revealedCount = this.revealSafeArea(cellId);
    const effects: GameEffect[] = [
      { type: "sound", cue: revealedCount > 5 ? "cascade" : "reveal" },
    ];
    if (this.safeRemaining() === 0) {
      this.finish("won", now);
      effects.push({ type: "sound", cue: "win" });
    }
    return { changed: revealedCount > 0, effects };
  }

  toggleFlag(cellId: CellId): ActionResult {
    if (this.phase === "paused" || this.phase === "won" || this.phase === "lost") return noChange;
    const cell = this.board.get(cellId);
    if (!cell || cell.state === "revealed") return noChange;
    cell.state = cell.state === "flagged" ? "hidden" : "flagged";
    return {
      changed: true,
      effects: [{ type: "sound", cue: cell.state === "flagged" ? "flag-on" : "flag-off" }],
    };
  }

  chord(cellId: CellId, now = performance.now()): ActionResult {
    if (this.phase !== "playing") return noChange;
    const cell = this.board.get(cellId);
    if (!cell || cell.state !== "revealed" || !cell.adjacentMines) return noChange;
    const neighbors = this.topology.neighbors(cellId);
    const flags = neighbors.filter((id) => this.board.get(id)?.state === "flagged").length;
    if (flags !== cell.adjacentMines) {
      return { changed: false, effects: [{ type: "sound", cue: "invalid" }] };
    }

    let revealedCount = 0;
    for (const neighborId of neighbors) {
      const neighbor = this.board.get(neighborId);
      if (!neighbor || neighbor.state !== "hidden") continue;
      if (neighbor.hasMine) {
        neighbor.state = "revealed";
        neighbor.triggered = true;
        this.finish("lost", now);
        return { changed: true, effects: [{ type: "sound", cue: "mine" }] };
      }
      revealedCount += this.revealSafeArea(neighborId);
    }
    const effects: GameEffect[] = [
      { type: "sound", cue: revealedCount > 5 ? "cascade" : "reveal" },
    ];
    if (this.safeRemaining() === 0) {
      this.finish("won", now);
      effects.push({ type: "sound", cue: "win" });
    }
    return { changed: revealedCount > 0, effects };
  }

  setPaused(paused: boolean, now = performance.now()): boolean {
    if (paused && this.phase === "playing") {
      if (this.startedAt !== null) this.completedElapsedMs += now - this.startedAt;
      this.startedAt = null;
      this.phase = "paused";
      return true;
    }
    if (!paused && this.phase === "paused") {
      this.startedAt = now;
      this.phase = "playing";
      return true;
    }
    return false;
  }

  snapshot(now = performance.now()): GameSnapshot {
    const terminal = this.phase === "won" || this.phase === "lost";
    const cells = new Map<CellId, CellSnapshot>();
    for (const [id, cell] of this.board) {
      const mineVisible = terminal && cell.hasMine;
      cells.set(id, {
        id,
        state: cell.state,
        adjacentMines: cell.state === "revealed" && !cell.hasMine ? cell.adjacentMines : null,
        isMineVisible: mineVisible,
        isTriggeredMine: cell.triggered,
        isWrongFlag: terminal && cell.state === "flagged" && !cell.hasMine,
      });
    }
    return {
      phase: this.phase,
      config: this.config,
      seed: this.seed,
      elapsedMs: this.elapsed(now),
      mineCount: this.config.mines,
      flagCount: [...this.board.values()].filter((cell) => cell.state === "flagged").length,
      safeRemaining: this.safeRemaining(),
      cells,
    };
  }

  /** Test-only diagnostic. Never expose this result to rendering code. */
  debugMineIds(): readonly CellId[] {
    return [...this.board].filter(([, cell]) => cell.hasMine).map(([id]) => id);
  }

  private placeMines(firstCell: CellId): void {
    const excluded = new Set([firstCell, ...this.topology.neighbors(firstCell)]);
    const candidates = this.topology.cells().filter((id) => !excluded.has(id));
    if (candidates.length < this.config.mines) {
      throw new Error("Not enough cells to preserve the first-click safe area");
    }
    const random = createSeededRandom(this.seed);
    const shuffled = [...candidates];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      const current = shuffled[index];
      const swap = shuffled[swapIndex];
      if (current === undefined || swap === undefined) continue;
      shuffled[index] = swap;
      shuffled[swapIndex] = current;
    }
    for (const id of shuffled.slice(0, this.config.mines)) {
      const cell = this.board.get(id);
      if (cell) cell.hasMine = true;
    }
    for (const [id, cell] of this.board) {
      cell.adjacentMines = this.topology.neighbors(id).filter((neighbor) => this.board.get(neighbor)?.hasMine).length;
    }
  }

  private revealSafeArea(startId: CellId): number {
    const queue = [startId];
    const visited = new Set<CellId>();
    let count = 0;
    while (queue.length > 0) {
      const id = queue.shift();
      if (!id || visited.has(id)) continue;
      visited.add(id);
      const cell = this.board.get(id);
      if (!cell || cell.state !== "hidden" || cell.hasMine) continue;
      cell.state = "revealed";
      count += 1;
      if (cell.adjacentMines === 0) {
        for (const neighbor of this.topology.neighbors(id)) queue.push(neighbor);
      }
    }
    return count;
  }

  private safeRemaining(): number {
    return [...this.board.values()].filter((cell) => !cell.hasMine && cell.state !== "revealed").length;
  }

  private elapsed(now: number): number {
    return this.completedElapsedMs + (this.startedAt === null ? 0 : Math.max(0, now - this.startedAt));
  }

  private finish(phase: "won" | "lost", now: number): void {
    if (this.startedAt !== null) this.completedElapsedMs += now - this.startedAt;
    this.startedAt = null;
    this.phase = phase;
  }
}

