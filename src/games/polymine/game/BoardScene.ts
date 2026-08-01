import Phaser from "phaser";
import type { GameController } from "../app/GameController";
import type { CellId, GameSnapshot, Point, SoundCue } from "../domain/types";
import { createToneDataUri } from "./audio/tone";

const soundCues: readonly SoundCue[] = [
  "reveal",
  "cascade",
  "flag-on",
  "flag-off",
  "invalid",
  "mine",
  "win",
];

const numberColors = [
  0x4c5350,
  0x2463b5,
  0x287a3f,
  0xc4433d,
  0x51458d,
  0x8b3539,
  0x24797d,
  0x252a27,
  0x6e7470,
];

export class BoardScene extends Phaser.Scene {
  private boardGraphics?: Phaser.GameObjects.Graphics;
  private readonly controller: GameController;
  private unsubscribeState?: () => void;
  private unsubscribeEffects?: () => void;
  private unsubscribeSettings?: () => void;
  private labels: Phaser.GameObjects.Text[] = [];
  private scaleFactor = 1;
  private offset: Point = { x: 0, y: 0 };
  private downAt = 0;
  private downPoint: Point = { x: 0, y: 0 };
  private dragPoint: Point = { x: 0, y: 0 };

  constructor(controller: GameController) {
    super("board");
    this.controller = controller;
  }

  preload(): void {
    for (const cue of soundCues) this.load.audio(cue, createToneDataUri(cue));
  }

  create(): void {
    this.boardGraphics = this.add.graphics();
    this.input.mouse?.disableContextMenu();
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.downAt = performance.now();
      this.downPoint = { x: pointer.x, y: pointer.y };
      this.dragPoint = { x: pointer.x, y: pointer.y };
    });
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown || Math.hypot(pointer.x - this.downPoint.x, pointer.y - this.downPoint.y) < 8) return;
      const camera = this.cameras.main;
      camera.scrollX -= (pointer.x - this.dragPoint.x) / camera.zoom;
      camera.scrollY -= (pointer.y - this.dragPoint.y) / camera.zoom;
      this.dragPoint = { x: pointer.x, y: pointer.y };
    });
    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => this.handlePointer(pointer));
    this.input.on(
      "wheel",
      (_pointer: Phaser.Input.Pointer, _objects: Phaser.GameObjects.GameObject[], _deltaX: number, deltaY: number) => {
        const camera = this.cameras.main;
        camera.setZoom(Phaser.Math.Clamp(camera.zoom - deltaY * 0.001, 1, 2.5));
      },
    );
    this.scale.on("resize", this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.shutdown, this);
    this.unsubscribeState = this.controller.subscribe(() => this.renderBoard(this.controller.getSnapshot()));
    this.unsubscribeEffects = this.controller.onEffects((effects) => {
      const settings = this.controller.settings;
      if (settings.sfxMuted) return;
      for (const effect of effects) {
        if (this.cache.audio.exists(effect.cue)) this.sound.play(effect.cue, { volume: settings.sfxVolume });
      }
    });
    this.unsubscribeSettings = this.controller.subscribeSettings(() => {
      this.sound.mute = this.controller.settings.sfxMuted;
      this.sound.volume = this.controller.settings.sfxVolume;
      this.renderBoard(this.controller.getSnapshot());
    });
    this.renderBoard(this.controller.getSnapshot());
  }

  shutdown(): void {
    this.scale.off("resize", this.handleResize, this);
    this.unsubscribeState?.();
    this.unsubscribeEffects?.();
    this.unsubscribeSettings?.();
    this.unsubscribeState = undefined;
    this.unsubscribeEffects = undefined;
    this.unsubscribeSettings = undefined;
  }

  private handlePointer(pointer: Phaser.Input.Pointer): void {
    const moved = Math.hypot(pointer.x - this.downPoint.x, pointer.y - this.downPoint.y);
    if (moved > 10) return;
    const local = {
      x: (pointer.worldX - this.offset.x) / this.scaleFactor,
      y: (pointer.worldY - this.offset.y) / this.scaleFactor,
    };
    const cell = this.controller.getTopology().cellAt(local);
    if (!cell) return;
    const longPress = performance.now() - this.downAt >= 420;
    const sourceEvent = pointer.event;
    const modifierFlag =
      sourceEvent instanceof MouseEvent && (sourceEvent.ctrlKey || sourceEvent.metaKey);
    if (pointer.rightButtonReleased() || longPress || modifierFlag) this.controller.toggleFlag(cell);
    else this.controller.reveal(cell);
  }

  private readonly handleResize = (): void => {
    this.cameras.main.setZoom(1).setScroll(0, 0);
    this.renderBoard(this.controller.getSnapshot());
  };

  private renderBoard(snapshot: GameSnapshot): void {
    if (!this.boardGraphics) return;
    for (const label of this.labels) label.destroy();
    this.labels = [];
    this.boardGraphics.clear();
    const topology = this.controller.getTopology();
    const cells = topology.cells();
    const rawPoints = cells.flatMap((cell) => [...topology.polygon(cell)]);
    if (rawPoints.length === 0) return;
    const minX = Math.min(...rawPoints.map((point) => point.x));
    const maxX = Math.max(...rawPoints.map((point) => point.x));
    const minY = Math.min(...rawPoints.map((point) => point.y));
    const maxY = Math.max(...rawPoints.map((point) => point.y));
    const horizontalPadding = 24;
    const topPadding = 24;
    const bottomPadding = 64;
    const availableHeight = Math.max(1, this.scale.height - topPadding - bottomPadding);
    this.scaleFactor = Math.max(
      3,
      Math.min(
        (this.scale.width - horizontalPadding * 2) / Math.max(1, maxX - minX),
        availableHeight / Math.max(1, maxY - minY),
      ),
    );
    this.offset = {
      x: (this.scale.width - (maxX - minX) * this.scaleFactor) / 2 - minX * this.scaleFactor,
      y:
        topPadding +
        (availableHeight - (maxY - minY) * this.scaleFactor) / 2 -
        minY * this.scaleFactor,
    };

    for (const id of cells) this.drawCell(id, snapshot);
  }

  private drawCell(id: CellId, snapshot: GameSnapshot): void {
    const graphics = this.boardGraphics;
    if (!graphics) return;
    const topology = this.controller.getTopology();
    const cell = snapshot.cells.get(id);
    if (!cell) return;
    const points = topology.polygon(id).map((point) => ({
      x: point.x * this.scaleFactor + this.offset.x,
      y: point.y * this.scaleFactor + this.offset.y,
    }));
    const isDark = document.documentElement.dataset.theme === "dark";
    let fill = isDark ? 0x365d44 : 0xcfe8d8;
    if (cell.state === "revealed") fill = isDark ? 0x1b2c21 : 0xfffdf5;
    if (cell.isTriggeredMine) fill = 0xd95d68;
    if (cell.isWrongFlag) fill = 0xf1b24b;
    graphics.fillStyle(fill, 1);
    const renderDensity = Math.min(window.devicePixelRatio || 1, 2);
    graphics.lineStyle(
      Math.max(
        1.25 * renderDensity,
        Math.min(2.5 * renderDensity, this.scaleFactor * 0.035),
      ),
      isDark ? 0x6f957d : 0x4f8e68,
      1,
    );
    const vectors = points.map((point) => new Phaser.Math.Vector2(point.x, point.y));
    graphics.fillPoints(vectors, true);
    graphics.strokePoints(vectors, true);

    const center = topology.center(id);
    const x = center.x * this.scaleFactor + this.offset.x;
    const y = center.y * this.scaleFactor + this.offset.y;
    const fontSize = Math.max(
      10 * renderDensity,
      Math.min(24 * renderDensity, this.scaleFactor * 0.45),
    );
    let text = "";
    let color = isDark ? "#edf2ee" : "#1f2329";
    if (cell.state === "flagged" && !cell.isWrongFlag) {
      text = "⚑";
      color = "#d99a14";
    } else if (cell.isMineVisible) {
      text = "✹";
      color = cell.isTriggeredMine ? "#fffaf3" : "#d95d68";
    } else if (cell.isWrongFlag) {
      text = "×";
      color = "#a66219";
    } else if (cell.state === "revealed" && cell.adjacentMines) {
      text = String(cell.adjacentMines);
      color = `#${(numberColors[cell.adjacentMines] ?? 0x354052).toString(16).padStart(6, "0")}`;
    }
    if (text) {
      const label = this.add
        .text(x, y, text, {
          fontFamily: "ui-rounded, system-ui, sans-serif",
          fontSize,
          color,
          fontStyle: "bold",
          resolution: Math.min(window.devicePixelRatio || 1, 2),
        })
        .setOrigin(0.5);
      this.labels.push(label);
    }
  }
}
