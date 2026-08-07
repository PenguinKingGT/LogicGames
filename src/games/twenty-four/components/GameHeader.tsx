import {
  ArrowCounterClockwise,
  ArrowUUpLeft,
  Lightbulb,
  Question,
  SpeakerHigh,
  SpeakerSlash,
} from "@phosphor-icons/react";

interface GameHeaderProps {
  readonly canUndo: boolean;
  readonly soundEnabled: boolean;
  readonly onUndo: () => void;
  readonly onNewPuzzle: () => void;
  readonly onHint: () => void;
  readonly onHelp: () => void;
  readonly onSoundToggle: () => void;
}

export function GameHeader({
  canUndo,
  soundEnabled,
  onUndo,
  onNewPuzzle,
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
      <div className="twenty-four-tools">
        <button
          type="button"
          aria-label="撤销"
          disabled={!canUndo}
          onClick={onUndo}
        >
          <ArrowUUpLeft />
        </button>
        <button type="button" aria-label="换一题" onClick={onNewPuzzle}>
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
