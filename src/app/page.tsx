import { Shapes } from "@phosphor-icons/react/dist/ssr";
import { GameCard } from "@/components/site/GameCard";
import { games } from "@/games/catalog";

export default function Home() {
  return (
    <main className="home-page">
      <header className="home-nav">
        <span className="home-brand">
          <Shapes aria-hidden="true" weight="duotone" />
          PUZZLE HOUSE
        </span>
      </header>

      <section className="game-menu" aria-label="选择游戏">
        <h1 className="sr-only">选择游戏</h1>
        {games.map((game) => (
          <GameCard key={game.slug} game={game} />
        ))}
      </section>
    </main>
  );
}
