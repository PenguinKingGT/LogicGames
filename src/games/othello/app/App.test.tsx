import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import App from "./App";

async function ready() {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
}

describe("Othello App", () => {
  afterEach(() => localStorage.clear());

  it("renders the opening and completes a human-AI exchange", async () => {
    const user = userEvent.setup();
    render(
      <App animationMs={1} thinkingMs={1} aiTimeoutMs={20} random={() => 0} />,
    );
    await ready();
    expect(
      screen.getByRole("grid", { name: "8 乘 8 黑白棋棋盘" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("gridcell", { name: /可落子/ })).toHaveLength(4);
    await user.click(screen.getByRole("gridcell", { name: /D3，可落子/ }));
    await waitFor(() =>
      expect(screen.getByText("轮到你落子")).toBeInTheDocument(),
    );
    expect(screen.getByText(/你 · 黑/).parentElement).not.toHaveTextContent(
      "2",
    );
  });

  it("opens help and changes difficulty", async () => {
    const user = userEvent.setup();
    render(<App />);
    await ready();
    await user.click(screen.getByRole("button", { name: "查看玩法" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("无棋可下时自动跳过");
    await user.click(screen.getByRole("button", { name: "关闭" }));
    await user.click(screen.getByRole("button", { name: "困难" }));
    expect(screen.getByRole("button", { name: "困难" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("lets the human play white after the computer opens as black", async () => {
    const user = userEvent.setup();
    render(
      <App animationMs={1} thinkingMs={1} aiTimeoutMs={20} random={() => 0} />,
    );
    await ready();

    await user.click(screen.getByRole("button", { name: "执白后手" }));

    expect(screen.getByRole("button", { name: "执白后手" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("你 · 白")).toBeInTheDocument();
    expect(screen.getByText("电脑 · 黑")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("轮到你落子")).toBeInTheDocument();
    });
    expect(
      screen.getAllByRole("gridcell", { name: /可落子/ }).length,
    ).toBeGreaterThan(0);
  });
});
