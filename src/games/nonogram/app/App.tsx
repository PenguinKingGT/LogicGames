"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { audioManager } from "../audio/audio-manager";
import type { SoundCue } from "../audio/sounds";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { GameHeader } from "../components/GameHeader";
import { HelpDialog } from "../components/HelpDialog";
import { PuzzleBoard } from "../components/PuzzleBoard";
import { ResultDialog } from "../components/ResultDialog";
import { ToolDock } from "../components/ToolDock";
import { difficultyLabels, getPuzzles, puzzles } from "../domain/puzzles";
import type { Difficulty, Tool } from "../domain/types";
import { defaultData, readData, recordCompletion, selectPuzzle, writeData, type NonogramData } from "../persistence/storage";
import { createInitialState, elapsedMs, gameReducer } from "./game-reducer";

const getNow = () => performance.now();

export function formatElapsed(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function App({ random = Math.random }: { random?: () => number }) {
  const [data, setData] = useState<NonogramData>(defaultData);
  const [state, dispatch] = useReducer(gameReducer, puzzles[0]!, createInitialState);
  const [tool, setTool] = useState<Tool>("filled");
  const [now, setNow] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const [restartOpen, setRestartOpen] = useState(false);
  const recordedResult = useRef<string | null>(null);
  const helpTriggerRef = useRef<HTMLButtonElement>(null);
  const hasProgress = state.marks.some((mark) => mark !== "unknown");
  const elapsed = elapsedMs(state, now || state.startedAt || 0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const loaded = readData();
      audioManager.setEnabled(loaded.soundEnabled);
      setData(loaded);
      const initialPuzzle = selectPuzzle(loaded.lastDifficulty, loaded, undefined, random);
      dispatch({ type: "load-puzzle", puzzle: initialPuzzle });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [random]);

  useEffect(() => {
    if (state.phase !== "playing") return;
    const timer = window.setInterval(() => setNow(getNow()), 500);
    return () => window.clearInterval(timer);
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== "won") return;
    const resultKey = `${state.puzzle.id}:${state.completedElapsedMs}`;
    if (recordedResult.current === resultKey) return;
    recordedResult.current = resultKey;
    void audioManager.play("win");
    setData((current) => {
      const next = recordCompletion(current, state.puzzle.id, state.completedElapsedMs);
      writeData(next);
      return next;
    });
  }, [state.completedElapsedMs, state.phase, state.puzzle.id]);

  const playSound = useCallback((cue: SoundCue) => {
    void audioManager.play(cue);
  }, []);

  const loadPuzzle = useCallback((difficulty: Difficulty, afterId?: string) => {
    setData((current) => {
      const nextData = { ...current, lastDifficulty: difficulty };
      const puzzle = selectPuzzle(difficulty, nextData, afterId, random);
      writeData(nextData);
      recordedResult.current = null;
      dispatch({ type: "load-puzzle", puzzle });
      return nextData;
    });
    setTool("filled");
    setNow(0);
  }, [random]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[role=dialog]")) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        playSound("undo");
        dispatch({ type: "undo", now: getNow() });
        event.preventDefault();
      } else if (!event.metaKey && !event.ctrlKey && event.key.toLowerCase() === "f") setTool("filled");
      else if (!event.metaKey && !event.ctrlKey && event.key.toLowerCase() === "x") setTool("crossed");
      else if (!event.metaKey && !event.ctrlKey && event.key.toLowerCase() === "e") setTool("unknown");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [playSound]);

  return (
    <main className="nonogram-game nonogram-stage">
      <a className="nonogram-skip-link" href="#nonogram-board">跳到棋盘</a>
      <div className="nonogram-shell">
        <GameHeader
          difficulty={state.puzzle.difficulty}
          elapsed={formatElapsed(elapsed)}
          onDifficultyChange={(difficulty) => {
            playSound("switch");
            loadPuzzle(difficulty);
          }}
          onNextPuzzle={() => {
            playSound("switch");
            loadPuzzle(state.puzzle.difficulty, state.puzzle.id);
          }}
          onHelp={() => setHelpOpen(true)}
          soundEnabled={data.soundEnabled}
          onSoundToggle={() => {
            const soundEnabled = !data.soundEnabled;
            const nextData = { ...data, soundEnabled };
            audioManager.setEnabled(soundEnabled);
            setData(nextData);
            writeData(nextData);
            if (soundEnabled) playSound("switch");
          }}
          helpTriggerRef={helpTriggerRef}
        />
        <section className="nonogram-play" aria-labelledby="puzzle-heading">
          <div className="puzzle-meta">
            <span id="puzzle-heading">{difficultyLabels[state.puzzle.difficulty]} / {state.puzzle.width}×{state.puzzle.height}</span>
            <span>
              {data.completedPuzzleIds.filter((id) => id.startsWith(`${state.puzzle.difficulty}-`)).length}
              /{getPuzzles(state.puzzle.difficulty).length} 完成
            </span>
          </div>
          <div id="nonogram-board">
            <PuzzleBoard
              key={state.puzzle.id}
              state={state}
              tool={tool}
              dispatch={dispatch}
              onSound={playSound}
            />
          </div>
        </section>
        <ToolDock
          tool={tool}
          canUndo={state.history.length > 0}
          hasProgress={hasProgress}
          onToolChange={setTool}
          onUndo={() => {
            playSound("undo");
            dispatch({ type: "undo", now: getNow() });
          }}
          onRestart={() => setRestartOpen(true)}
        />
        <p className="nonogram-status" aria-live="polite">
          {state.phase === "won" ? `已完成${state.puzzle.name}` : `当前工具：${tool === "filled" ? "填格" : tool === "crossed" ? "标空" : "擦除"}`}
        </p>
      </div>
      <HelpDialog
        open={helpOpen}
        onOpenChange={(open) => {
          setHelpOpen(open);
          if (!open) window.requestAnimationFrame(() => helpTriggerRef.current?.focus());
        }}
      />
      <ConfirmDialog
        open={restartOpen}
        onOpenChange={setRestartOpen}
        onConfirm={() => {
          playSound("erase");
          dispatch({ type: "restart" });
          recordedResult.current = null;
          setNow(0);
          setRestartOpen(false);
        }}
      />
      <ResultDialog
        open={state.phase === "won"}
        name={state.puzzle.name}
        elapsed={formatElapsed(state.completedElapsedMs)}
        onNext={() => {
          playSound("switch");
          loadPuzzle(state.puzzle.difficulty, state.puzzle.id);
        }}
        onReplay={() => {
          playSound("erase");
          dispatch({ type: "restart" });
          recordedResult.current = null;
          setNow(0);
        }}
      />
    </main>
  );
}
