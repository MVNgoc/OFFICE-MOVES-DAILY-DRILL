import type { Exercise } from '../types'
import { formatClock, useTimer } from '../hooks/useTimer'
import { timerSeconds } from '../lib/exercises'

interface Props {
  exercise: Exercise
  amount: number
  onFinish: () => void
}

export function Timer({ exercise, amount, onFinish }: Props) {
  const total = timerSeconds(exercise, amount)
  const { remaining, running, finished, progress, toggle, reset } = useTimer(total, { onFinish })

  const urgent = remaining > 0 && remaining <= 5

  return (
    <div className="flex flex-col gap-2">
      {/* Clock readout */}
      <div
        className={`pixel-in relative overflow-hidden bg-screen-900 px-3 py-2 text-center ${
          urgent ? 'anim-shake' : ''
        }`}
      >
        {/* Progress fill behind the digits */}
        <div
          className="absolute inset-y-0 left-0 bg-retro-green-700/45 transition-[width] duration-100 ease-linear"
          style={{ width: `${Math.min(100, progress * 100)}%` }}
          aria-hidden="true"
        />
        <output
          aria-live="off"
          className={`font-pixel relative text-xl leading-none tracking-wider sm:text-3xl ${
            finished ? 'text-retro-gold' : urgent ? 'text-retro-red' : 'text-cream-100'
          }`}
        >
          {formatClock(remaining)}
        </output>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={toggle}
          disabled={finished}
          className={`pixel-btn font-vn px-2 py-2.5 text-sm leading-none sm:text-base ${
            running ? 'pixel-btn--red' : 'pixel-btn--green'
          }`}
        >
          {running ? '❚❚ TẠM DỪNG' : finished ? '✓ XONG' : '▶ BẮT ĐẦU'}
        </button>
        <button
          type="button"
          onClick={reset}
          className="pixel-btn font-vn px-2 py-2.5 text-sm leading-none sm:text-base"
        >
          ↻ LÀM LẠI
        </button>
      </div>
    </div>
  )
}
