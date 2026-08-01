import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { GameController } from "./GameController";
import PolyMineRuntime from "./PolyMineRuntime";

vi.mock("./App", () => ({
  App: () => <div data-testid="polymine-app" />,
}));

describe("PolyMineRuntime", () => {
  it("owns one controller and destroys it when the route unmounts", () => {
    const destroy = vi.fn();
    const createController = vi.fn(() => ({ destroy }) as unknown as GameController);
    const view = render(<PolyMineRuntime createController={createController} />);

    expect(createController).toHaveBeenCalledTimes(1);
    view.unmount();
    expect(destroy).toHaveBeenCalledTimes(1);
  });
});
