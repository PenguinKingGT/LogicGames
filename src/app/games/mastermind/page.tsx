import type { Metadata } from "next";
import App from "@/games/mastermind/app/App";
import "@/games/mastermind/index.css";

export const metadata: Metadata = {
  title: "彩码谜局",
  description: "用颜色与位置反馈破解四位密码。",
};

export default function MasterMindPage() {
  return (
    <main className="game-route-shell">
      <App />
    </main>
  );
}
