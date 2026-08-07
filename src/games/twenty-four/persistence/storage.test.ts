import { afterEach, describe, expect, it } from "vitest";
import { defaultSettings, readSettings, writeSettings } from "./storage";

describe("24 Point settings", () => {
  afterEach(() => localStorage.clear());

  it("persists only the sound preference", () => {
    writeSettings({ soundEnabled: false });
    expect(readSettings()).toEqual({ soundEnabled: false });
    expect(localStorage.getItem("twenty-four:v1")).not.toContain("completed");
  });

  it("falls back when storage is malformed", () => {
    localStorage.setItem("twenty-four:v1", "not-json");
    expect(readSettings()).toEqual(defaultSettings);
  });
});
