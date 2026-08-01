import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./Dialog";

export function HelpDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>怎么玩</DialogTitle>
        <DialogDescription>根据每行和每列的数字，找出所有需要填黑的格子。</DialogDescription>
        <div className="help-list">
          <div><strong>数字</strong><p>表示连续黑格的长度。多个数字之间至少隔一个空格。</p></div>
          <div><strong>填格</strong><p>用左键或触控涂黑。拖动可以连续填写。</p></div>
          <div><strong>标空</strong><p>用右键或“标空”工具画叉，记录确定为空的位置。</p></div>
        </div>
        <p className="keyboard-note">键盘：方向键移动，F 填格，X 标空，E 擦除，空格应用工具。</p>
      </DialogContent>
    </Dialog>
  );
}

