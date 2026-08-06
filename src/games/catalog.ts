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
] as const;

export type Game = (typeof games)[number];
