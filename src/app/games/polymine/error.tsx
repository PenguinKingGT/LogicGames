"use client";

import Link from "next/link";

export default function PolyMineError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="game-error" role="alert">
      <p>棋盘没有准备好</p>
      <h1>加载 PolyMine 时遇到问题</h1>
      <div>
        <button type="button" onClick={reset}>重新加载</button>
        <Link href="/">返回游戏菜单</Link>
      </div>
    </main>
  );
}
