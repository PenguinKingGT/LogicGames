import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

afterEach(() => {
  vi.useRealTimers();
});

describe("Connect Four App", () => {
  it("renders the standard round and opens help", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "四子棋" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "标准" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    fireEvent.click(screen.getByRole("button", { name: "查看玩法" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("率先连成四枚棋子");
  });

  it("starts with an AI opening when the player chooses yellow", async () => {
    vi.useFakeTimers();
    render(
      <App
        animationMs={0}
        thinkingMs={0}
        aiTimeoutMs={100}
        chooseAiMove={() => ({ column: 3, score: 0, completedDepth: 1 })}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "执黄后手" }));
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    expect(document.querySelectorAll(".connect-four-disc")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "第 1 列" })).toBeEnabled();
  });
});
