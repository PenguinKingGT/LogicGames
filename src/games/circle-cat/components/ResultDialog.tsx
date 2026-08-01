import { ArrowClockwise, Smiley, SmileySad } from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./Dialog";

export function ResultDialog({
  result,
  moves,
  onReplay,
}: {
  result: "won" | "lost" | null;
  moves: number;
  onReplay: () => void;
}) {
  const won = result === "won";
  return (
    <Dialog open={result !== null}>
      <DialogContent
        className={`circle-cat-result ${won ? "is-win" : "is-loss"}`}
        hideClose
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <span className="circle-cat-result-icon" aria-hidden="true">
          {won ? <Smiley weight="duotone" /> : <SmileySad weight="duotone" />}
        </span>
        <DialogTitle>{won ? "圈住啦！" : "小猫跑掉了"}</DialogTitle>
        <DialogDescription>
          {won ? `你用了 ${moves} 步封住所有出口。` : `坚持了 ${moves} 步，再试一次吧。`}
        </DialogDescription>
        <button type="button" className="circle-cat-primary-button" onClick={onReplay}>
          <ArrowClockwise weight="bold" />
          再来一局
        </button>
      </DialogContent>
    </Dialog>
  );
}

