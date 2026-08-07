import type { Difficulty, Puzzle } from "./types";

export const PUZZLES: readonly Puzzle[] = [
  { id: "easy-1", difficulty: "easy", numbers: [1, 2, 3, 4] },
  { id: "easy-2", difficulty: "easy", numbers: [2, 3, 4, 6] },
  { id: "easy-3", difficulty: "easy", numbers: [3, 4, 4, 6] },
  { id: "easy-4", difficulty: "easy", numbers: [2, 4, 8, 8] },
  { id: "normal-1", difficulty: "normal", numbers: [3, 3, 8, 8] },
  { id: "normal-2", difficulty: "normal", numbers: [1, 5, 5, 5] },
  { id: "normal-3", difficulty: "normal", numbers: [2, 7, 7, 10] },
  { id: "normal-4", difficulty: "normal", numbers: [4, 7, 8, 8] },
  { id: "hard-1", difficulty: "hard", numbers: [1, 3, 4, 6] },
  { id: "hard-2", difficulty: "hard", numbers: [1, 4, 5, 6] },
  { id: "hard-3", difficulty: "hard", numbers: [3, 3, 7, 7] },
  { id: "hard-4", difficulty: "hard", numbers: [5, 5, 7, 11] },
] as const;

export function choosePuzzle(
  difficulty: Difficulty,
  previousId: string | null,
  random: () => number,
): Puzzle {
  const matching = PUZZLES.filter(
    (puzzle) => puzzle.difficulty === difficulty && puzzle.id !== previousId,
  );
  const candidates = matching.length > 0 ? matching : PUZZLES;
  const index = Math.min(
    candidates.length - 1,
    Math.floor(random() * candidates.length),
  );
  return candidates[index];
}
