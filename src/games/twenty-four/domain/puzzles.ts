import { solve } from "./solver";
import type { Puzzle, Solution } from "./types";

const MINIMUM_NUMBER = 1;
const MAXIMUM_NUMBER = 13;

export const PUZZLES: readonly Puzzle[] = createCompletePuzzleBank();

export function choosePuzzle(
  previousId: string | null,
  random: () => number,
): Puzzle {
  const alternatives = PUZZLES.filter((puzzle) => puzzle.id !== previousId);
  const candidates = alternatives.length > 0 ? alternatives : PUZZLES;
  const index = Math.min(
    candidates.length - 1,
    Math.floor(random() * candidates.length),
  );
  return candidates[index];
}

function createCompletePuzzleBank(): readonly Puzzle[] {
  const puzzles: Puzzle[] = [];
  for (let first = MINIMUM_NUMBER; first <= MAXIMUM_NUMBER; first += 1) {
    for (let second = first; second <= MAXIMUM_NUMBER; second += 1) {
      for (let third = second; third <= MAXIMUM_NUMBER; third += 1) {
        for (let fourth = third; fourth <= MAXIMUM_NUMBER; fourth += 1) {
          const numbers: [number, number, number, number] = [
            first,
            second,
            third,
            fourth,
          ];
          const solution = solve(numbers);
          if (!solution) continue;
          puzzles.push(createPuzzle(numbers, solution));
        }
      }
    }
  }
  return puzzles;
}

function createPuzzle(
  numbers: readonly [number, number, number, number],
  solution: Solution,
): Puzzle {
  return {
    id: numbers.join("-"),
    numbers,
    solution,
  };
}
