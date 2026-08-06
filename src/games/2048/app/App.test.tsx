import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { audioManager } from "../audio/audio-manager";
import App from "./App";

async function ready() {
  await act(async () => { await new Promise((resolve) => requestAnimationFrame(resolve)); });
}

describe("2048 App", () => {
  afterEach(() => { localStorage.clear(); audioManager.setEnabled(true); vi.restoreAllMocks(); });

  it("renders two tiles and supports keyboard movement plus undo", async () => {
    const user = userEvent.setup();
    render(<App random={() => 0} animationMs={1} />);
    await ready();
    const board = screen.getByRole("application", { name: "4 乘 4 数字方阵" });
    expect(board.querySelectorAll(".g2048-tile")).toHaveLength(2);
    board.focus();
    await user.keyboard("{ArrowRight}");
    await waitFor(() => expect(screen.getByText("当前分数").parentElement).toHaveTextContent("4"));
    expect(screen.getByRole("button", { name: "撤销上一步" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "撤销上一步" }));
    expect(screen.getByText("当前分数").parentElement).toHaveTextContent("0");
  });

  it("opens help and persists the sound toggle", async () => {
    const user = userEvent.setup();
    render(<App random={() => 0} />);
    await ready();
    await user.click(screen.getByRole("button", { name: "查看玩法" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("相同数字相遇时会合并");
    await user.click(screen.getByRole("button", { name: "关闭" }));
    await user.click(screen.getByRole("button", { name: "关闭音效" }));
    expect(localStorage.getItem("2048:sound")).toBe("false");
    expect(screen.getByRole("button", { name: "开启音效" })).toBeInTheDocument();
  });
});
