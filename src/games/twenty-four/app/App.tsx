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
import type { Operator } from "../domain/types";
import {
  defaultSettings,
  readSettings,
  writeSettings,
} from "../persistence/storage";
import { createGameState, gameReducer } from "./game-reducer";

interface AppProps {
  readonly random?: () => number;
}

export default function App({ random = Math.random }: AppProps) {
  const [soundEnabled, setSoundEnabled] = useState(
    defaultSettings.soundEnabled,
  );
  const [helpOpen, setHelpOpen] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const randomRef = useRef(random);
  const [state, dispatch] = useReducer(
    gameReducer,
    PUZZLES[0],
    createGameState,
  );

  useEffect(() => {
    randomRef.current = random;
  }, [random]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setSoundEnabled(readSettings().soundEnabled);
      dispatch({
        type: "new-puzzle",
        puzzle: choosePuzzle(null, randomRef.current),
      });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function startNewPuzzle(): void {
    dispatch({
      type: "new-puzzle",
      puzzle: choosePuzzle(state.puzzle.id, randomRef.current),
    });
  }

  function selectCard(cardId: string): void {
    const willCombine = Boolean(
      state.selectedCardId &&
        state.selectedOperator &&
        state.selectedCardId !== cardId,
    );
    dispatch({ type: "select-card", cardId });
    playSound(willCombine ? "combine" : "select", soundEnabled);
  }

  function selectOperator(operator: Operator): void {
    dispatch({ type: "select-operator", operator });
    playSound("select", soundEnabled);
  }

  function toggleSound(): void {
    const nextSoundEnabled = !soundEnabled;
    setSoundEnabled(nextSoundEnabled);
    writeSettings({ soundEnabled: nextSoundEnabled });
  }

  function handleNextPuzzle(): void {
    playSound("success", soundEnabled);
    startNewPuzzle();
  }

  return (
    <div className="twenty-four-game">
      <div className="twenty-four-shell">
        <GameHeader
          canUndo={state.history.length > 0}
          soundEnabled={soundEnabled}
          onUndo={() => dispatch({ type: "undo" })}
          onNewPuzzle={startNewPuzzle}
          onHint={() => setHintOpen(true)}
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
        </main>
      </div>

      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
      <HintDialog
        open={hintOpen}
        solution={state.puzzle.solution.display}
        onOpenChange={setHintOpen}
      />
      <CompletionDialog open={state.completed} onNext={handleNextPuzzle} />
    </div>
  );
}
