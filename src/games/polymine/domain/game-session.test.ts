import { describe, expect, it } from "vitest";
import { GameSession } from "./game-session";
import { getPreset } from "./presets";

describe("GameSession", () => {
  it.each(["square", "triangle", "hex"] as const)(
    "keeps the first %s reveal and all neighbors mine-free",
    (geometry) => {
      const session = new GameSession(getPreset(geometry, "easy"), "safe-seed");
      const first = session.topology.cells()[Math.floor(session.topology.cells().length / 2)];
      expect(first).toBeDefined();
      session.reveal(first!, 100);
      const mines = new Set(session.debugMineIds());
      expect(mines).toHaveLength(session.config.mines);
      expect(mines.has(first!)).toBe(false);
      for (const neighbor of session.topology.neighbors(first!)) expect(mines.has(neighbor)).toBe(false);
      expect(session.snapshot(100).cells.get(first!)?.adjacentMines).toBe(0);
    },
  );

  it("generates deterministic mine layouts from a seed", () => {
    const config = getPreset("square", "easy");
    const first = "s:4:4";
    const firstSession = new GameSession(config, "repeatable");
    const secondSession = new GameSession(config, "repeatable");
    firstSession.reveal(first);
    secondSession.reveal(first);
    expect(secondSession.debugMineIds()).toEqual(firstSession.debugMineIds());
  });

  it("allows flags before starting without placing mines", () => {
    const session = new GameSession(getPreset("square", "easy"), "flags");
    expect(session.toggleFlag("s:0:0").changed).toBe(true);
    expect(session.snapshot().phase).toBe("ready");
    expect(session.debugMineIds()).toHaveLength(0);
    expect(session.snapshot().flagCount).toBe(1);
  });

  it("pauses elapsed time", () => {
    const session = new GameSession(getPreset("square", "easy"), "clock");
    session.reveal("s:4:4", 100);
    expect(session.snapshot(1100).elapsedMs).toBe(1000);
    session.setPaused(true, 1100);
    expect(session.snapshot(5000).elapsedMs).toBe(1000);
    session.setPaused(false, 5000);
    expect(session.snapshot(5500).elapsedMs).toBe(1500);
  });

  it("refuses a board that cannot preserve the first-click safe area", () => {
    const session = new GameSession(
      { geometry: "square", difficulty: "easy", rows: 2, columns: 2, mines: 1 },
      "too-small",
    );
    expect(() => session.reveal("s:0:0")).toThrow(/safe area/);
  });

  it("loses when a mine is revealed", () => {
    const session = new GameSession(getPreset("square", "easy"), "known-loss");
    session.reveal("s:4:4", 100);
    const mine = session.debugMineIds()[0];
    expect(mine).toBeDefined();
    session.reveal(mine!, 200);
    const snapshot = session.snapshot(200);
    expect(snapshot.phase).toBe("lost");
    expect(snapshot.cells.get(mine!)?.isTriggeredMine).toBe(true);
  });

  it("wins after every safe cell is revealed", () => {
    const session = new GameSession(getPreset("square", "easy"), "known-win");
    session.reveal("s:4:4", 100);
    const mines = new Set(session.debugMineIds());
    for (const cell of session.topology.cells()) {
      if (!mines.has(cell)) session.reveal(cell, 200);
    }
    expect(session.snapshot(200).phase).toBe("won");
    expect(session.snapshot(200).safeRemaining).toBe(0);
  });

  it("chords a revealed number after its neighboring mines are flagged", () => {
    const session = new GameSession(getPreset("square", "easy"), "known-chord");
    session.reveal("s:4:4", 100);
    const mines = new Set(session.debugMineIds());
    const snapshot = session.snapshot(100);
    const numbered = [...snapshot.cells.values()].find(
      (cell) => cell.state === "revealed" && (cell.adjacentMines ?? 0) > 0,
    );
    expect(numbered).toBeDefined();
    for (const neighbor of session.topology.neighbors(numbered!.id)) {
      if (mines.has(neighbor)) session.toggleFlag(neighbor);
    }
    const before = session.snapshot(100).safeRemaining;
    session.chord(numbered!.id, 200);
    expect(session.snapshot(200).safeRemaining).toBeLessThan(before);
    expect(session.snapshot(200).phase).not.toBe("lost");
  });

  it("loses a chord when the right number of flags are placed on safe cells", () => {
    const session = new GameSession(getPreset("square", "easy"), "wrong-flags");
    session.reveal("s:4:4", 100);
    const mines = new Set(session.debugMineIds());
    const snapshot = session.snapshot(100);
    const numbered = [...snapshot.cells.values()].find((cell) => {
      if (cell.state !== "revealed" || !cell.adjacentMines) return false;
      const safeHidden = session.topology
        .neighbors(cell.id)
        .filter((id) => !mines.has(id) && snapshot.cells.get(id)?.state === "hidden");
      return safeHidden.length >= cell.adjacentMines;
    });
    expect(numbered).toBeDefined();
    const safeHidden = session.topology
      .neighbors(numbered!.id)
      .filter((id) => !mines.has(id) && snapshot.cells.get(id)?.state === "hidden");
    for (const cell of safeHidden.slice(0, numbered!.adjacentMines!)) session.toggleFlag(cell);
    session.chord(numbered!.id, 200);
    expect(session.snapshot(200).phase).toBe("lost");
  });

  it("ignores invalid and terminal actions", () => {
    const session = new GameSession(getPreset("square", "easy"), "guards");
    expect(session.chord("s:0:0").changed).toBe(false);
    expect(session.setPaused(true)).toBe(false);
    session.reveal("s:4:4", 100);
    const numbered = [...session.snapshot(100).cells.values()].find(
      (cell) => cell.state === "revealed" && (cell.adjacentMines ?? 0) > 0,
    );
    expect(numbered).toBeDefined();
    expect(session.chord(numbered!.id).effects[0]?.cue).toBe("invalid");
    session.reveal(session.debugMineIds()[0]!, 200);
    expect(session.toggleFlag("s:0:0").changed).toBe(false);
    expect(session.reveal("s:0:0").changed).toBe(false);
  });
});
