import { ArrowCounterClockwise, ArrowUUpLeft, Question, SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";

interface Props {
  readonly score: number; readonly bestScore: number; readonly canUndo: boolean; readonly soundEnabled: boolean;
  readonly onUndo: () => void; readonly onRestart: () => void; readonly onSound: () => void; readonly onHelp: () => void;
}
export function GameHeader(props: Props) {
  return <header className="g2048-header">
    <div className="g2048-title"><span>NUMBER TRAY · 04×04</span><h1>数字方阵</h1></div>
    <div className="g2048-score"><span>当前分数<strong>{props.score}</strong></span><span>最高分<strong>{props.bestScore}</strong></span></div>
    <div className="g2048-tools">
      <button type="button" onClick={props.onUndo} disabled={!props.canUndo} aria-label="撤销上一步"><ArrowUUpLeft /></button>
      <button type="button" onClick={props.onRestart} aria-label="重新开局"><ArrowCounterClockwise /></button>
      <button type="button" onClick={props.onSound} aria-label={props.soundEnabled ? "关闭音效" : "开启音效"}>{props.soundEnabled ? <SpeakerHigh /> : <SpeakerSlash />}</button>
      <button type="button" onClick={props.onHelp} aria-label="查看玩法"><Question /></button>
    </div>
  </header>;
}
