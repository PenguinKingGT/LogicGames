export const games = [
  {
    slug: "mastermind",
    title: "彩码谜局",
    englishTitle: "MasterMind",
    href: "/games/mastermind",
    art: "code",
  },
  {
    slug: "polymine",
    title: "多边形扫雷",
    englishTitle: "PolyMine",
    href: "/games/polymine",
    art: "geometry",
  },
  {
    slug: "nonogram",
    title: "数织",
    englishTitle: "Nonogram",
    href: "/games/nonogram",
    art: "pixel",
  },
  {
    slug: "circle-cat",
    title: "圈小猫",
    englishTitle: "Circle the Cat",
    href: "/games/circle-cat",
    art: "cat",
  },
  {
    slug: "2048",
    title: "数字方阵",
    englishTitle: "2048",
    href: "/games/2048",
    art: "number",
  },
  {
    slug: "othello",
    title: "黑白棋",
    englishTitle: "Othello",
    href: "/games/othello",
    art: "disc",
  },
  {
    slug: "twenty-four",
    title: "24 点",
    englishTitle: "24 Point",
    href: "/games/twenty-four",
    art: "arithmetic",
  },
  {
    slug: "maze",
    title: "迷宫",
    englishTitle: "Maze",
    href: "/games/maze",
    art: "maze",
  },
  {
    slug: "connect-four",
    title: "四子棋",
    englishTitle: "Connect Four",
    href: "/games/connect-four",
    art: "connect-four",
  },
] as const;

export type Game = (typeof games)[number];
