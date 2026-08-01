import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GameSession } from "../domain/game-session";
import { getPreset } from "../domain/presets";
import { App } from "./App";
import { GameController } from "./GameController";

vi.mock("../ui/PhaserBoard", () => ({
  PhaserBoard: () => <div data-testid="phaser-board" />,
}));

describe("App entry flow", () => {
  let controller: GameController;

  beforeEach(() => {
    localStorage.clear();
    controller = new GameController();
  });

  afterEach(() => {
    cleanup();
    controller.destroy();
  });

  it("chooses a board before entering the game", () => {
    render(<App controller={controller} />);

    expect(screen.getByRole("heading", { name: "选个棋盘" })).toBeInTheDocument();
    expect(screen.queryByLabelText("游戏区域")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /三角/ }));
    fireEvent.click(screen.getByRole("button", { name: /挑战/ }));
    fireEvent.click(screen.getByRole("button", { name: /开始游戏/ }));

    expect(screen.getByLabelText("游戏区域")).toBeInTheDocument();
    expect(screen.getByTestId("phaser-board")).toBeInTheDocument();
    expect(controller.settings).toMatchObject({
      geometry: "triangle",
      difficulty: "hard",
    });
  });

  it("opens the game instructions from the outer help action", () => {
    render(<App controller={controller} />);

    fireEvent.click(screen.getByRole("button", { name: "查看玩法" }));

    expect(screen.getByRole("dialog")).toHaveTextContent("怎么玩");
    expect(screen.getByRole("dialog")).toHaveTextContent("第一次点击一定安全");
    expect(screen.queryByText("本地战绩")).not.toBeInTheDocument();
  });

  it("shows the result after a win and starts a fresh game", () => {
    render(<App controller={controller} />);
    fireEvent.click(screen.getByRole("button", { name: /开始游戏/ }));

    const seed = "known-win";
    const firstCell = "s:4:4";
    const reference = new GameSession(getPreset("square", "easy"), seed);
    reference.reveal(firstCell, 100);
    const mines = new Set(reference.debugMineIds());

    act(() => {
      controller.newGame("square", "easy", seed);
      controller.reveal(firstCell);
      for (const cell of controller.getTopology().cells()) {
        if (!mines.has(cell)) controller.reveal(cell);
      }
    });

    expect(screen.getByRole("dialog")).toHaveTextContent("扫雷成功");
    fireEvent.click(screen.getByRole("button", { name: "再来一局" }));

    expect(controller.getSnapshot().phase).toBe("ready");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
