import type { Difficulty } from "../ai/search";
import type { DiscCounts, Player } from "../domain/types";
import type { Stats } from "../persistence/storage";

const DIFFICULTY_LABELS: Readonly<Record<Difficulty, string>> = {
  easy: "简单",
  normal: "标准",
  hard: "困难",
};

interface MatchLedgerProps {
  readonly status: string;
  readonly currentPlayer: Player | null;
  readonly counts: DiscCounts;
  readonly difficulty: Difficulty;
  readonly stats: Stats;
  readonly fallbackUsed: boolean;
}

export function MatchLedger({
  status,
  currentPlayer,
  counts,
  difficulty,
  stats,
  fallbackUsed,
}: MatchLedgerProps) {
  return (
    <aside className="othello-ledger">
      <span className="othello-kicker">MATCH STATUS</span>
      <div className="othello-turn">
        <i className={currentPlayer ?? "black"} />
        <strong>{status}</strong>
      </div>

      <div className="othello-counts">
        <span>
          <i className="black" />你 · 黑<strong>{counts.black}</strong>
        </span>
        <span>
          <i className="white" />
          电脑 · 白<strong>{counts.white}</strong>
        </span>
      </div>

      <div className="othello-record">
        <span>{DIFFICULTY_LABELS[difficulty]}战绩</span>
        <strong>
          {stats.wins} 胜 · {stats.losses} 负 · {stats.draws} 平
        </strong>
      </div>

      {fallbackUsed ? <p>电脑已改用快速落子</p> : null}
    </aside>
  );
}
