import type { Metadata } from "next";
import App from "@/games/othello/app/App";
import "@/games/othello/styles/othello.css";
export const metadata: Metadata = {
  title: "黑白棋",
  description: "执黑先行，与电脑进行一局经典黑白棋对战。",
};
export default function OthelloPage() {
  return (
    <main className="game-route-shell">
      <App />
    </main>
  );
}
