import type { Metadata } from "next";
import App from "@/games/maze/app/App";
import "@/games/maze/styles/maze.css";

export const metadata: Metadata = {
  title: "迷宫",
  description: "在随机生成的完整迷宫中寻找出口。",
};

export default function MazePage() {
  return (
    <main className="game-route-shell">
      <App />
    </main>
  );
}
