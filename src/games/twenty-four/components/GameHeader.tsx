import {
  ArrowCounterClockwise,
  ArrowUUpLeft,
  Lightbulb,
  Question,
  SpeakerHigh,
  SpeakerSlash,
} from "@phosphor-icons/react";
import type { Difficulty } from "../domain/types";

const DIFFICULTIES: readonly Difficulty[] = ["easy", "normal", "hard"];
const LABELS: Readonly<Record<Difficulty, string>> = {
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
  readonly onReset: () => void;
  readonly onHint: () => void;
  readonly onHelp: () => void;
  readonly onSoundToggle: () => void;
}

export function GameHeader({
  difficulty,
  canUndo,
  soundEnabled,
  onDifficultyChange,
  onUndo,
  onReset,
  onHint,
  onHelp,
  onSoundToggle,
}: GameHeaderProps) {
  return (
    <header className="twenty-four-header">
      <div className="twenty-four-title">
        <span>ARITHMETIC STUDY · No. 24</span>
        <h1>24 点</h1>
      </div>
      <div className="twenty-four-difficulty" aria-label="选择难度">
        {DIFFICULTIES.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={difficulty === option}
            onClick={() => onDifficultyChange(option)}
          >
            {LABELS[option]}
          </button>
        ))}
      </div>
      <div className="twenty-four-tools">
        <button
          type="button"
          aria-label="撤销"
          disabled={!canUndo}
          onClick={onUndo}
        >
          <ArrowUUpLeft />
        </button>
        <button type="button" aria-label="重置本题" onClick={onReset}>
          <ArrowCounterClockwise />
        </button>
        <button type="button" aria-label="提示" onClick={onHint}>
          <Lightbulb />
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
