import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./Dialog";

export function HelpDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>怎么玩</DialogTitle>
        <DialogDescription>点一个圆点封路，小猫随后走一格。</DialogDescription>
        <div className="circle-cat-help-list">
          <div><strong>封路</strong><p>绿色圆点可以点击，变成黄色路障后不能撤回。</p></div>
          <div><strong>圈住</strong><p>让小猫找不到通往边缘的路线就获胜。</p></div>
          <div><strong>别放跑</strong><p>小猫一旦走到棋盘边缘，本局结束。</p></div>
        </div>
        <p className="circle-cat-keyboard-note">键盘可用方向键选格，按空格或回车封路。</p>
      </DialogContent>
    </Dialog>
  );
}

