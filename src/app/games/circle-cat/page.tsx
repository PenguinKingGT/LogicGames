import type { Metadata } from "next";
import App from "@/games/circle-cat/app/App";
import "@/games/circle-cat/styles/circle-cat.css";

export const metadata: Metadata = {
  title: "圈小猫",
  description: "封住小猫的去路，在它逃到边缘前把它圈住。",
};

export default function CircleCatPage() {
  return (
    <main className="game-route-shell">
      <App />
    </main>
  );
}

