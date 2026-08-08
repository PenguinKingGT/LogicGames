import type { GameState } from "../app/game-reducer";
import { otherPlayer } from "../domain/engine";

export function MatchStatus({ state }: { readonly state: GameState }) {
  const aiPlayer = otherPlayer(state.humanPlayer);
  const status = getStatus(state);
  return (
    <aside className="connect-four-status">
      <span>MATCH STATUS</span>
      <h2>{status}</h2>
      <div className="connect-four-player-row">
        <i data-player={state.humanPlayer} />
        <span>你 · {state.humanPlayer === "red" ? "红" : "黄"}</span>
      </div>
      <div className="connect-four-player-row">
        <i data-player={aiPlayer} />
        <span>电脑 · {aiPlayer === "red" ? "红" : "黄"}</span>
      </div>
      <p>纵向、横向或斜向率先连成四枚棋子即可获胜。</p>
    </aside>
  );
}

function getStatus(state: GameState): string {
  if (state.phase === "ai-thinking") return "电脑正在思考";
  if (state.phase === "dropping-ai") return "电脑正在落子";
  if (state.phase === "dropping-human") return "棋子落下";
  if (state.phase === "finished") {
    if (state.result === "draw") return "本局平局";
    return state.result === state.humanPlayer ? "你获胜" : "电脑获胜";
  }
  return state.fallbackUsed ? "电脑已改用快速落子" : "轮到你落子";
}
