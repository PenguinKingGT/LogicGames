import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { NONOGRAM_STORAGE_KEY } from "../persistence/storage";
import { audioManager } from "../audio/audio-manager";

const heartFilled = [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 22];

async function ready() {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
}

describe("Nonogram App", () => {
  afterEach(() => {
    audioManager.setEnabled(true);
    vi.restoreAllMocks();
  });

  it("renders the 5 by 5 puzzle with row and column clues", async () => {
    render(<App random={() => 0} />);
    await ready();
    expect(screen.getByRole("grid", { name: "5 乘 5 数织棋盘" })).toBeInTheDocument();
    expect(screen.getAllByRole("gridcell")).toHaveLength(25);
    expect(screen.getByLabelText("行线索")).toHaveTextContent("35531");
    expect(screen.getByLabelText("列线索")).toHaveTextContent("24542");
  });

  it("fills, crosses, erases, and undoes one drag as a unit", async () => {
    const user = userEvent.setup();
    render(<App random={() => 0} />);
    await ready();
    const cells = screen.getAllByRole("gridcell");

    await user.click(screen.getByRole("button", { name: /标空/ }));
    await user.click(cells[0]!);
    expect(cells[0]).toHaveAttribute("data-state", "crossed");

    await user.click(screen.getByRole("button", { name: /擦除/ }));
    await user.click(cells[0]!);
    expect(cells[0]).toHaveAttribute("data-state", "unknown");

    await user.click(screen.getByRole("button", { name: /填格/ }));
    const elementFromPoint = vi.fn(() => cells[1]!);
    Object.defineProperty(document, "elementFromPoint", { configurable: true, value: elementFromPoint });
    fireEvent.pointerDown(cells[0]!, { button: 0, pointerId: 4 });
    fireEvent.pointerMove(screen.getByRole("grid"), { pointerId: 4, clientX: 10, clientY: 10 });
    fireEvent.pointerUp(window, { pointerId: 4 });
    expect(elementFromPoint).toHaveBeenCalled();
    expect(cells[0]).toHaveAttribute("data-state", "filled");
    expect(cells[1]).toHaveAttribute("data-state", "filled");

    await user.click(screen.getByRole("button", { name: /撤销/ }));
    expect(cells[0]).toHaveAttribute("data-state", "unknown");
    expect(cells[1]).toHaveAttribute("data-state", "unknown");
    Reflect.deleteProperty(document, "elementFromPoint");
  });

  it("supports keyboard tool shortcuts and grid navigation", async () => {
    const user = userEvent.setup();
    render(<App random={() => 0} />);
    await ready();
    const cells = screen.getAllByRole("gridcell");
    cells[0]!.focus();
    await user.keyboard("x ");
    expect(cells[0]).toHaveAttribute("data-state", "crossed");
    await user.keyboard("{ArrowRight}");
    await waitFor(() => expect(cells[1]).toHaveFocus());
    await user.keyboard("f ");
    expect(cells[1]).toHaveAttribute("data-state", "filled");
  });

  it("completes a puzzle, stores the result, and replays", async () => {
    const user = userEvent.setup();
    render(<App random={() => 0} />);
    await ready();
    const cells = screen.getAllByRole("gridcell");
    for (const index of heartFilled) await user.click(cells[index]!);

    expect(await screen.findByRole("dialog")).toHaveTextContent("完成");
    expect(screen.getByRole("dialog")).toHaveTextContent("心愿");
    expect(localStorage.getItem(NONOGRAM_STORAGE_KEY)).toContain("easy-heart");
    await user.click(screen.getByRole("button", { name: "重玩本题" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getAllByRole("gridcell").every((cell) => cell.dataset.state === "unknown")).toBe(true);
  });

  it("opens help, changes difficulty, and cleans timer resources", async () => {
    const user = userEvent.setup();
    const clearIntervalSpy = vi.spyOn(window, "clearInterval");
    const view = render(<App random={() => 0} />);
    await ready();

    const help = screen.getByRole("button", { name: "查看玩法" });
    await user.click(help);
    expect(screen.getByRole("dialog")).toHaveTextContent("怎么玩");
    await user.click(screen.getByRole("button", { name: "关闭" }));
    await waitFor(() => expect(help).toHaveFocus());

    await user.click(screen.getByRole("button", { name: "标准" }));
    expect(screen.getByRole("grid", { name: "10 乘 10 数织棋盘" })).toBeInTheDocument();
    const first = screen.getAllByRole("gridcell")[0]!;
    await user.click(first);
    view.unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it("plays interaction cues and persists the sound setting", async () => {
    const user = userEvent.setup();
    const play = vi.spyOn(audioManager, "play").mockResolvedValue(undefined);
    render(<App random={() => 0} />);
    await ready();

    await user.click(screen.getAllByRole("gridcell")[0]!);
    expect(play).toHaveBeenCalledWith("fill");

    await user.click(screen.getByRole("button", { name: "关闭音效" }));
    expect(screen.getByRole("button", { name: "开启音效" })).toBeInTheDocument();
    expect(localStorage.getItem(NONOGRAM_STORAGE_KEY)).toContain('"soundEnabled":false');

    await user.click(screen.getByRole("button", { name: "开启音效" }));
    expect(play).toHaveBeenCalledWith("switch");
    expect(localStorage.getItem(NONOGRAM_STORAGE_KEY)).toContain('"soundEnabled":true');
  });
});
