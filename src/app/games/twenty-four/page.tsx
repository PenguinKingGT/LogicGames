import type { Metadata } from "next";
import App from "@/games/twenty-four/app/App";
import "@/games/twenty-four/styles/twenty-four.css";

export const metadata: Metadata = {
  title: "24 点",
  description: "使用四则运算，把四个数字精确计算成 24。",
};

export default function TwentyFourPage() {
  return (
    <main className="game-route-shell">
      <App />
    </main>
  );
}
