import Phaser from "phaser";
import type { GameController } from "../app/GameController";
import { BoardScene } from "./BoardScene";

export function getRenderSize(parent: HTMLElement): { width: number; height: number } {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  return {
    width: Math.max(1, Math.round(parent.clientWidth * pixelRatio)),
    height: Math.max(1, Math.round(parent.clientHeight * pixelRatio)),
  };
}

export function createGame(parent: HTMLElement, controller: GameController): Phaser.Game {
  const renderSize = getRenderSize(parent);
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: "transparent",
    transparent: true,
    width: renderSize.width,
    height: renderSize.height,
    scale: { mode: Phaser.Scale.NONE, autoCenter: Phaser.Scale.NO_CENTER },
    scene: [new BoardScene(controller)],
    render: {
      antialias: true,
      antialiasGL: true,
      roundPixels: false,
      powerPreference: "high-performance",
    },
    audio: { disableWebAudio: false },
  });
  return game;
}
