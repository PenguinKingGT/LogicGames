import {
  ArrowCounterClockwise,
  ArrowUUpLeft,
  Question,
  SpeakerHigh,
  SpeakerSlash,
} from "@phosphor-icons/react";
import type { Difficulty } from "../ai/search";

const DIFFICULTIES: readonly Difficulty[] = ["easy", "normal", "hard"];
const DIFFICULTY_LABELS: Readonly<Record<Difficulty, string>> = {
  easy: "简单",
  normal: "标准",
  hard: "困难",
};

interface GameHeaderProps {
  readonly difficulty: Difficulty;
  readonly canUndo: boolean;
  readonly soundEnabled: boolean;
  readonly onDifficultyChange: (difficulty: Difficulty) => void;
  readonly onUndo: () => void;
  readonly onRestart: () => void;
  readonly onSoundToggle: () => void;
  readonly onHelp: () => void;
}

export function GameHeader({
  difficulty,
  canUndo,
  soundEnabled,
  onDifficultyChange,
  onUndo,
  onRestart,
  onSoundToggle,
  onHelp,
}: GameHeaderProps) {
  return (
    <header className="othello-header">
      <div className="othello-title">
        <span>OTHELLO · HUMAN VS MACHINE</span>
        <h1>黑白棋</h1>
      </div>

      <div className="othello-difficulty">
        {DIFFICULTIES.map((option) => (
          <button
            type="button"
            key={option}
            aria-pressed={difficulty === option}
            onClick={() => onDifficultyChange(option)}
          >
            {DIFFICULTY_LABELS[option]}
          </button>
        ))}
      </div>

      <div className="othello-tools">
        <button
          type="button"
          aria-label="悔棋"
          disabled={!canUndo}
          onClick={onUndo}
        >
          <ArrowUUpLeft />
        </button>
        <button type="button" aria-label="重新开局" onClick={onRestart}>
          <ArrowCounterClockwise />
        </button>
        <button
          type="button"
          aria-label={soundEnabled ? "关闭音效" : "开启音效"}
          onClick={onSoundToggle}
        >
          {soundEnabled ? <SpeakerHigh /> : <SpeakerSlash />}
        </button>
        <button type="button" aria-label="查看玩法" onClick={onHelp}>
          <Question />
        </button>
      </div>
    </header>
  );
}
