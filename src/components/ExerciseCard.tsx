import type { Exercise } from '../types'
import { AREA_LABEL, DIFFICULTY_LABEL, ICON_SRC, formatAmount, pickDuration } from '../lib/exercises'
import type { TimeBudget } from '../types'
import { Sprite, Stars } from './Pixel'
import { Timer } from './Timer'
import { sfx } from '../lib/audio'

interface Props {
  exercise: Exercise
  time: TimeBudget
  amount: number
  onAmountChange: (amount: number) => void
  onFinish: () => void
}

export function ExerciseCard({ exercise, time, amount, onAmountChange, onFinish }: Props) {
  const suggested = pickDuration(exercise, time)

  return (
    <div className="anim-pop flex flex-col gap-2.5">
      {/* ---------- Title row ---------- */}
      <div className="panel-cream flex items-center gap-2 px-2 py-2 sm:gap-3 sm:px-3">
        <span className="pixel-in flex h-12 w-12 shrink-0 items-center justify-center bg-screen-500 p-1 sm:h-14 sm:w-14">
          <Sprite src={ICON_SRC[exercise.icon]} className="h-full w-full object-contain sprite-shadow" />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="font-vn truncate text-xl leading-tight text-ink sm:text-2xl" title={exercise.name}>
            {exercise.name}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-term bg-screen-500 px-1.5 text-sm leading-tight text-cream-100 sm:text-base">
              {AREA_LABEL[exercise.category]}
            </span>
            <Stars value={exercise.difficulty} size={14} />
            <span className="font-term text-sm leading-tight text-ink/60 sm:text-base">
              {DIFFICULTY_LABEL[exercise.difficulty]}
            </span>
          </div>
        </div>
      </div>

      {/* ---------- Instructions ---------- */}
      <div className="panel-cream px-2.5 py-2 sm:px-3">
        <p className="font-vn text-xs leading-none tracking-widest text-ink/50 sm:text-sm">CÁCH TẬP</p>
        <p className="font-term mt-1.5 text-lg leading-snug text-ink sm:text-xl">{exercise.description}</p>
        <p className="font-term mt-2 border-t-2 border-dashed border-ink/20 pt-1.5 text-base leading-snug text-ink/70 sm:text-lg">
          <span aria-hidden="true">💡 </span>
          {exercise.tips}
        </p>
      </div>

      {/* ---------- Amount selector ---------- */}
      <div className="panel-cream px-2.5 py-2 sm:px-3">
        <p className="font-vn text-xs leading-none tracking-widest text-ink/50 sm:text-sm">
          KHỐI LƯỢNG {exercise.unit === 'seconds' ? '(GIÂY)' : '(SỐ LẦN)'}
        </p>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {exercise.durationOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                sfx.click()
                onAmountChange(option)
              }}
              data-active={amount === option}
              aria-pressed={amount === option}
              className="pixel-btn font-vn relative px-1 py-2 text-sm leading-none sm:text-base"
            >
              {formatAmount(exercise, option)}
              {option === suggested && (
                <span
                  className="font-term absolute -top-2.5 right-0 bg-retro-gold px-1 text-xs leading-tight text-ink"
                  style={{ boxShadow: '0 0 0 2px var(--color-ink)' }}
                >
                  {time}m
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ---------- Countdown ---------- */}
      <Timer key={`${exercise.id}:${amount}`} exercise={exercise} amount={amount} onFinish={onFinish} />
    </div>
  )
}
