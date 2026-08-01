import type { Metadata } from "next";
import PolyMineClient from "@/games/polymine/app/PolyMineClient";
import "@/games/polymine/styles/globals.css";

export const metadata: Metadata = {
  title: "PolyMine 多边形扫雷",
  description: "在三种几何棋盘上推理排雷。",
};

export default function PolyMinePage() {
  return (
    <main className="game-route-shell">
      <PolyMineClient />
    </main>
  );
}
