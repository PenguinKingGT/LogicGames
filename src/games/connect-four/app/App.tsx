"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { chooseMove, type Difficulty } from "../ai/search";
import type { AiRequest, AiResponse } from "../ai/worker-protocol";
import { audioManager } from "../audio/audio-manager";
import { ConnectFourBoard } from "../components/ConnectFourBoard";
import { HelpDialog, ResultDialog } from "../components/GameDialogs";
import { GameHeader } from "../components/GameHeader";
import { MatchStatus } from "../components/MatchStatus";
import { getLegalColumns, otherPlayer } from "../domain/engine";
import type { Player } from "../domain/types";
import {
  createGameState,
  gameReducer,
  type GameState,
} from "./game-reducer";

const STANDARD_BUDGET_MS = 10_000;
const HARD_BUDGET_MS = 500;

interface AppProps {
  readonly animationMs?: number;
  readonly thinkingMs?: number;
  readonly aiTimeoutMs?: number;
  readonly random?: () => number;
  readonly chooseAiMove?: typeof chooseMove;
}

export default function App({
  animationMs = 320,
  thinkingMs = 220,
  aiTimeoutMs = 1_200,
  random = Math.random,
  chooseAiMove = chooseMove,
}: AppProps) {
  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    createGameState(),
  );
  const [helpOpen, setHelpOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const workerRef = useRef<Worker | null>(null);
  const randomRef = useRef(random);
  const aiChooserRef = useRef(chooseAiMove);
  const announcedRoundRef = useRef<number | null>(null);

  useEffect(() => {
    randomRef.current = random;
    aiChooserRef.current = chooseAiMove;
  }, [chooseAiMove, random]);

  useEffect(() => {
    if (typeof Worker === "undefined") return;
    const worker = new Worker(new URL("../ai/worker.ts", import.meta.url), {
      type: "module",
    });
    workerRef.current = worker;
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (state.phase !== "dropping-human" && state.phase !== "dropping-ai") {
      return;
    }
    void audioManager.play("drop");
    const type = state.phase === "dropping-human"
      ? "finish-human-drop"
      : "finish-ai-drop";
    const timer = window.setTimeout(() => {
      dispatch({ type, roundId: state.roundId, turnId: state.turnId });
    }, animationMs);
    return () => window.clearTimeout(timer);
  }, [animationMs, state.phase, state.roundId, state.turnId]);

  useEffect(() => {
    if (state.phase !== "ai-thinking") return;
    const aiPlayer = otherPlayer(state.humanPlayer);
    const legalColumns = getLegalColumns(state.board);
    const fallbackColumn = legalColumns.includes(3) ? 3 : legalColumns[0];
    if (fallbackColumn === undefined) return;
    const roundId = state.roundId;
    const turnId = state.turnId;
    let selectedColumn: number | null = null;
    let delayElapsed = false;
    let delivered = false;

    function deliver(fallback: boolean): void {
      if (delivered || !delayElapsed || selectedColumn === null) return;
      delivered = true;
      dispatch({
        type: "ai-drop",
        column: selectedColumn,
        roundId,
        turnId,
        fallback,
      });
    }

    const delayTimer = window.setTimeout(() => {
      delayElapsed = true;
      deliver(false);
    }, thinkingMs);
    const fallbackTimer = window.setTimeout(() => {
      selectedColumn = fallbackColumn;
      delayElapsed = true;
      deliver(true);
    }, aiTimeoutMs);
    const worker = workerRef.current;
    let localTimer: number | null = null;
    if (worker) {
      worker.onmessage = (event: MessageEvent<AiResponse>) => {
        const response = event.data;
        if (response.roundId !== roundId || response.turnId !== turnId) return;
        selectedColumn = response.result?.column ?? fallbackColumn;
        deliver(false);
      };
      const request: AiRequest = {
        type: "choose-move",
        board: state.board,
        player: aiPlayer,
        difficulty: state.difficulty,
        random: randomRef.current(),
        roundId,
        turnId,
      };
      worker.postMessage(request);
    } else {
      localTimer = window.setTimeout(() => {
        const budget = state.difficulty === "hard"
          ? HARD_BUDGET_MS
          : STANDARD_BUDGET_MS;
        selectedColumn = aiChooserRef.current(
          state.board,
          aiPlayer,
          state.difficulty,
          { random: randomRef.current(), timeBudgetMs: budget },
        )?.column ?? fallbackColumn;
        deliver(true);
      }, 0);
    }
    return () => {
      window.clearTimeout(delayTimer);
      window.clearTimeout(fallbackTimer);
      if (localTimer !== null) window.clearTimeout(localTimer);
      if (worker) worker.onmessage = null;
    };
  }, [
    aiTimeoutMs,
    state.board,
    state.difficulty,
    state.humanPlayer,
    state.phase,
    state.roundId,
    state.turnId,
    thinkingMs,
  ]);

  useEffect(() => {
    if (
      state.phase !== "finished" ||
      !state.result ||
      announcedRoundRef.current === state.roundId
    ) {
      return;
    }
    announcedRoundRef.current = state.roundId;
    const sound = state.result === "draw"
      ? "draw"
      : state.result === state.humanPlayer
        ? "win"
        : "lose";
    void audioManager.play(sound);
  }, [state.humanPlayer, state.phase, state.result, state.roundId]);

  function startNewGame(settings: {
    readonly humanPlayer?: Player;
    readonly difficulty?: Difficulty;
  } = {}): void {
    void audioManager.play("button");
    dispatch({
      type: "new-game",
      roundId: state.roundId + 1,
      humanPlayer: settings.humanPlayer,
      difficulty: settings.difficulty,
    });
  }

  function toggleSound(): void {
    const enabled = !soundEnabled;
    setSoundEnabled(enabled);
    audioManager.setEnabled(enabled);
    if (enabled) void audioManager.play("button");
  }

  const boardDisabled = state.phase !== "human-turn";
  const canUndo = Boolean(
    state.undo && (state.phase === "human-turn" || state.phase === "finished"),
  );

  return (
    <div className="connect-four-game">
      <div className="connect-four-shell">
        <GameHeader
          difficulty={state.difficulty}
          humanPlayer={state.humanPlayer}
          soundEnabled={soundEnabled}
          canUndo={canUndo}
          onDifficultyChange={(difficulty) => startNewGame({ difficulty })}
          onPlayerChange={(humanPlayer) => startNewGame({ humanPlayer })}
          onNewGame={() => startNewGame()}
          onUndo={() => dispatch({ type: "undo" })}
          onSoundToggle={toggleSound}
          onHelp={() => setHelpOpen(true)}
        />
        <main className="connect-four-stage">
          <ConnectFourBoard
            board={state.board}
            lastMove={state.lastMove}
            disabled={boardDisabled}
            onDrop={(column) => dispatch({ type: "human-drop", column })}
          />
          <MatchStatus state={state} />
          <p className="connect-four-live" aria-live="polite">
            {getLiveMessage(state)}
          </p>
        </main>
      </div>
      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
      <ResultDialog
        result={state.phase === "finished" ? state.result : null}
        humanPlayer={state.humanPlayer}
        onNewGame={() => startNewGame()}
      />
    </div>
  );
}

function getLiveMessage(state: GameState): string {
  if (state.phase === "ai-thinking") return "电脑正在思考";
  if (state.fallbackUsed && state.phase === "human-turn") {
    return "电脑已改用快速落子";
  }
  if (state.lastMove) {
    const owner = state.lastMove.player === state.humanPlayer ? "你" : "电脑";
    return `${owner}落在第 ${state.lastMove.column + 1} 列，第 ${state.lastMove.row + 1} 行`;
  }
  return "";
}
