import { useEffect, useRef, useState } from "react";
import type Phaser from "phaser";
import type { GameController } from "../app/GameController";
import type { CellId } from "../domain/types";

interface PhaserBoardProps {
  controller: GameController;
}

export function PhaserBoard({ controller }: PhaserBoardProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [activeCell, setActiveCell] = useState<CellId>(() => controller.getTopology().cells()[0] ?? "");

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let game: Phaser.Game | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let resizeFrame = 0;
    let syncSize: (() => void) | null = null;
    let disposed = false;
    void import("../game/create-game").then(({ createGame, getRenderSize }) => {
      if (disposed) return;
      game = createGame(host, controller);
      syncSize = () => {
        if (!game || host.clientWidth === 0 || host.clientHeight === 0) return;
        const renderSize = getRenderSize(host);
        game.scale.resize(renderSize.width, renderSize.height);
      };
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(host);
      window.addEventListener("resize", syncSize);
      resizeFrame = window.requestAnimationFrame(syncSize);
    });
    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      if (syncSize) window.removeEventListener("resize", syncSize);
      window.cancelAnimationFrame(resizeFrame);
      game?.destroy(true);
    };
  }, [controller]);

  useEffect(
    () => controller.subscribe(() => {
      if (!controller.getTopology().cells().includes(activeCell)) {
        setActiveCell(controller.getTopology().cells()[0] ?? "");
      }
    }),
    [activeCell, controller],
  );

  const move = (dx: number, dy: number) => {
    const topology = controller.getTopology();
    const origin = topology.center(activeCell);
    let best: { id: CellId; score: number } | null = null;
    for (const candidate of topology.cells()) {
      if (candidate === activeCell) continue;
      const point = topology.center(candidate);
      const vx = point.x - origin.x;
      const vy = point.y - origin.y;
      const forward = vx * dx + vy * dy;
      if (forward <= 0) continue;
      const sideways = Math.abs(vx * dy - vy * dx);
      const score = sideways * 4 + Math.hypot(vx, vy);
      if (!best || score < best.score) best = { id: candidate, score };
    }
    if (best) setActiveCell(best.id);
  };

  return (
    <div
      className="board-shell"
      role="application"
      aria-label="扫雷棋盘。使用方向键移动，回车翻开，F 标旗。"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") move(-1, 0);
        else if (event.key === "ArrowRight") move(1, 0);
        else if (event.key === "ArrowUp") move(0, -1);
        else if (event.key === "ArrowDown") move(0, 1);
        else if (event.key === "Enter" || event.key === " ") controller.reveal(activeCell);
        else if (event.key.toLowerCase() === "f") controller.toggleFlag(activeCell);
        else return;
        event.preventDefault();
      }}
    >
      <div ref={hostRef} className="phaser-host" />
      <span className="sr-only" aria-live="polite">
        当前格 {activeCell}，{controller.getSnapshot().cells.get(activeCell)?.state ?? "未知"}
      </span>
    </div>
  );
}
