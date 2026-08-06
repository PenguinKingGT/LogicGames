import { useRef, type PointerEvent } from "react";
import type { Direction, Tile } from "../domain/types";

interface Props { readonly tiles: readonly Tile[]; readonly disabled: boolean; readonly onMove: (direction: Direction) => void }
export function TileBoard({ tiles, disabled, onMove }: Props) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    start.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const pointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const origin = start.current; start.current = null;
    if (!origin || disabled) return;
    const dx = event.clientX - origin.x; const dy = event.clientY - origin.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 28) return;
    if (Math.abs(dx) > Math.abs(dy) * 1.15) onMove(dx > 0 ? "right" : "left");
    else if (Math.abs(dy) > Math.abs(dx) * 1.15) onMove(dy > 0 ? "down" : "up");
  };
  return <div
    className="g2048-board" role="application" aria-label="4 乘 4 数字方阵"
    aria-describedby="g2048-instructions" aria-disabled={disabled}
    tabIndex={0} onPointerDown={pointerDown} onPointerUp={pointerUp}
  >
    {Array.from({ length: 16 }, (_, index) => <span className="g2048-cell" key={index} />)}
    <div className="g2048-tile-layer">
      {tiles.map((tile) => <div
        className="g2048-tile" data-value={tile.value} data-merged={tile.merged || undefined} data-spawned={tile.spawned || undefined}
        key={tile.id} style={{ "--tile-row": tile.row, "--tile-col": tile.col } as React.CSSProperties}
        aria-label={`${tile.value}，第 ${tile.row + 1} 行第 ${tile.col + 1} 列`}
      ><span>{tile.value}</span></div>)}
    </div>
  </div>;
}
