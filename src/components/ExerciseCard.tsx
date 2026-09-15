import type { Exercise } from '../types'
import { AREA_LABEL, DIFFICULTY_LABEL, exerciseFrames, formatAmount, pickDuration } from '../lib/exercises'
import type { TimeBudget } from '../types'
import { FrameAnimation, Stars } from './Pixel'
import { InfoTip } from './InfoTip'
import { Timer } from './Timer'
import { sfx } from '../lib/audio'

interface Props {
  exercise: Exercise
  time: TimeBudget
  amount: number
  onAmountChange: (amount: number) => void
  onFinish: (seconds: number, lastSide: boolean) => void
}

export function ExerciseCard({ exercise, time, amount, onAmountChange, onFinish }: Props) {
  const suggested = pickDuration(exercise, time)

  return (
    <div className="anim-pop flex flex-col gap-2.5">
      {/* ---------- Title row ---------- */}
      <div className="panel-cream flex items-center gap-2 px-2 py-2 sm:gap-3 sm:px-3">
        <span className="pixel-in flex h-16 w-16 shrink-0 items-center justify-center bg-screen-500 p-1 sm:h-20 sm:w-20">
          <FrameAnimation
            frames={exerciseFrames(exercise)}
            alt={`Minh hoạ động tác ${exercise.name}`}
            className="h-full w-full sprite-shadow"
          />
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
        {/* A <p> cannot legally wrap the popover's block content. */}
        <div className="flex items-center">
          <span className="font-vn text-xs leading-none tracking-widest text-ink/50 sm:text-sm">
            KHỐI LƯỢNG {exercise.unit === 'seconds' ? '(GIÂY)' : '(SỐ LẦN)'}
            {exercise.perSide && ' · MỖI BÊN'}
          </span>
          <InfoTip label="Khối lượng nghĩa là gì?">
            <p className="font-vn text-xs leading-none tracking-widest text-ink/60 sm:text-sm">
              KHỐI LƯỢNG LÀ GÌ?
            </p>
            <p className="font-term mt-1.5 text-base leading-snug text-ink sm:text-lg">
              Là lượng vận động cho <b>một lần quay</b>.{' '}
              {exercise.unit === 'reps'
                ? 'Số lần là số cái cần làm — đồng hồ tính 3 giây mỗi cái để bạn giữ nhịp.'
                : exercise.timedAs === 'moving'
                  ? 'Số giây là thời gian lặp động tác — cứ làm đều cho tới khi hết giờ.'
                  : 'Số giây là thời gian giữ yên tư thế.'}
              {exercise.perSide && ' Con số này tính cho mỗi bên, đồng hồ sẽ tự chạy đủ hai bên.'}
            </p>
            <p className="font-term mt-2 border-t-2 border-dashed border-ink/20 pt-1.5 text-base leading-snug text-ink/75 sm:text-lg">
              Huy hiệu <span className="bg-retro-gold px-1 text-ink">GỢI Ý</span> nằm ở mức hợp với
              buổi tập bạn chọn. Buổi càng dài thì mỗi bài càng nặng:
            </p>
            <ul className="font-term mt-1 text-base leading-snug text-ink/75 sm:text-lg">
              <li>· 3 phút — set ngắn, giải lao nhanh giữa giờ</li>
              <li>· 5 phút — set vừa</li>
              <li>· 10 phút — set dài, buổi tập ra trò</li>
            </ul>
            <p className="font-term mt-2 text-sm leading-snug text-ink/55 sm:text-base">
              Bạn vẫn chọn mức khác được — app luôn theo bạn.
            </p>
          </InfoTip>
        </div>
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
                  title={`Mức phù hợp với buổi tập ${time} phút`}
                >
                  GỢI Ý
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
