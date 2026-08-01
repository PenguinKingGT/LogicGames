"use client";

import {
  Bomb,
  Check,
  ChevronLeft,
  CircleHelp,
  Clock3,
  Flag,
  Grid2X2,
  Hexagon,
  Monitor,
  MousePointer2,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  Sun,
  Triangle,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { GameController } from "./GameController";
import { difficultyLabels, geometryLabels } from "../domain/presets";
import type { Difficulty, GeometryKind } from "../domain/types";
import type { ThemeMode } from "../persistence/local-storage";
import { PhaserBoard } from "../ui/PhaserBoard";
import { Button } from "../ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogThemeProvider,
  DialogTitle,
} from "../ui/components/dialog";
import { formatTime } from "../ui/format";

const geometryOptions: Array<{
  value: GeometryKind;
  icon: typeof Grid2X2;
  note: string;
}> = [
  { value: "square", icon: Grid2X2, note: "经典" },
  { value: "triangle", icon: Triangle, note: "多变" },
  { value: "hex", icon: Hexagon, note: "均衡" },
];

const difficulties: Array<{ value: Difficulty; note: string }> = [
  { value: "easy", note: "适合热身" },
  { value: "normal", note: "节奏刚好" },
  { value: "hard", note: "需要耐心" },
];

const themes: Array<{ value: ThemeMode; label: string; icon: typeof Sun }> = [
  { value: "system", label: "跟随系统", icon: Monitor },
  { value: "light", label: "浅色", icon: Sun },
  { value: "dark", label: "深色", icon: Moon },
];

function useSettings(controller: GameController) {
  return useSyncExternalStore(
    (listener) => controller.subscribeSettings(listener),
    () => controller.settings,
  );
}

export function App({ controller }: { controller: GameController }) {
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot);
  const settings = useSettings(controller);
  const [view, setView] = useState<"setup" | "game">("setup");
  const [selectedGeometry, setSelectedGeometry] = useState(settings.geometry);
  const [selectedDifficulty, setSelectedDifficulty] = useState(settings.difficulty);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [systemDark, setSystemDark] = useState(
    () => typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const resolvedTheme = settings.theme === "dark" ||
    (settings.theme === "system" && systemDark) ? "dark" : "light";
  const terminal = snapshot.phase === "won" || snapshot.phase === "lost";

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(media.matches);
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (view !== "game") return;
      if (event.key.toLowerCase() === "r" && !event.metaKey && !event.ctrlKey) {
        controller.newGame();
      }
      if (event.key.toLowerCase() === "m") {
        controller.updateSettings({ sfxMuted: !controller.settings.sfxMuted });
      }
      if (event.key === "Escape" && snapshot.phase === "playing") {
        controller.setPaused(true);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [controller, snapshot.phase, view]);

  const startGame = () => {
    controller.newGame(selectedGeometry, selectedDifficulty);
    setView("game");
  };

  const returnToSetup = () => {
    if (snapshot.phase === "playing") controller.setPaused(true);
    setSelectedGeometry(settings.geometry);
    setSelectedDifficulty(settings.difficulty);
    setView("setup");
  };

  return (
    <DialogThemeProvider value={resolvedTheme}>
    <div className="polymine-game app-shell" data-view={view} data-theme={resolvedTheme}>
      <a className="skip-link" href="#main-content">
        跳到主要内容
      </a>
      <div className="game-backdrop" aria-hidden="true">
        <span className="backdrop-tile tile-square" />
        <span className="backdrop-tile tile-triangle" />
        <span className="backdrop-tile tile-hex" />
        <span className="backdrop-dot dot-one" />
        <span className="backdrop-dot dot-two" />
      </div>
      {view === "setup" ? (
        <main id="main-content" className="setup-screen">
          <header className="setup-header">
            <div className="brand" aria-label="PolyMine 多边形扫雷">
              <span className="brand-mark" aria-hidden="true">
                <Hexagon />
                <span className="brand-face">
                  <i />
                  <i />
                  <b />
                </span>
              </span>
              <span className="brand-copy">
                <strong>PolyMine</strong>
                <small>多边雷区</small>
              </span>
            </div>
            <div className="outer-actions">
              <Button
                variant="ghost"
                className="action-button"
                aria-label="查看玩法"
                onClick={() => setHelpOpen(true)}
              >
                <CircleHelp />
                <span>玩法</span>
              </Button>
              <Button
                variant="ghost"
                className="action-button"
                aria-label="打开设置"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings2 />
                <span>设置</span>
              </Button>
            </div>
          </header>

          <section className="setup-panel" aria-labelledby="setup-title">
            <div className="setup-title">
              <span className="setup-kicker">准备开局</span>
              <h1 id="setup-title">选个棋盘</h1>
              <p>换一种形状，换一种推理节奏。</p>
            </div>

            <fieldset className="setup-group">
              <legend>棋盘形状</legend>
              <div className="geometry-picker">
                {geometryOptions.map(({ value, icon: Icon, note }) => (
                  <button
                    key={value}
                    type="button"
                    className="geometry-option"
                    data-active={selectedGeometry === value}
                    aria-pressed={selectedGeometry === value}
                    onClick={() => setSelectedGeometry(value)}
                  >
                    <span className="geometry-icon">
                      <Icon aria-hidden="true" />
                    </span>
                    <strong>{geometryLabels[value]}</strong>
                    <small>{note}</small>
                    <Check className="option-check" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="setup-group">
              <legend>难度</legend>
              <div className="difficulty-picker">
                {difficulties.map(({ value, note }) => (
                  <button
                    key={value}
                    type="button"
                    data-active={selectedDifficulty === value}
                    aria-pressed={selectedDifficulty === value}
                    onClick={() => setSelectedDifficulty(value)}
                  >
                    <strong>{difficultyLabels[value]}</strong>
                    <small>{note}</small>
                  </button>
                ))}
              </div>
            </fieldset>

            <Button className="start-button" onClick={startGame}>
              <span>开始游戏</span>
              <span className="start-icon" aria-hidden="true">
                <Play size={17} fill="currentColor" />
              </span>
            </Button>
          </section>
        </main>
      ) : (
        <>
          <header className="game-topbar">
            <Button
              variant="ghost"
              className="back-button"
              aria-label="返回选择棋盘"
              onClick={returnToSetup}
            >
              <ChevronLeft />
              <span>选棋盘</span>
            </Button>
            <div className="game-mode">
              <strong>{geometryLabels[settings.geometry]}</strong>
              <i aria-hidden="true" />
              <span>{difficultyLabels[settings.difficulty]}</span>
            </div>
            <div className="outer-actions">
              <Button
                variant="ghost"
                className="action-button"
                aria-label="查看玩法"
                onClick={() => setHelpOpen(true)}
              >
                <CircleHelp />
                <span>玩法</span>
              </Button>
              <Button
                variant="ghost"
                className="action-button"
                aria-label="打开设置"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings2 />
                <span>设置</span>
              </Button>
            </div>
          </header>

          <main id="main-content" className="game-screen">
            <section className="play-card" aria-label="游戏区域">
              <div className="game-hud">
                <div className="hud-stat">
                  <Flag aria-hidden="true" />
                  <span>剩余</span>
                  <strong>{Math.max(0, snapshot.mineCount - snapshot.flagCount)}</strong>
                </div>
                <div className="hud-stat">
                  <Clock3 aria-hidden="true" />
                  <span>用时</span>
                  <strong>{formatTime(snapshot.elapsedMs)}</strong>
                </div>
                <div className="hud-actions">
                  <Button
                    variant="secondary"
                    size="icon"
                    aria-label={snapshot.phase === "paused" ? "继续游戏" : "暂停游戏"}
                    onClick={() => controller.setPaused(snapshot.phase !== "paused")}
                    disabled={terminal || snapshot.phase === "ready"}
                  >
                    {snapshot.phase === "paused" ? <Play /> : <Pause />}
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    aria-label="重新开始"
                    onClick={() => controller.newGame()}
                  >
                    <RotateCcw />
                  </Button>
                </div>
              </div>

              <div className="board-wrap">
                <PhaserBoard controller={controller} />
                <div className="board-guide" aria-hidden="true">
                  <span>
                    <MousePointer2 />
                    左键翻开
                  </span>
                  <i />
                  <span>
                    <Flag />
                    右键标记
                  </span>
                </div>
                {snapshot.phase === "paused" && (
                  <div className="pause-overlay">
                    <Pause aria-hidden="true" />
                    <h2>已暂停</h2>
                    <Button onClick={() => controller.setPaused(false)}>
                      <Play size={17} fill="currentColor" />
                      继续
                    </Button>
                  </div>
                )}
              </div>
            </section>
          </main>
        </>
      )}

      <Dialog open={view === "game" && terminal}>
        <DialogContent
          className="result-dialog"
          onEscapeKeyDown={(event) => event.preventDefault()}
        >
          <div className={`result-badge ${snapshot.phase}`} aria-hidden="true">
            {snapshot.phase === "won" ? <Trophy /> : <Bomb />}
          </div>
          <DialogTitle>{snapshot.phase === "won" ? "扫雷成功" : "踩到雷了"}</DialogTitle>
          <DialogDescription>
            {geometryLabels[settings.geometry]}，{difficultyLabels[settings.difficulty]}，用时{" "}
            {formatTime(snapshot.elapsedMs)}
          </DialogDescription>
          <div className="result-actions">
            <Button onClick={() => controller.newGame()}>再来一局</Button>
            <Button
              variant="secondary"
              onClick={() =>
                controller.newGame(
                  settings.geometry,
                  settings.difficulty,
                  snapshot.seed,
                )
              }
            >
              重玩本局
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="help-dialog">
          <DialogTitle>怎么玩</DialogTitle>
          <DialogDescription>翻开所有安全格，不要踩到雷。</DialogDescription>
          <div className="help-steps">
            <div>
              <span>点按</span>
              <p>翻开格子。第一次点击一定安全。</p>
            </div>
            <div>
              <span>长按</span>
              <p>给可疑格子标旗。电脑端也可以使用右键。</p>
            </div>
            <div>
              <span>数字</span>
              <p>表示与当前格共享边或顶点的雷数。</p>
            </div>
          </div>
          <div className="help-shapes">
            {geometryOptions.map(({ value, icon: Icon }) => (
              <div key={value}>
                <Icon aria-hidden="true" />
                <span>{geometryLabels[value]}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="settings-dialog">
          <DialogTitle>设置</DialogTitle>
          <DialogDescription>声音和外观</DialogDescription>

          <div className="settings-section">
            <div className="setting-row">
              <div className="setting-label">
                {settings.sfxMuted ? <VolumeX /> : <Volume2 />}
                <span>
                  <strong>游戏音效</strong>
                  <small>{settings.sfxMuted ? "已关闭" : "已开启"}</small>
                </span>
              </div>
              <button
                type="button"
                className="switch"
                role="switch"
                aria-checked={!settings.sfxMuted}
                onClick={() =>
                  controller.updateSettings({ sfxMuted: !settings.sfxMuted })
                }
              >
                <span />
              </button>
            </div>
            <input
              aria-label="音效音量"
              type="range"
              min="0"
              max="100"
              disabled={settings.sfxMuted}
              value={Math.round(settings.sfxVolume * 100)}
              onChange={(event) =>
                controller.updateSettings({
                  sfxVolume: Number(event.target.value) / 100,
                  sfxMuted: false,
                })
              }
            />
          </div>

          <div className="settings-section">
            <span className="settings-heading">外观</span>
            <div className="theme-picker">
              {themes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  data-active={settings.theme === value}
                  aria-pressed={settings.theme === value}
                  onClick={() => controller.updateSettings({ theme: value })}
                >
                  <Icon />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </DialogThemeProvider>
  );
}
