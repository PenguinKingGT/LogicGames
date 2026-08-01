import { ArrowClockwise, Cat, Question, SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import type { Difficulty } from "../domain/types";
import { difficultyLabels } from "../domain/setup";

interface GameHeaderProps {
  readonly difficulty: Difficulty;
  readonly moves: number;
  readonly bestMoves: number | null;
  readonly soundEnabled: boolean;
  readonly onDifficultyChange: (difficulty: Difficulty) => void;
  readonly onRestart: () => void;
  readonly onSoundToggle: () => void;
  readonly onHelp: () => void;
}

export function GameHeader({
  difficulty,
  moves,
  bestMoves,
  soundEnabled,
  onDifficultyChange,
  onRestart,
  onSoundToggle,
  onHelp,
}: GameHeaderProps) {
  return (
    <>
      <header className="circle-cat-header">
        <div className="circle-cat-brand">
          <span className="circle-cat-brand-mark" aria-hidden="true"><Cat weight="duotone" /></span>
          <div><h1>圈小猫</h1><p>CIRCLE THE CAT</p></div>
        </div>
        <div className="circle-cat-header-actions">
          <button type="button" className="circle-cat-icon-button" onClick={onRestart} aria-label="重新开局">
            <ArrowClockwise weight="bold" />
          </button>
          <button
            type="button"
            className="circle-cat-icon-button"
            onClick={onSoundToggle}
            aria-label={soundEnabled ? "关闭音效" : "开启音效"}
            aria-pressed={soundEnabled}
          >
            {soundEnabled ? <SpeakerHigh weight="bold" /> : <SpeakerSlash weight="bold" />}
          </button>
          <button type="button" className="circle-cat-icon-button" onClick={onHelp} aria-label="查看玩法">
            <Question weight="bold" />
          </button>
        </div>
      </header>

      <div className="circle-cat-scorebar">
        <div className="circle-cat-metrics">
          <div><span>步数</span><strong>{moves}</strong></div>
          <div><span>最佳</span><strong>{bestMoves ?? "--"}</strong></div>
        </div>
        <div className="circle-cat-difficulty" aria-label="选择难度">
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
      </div>
    </>
  );
}
