import { GameSession } from "../domain/game-session";
import { getPreset } from "../domain/presets";
import { makeSeed } from "../domain/rng";
import type { CellId, GameEffect, GameSnapshot } from "../domain/types";
import {
  loadData,
  saveData,
  statsKey,
  type ModeStats,
  type Settings,
} from "../persistence/local-storage";

type Listener = () => void;
type EffectListener = (effects: readonly GameEffect[]) => void;

export class GameController {
  private session: GameSession;
  private snapshotValue: GameSnapshot;
  private readonly listeners = new Set<Listener>();
  private readonly settingsListeners = new Set<Listener>();
  private readonly effectListeners = new Set<EffectListener>();
  private timer: number | null = null;
  private terminalRecorded = false;
  settings: Settings;
  stats: Record<string, ModeStats>;

  constructor() {
    const persisted = loadData();
    this.settings = persisted.settings;
    this.stats = persisted.stats;
    this.session = new GameSession(
      getPreset(this.settings.geometry, this.settings.difficulty),
      makeSeed(),
    );
    this.snapshotValue = this.session.snapshot();
    this.timer = window.setInterval(() => {
      if (this.snapshotValue.phase === "playing") this.refresh();
    }, 250);
  }

  readonly subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  readonly getSnapshot = (): GameSnapshot => this.snapshotValue;

  subscribeSettings(listener: Listener): () => void {
    this.settingsListeners.add(listener);
    return () => this.settingsListeners.delete(listener);
  }

  onEffects(listener: EffectListener): () => void {
    this.effectListeners.add(listener);
    return () => this.effectListeners.delete(listener);
  }

  reveal(cellId: CellId): void {
    const result = this.session.reveal(cellId);
    this.commit(result.changed, result.effects);
  }

  toggleFlag(cellId: CellId): void {
    const result = this.session.toggleFlag(cellId);
    this.commit(result.changed, result.effects);
  }

  setPaused(paused: boolean): void {
    if (this.session.setPaused(paused)) this.refresh();
  }

  newGame(
    geometry = this.settings.geometry,
    difficulty = this.settings.difficulty,
    seed = makeSeed(),
  ): void {
    this.settings = { ...this.settings, geometry, difficulty };
    this.session = new GameSession(getPreset(geometry, difficulty), seed);
    this.terminalRecorded = false;
    this.persist();
    this.refresh();
    this.notifySettings();
  }

  updateSettings(patch: Partial<Settings>): void {
    this.settings = { ...this.settings, ...patch };
    this.persist();
    this.notifySettings();
  }

  getTopology() {
    return this.session.topology;
  }

  getModeStats(): ModeStats {
    return this.stats[statsKey(this.settings.geometry, this.settings.difficulty)] ?? {
      games: 0,
      wins: 0,
      bestMs: null,
      streak: 0,
    };
  }

  destroy(): void {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.listeners.clear();
    this.settingsListeners.clear();
    this.effectListeners.clear();
  }

  private commit(changed: boolean, effects: readonly GameEffect[]): void {
    if (changed) this.refresh();
    if (effects.length > 0) {
      for (const listener of this.effectListeners) listener(effects);
    }
  }

  private refresh(): void {
    this.snapshotValue = this.session.snapshot();
    this.recordTerminalIfNeeded();
    for (const listener of this.listeners) listener();
  }

  private recordTerminalIfNeeded(): void {
    if (this.terminalRecorded || (this.snapshotValue.phase !== "won" && this.snapshotValue.phase !== "lost")) {
      return;
    }
    this.terminalRecorded = true;
    const key = statsKey(this.settings.geometry, this.settings.difficulty);
    const previous = this.getModeStats();
    const won = this.snapshotValue.phase === "won";
    this.stats = {
      ...this.stats,
      [key]: {
        games: previous.games + 1,
        wins: previous.wins + (won ? 1 : 0),
        bestMs:
          won && (previous.bestMs === null || this.snapshotValue.elapsedMs < previous.bestMs)
            ? this.snapshotValue.elapsedMs
            : previous.bestMs,
        streak: won ? previous.streak + 1 : 0,
      },
    };
    this.persist();
  }

  private notifySettings(): void {
    for (const listener of this.settingsListeners) listener();
  }

  private persist(): void {
    saveData(this.settings, this.stats);
  }
}
