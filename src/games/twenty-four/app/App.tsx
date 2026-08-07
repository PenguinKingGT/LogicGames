"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { playSound } from "../audio/audio-manager";
import {
  CompletionDialog,
  HelpDialog,
  HintDialog,
} from "../components/GameDialogs";
import { GameHeader } from "../components/GameHeader";
import { GameWorkspace } from "../components/GameWorkspace";
import { choosePuzzle, PUZZLES } from "../domain/puzzles";
import { solve } from "../domain/solver";
import type { Difficulty, Operator } from "../domain/types";
import {
  defaultData,
  readData,
  recordCompletion,
  writeData,
  type TwentyFourData,
} from "../persistence/storage";
import { createGameState, gameReducer } from "./game-reducer";

interface AppProps {
  readonly random?: () => number;
  readonly now?: () => number;
}

export default function App({
  random = Math.random,
  now = Date.now,
}: AppProps) {
  const [preferences, setPreferences] = useState<TwentyFourData>(defaultData);
  const [ready, setReady] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const recordedPuzzle = useRef<string | null>(null);
  const randomRef = useRef(random);
  const nowRef = useRef(now);
  const [state, dispatch] = useReducer(
    gameReducer,
    PUZZLES.find((puzzle) => puzzle.difficulty === "normal") ?? PUZZLES[0],
    (puzzle) => createGameState(puzzle, "normal", now()),
  );

  useEffect(() => {
    randomRef.current = random;
    nowRef.current = now;
  }, [now, random]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const stored = readData();
      setPreferences(stored);
      const puzzle = choosePuzzle(stored.difficulty, null, randomRef.current);
      dispatch({
        type: "new-puzzle",
        puzzle,
        difficulty: stored.difficulty,
        startedAt: nowRef.current(),
      });
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (
      !ready ||
      !state.completed ||
      recordedPuzzle.current === state.puzzle.id
    ) {
      return;
    }
    recordedPuzzle.current = state.puzzle.id;
    const updated = recordCompletion(
      preferences,
      state.difficulty,
      state.assisted,
      now() - state.startedAt,
    );
    setPreferences(updated);
    writeData(updated);
    playSound("success", updated.soundEnabled);
  }, [now, preferences, ready, state]);

  const solution = solve(state.puzzle.numbers);

  function startPuzzle(difficulty: Difficulty): void {
    const puzzle = choosePuzzle(difficulty, state.puzzle.id, random);
    recordedPuzzle.current = null;
    dispatch({ type: "new-puzzle", puzzle, difficulty, startedAt: now() });
    const updated = { ...preferences, difficulty };
    setPreferences(updated);
    writeData(updated);
  }

  function selectCard(cardId: string): void {
    const willCombine = Boolean(
      state.selectedCardId &&
        state.selectedOperator &&
        state.selectedCardId !== cardId,
    );
    dispatch({ type: "select-card", cardId });
    playSound(willCombine ? "combine" : "select", preferences.soundEnabled);
  }

  function selectOperator(operator: Operator): void {
    dispatch({ type: "select-operator", operator });
    playSound("select", preferences.soundEnabled);
  }

  function openHint(): void {
    dispatch({ type: "use-assistance" });
    setHintOpen(true);
  }

  function toggleSound(): void {
    const updated = {
      ...preferences,
      soundEnabled: !preferences.soundEnabled,
    };
    setPreferences(updated);
    writeData(updated);
  }

  return (
    <div className="twenty-four-game">
      <div className="twenty-four-shell">
        <GameHeader
          difficulty={state.difficulty}
          canUndo={state.history.length > 0}
          soundEnabled={preferences.soundEnabled}
          onDifficultyChange={startPuzzle}
          onUndo={() => dispatch({ type: "undo" })}
          onReset={() => dispatch({ type: "reset" })}
          onHint={openHint}
          onHelp={() => setHelpOpen(true)}
          onSoundToggle={toggleSound}
        />

        <main className="twenty-four-stage">
          <GameWorkspace
            cards={state.cards}
            selectedCardId={state.selectedCardId}
            selectedOperator={state.selectedOperator}
            message={state.message}
            onCardSelect={selectCard}
            onOperatorSelect={selectOperator}
          />
          <aside className="twenty-four-ledger" aria-label="游戏记录">
            <span>SESSION RECORD</span>
            <div>
              <small>当前连胜</small>
              <strong>{preferences.streak.toString().padStart(2, "0")}</strong>
            </div>
            <div>
              <small>最佳连胜</small>
              <strong>
                {preferences.bestStreak.toString().padStart(2, "0")}
              </strong>
            </div>
            <p>
              本难度完成 {preferences.records[state.difficulty].completed} 题
              <br />
              辅助完成 {preferences.records[state.difficulty].assisted} 题
            </p>
          </aside>
        </main>
      </div>

      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
      {solution ? (
        <HintDialog
          open={hintOpen}
          solution={solution.display}
          onOpenChange={setHintOpen}
        />
      ) : null}
      <CompletionDialog
        open={state.completed}
        assisted={state.assisted}
        onNext={() => startPuzzle(state.difficulty)}
      />
    </div>
  );
}
