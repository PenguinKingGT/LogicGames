import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import App from "./App";

async function ready(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
}

describe("24 Point App", () => {
  afterEach(() => localStorage.clear());

  it("renders a solvable round and opens the rules", async () => {
    const user = userEvent.setup();
    render(<App random={() => 0} />);
    await ready();
    expect(screen.getAllByRole("button", { name: /数字卡片/ })).toHaveLength(4);
    await user.click(screen.getByRole("button", { name: "查看玩法" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("每个数字必须使用");
  });

  it("shows a solution without adding completion categories", async () => {
    const user = userEvent.setup();
    render(<App random={() => 0} />);
    await ready();
    await user.click(screen.getByRole("button", { name: "提示" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("一种可行解");
    expect(screen.getByRole("dialog")).toHaveTextContent("= 24");
    expect(screen.queryByText("辅助完成")).not.toBeInTheDocument();
  });

  it("combines cards and can undo the operation", async () => {
    const user = userEvent.setup();
    render(<App random={() => 0} />);
    await ready();
    const cards = screen.getAllByRole("button", { name: /数字卡片/ });
    await user.click(cards[0]);
    await user.click(screen.getByRole("button", { name: "运算符 +" }));
    await user.click(cards[1]);
    expect(screen.getAllByRole("button", { name: /数字卡片/ })).toHaveLength(3);
    await user.click(screen.getByRole("button", { name: "撤销" }));
    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /数字卡片/ })).toHaveLength(
        4,
      );
    });
  });

  it("completes an exact 24 expression", async () => {
    const user = userEvent.setup();
    render(<App random={() => 0} />);
    await ready();

    const ones = screen.getAllByRole("button", { name: "数字卡片 1" });
    await user.click(ones[0]);
    await user.click(screen.getByRole("button", { name: "运算符 +" }));
    await user.click(ones[1]);
    await combine(user, "数字卡片 2", "运算符 +", "数字卡片 1");
    await combine(user, "数字卡片 3", "运算符 ×", "数字卡片 8");

    expect(screen.getByRole("dialog")).toHaveTextContent("计算成立");
    expect(screen.getByRole("dialog")).toHaveTextContent("精确得到 24");
  });

  it("replaces the current puzzle when refresh is pressed", async () => {
    const user = userEvent.setup();
    render(<App random={() => 0} />);
    await ready();
    const before = getCardNames();

    await user.click(screen.getByRole("button", { name: "换一题" }));

    expect(getCardNames()).not.toEqual(before);
    expect(screen.queryByText("完成题目")).not.toBeInTheDocument();
  });
});

function getCardNames(): string[] {
  return screen
    .getAllByRole("button", { name: /数字卡片/ })
    .map((card) => card.getAttribute("aria-label") ?? "");
}

async function combine(
  user: ReturnType<typeof userEvent.setup>,
  leftName: string,
  operatorName: string,
  rightName: string,
): Promise<void> {
  await user.click(screen.getByRole("button", { name: leftName }));
  await user.click(screen.getByRole("button", { name: operatorName }));
  await user.click(screen.getByRole("button", { name: rightName }));
}
