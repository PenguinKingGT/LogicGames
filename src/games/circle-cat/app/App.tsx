"use client";

import { useCallback, useEffect, useReducer, useRef, useState, type CSSProperties } from "react";
import { audioManager } from "../audio/audio-manager";
import { AbandonRoundDialog } from "../components/AbandonRoundDialog";
import { CatBoard } from "../components/CatBoard";
import { GameHeader } from "../components/GameHeader";
import { HelpDialog } from "../components/HelpDialog";
import { ResultDialog } from "../components/ResultDialog";
import { createOpening, difficultyLabels } from "../domain/setup";
import type { Coordinate, Difficulty } from "../domain/types";
import { defaultData, readData, recordResult, writeData, type CircleCatData } from "../persistence/storage";
import { canBlock, createGameState, gameReducer } from "./game-reducer";

const CAT_FRAMES = [
  "idle-0", "idle-1", "idle-2", "idle-3",
  "run-0", "run-1", "run-2", "run-3", "run-4",
].map((name) => `/games/circle-cat/cat/${name}.png`);

interface AppProps {
  readonly seed?: number;
  readonly random?: () => number;
  readonly movementMs?: number;
  readonly preloadAssets?: boolean;
}

type PendingAction =
  | { readonly type: "restart" }
  | { readonly type: "difficulty"; readonly difficulty: Difficulty };

export default function App({
  seed = 0x51c0ffee,
  random = Math.random,
  movementMs = 280,
  preloadAssets = true,
}: AppProps) {
  const [data, setData] = useState<CircleCatData>(defaultData);
  const [state, dispatch] = useReducer(gameReducer, createOpening("normal", seed), createGameState);
  const [helpOpen, setHelpOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [assetsReady, setAssetsReady] = useState(!preloadAssets);
  const seedRef = useRef(seed);
  const roundRef = useRef(1);
  const recordedResult = useRef<string | null>(null);

  const startRound = useCallback((difficulty: Difficulty) => {
    seedRef.current = (seedRef.current + 0x9e3779b9) >>> 0;
    roundRef.current += 1;
    recordedResult.current = null;
    dispatch({
      type: "new-round",
      opening: createOpening(difficulty, seedRef.current),
      roundId: roundRef.current,
    });
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const loaded = readData();
      audioManager.setEnabled(loaded.soundEnabled);
      setData(loaded);
      dispatch({
        type: "new-round",
        opening: createOpening(loaded.lastDifficulty, seed),
        roundId: roundRef.current,
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [seed]);

  useEffect(() => {
    if (!preloadAssets) return;
    let cancelled = false;
    const images = CAT_FRAMES.map((source) => {
      const image = new Image();
      image.src = source;
      return new Promise<void>((resolve) => {
        image.onload = () => resolve();
        image.onerror = () => resolve();
      });
    });
    void Promise.all(images).then(() => { if (!cancelled) setAssetsReady(true); });
    return () => { cancelled = true; };
  }, [preloadAssets]);

  useEffect(() => {
    if (state.phase !== "moving") return;
    void audioManager.play("step");
    const roundId = state.roundId;
    const timer = window.setTimeout(() => dispatch({ type: "finish-move", roundId }), movementMs);
    return () => window.clearTimeout(timer);
  }, [movementMs, state.phase, state.roundId]);

  useEffect(() => {
    if (state.phase !== "won" && state.phase !== "lost") return;
    const key = `${state.roundId}:${state.phase}`;
    if (recordedResult.current === key) return;
    recordedResult.current = key;
    void audioManager.play(state.phase === "won" ? "win" : "lose");
    setData((current) => {
      const next = recordResult(current, state.difficulty, state.phase === "won", state.moves);
      writeData(next);
      return next;
    });
  }, [state.difficulty, state.moves, state.phase, state.roundId]);

  const handleBlock = (cell: Coordinate) => {
    if (!assetsReady || !canBlock(state, cell)) return;
    void audioManager.play("place");
    dispatch({ type: "block", cell, randomValue: random() });
  };

  const applyDifficulty = (difficulty: Difficulty) => {
    setData((current) => {
      const next = { ...current, lastDifficulty: difficulty };
      writeData(next);
      return next;
    });
    startRound(difficulty);
  };

  const restart = () => {
    startRound(state.difficulty);
  };

  const hasRoundInProgress = state.moves > 0 && state.phase !== "won" && state.phase !== "lost";

  const requestDifficulty = (difficulty: Difficulty) => {
    if (difficulty === state.difficulty) return;
    void audioManager.play("button");
    if (hasRoundInProgress) {
      setPendingAction({ type: "difficulty", difficulty });
      return;
    }
    applyDifficulty(difficulty);
  };

  const requestRestart = () => {
    void audioManager.play("button");
    if (hasRoundInProgress) {
      setPendingAction({ type: "restart" });
      return;
    }
    restart();
  };

  const confirmPendingAction = () => {
    const action = pendingAction;
    if (!action) return;
    setPendingAction(null);
    void audioManager.play("button");
    if (action.type === "restart") restart();
    else applyDifficulty(action.difficulty);
  };

  const replay = () => {
    void audioManager.play("button");
    restart();
  };

  return (
    <main className="circle-cat-game" style={{ "--cat-move-ms": `${movementMs}ms` } as CSSProperties}>
      <div className="circle-cat-shell">
        <GameHeader
          difficulty={state.difficulty}
          moves={state.moves}
          bestMoves={data.stats[state.difficulty].bestMoves}
          soundEnabled={data.soundEnabled}
          onDifficultyChange={requestDifficulty}
          onRestart={requestRestart}
          onSoundToggle={() => {
            setData((current) => {
              const next = { ...current, soundEnabled: !current.soundEnabled };
              audioManager.setEnabled(next.soundEnabled);
              writeData(next);
              if (next.soundEnabled) void audioManager.play("button");
              return next;
            });
          }}
          onHelp={() => {
            void audioManager.play("button");
            setHelpOpen(true);
          }}
        />
        <CatBoard state={state} assetsReady={assetsReady} onBlock={handleBlock} />
      </div>

      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
      <ResultDialog
        result={state.phase === "won" || state.phase === "lost" ? state.phase : null}
        moves={state.moves}
        onReplay={replay}
      />
      <AbandonRoundDialog
        open={pendingAction !== null}
        title={pendingAction?.type === "difficulty" ? `切换到${difficultyLabels[pendingAction.difficulty]}？` : "重新开局？"}
        description="当前进度不会保留。"
        confirmLabel={pendingAction?.type === "difficulty" ? "切换难度" : "重新开局"}
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmPendingAction}
      />
    </main>
  );
}
