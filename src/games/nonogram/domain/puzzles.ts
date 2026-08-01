import type { Difficulty, PuzzleDefinition } from "./types";

function definePuzzle(
  id: string,
  name: string,
  difficulty: Difficulty,
  solution: readonly string[],
): PuzzleDefinition {
  return { id, name, difficulty, width: solution[0]?.length ?? 0, height: solution.length, solution };
}

const basePuzzles: readonly PuzzleDefinition[] = [
  definePuzzle("easy-heart", "心愿", "easy", [
    ".###.", "#####", "#####", ".###.", "..#..",
  ]),
  definePuzzle("easy-tree", "松树", "easy", [
    "..#..", ".###.", "#####", "..#..", ".###.",
  ]),
  definePuzzle("easy-cup", "茶杯", "easy", [
    "#...#", "#...#", "#...#", ".###.", "..#..",
  ]),
  definePuzzle("easy-fish", "小鱼", "easy", [
    ".###.", "##..#", "#####", "##..#", ".###.",
  ]),
  definePuzzle("easy-house", "小屋", "easy", [
    "..#..", ".###.", "#####", "#.#.#", "#####",
  ]),
  definePuzzle("easy-star", "星光", "easy", [
    "..#..", "#.#.#", ".###.", "#####", ".#.#.",
  ]),
  definePuzzle("easy-kite", "纸鸢", "easy", [
    "##...", ".#.#.", "###..", "..##.", "#...#",
  ]),
  definePuzzle("easy-lantern", "灯影", "easy", [
    "#.#..", ".###.", "##...", "..###", ".#..#",
  ]),
  definePuzzle("easy-bird", "飞羽", "easy", [
    "#..#.", ".###.", "##..#", "..##.", ".#...",
  ]),
  definePuzzle("easy-leaf", "叶脉", "easy", [
    ".##.#", "###..", "..#.#", "#.##.", ".#..#",
  ]),

  definePuzzle("normal-rocket", "发射台", "normal", [
    "....##....", "...####...", "...####...", "..######..", "..######..",
    "...####...", "...####...", "..##..##..", ".##....##.", "##......##",
  ]),
  definePuzzle("normal-cat", "夜猫", "normal", [
    ".##....##.", "####..####", "##########", "##.####.##", "##########",
    ".########.", "..######..", "...####...", "..##..##..", ".##....##.",
  ]),
  definePuzzle("normal-umbrella", "雨伞", "normal", [
    "....##....", "..######..", ".########.", "##########", "#.#.#.#.#.",
    "....##....", "....##....", "....##....", "....##....", "...####...",
  ]),
  definePuzzle("normal-mushroom", "蘑菇", "normal", [
    "...####...", ".########.", "##########", "##.####.##", "...####...",
    "...####...", "...####...", "..######..", ".##.##.##.", "##..##..##",
  ]),
  definePuzzle("normal-camera", "相机", "normal", [
    "..........", "..######..", ".########.", "###....###", "##.#..#.##",
    "##......##", "##..##..##", "###....###", ".########.", "..######..",
  ]),
  definePuzzle("normal-music", "音符", "normal", [
    ".....###..", ".....###..", ".....###..", ".....###..", ".#######..",
    "########..", "###..###..", "###..###..", "###.####..", ".###.##...",
  ]),
  definePuzzle("normal-bridge", "长桥", "normal", [
    "#.........", "##........", ".###......", "..####....", "...#####..",
    "..##..###.", ".##....###", "###.....##", ".####...#.", "...###....",
  ]),
  definePuzzle("normal-city", "城灯", "normal", [
    "#..##.....", "##.##..#..", "##.#####..", "#####.##..", ".###..####",
    "##..######", "#...##.###", "###.#...##", ".#####..#.", "..##.####.",
  ]),
  definePuzzle("normal-garden", "庭园", "normal", [
    ".#...##...", "###..#..#.", ".####...##", "##..###...", "...##.####",
    "#.####..#.", "##...###..", ".###.#..##", "#..####...", "..##...###",
  ]),

  definePuzzle("hard-launch", "升空", "hard", [
    "......###......", "......###......", ".....######....", ".....######....", ".....######....",
    "...#########...", "...#########...", "...#########...", ".....######....", ".....######....",
    ".....######....", "...###...###...", "..###......###.", "..###......###.", "###.........###",
  ]),
  definePuzzle("hard-cat", "猫影", "hard", [
    "..###......###.", "..###......###.", "######...######", "###############", "###############",
    "###..######.###", "###############", "###############", "..############.", "...#########...",
    "...#########...", ".....######....", "...###...###...", "...###...###...", "..###......###.",
  ]),
  definePuzzle("hard-rain", "雨幕", "hard", [
    "......###......", "......###......", "...#########...", "..############.", "..############.",
    "###############", "##.##.##.##.##.", "##.##.##.##.##.", "......###......", "......###......",
    "......###......", "......###......", "......###......", "......###......", ".....######....",
  ]),
  definePuzzle("hard-mushroom", "林间菇", "hard", [
    ".....######....", ".....######....", "..############.", "###############", "###############",
    "###..######.###", ".....######....", ".....######....", ".....######....", ".....######....",
    ".....######....", "...#########...", "..###.###..###.", "..###.###..###.", "###...###...###",
  ]),
  definePuzzle("hard-camera", "取景器", "hard", [
    "...............", "...............", "...#########...", "..############.", "..############.",
    "#####......####", "###..#...##.###", "###..#...##.###", "###.........###", "###...###...###",
    "###...###...###", "#####......####", "..############.", "..############.", "...#########...",
  ]),
  definePuzzle("hard-rhythm", "节拍", "hard", [
    "........####...", "........####...", "........####...", "........####...", "........####...",
    "........####...", "..##########...", "..##########...", "############...", "#####...####...",
    "#####...####...", "#####...####...", "#####.######...", "#####.######...", "..####..###....",
  ]),
  definePuzzle("hard-harbor", "港湾", "hard", [
    "##...#....##...", ".###...##....#.", "#..####...#....", "...##..#####...", "##....###..##..",
    ".#.#.####...##.", "####...#..###..", "..###....##..#.", "#....#####...##", ".##..#...####..",
    "###....##...#..", "..#.####..##...", "#.##...###....#", "...####.#..###.", ".#...##.#####..",
  ]),
] as const;

type TransformId =
  | "r90" | "r180" | "r270" | "mirror" | "mirror-r90" | "mirror-r180" | "mirror-r270"
  | "inverse" | "inverse-r90" | "inverse-r180" | "inverse-r270"
  | "inverse-mirror" | "inverse-mirror-r90" | "inverse-mirror-r180" | "inverse-mirror-r270";

const transforms: readonly { id: TransformId; label: string }[] = [
  { id: "r90", label: "转向一" },
  { id: "r180", label: "转向二" },
  { id: "r270", label: "转向三" },
  { id: "mirror", label: "映像一" },
  { id: "mirror-r90", label: "映像二" },
  { id: "mirror-r180", label: "映像三" },
  { id: "mirror-r270", label: "映像四" },
  { id: "inverse", label: "反相一" },
  { id: "inverse-r90", label: "反相二" },
  { id: "inverse-r180", label: "反相三" },
  { id: "inverse-r270", label: "反相四" },
  { id: "inverse-mirror", label: "反相映像一" },
  { id: "inverse-mirror-r90", label: "反相映像二" },
  { id: "inverse-mirror-r180", label: "反相映像三" },
  { id: "inverse-mirror-r270", label: "反相映像四" },
] as const;

function rotateClockwise(solution: readonly string[]): readonly string[] {
  const size = solution.length;
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, column) => solution[size - column - 1]![row]).join(""));
}

function mirrorHorizontally(solution: readonly string[]): readonly string[] {
  return solution.map((row) => [...row].reverse().join(""));
}

function transformSolution(solution: readonly string[], transform: TransformId): readonly string[] {
  const mirrored = transform.includes("mirror") ? mirrorHorizontally(solution) : solution;
  const turns = transform.endsWith("r90") ? 1 : transform.endsWith("r180") ? 2 : transform.endsWith("r270") ? 3 : 0;
  let result = mirrored;
  for (let turn = 0; turn < turns; turn += 1) result = rotateClockwise(result);
  if (transform.startsWith("inverse")) {
    result = result.map((row) => [...row].map((cell) => cell === "#" ? "." : "#").join(""));
  }
  return result;
}

function buildPuzzlePack(): readonly PuzzleDefinition[] {
  const variantOnlyIds = new Set(["hard-harbor"]);
  const pack = basePuzzles.filter((puzzle) => !variantOnlyIds.has(puzzle.id));
  const seen = new Set(pack.map((puzzle) => `${puzzle.difficulty}:${puzzle.solution.join("/")}`));
  for (const puzzle of basePuzzles) {
    for (const transform of transforms) {
      if (variantOnlyIds.has(puzzle.id) && !transform.id.startsWith("inverse")) continue;
      if (transform.id.startsWith("inverse")
        && (puzzle.id === "easy-fish" || puzzle.id === "easy-lantern"
          || puzzle.id === "normal-cat" || puzzle.id === "normal-garden")) continue;
      const solution = transformSolution(puzzle.solution, transform.id);
      const key = `${puzzle.difficulty}:${solution.join("/")}`;
      if (seen.has(key)) continue;
      seen.add(key);
      pack.push(definePuzzle(
        `${puzzle.id}-${transform.id}`,
        `${puzzle.name}（${transform.label}）`,
        puzzle.difficulty,
        solution,
      ));
    }
  }
  return pack;
}

export const puzzles: readonly PuzzleDefinition[] = buildPuzzlePack();

export const difficultySizes: Record<Difficulty, number> = { easy: 5, normal: 10, hard: 15 };
export const difficultyLabels: Record<Difficulty, string> = { easy: "轻松", normal: "标准", hard: "挑战" };

export function getPuzzles(difficulty: Difficulty): readonly PuzzleDefinition[] {
  return puzzles.filter((puzzle) => puzzle.difficulty === difficulty);
}

export function getPuzzle(id: string): PuzzleDefinition | undefined {
  return puzzles.find((puzzle) => puzzle.id === id);
}
