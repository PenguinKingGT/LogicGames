import type { Metadata } from "next";
import App from "@/games/connect-four/app/App";
import "@/games/connect-four/styles/connect-four.css";

export const metadata: Metadata = {
  title: "四子棋",
  description: "选择先后手和难度，与电脑进行一局经典四子棋对战。",
};

export default function ConnectFourPage() {
  return (
    <main className="game-route-shell">
      <App />
    </main>
  );
}
