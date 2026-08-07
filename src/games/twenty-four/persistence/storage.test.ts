import { afterEach, describe, expect, it } from "vitest";
import { defaultData, readData, recordCompletion, writeData } from "./storage";

describe("24 Point persistence", () => {
  afterEach(() => localStorage.clear());

  it("round-trips preferences", () => {
    const stored = { ...defaultData, difficulty: "hard" as const };
    writeData(stored);
    expect(readData()).toEqual(stored);
  });

  it("falls back when storage is malformed", () => {
    localStorage.setItem("twenty-four:v1", "not-json");
    expect(readData()).toEqual(defaultData);
  });

  it("records standard and assisted completions differently", () => {
    const standard = recordCompletion(defaultData, "normal", false, 9000);
    expect(standard.streak).toBe(1);
    expect(standard.records.normal.bestTimeMs).toBe(9000);
    const assisted = recordCompletion(standard, "normal", true, 2000);
    expect(assisted.streak).toBe(0);
    expect(assisted.records.normal.assisted).toBe(1);
    expect(assisted.records.normal.bestTimeMs).toBe(9000);
  });
});
