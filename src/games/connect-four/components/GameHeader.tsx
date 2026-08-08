import {
  ArrowCounterClockwise,
  ArrowUUpLeft,
  Question,
  SpeakerHigh,
  SpeakerSlash,
} from "@phosphor-icons/react";
import type { Difficulty } from "../ai/search";
import type { Player } from "../domain/types";

interface GameHeaderProps {
  readonly difficulty: Difficulty;
  readonly humanPlayer: Player;
  readonly soundEnabled: boolean;
  readonly canUndo: boolean;
  readonly onDifficultyChange: (difficulty: Difficulty) => void;
  readonly onPlayerChange: (player: Player) => void;
  readonly onNewGame: () => void;
  readonly onUndo: () => void;
  readonly onSoundToggle: () => void;
  readonly onHelp: () => void;
}

const DIFFICULTIES: readonly Difficulty[] = ["easy", "normal", "hard"];
const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "简单",
  normal: "标准",
  hard: "困难",
};

export function GameHeader(props: GameHeaderProps) {
  return (
    <header className="connect-four-header">
      <div className="connect-four-title">
        <span>CONNECT FOUR</span>
        <h1>四子棋</h1>
      </div>
      <div className="connect-four-settings">
        <div className="connect-four-segment" aria-label="选择先后手">
          <button
            type="button"
            aria-pressed={props.humanPlayer === "red"}
            onClick={() => props.onPlayerChange("red")}
          >
            执红先手
          </button>
          <button
            type="button"
            aria-pressed={props.humanPlayer === "yellow"}
            onClick={() => props.onPlayerChange("yellow")}
          >
            执黄后手
          </button>
        </div>
        <div className="connect-four-segment" aria-label="选择难度">
          {DIFFICULTIES.map((difficulty) => (
            <button
              key={difficulty}
              type="button"
              aria-pressed={props.difficulty === difficulty}
              onClick={() => props.onDifficultyChange(difficulty)}
            >
              {DIFFICULTY_LABELS[difficulty]}
            </button>
          ))}
        </div>
      </div>
      <div className="connect-four-tools">
        <button type="button" aria-label="新对局" onClick={props.onNewGame}>
          <ArrowCounterClockwise />
        </button>
        <button
          type="button"
          aria-label="悔棋"
          disabled={!props.canUndo}
          onClick={props.onUndo}
        >
          <ArrowUUpLeft />
        </button>
        <button
          type="button"
          aria-label="切换声音"
          aria-pressed={props.soundEnabled}
          onClick={props.onSoundToggle}
        >
          {props.soundEnabled ? <SpeakerHigh /> : <SpeakerSlash />}
        </button>
        <button type="button" aria-label="查看玩法" onClick={props.onHelp}>
          <Question />
        </button>
      </div>
    </header>
  );
}
