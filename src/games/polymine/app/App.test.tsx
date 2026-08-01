import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
});
