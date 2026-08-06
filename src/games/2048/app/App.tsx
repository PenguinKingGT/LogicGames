"use client";

import { useCallback, useEffect, useReducer, useRef, useState, type KeyboardEvent } from "react";
import { audioManager } from "../audio/audio-manager";
import { HelpDialog, RestartDialog, ResultDialog } from "../components/GameDialogs";
import { GameHeader } from "../components/GameHeader";
import { TileBoard } from "../components/TileBoard";
import { createOpening } from "../domain/engine";
import type { Direction } from "../domain/types";
import { readGame, writeGame } from "../persistence/storage";
import { createGameState, gameReducer } from "./game-reducer";

const SOUND_KEY = "2048:sound";
const KEY_DIRECTIONS: Readonly<Record<string, Direction | undefined>> = {
  ArrowUp: "up", w: "up", W: "up", ArrowDown: "down", s: "down", S: "down",
  ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right",
};

interface Props { readonly random?: () => number; readonly animationMs?: number }
export default function App({ random = Math.random, animationMs = 170 }: Props) {
  const randomRef = useRef(random);
  const [state, dispatch] = useReducer(gameReducer, undefined, () => createGameState(() => 0));
  const [ready, setReady] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [restartOpen, setRestartOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const previousPhase = useRef(state.phase);

  useEffect(() => { randomRef.current = random; }, [random]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const stored = readGame();
      if (stored) dispatch({ type: "hydrate", state: stored });
      else dispatch({ type: "new-round", ...createOpening(randomRef.current), roundId: 1 });
      const sound = localStorage.getItem(SOUND_KEY) !== "false";
      setSoundEnabled(sound); audioManager.setEnabled(sound); setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!ready || state.phase === "animating") return;
    writeGame(state);
  }, [ready, state]);

  useEffect(() => {
    if (state.phase !== "animating") return;
    void audioManager.play(state.motions.some((motion) => motion.mergedInto !== undefined) ? "merge" : "slide");
    const roundId = state.roundId; const moveId = state.moveId;
    const timer = window.setTimeout(() => dispatch({ type: "finish-animation", roundId, moveId }), animationMs);
    return () => window.clearTimeout(timer);
  }, [animationMs, state.motions, state.moveId, state.phase, state.roundId]);

  useEffect(() => {
    if (previousPhase.current !== state.phase) {
      if (state.phase === "won") void audioManager.play("milestone");
      if (state.phase === "lost") void audioManager.play("lose");
      previousPhase.current = state.phase;
    }
  }, [state.phase]);

  const move = useCallback((direction: Direction) => {
    dispatch({ type: "move", direction, randomPosition: randomRef.current(), randomValue: randomRef.current() });
  }, []);
  const keyDown = (event: KeyboardEvent<HTMLElement>) => {
    const direction = KEY_DIRECTIONS[event.key];
    if (!direction || state.phase === "animating") return;
    event.preventDefault(); move(direction);
  };
  const startRound = () => {
    const opening = createOpening(randomRef.current);
    dispatch({ type: "new-round", ...opening, roundId: state.roundId + 1 });
    setRestartOpen(false); void audioManager.play("button");
  };

  return <main className="game-2048" onKeyDown={keyDown}>
    <div className="g2048-shell">
      <GameHeader score={state.score} bestScore={state.bestScore} canUndo={state.undo !== null && state.phase !== "animating"}
        soundEnabled={soundEnabled} onUndo={() => dispatch({ type: "undo" })}
        onRestart={() => state.moves > 0 ? setRestartOpen(true) : startRound()}
        onSound={() => { const next = !soundEnabled; setSoundEnabled(next); audioManager.setEnabled(next); localStorage.setItem(SOUND_KEY, String(next)); if (next) void audioManager.play("button"); }}
        onHelp={() => setHelpOpen(true)} />
      <section className="g2048-play">
        <TileBoard tiles={state.tiles} disabled={!ready || state.phase === "animating" || state.phase === "won" || state.phase === "lost"} onMove={move} />
        <p id="g2048-instructions">方向键 / WASD / 滑动移动数字</p>
        <p className="g2048-live" aria-live="polite">{state.phase === "won" ? "已合成 2048" : state.phase === "lost" ? "没有可移动的方块" : `当前分数 ${state.score}`}</p>
      </section>
    </div>
    <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    <RestartDialog open={restartOpen} onCancel={() => setRestartOpen(false)} onConfirm={startRound} />
    <ResultDialog phase={state.phase === "won" || state.phase === "lost" ? state.phase : null} score={state.score} bestScore={state.bestScore} onContinue={() => dispatch({ type: "continue" })} onRestart={startRound} />
  </main>;
}
