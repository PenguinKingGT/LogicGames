import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <p>这里没有游戏</p>
      <h1>页面走丢了</h1>
      <Link href="/">返回游戏菜单</Link>
    </main>
  );
}
