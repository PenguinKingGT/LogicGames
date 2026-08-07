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
    render(<App random={() => 0} now={() => 1000} />);
    await ready();
    expect(screen.getAllByRole("button", { name: /数字卡片/ })).toHaveLength(4);
    await user.click(screen.getByRole("button", { name: "查看玩法" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("每个数字必须使用");
  });

  it("shows a solution and marks the round assisted", async () => {
    const user = userEvent.setup();
    render(<App random={() => 0} now={() => 1000} />);
    await ready();
    await user.click(screen.getByRole("button", { name: "提示" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("一种可行解");
    expect(screen.getByRole("dialog")).toHaveTextContent("= 24");
  });

  it("combines cards and can undo the operation", async () => {
    const user = userEvent.setup();
    render(<App random={() => 0} now={() => 1000} />);
    await ready();
    const threes = screen.getAllByRole("button", { name: "数字卡片 3" });
    await user.click(threes[0]);
    await user.click(screen.getByRole("button", { name: "运算符 +" }));
    await user.click(threes[1]);
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
    render(<App random={() => 0} now={() => 1000} />);
    await ready();
    await user.click(screen.getByRole("button", { name: "简单" }));

    await combine(user, "数字卡片 1", "运算符 +", "数字卡片 2");
    const threes = screen.getAllByRole("button", { name: "数字卡片 3" });
    await user.click(threes[1]);
    await user.click(screen.getByRole("button", { name: "运算符 +" }));
    await user.click(threes[0]);
    await combine(user, "数字卡片 6", "运算符 ×", "数字卡片 4");

    expect(screen.getByRole("dialog")).toHaveTextContent("计算成立");
    expect(screen.getByRole("dialog")).toHaveTextContent("连胜已记录");
  });
});

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
