import type { Metadata } from "next";
import App from "@/games/2048/app/App";
import "@/games/2048/styles/2048.css";

export const metadata: Metadata = {
  title: "数字方阵 2048",
  description: "滑动数字方块，合并相同数字，挑战 2048。",
};

export default function Game2048Page() {
  return <main className="game-route-shell"><App /></main>;
}
