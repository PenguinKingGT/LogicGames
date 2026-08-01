import type { Metadata } from "next";
import App from "@/games/nonogram/app/App";
import "@/games/nonogram/styles/nonogram.css";

export const metadata: Metadata = {
  title: "数织",
  description: "根据行列数字线索，还原隐藏在方格中的图案。",
};

export default function NonogramPage() {
  return (
    <main className="game-route-shell">
      <App />
    </main>
  );
}
