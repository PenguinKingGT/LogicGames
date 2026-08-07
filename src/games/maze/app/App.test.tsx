import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

async function ready(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
}

describe("Maze App", () => {
  it("renders the maze and opens the rules", async () => {
    const user = userEvent.setup();
    render(<App random={() => 0} />);
    await ready();
    expect(screen.getByRole("application")).toHaveAccessibleName(/15 乘 15/);
    expect(screen.getByRole("img", { name: "出口" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "查看玩法" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("没有步数和时间限制");
  });

  it("moves with the keyboard and restarts at the origin", async () => {
    const user = userEvent.setup();
    render(<App random={() => 0} />);
    await ready();
    const initialPosition = screen
      .getByRole("img", { name: /当前位置/ })
      .getAttribute("aria-label");
    const board = screen.getByRole("application");
    board.focus();
    await user.keyboard(keyForStartCell(board));
    expect(screen.getByRole("img", { name: /当前位置/ })).not.toHaveAttribute(
      "aria-label",
      initialPosition,
    );
    await user.click(screen.getByRole("button", { name: "重新开始" }));
    expect(screen.getByRole("img", { name: /当前位置/ })).toHaveAttribute(
      "aria-label",
      "当前位置，第 1 行第 1 列",
    );
  });

  it("supports board-scoped keyboard movement", async () => {
    const user = userEvent.setup();
    render(<App random={() => 0} />);
    await ready();
    const board = screen.getByRole("application");
    board.focus();
    await user.keyboard(keyForStartCell(board));
    expect(screen.getByRole("img", { name: /当前位置/ })).not.toHaveAttribute(
      "aria-label",
      "当前位置，第 1 行第 1 列",
    );
  });

  it("generates a different maze from the header action", async () => {
    const user = userEvent.setup();
    render(<App random={() => 0} />);
    await ready();
    const before = screen
      .getByRole("application")
      .getAttribute("data-maze-signature");
    await user.click(screen.getByRole("button", { name: "新迷宫" }));
    expect(screen.getByRole("application")).not.toHaveAttribute(
      "data-maze-signature",
      before,
    );
  });

  it("switches to a larger complex maze without direction buttons", async () => {
    const user = userEvent.setup();
    render(<App random={() => 0} />);
    await ready();
    await user.click(screen.getByRole("button", { name: "复杂" }));
    expect(screen.getByRole("application")).toHaveAccessibleName(/25 乘 25/);
    expect(screen.getByRole("button", { name: "复杂" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.queryByRole("button", { name: /移动/ }),
    ).not.toBeInTheDocument();
  });
});

function keyForStartCell(board: HTMLElement): string {
  const startCell = board.querySelector<HTMLElement>("[data-start]");
  const openings = startCell?.dataset.open ?? "";
  if (openings.includes("r")) return "{ArrowRight}";
  if (openings.includes("d")) return "{ArrowDown}";
  throw new Error("Expected the starting cell to have an open passage");
}
