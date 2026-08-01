import { ArrowUpRight, CirclesFour, Hexagon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { Game } from "@/games/catalog";

export function GameCard({ game }: { game: Game }) {
  const isMasterMind = game.slug === "mastermind";

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
        {isMasterMind ? (
          <>
            <CirclesFour className="game-card-main-icon" weight="fill" />
            <span className="mastermind-chip mastermind-chip-one" />
            <span className="mastermind-chip mastermind-chip-two" />
            <span className="mastermind-chip mastermind-chip-three" />
          </>
        ) : (
          <>
            <Hexagon className="game-card-main-icon" weight="duotone" />
            <Hexagon className="polymine-hex polymine-hex-one" weight="fill" />
            <Hexagon className="polymine-hex polymine-hex-two" weight="fill" />
          </>
        )}
      </div>
    </Link>
  );
}
