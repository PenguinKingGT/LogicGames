import { ColorToken } from "@/games/mastermind/components/game/ColorToken"
import { COLOR_IDS, COLOR_META } from "@/games/mastermind/game/config"
import type { ColorId } from "@/games/mastermind/game/types"

interface ColorPickerProps {
  disabled: boolean
  onPick: (color: ColorId) => void
}

export function ColorPicker({ disabled, onPick }: ColorPickerProps) {
  return (
    <div className="grid grid-cols-6 gap-1.5" aria-label="颜色选择">
      {COLOR_IDS.map((color) => {
        const meta = COLOR_META[color]
        return (
          <button
            key={color}
            type="button"
            className="color-choice"
            disabled={disabled}
            onClick={() => onPick(color)}
            aria-label={`选择${meta.name}色，编号 ${meta.number}`}
          >
            <ColorToken color={color} size="large" label />
          </button>
        )
      })}
    </div>
  )
}

