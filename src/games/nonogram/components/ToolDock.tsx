import { ArrowCounterClockwise, Eraser, Square, X } from "@phosphor-icons/react";
import type { Tool } from "../domain/types";

interface ToolDockProps {
  tool: Tool;
  canUndo: boolean;
  hasProgress: boolean;
  onToolChange: (tool: Tool) => void;
  onUndo: () => void;
  onRestart: () => void;
}

const tools = [
  { value: "filled" as const, label: "填格", key: "F", icon: Square },
  { value: "crossed" as const, label: "标空", key: "X", icon: X },
  { value: "unknown" as const, label: "擦除", key: "E", icon: Eraser },
];

export function ToolDock({ tool, canUndo, hasProgress, onToolChange, onUndo, onRestart }: ToolDockProps) {
  return (
    <section className="tool-dock" aria-label="棋盘工具">
      <div className="tool-group">
        {tools.map(({ value, label, key, icon: Icon }) => (
          <button
            key={value}
            type="button"
            className="tool-button"
            data-tool={value}
            aria-pressed={tool === value}
            onClick={() => onToolChange(value)}
          >
            <Icon weight={value === "filled" ? "fill" : "bold"} />
            <span>{label}</span>
            <kbd>{key}</kbd>
          </button>
        ))}
      </div>
      <span className="tool-divider" aria-hidden="true" />
      <button type="button" className="tool-button tool-button-secondary" disabled={!canUndo} onClick={onUndo}>
        <ArrowCounterClockwise weight="bold" />
        <span>撤销</span>
        <kbd>⌘Z</kbd>
      </button>
      <button type="button" className="restart-button" disabled={!hasProgress} onClick={onRestart}>重新开始</button>
    </section>
  );
}

