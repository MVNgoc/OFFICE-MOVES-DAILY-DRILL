import type { TimeBudget } from '../types'
import { formatClock } from '../hooks/useTimer'
import { sfx } from '../lib/audio'

interface Props {
  budget: TimeBudget
  count: number
  remaining: number
  progress: number
  done: boolean
  onReset: () => void
}

/**
 * Progress toward the chosen session length. This is what makes the THỜI GIAN
 * filter mean what it says: one spin is one exercise, and the bar fills until
 * the whole budget is worked through.
 */
export function SessionBar({ budget, count, remaining, progress, done, onReset }: Props) {
  return (
    <div className="panel-cream px-2.5 py-1.5 sm:px-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-vn text-xs leading-none tracking-wide text-ink/60 sm:text-sm">
          BUỔI {budget} PHÚT · {count} BÀI XONG
        </p>
        <button
          type="button"
          onClick={() => {
            sfx.click()
            onReset()
          }}
          className="font-term text-sm leading-none text-ink/50 underline decoration-dotted underline-offset-2 hover:text-ink sm:text-base"
        >
          làm mới
        </button>
      </div>

      <div className="pixel-in relative mt-1.5 h-3 overflow-hidden bg-screen-900 sm:h-4">
        <div
          className={`absolute inset-y-0 left-0 transition-[width] duration-300 ${
            done ? 'bg-retro-gold' : 'bg-retro-green-500'
          }`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <p
        className={`font-term mt-1 text-base leading-none sm:text-lg ${done ? 'text-retro-green-700' : 'text-ink/70'}`}
        aria-live="polite"
      >
        {done ? '★ Hoàn thành buổi tập! Nhớ đánh dấu streak.' : `Còn ${formatClock(remaining)} — nhấn [SPIN] để tập tiếp`}
      </p>
    </div>
  )
}
