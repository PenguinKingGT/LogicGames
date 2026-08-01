"use client";

import dynamic from "next/dynamic";

const PolyMineRuntime = dynamic(() => import("./PolyMineRuntime"), {
  ssr: false,
  loading: () => (
    <div className="polymine-loading" role="status">
      <span />
      <p>正在准备棋盘</p>
    </div>
  ),
});

export default function PolyMineClient() {
  return <PolyMineRuntime />;
}
