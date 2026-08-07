import {
  ArrowCounterClockwise,
  ArrowsClockwise,
  Question,
} from "@phosphor-icons/react";
import type { MazeMode } from "../domain/types";

const MODES: readonly MazeMode[] = ["standard", "complex"];
const MODE_LABELS: Readonly<Record<MazeMode, string>> = {
  standard: "标准",
  complex: "复杂",
};

interface GameHeaderProps {
  readonly mode: MazeMode;
  readonly onModeChange: (mode: MazeMode) => void;
  readonly onNewMaze: () => void;
  readonly onRestart: () => void;
  readonly onHelp: () => void;
}

export function GameHeader({
  mode,
  onModeChange,
  onNewMaze,
  onRestart,
  onHelp,
}: GameHeaderProps) {
  return (
    <header className="maze-header">
      <div className="maze-title">
        <span>FIELD STUDY · ROUTE 01</span>
        <h1>迷宫</h1>
      </div>
      <div className="maze-mode" aria-label="选择迷宫复杂度">
        {MODES.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={mode === option}
            onClick={() => onModeChange(option)}
          >
            {MODE_LABELS[option]}
          </button>
        ))}
      </div>
      <div className="maze-tools">
        <button type="button" aria-label="新迷宫" onClick={onNewMaze}>
          <ArrowsClockwise />
        </button>
        <button type="button" aria-label="重新开始" onClick={onRestart}>
          <ArrowCounterClockwise />
        </button>
        <button type="button" aria-label="查看玩法" onClick={onHelp}>
          <Question />
        </button>
      </div>
    </header>
  );
}
