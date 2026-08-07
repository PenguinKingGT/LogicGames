"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { CompletionDialog, HelpDialog } from "../components/GameDialogs";
import { GameHeader } from "../components/GameHeader";
import { MazeBoard } from "../components/MazeBoard";
import { createMaze } from "../domain/generator";
import {
  COMPLEX_MAZE_SIZE,
  STANDARD_MAZE_SIZE,
  type Direction,
  type Maze,
  type MazeMode,
} from "../domain/types";
import { createGameState, gameReducer } from "./game-reducer";

interface AppProps {
  readonly random?: () => number;
}

export default function App({ random = Math.random }: AppProps) {
  const [helpOpen, setHelpOpen] = useState(false);
  const randomRef = useRef(random);
  const variationRef = useRef(0);
  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    createGameState(createMaze(() => 0)),
  );

  useEffect(() => {
    randomRef.current = random;
  }, [random]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      variationRef.current += 1;
      const maze = createMaze(
        createVariationRandom(randomRef.current, variationRef.current),
      );
      dispatch({ type: "new-maze", maze });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function generateMaze(previous: Maze | null, size = state.maze.size): Maze {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      variationRef.current += 1;
      const candidate = createMaze(
        createVariationRandom(randomRef.current, variationRef.current),
        size,
      );
      if (!previous || candidate.signature !== previous.signature) {
        return candidate;
      }
    }
    variationRef.current += 17;
    return createMaze(
      createVariationRandom(randomRef.current, variationRef.current),
      size,
    );
  }

  function startNewMaze(): void {
    dispatch({ type: "new-maze", maze: generateMaze(state.maze) });
  }

  function changeMode(mode: MazeMode): void {
    const size = mode === "complex" ? COMPLEX_MAZE_SIZE : STANDARD_MAZE_SIZE;
    dispatch({ type: "new-maze", maze: generateMaze(state.maze, size) });
  }

  function move(direction: Direction): void {
    dispatch({ type: "move", direction });
  }

  return (
    <div className="maze-game">
      <div className="maze-shell">
        <GameHeader
          mode={state.maze.size === COMPLEX_MAZE_SIZE ? "complex" : "standard"}
          onModeChange={changeMode}
          onNewMaze={startNewMaze}
          onRestart={() => dispatch({ type: "restart" })}
          onHelp={() => setHelpOpen(true)}
        />
        <main className="maze-stage">
          <div className="maze-map-meta" aria-hidden="true">
            <span>GRID {state.maze.size} × {state.maze.size}</span>
            <span>NORTH / 00°</span>
          </div>
          <MazeBoard
            maze={state.maze}
            player={state.player}
            visitedIds={state.visitedIds}
            onMove={move}
          />
          <p className="maze-live" aria-live="polite">
            {state.message}
          </p>
        </main>
      </div>
      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
      <CompletionDialog
        open={state.status === "completed"}
        onNewMaze={startNewMaze}
      />
    </div>
  );
}

function createVariationRandom(
  source: () => number,
  variation: number,
): () => number {
  let callIndex = 0;
  return () => {
    callIndex += 1;
    const raw = source();
    const base = Number.isFinite(raw)
      ? Math.max(0, Math.min(0.999999999, raw))
      : 0;
    const offset = (variation * 0.61803398875 + callIndex * 0.38196601125) % 1;
    return (base + offset) % 1;
  };
}
