import { ArrowClockwise, Question, SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import type { Ref } from "react";
import { difficultyLabels } from "../domain/puzzles";
import type { Difficulty } from "../domain/types";

interface GameHeaderProps {
  difficulty: Difficulty;
  elapsed: string;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onNextPuzzle: () => void;
  onHelp: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  helpTriggerRef?: Ref<HTMLButtonElement>;
}

export function GameHeader({
  difficulty,
  elapsed,
  onDifficultyChange,
  onNextPuzzle,
  onHelp,
  soundEnabled,
  onSoundToggle,
  helpTriggerRef,
}: GameHeaderProps) {
  return (
    <header className="nonogram-header">
      <div className="nonogram-brand">
        <span>NONOGRAM</span>
        <h1>数织</h1>
      </div>
      <div className="nonogram-header-tools">
        <div className="difficulty-switch" aria-label="选择难度">
          {(["easy", "normal", "hard"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={difficulty === value}
              onClick={() => onDifficultyChange(value)}
            >
              {difficultyLabels[value]}
            </button>
          ))}
        </div>
        <time className="nonogram-time" aria-label={`用时 ${elapsed}`}>{elapsed}</time>
        <button type="button" className="icon-button" onClick={onNextPuzzle} aria-label="换一题">
          <ArrowClockwise weight="bold" />
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={onSoundToggle}
          aria-label={soundEnabled ? "关闭音效" : "开启音效"}
          aria-pressed={soundEnabled}
        >
          {soundEnabled ? <SpeakerHigh weight="bold" /> : <SpeakerSlash weight="bold" />}
        </button>
        <button ref={helpTriggerRef} type="button" className="icon-button" onClick={onHelp} aria-label="查看玩法">
          <Question weight="bold" />
        </button>
      </div>
    </header>
  );
}
