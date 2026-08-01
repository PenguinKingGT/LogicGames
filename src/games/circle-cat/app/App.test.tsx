import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { audioManager } from "../audio/audio-manager";
import { CIRCLE_CAT_STORAGE_KEY } from "../persistence/storage";
import App from "./App";

async function ready() {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
}

describe("Circle Cat App", () => {
  afterEach(() => {
    localStorage.clear();
    audioManager.setEnabled(true);
    vi.restoreAllMocks();
  });

  it("renders a playable 11 by 11 board", async () => {
    render(<App seed={4} preloadAssets={false} />);
    await ready();
    expect(screen.getByRole("grid", { name: "11 乘 11 圈小猫棋盘" })).toBeInTheDocument();
    expect(screen.getAllByRole("gridcell")).toHaveLength(121);
    expect(screen.getAllByRole("gridcell").filter((cell) => cell.dataset.state === "blocked")).toHaveLength(10);
    expect(screen.getAllByRole("gridcell").filter((cell) => cell.dataset.state === "cat")).toHaveLength(1);
  });

  it("blocks a cell, moves the cat, and unlocks the next turn", async () => {
    const user = userEvent.setup();
    const play = vi.spyOn(audioManager, "play").mockResolvedValue(undefined);
    render(<App seed={8} random={() => 0} movementMs={1} preloadAssets={false} />);
    await ready();
    const cells = screen.getAllByRole("gridcell");
    const target = cells.find((cell) => cell.dataset.state === "open")!;
    const oldCat = cells.findIndex((cell) => cell.dataset.state === "cat");

    await user.click(target);
    expect(target).toHaveAttribute("data-state", "blocked");
    expect(play).toHaveBeenCalledWith("place");
    expect(play).toHaveBeenCalledWith("step");
    await waitFor(() => expect(screen.getByText("步数").parentElement).toHaveTextContent("1"));
    const newCat = screen.getAllByRole("gridcell").findIndex((cell) => cell.dataset.state === "cat");
    expect(newCat).not.toBe(oldCat);
  });

  it("changes difficulty, restarts, and persists settings", async () => {
    const user = userEvent.setup();
    render(<App seed={12} preloadAssets={false} />);
    await ready();

    await user.click(screen.getByRole("button", { name: "挑战" }));
    expect(screen.getAllByRole("gridcell").filter((cell) => cell.dataset.state === "blocked")).toHaveLength(6);
    expect(localStorage.getItem(CIRCLE_CAT_STORAGE_KEY)).toContain('"lastDifficulty":"hard"');

    const firstLayout = screen.getAllByRole("gridcell")
      .filter((cell) => cell.dataset.state === "blocked")
      .map((cell) => cell.getAttribute("aria-label"));
    await user.click(screen.getByRole("button", { name: "重新开局" }));
    const secondLayout = screen.getAllByRole("gridcell")
      .filter((cell) => cell.dataset.state === "blocked")
      .map((cell) => cell.getAttribute("aria-label"));
    expect(secondLayout).not.toEqual(firstLayout);
  });

  it("confirms before discarding an active round", async () => {
    const user = userEvent.setup();
    render(<App seed={8} random={() => 0} movementMs={1} preloadAssets={false} />);
    await ready();

    const target = screen.getAllByRole("gridcell").find((cell) => cell.dataset.state === "open")!;
    await user.click(target);
    await waitFor(() => expect(screen.getByText("步数").parentElement).toHaveTextContent("1"));

    await user.click(screen.getByRole("button", { name: "重新开局" }));
    let dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("当前进度不会保留");
    await user.click(within(dialog).getByRole("button", { name: "继续游戏" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("步数").parentElement).toHaveTextContent("1");

    await user.click(screen.getByRole("button", { name: "挑战" }));
    dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("切换到挑战");
    await user.click(within(dialog).getByRole("button", { name: "切换难度" }));

    expect(screen.getByRole("button", { name: "挑战" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("步数").parentElement).toHaveTextContent("0");
  });

  it("opens help and persists the sound toggle", async () => {
    const user = userEvent.setup();
    render(<App preloadAssets={false} />);
    await ready();

    await user.click(screen.getByRole("button", { name: "查看玩法" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("点一个圆点封路");
    await user.click(screen.getByRole("button", { name: "关闭" }));

    await user.click(screen.getByRole("button", { name: "关闭音效" }));
    expect(screen.getByRole("button", { name: "开启音效" })).toBeInTheDocument();
    expect(localStorage.getItem(CIRCLE_CAT_STORAGE_KEY)).toContain('"soundEnabled":false');
  });

  it("supports roving keyboard focus and blocking", async () => {
    const user = userEvent.setup();
    render(<App seed={15} movementMs={1} preloadAssets={false} />);
    await ready();
    const center = screen.getByRole("gridcell", { name: /6 行 6 列/ });
    center.focus();
    await user.keyboard("{ArrowRight}");
    await waitFor(() => expect(screen.getByRole("gridcell", { name: /6 行 7 列/ })).toHaveFocus());
    const focused = screen.getByRole("gridcell", { name: /6 行 7 列/ });
    if (focused.dataset.state === "open") {
      await user.keyboard(" ");
      expect(focused).toHaveAttribute("data-state", "blocked");
    }
  });
});
