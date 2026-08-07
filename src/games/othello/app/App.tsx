"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { chooseMove, type Difficulty } from "../ai/search";
import type { AiRequest, AiResponse } from "../ai/worker-protocol";
import { audioManager } from "../audio/audio-manager";
import {
  AbandonDialog,
  HelpDialog,
  ResultDialog,
} from "../components/GameDialogs";
import { GameHeader } from "../components/GameHeader";
import { MatchLedger } from "../components/MatchLedger";
import { OthelloBoard } from "../components/OthelloBoard";
import { getLegalMoves, opponent } from "../domain/board";
import type { GameResult, Player } from "../domain/types";
import {
  defaultData,
  readData,
  recordResult,
  writeData,
  type OthelloData,
} from "../persistence/storage";
import { createGameState, gameReducer, type GameState } from "./game-reducer";

const HARD_AI_BUDGET_MS = 650;
const STANDARD_AI_BUDGET_MS = 10_000;

interface AppProps {
  readonly animationMs?: number;
  readonly thinkingMs?: number;
  readonly aiTimeoutMs?: number;
  readonly random?: () => number;
  readonly chooseAiMove?: typeof chooseMove;
}

type PendingAction =
  | { readonly type: "restart" }
  | { readonly type: "difficulty"; readonly difficulty: Difficulty }
  | { readonly type: "human-player"; readonly humanPlayer: Player };

interface NewGameSettings {
  readonly difficulty?: Difficulty;
  readonly humanPlayer?: Player;
}

function getStatus(state: GameState): string {
  if (state.phase === "ai-thinking") return "电脑正在思考…";
  if (state.phase === "finished") return "对局结束";
  if (state.passed) {
    const passedPlayer = state.passed === "white" ? "白方" : "黑方";
    return `${passedPlayer}无棋可下，自动跳过`;
  }
  return state.currentPlayer === state.humanPlayer
    ? "轮到你落子"
    : "电脑落子中";
}

function getAiBudget(difficulty: Difficulty): number {
  return difficulty === "hard" ? HARD_AI_BUDGET_MS : STANDARD_AI_BUDGET_MS;
}

function getResultSound(
  result: GameResult,
  humanPlayer: Player,
): "win" | "lose" | "draw" {
  if (result === "draw") return "draw";
  if (result === humanPlayer) return "win";
  return "lose";
}

function getPendingActionTitle(pendingAction: PendingAction | null): string {
  if (pendingAction?.type === "difficulty") return "切换难度？";
  if (pendingAction?.type === "human-player") return "切换执棋颜色？";
  return "重新开局？";
}

export default function App({
  animationMs = 360,
  thinkingMs = 280,
  aiTimeoutMs = 1500,
  random = Math.random,
  chooseAiMove = chooseMove,
}: AppProps) {
  const [preferences, setPreferences] = useState<OthelloData>(defaultData);
  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    createGameState(),
  );
  const [ready, setReady] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );

  const workerRef = useRef<Worker | null>(null);
  const recordedRoundRef = useRef<number | null>(null);
  const randomRef = useRef(random);
  const aiChooserRef = useRef(chooseAiMove);

  useEffect(() => {
    randomRef.current = random;
    aiChooserRef.current = chooseAiMove;
  }, [random, chooseAiMove]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const storedPreferences = readData();
      setPreferences(storedPreferences);
      audioManager.setEnabled(storedPreferences.soundEnabled);
      dispatch({
        type: "new-game",
        difficulty: storedPreferences.difficulty,
        humanPlayer: storedPreferences.humanPlayer,
        roundId: 1,
      });
      setReady(true);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

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
    const isHumanAnimation = state.phase === "animating-human";
    const isAiAnimation = state.phase === "animating-ai";
    if (!isHumanAnimation && !isAiAnimation) return;

    void audioManager.play("flip");
    const roundId = state.roundId;
    const turnId = state.turnId;
    const actionType = isHumanAnimation
      ? "finish-human-animation"
      : "finish-ai-animation";
    const timer = window.setTimeout(() => {
      dispatch({ type: actionType, roundId, turnId });
    }, animationMs);

    return () => window.clearTimeout(timer);
  }, [animationMs, state.phase, state.roundId, state.turnId]);

  useEffect(() => {
    if (state.phase !== "ai-thinking") return;

    const board = state.board;
    const difficulty = state.difficulty;
    const aiPlayer = opponent(state.humanPlayer);
    const roundId = state.roundId;
    const turnId = state.turnId;
    const firstLegalMove = getLegalMoves(board, aiPlayer)[0]?.index ?? null;
    let selectedMove: number | null = null;
    let minimumDelayElapsed = false;
    let delivered = false;

    const deliverMove = (fallback: boolean) => {
      if (delivered || !minimumDelayElapsed || selectedMove === null) return;
      delivered = true;
      dispatch({
        type: "ai-move",
        index: selectedMove,
        roundId,
        turnId,
        fallback,
      });
    };

    const minimumDelayTimer = window.setTimeout(() => {
      minimumDelayElapsed = true;
      deliverMove(false);
    }, thinkingMs);

    const fallbackTimer = window.setTimeout(() => {
      if (delivered) return;
      selectedMove = firstLegalMove;
      minimumDelayElapsed = true;
      deliverMove(true);
    }, aiTimeoutMs);

    const worker = workerRef.current;
    let quickSearchTimer: number | null = null;
    if (worker) {
      worker.onmessage = (event: MessageEvent<AiResponse>) => {
        const response = event.data;
        if (response.roundId !== roundId || response.turnId !== turnId) return;
        selectedMove = response.result?.index ?? firstLegalMove;
        deliverMove(false);
      };

      const request: AiRequest = {
        type: "choose-move",
        board,
        player: aiPlayer,
        difficulty,
        roundId,
        turnId,
        random: randomRef.current(),
      };
      worker.postMessage(request);
    } else {
      quickSearchTimer = window.setTimeout(() => {
        selectedMove =
          aiChooserRef.current(board, aiPlayer, difficulty, {
            random: randomRef.current(),
            timeBudgetMs: getAiBudget(difficulty),
          })?.index ?? null;
        deliverMove(true);
      }, 0);
    }

    return () => {
      window.clearTimeout(minimumDelayTimer);
      window.clearTimeout(fallbackTimer);
      if (quickSearchTimer !== null) window.clearTimeout(quickSearchTimer);
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
      recordedRoundRef.current === state.roundId
    ) {
      return;
    }

    const result = state.result;
    recordedRoundRef.current = state.roundId;
    void audioManager.play(getResultSound(result, state.humanPlayer));

    setPreferences((currentPreferences) => {
      const updatedPreferences = recordResult(
        currentPreferences,
        state.difficulty,
        result,
        state.humanPlayer,
        state.counts.black,
        state.counts.white,
      );
      writeData(updatedPreferences);
      return updatedPreferences;
    });
  }, [
    state.counts.black,
    state.counts.white,
    state.difficulty,
    state.humanPlayer,
    state.phase,
    state.result,
    state.roundId,
  ]);

  const startGame = useCallback(
    (settings: NewGameSettings = {}) => {
      const difficulty = settings.difficulty ?? state.difficulty;
      const humanPlayer = settings.humanPlayer ?? state.humanPlayer;
      recordedRoundRef.current = null;
      dispatch({
        type: "new-game",
        difficulty,
        humanPlayer,
        roundId: state.roundId + 1,
      });
      setPendingAction(null);
      setPreferences((currentPreferences) => {
        const updatedPreferences = {
          ...currentPreferences,
          difficulty,
          humanPlayer,
        };
        writeData(updatedPreferences);
        return updatedPreferences;
      });
      void audioManager.play("button");
    },
    [state.difficulty, state.humanPlayer, state.roundId],
  );

  const hasActiveGame =
    state.phase !== "finished" &&
    (state.turnId > 0 || state.phase === "ai-thinking");
  const status = getStatus(state);

  const requestDifficulty = (difficulty: Difficulty) => {
    if (difficulty === state.difficulty) return;
    if (hasActiveGame) {
      setPendingAction({ type: "difficulty", difficulty });
      return;
    }
    startGame({ difficulty });
  };

  const requestHumanPlayer = (humanPlayer: Player) => {
    if (humanPlayer === state.humanPlayer) return;
    if (hasActiveGame) {
      setPendingAction({ type: "human-player", humanPlayer });
      return;
    }
    startGame({ humanPlayer });
  };

  const toggleSound = () => {
    setPreferences((currentPreferences) => {
      const updatedPreferences = {
        ...currentPreferences,
        soundEnabled: !currentPreferences.soundEnabled,
      };
      audioManager.setEnabled(updatedPreferences.soundEnabled);
      writeData(updatedPreferences);
      if (updatedPreferences.soundEnabled) void audioManager.play("button");
      return updatedPreferences;
    });
  };

  const confirmPendingAction = () => {
    if (pendingAction?.type === "difficulty") {
      startGame({ difficulty: pendingAction.difficulty });
      return;
    }
    if (pendingAction?.type === "human-player") {
      startGame({ humanPlayer: pendingAction.humanPlayer });
      return;
    }
    startGame();
  };

  return (
    <main className="othello-game">
      <div className="othello-shell">
        <GameHeader
          difficulty={state.difficulty}
          humanPlayer={state.humanPlayer}
          canUndo={
            state.undo !== null &&
            (state.phase === "human-turn" || state.phase === "finished")
          }
          soundEnabled={preferences.soundEnabled}
          onDifficultyChange={requestDifficulty}
          onHumanPlayerChange={requestHumanPlayer}
          onUndo={() => dispatch({ type: "undo" })}
          onRestart={() => {
            if (hasActiveGame) setPendingAction({ type: "restart" });
            else startGame();
          }}
          onSoundToggle={toggleSound}
          onHelp={() => setHelpOpen(true)}
        />

        <div className="othello-stage">
          <OthelloBoard
            board={state.board}
            humanPlayer={state.humanPlayer}
            interactive={ready && state.phase === "human-turn"}
            lastIndex={state.lastMove?.index}
            flipped={state.lastMove?.flips ?? []}
            onMove={(index) => {
              void audioManager.play("place");
              dispatch({ type: "human-move", index });
            }}
          />
          <MatchLedger
            status={status}
            currentPlayer={state.currentPlayer}
            counts={state.counts}
            humanPlayer={state.humanPlayer}
            difficulty={state.difficulty}
            stats={preferences.stats[state.difficulty]}
            fallbackUsed={state.fallbackUsed}
          />
        </div>

        <p className="othello-live" aria-live="polite">
          {status}。黑 {state.counts.black}，白 {state.counts.white}
        </p>
      </div>

      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
      <AbandonDialog
        open={pendingAction !== null}
        title={getPendingActionTitle(pendingAction)}
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmPendingAction}
      />
      <ResultDialog
        result={state.result}
        humanPlayer={state.humanPlayer}
        blackCount={state.counts.black}
        whiteCount={state.counts.white}
        onRestart={() => startGame()}
      />
    </main>
  );
}
