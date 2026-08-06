import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "./Dialog";

export function HelpDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent>
    <span className="g2048-dialog-kicker">玩法</span><DialogTitle>合成 2048</DialogTitle>
    <DialogDescription>使用方向键、WASD 或在棋盘上滑动。相同数字相遇时会合并；每次有效移动后会出现一个新数字。</DialogDescription>
    <div className="g2048-dialog-actions"><DialogClose>知道了</DialogClose></div>
  </DialogContent></Dialog>;
}

export function ResultDialog({ phase, score, bestScore, onContinue, onRestart }: { phase: "won" | "lost" | null; score: number; bestScore: number; onContinue: () => void; onRestart: () => void }) {
  return <Dialog open={phase !== null}><DialogContent hideClose>
    <span className="g2048-dialog-kicker">{phase === "won" ? "MILESTONE" : "NO MOVES LEFT"}</span>
    <DialogTitle>{phase === "won" ? "合成 2048！" : "棋盘已满"}</DialogTitle>
    <DialogDescription>本局 {score} 分 · 最高 {bestScore} 分</DialogDescription>
    <div className="g2048-dialog-actions">
      {phase === "won" ? <button type="button" onClick={onContinue}>继续挑战</button> : null}
      <button type="button" className="secondary" onClick={onRestart}>{phase === "won" ? "重新开局" : "再来一局"}</button>
    </div>
  </DialogContent></Dialog>;
}

export function RestartDialog({ open, onCancel, onConfirm }: { open: boolean; onCancel: () => void; onConfirm: () => void }) {
  return <Dialog open={open} onOpenChange={(next) => { if (!next) onCancel(); }}><DialogContent hideClose>
    <DialogTitle>重新开局？</DialogTitle><DialogDescription>当前棋盘和分数会被清除，最高分会保留。</DialogDescription>
    <div className="g2048-dialog-actions"><button type="button" className="secondary" onClick={onCancel}>继续游戏</button><button type="button" onClick={onConfirm}>重新开局</button></div>
  </DialogContent></Dialog>;
}
