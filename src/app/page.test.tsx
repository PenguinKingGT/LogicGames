import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("home menu", () => {
  it("links to both standalone game pages", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { level: 1, name: "选择游戏" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "在新标签页打开彩码谜局" }))
      .toHaveAttribute("href", "/games/mastermind");
    expect(screen.getByRole("link", { name: "在新标签页打开彩码谜局" }))
      .toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: "在新标签页打开多边形扫雷" }))
      .toHaveAttribute("href", "/games/polymine");
    expect(screen.getByRole("link", { name: "在新标签页打开多边形扫雷" }))
      .toHaveAttribute("target", "_blank");
  });
});
