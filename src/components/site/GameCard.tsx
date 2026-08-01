import {
  ArrowUpRight,
  CirclesFour,
  GridNine,
  Hexagon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { Game } from "@/games/catalog";

export function GameCard({ game }: { game: Game }) {
  return (
    <Link
      className={`game-card game-card-${game.slug}`}
      href={game.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`在新标签页打开${game.title}`}
    >
      <div className="game-card-copy">
        <span className="game-card-name">{game.englishTitle}</span>
        <h2>{game.title}</h2>
        <span className="game-card-action">
          开始游戏
          <ArrowUpRight aria-hidden="true" weight="bold" />
        </span>
      </div>
      <div className="game-card-art" aria-hidden="true">
        <GameCardArt art={game.art} />
      </div>
    </Link>
  );
}

function GameCardArt({ art }: { art: Game["art"] }) {
  switch (art) {
    case "code":
      return (
        <>
          <CirclesFour className="game-card-main-icon" weight="fill" />
          <span className="mastermind-chip mastermind-chip-one" />
          <span className="mastermind-chip mastermind-chip-two" />
          <span className="mastermind-chip mastermind-chip-three" />
        </>
      );
    case "geometry":
      return (
        <>
          <Hexagon className="game-card-main-icon" weight="duotone" />
          <Hexagon className="polymine-hex polymine-hex-one" weight="fill" />
          <Hexagon className="polymine-hex polymine-hex-two" weight="fill" />
        </>
      );
    case "pixel":
      return (
        <>
          <GridNine className="game-card-main-icon" weight="duotone" />
          <span className="nonogram-pixel nonogram-pixel-one" />
          <span className="nonogram-pixel nonogram-pixel-two" />
          <span className="nonogram-pixel nonogram-pixel-three" />
        </>
      );
  }
}
