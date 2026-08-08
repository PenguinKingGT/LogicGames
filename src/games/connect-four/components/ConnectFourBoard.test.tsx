import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createBoard } from "../domain/engine";
import { ConnectFourBoard } from "./ConnectFourBoard";

describe("ConnectFourBoard", () => {
  it("drops through column controls and keyboard selection", () => {
    const onDrop = vi.fn();
    render(
      <ConnectFourBoard
        board={createBoard()}
        lastMove={null}
        disabled={false}
        onDrop={onDrop}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "第 2 列" }));
    expect(onDrop).toHaveBeenLastCalledWith(1);
    const board = screen.getByRole("application");
    board.focus();
    fireEvent.keyDown(board, { key: "ArrowRight" });
    fireEvent.keyDown(board, { key: "Enter" });
    expect(onDrop).toHaveBeenLastCalledWith(4);
  });

  it("disables all columns while input is locked", () => {
    render(
      <ConnectFourBoard
        board={createBoard()}
        lastMove={null}
        disabled
        onDrop={vi.fn()}
      />,
    );
    for (const button of screen.getAllByRole("button")) {
      expect(button).toBeDisabled();
    }
  });
});
