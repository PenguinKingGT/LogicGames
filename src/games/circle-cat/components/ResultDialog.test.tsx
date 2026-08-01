import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ResultDialog } from "./ResultDialog";

describe("Circle Cat result dialog", () => {
  it("shows an actionable loss result inside the styled portal", async () => {
    const user = userEvent.setup();
    const replay = vi.fn();

    render(<ResultDialog result="lost" moves={5} onReplay={replay} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("小猫跑掉了");
    expect(dialog.closest(".circle-cat-portal")).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "再来一局" }));
    expect(replay).toHaveBeenCalledOnce();
  });
});
