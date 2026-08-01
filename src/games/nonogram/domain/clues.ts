import type { CellMark, PuzzleClues, PuzzleDefinition } from "./types";

export function deriveLineClue(line: Iterable<boolean>): readonly number[] {
  const clues: number[] = [];
  let run = 0;
  for (const filled of line) {
    if (filled) {
      run += 1;
    } else if (run > 0) {
      clues.push(run);
      run = 0;
    }
  }
  if (run > 0) clues.push(run);
  return clues;
}

export function deriveClues(puzzle: PuzzleDefinition): PuzzleClues {
  const rows = puzzle.solution.map((row) => deriveLineClue([...row].map((cell) => cell === "#")));
  const columns = Array.from({ length: puzzle.width }, (_, column) =>
    deriveLineClue(puzzle.solution.map((row) => row[column] === "#")),
  );
  return { width: puzzle.width, height: puzzle.height, rows, columns };
}

export function solutionMask(puzzle: PuzzleDefinition): readonly boolean[] {
  return puzzle.solution.flatMap((row) => [...row].map((cell) => cell === "#"));
}

export function matchesSolution(marks: readonly CellMark[], puzzle: PuzzleDefinition): boolean {
  const solution = solutionMask(puzzle);
  return marks.length === solution.length && marks.every((mark, index) => (mark === "filled") === solution[index]);
}

