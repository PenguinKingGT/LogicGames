export const games = [
  {
    slug: "mastermind",
    title: "彩码谜局",
    englishTitle: "MasterMind",
    href: "/games/mastermind",
  },
  {
    slug: "polymine",
    title: "多边形扫雷",
    englishTitle: "PolyMine",
    href: "/games/polymine",
  },
] as const;

export type Game = (typeof games)[number];
