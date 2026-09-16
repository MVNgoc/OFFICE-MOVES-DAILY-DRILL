import type { StreakState } from '../types'
import { FrameAnimation, Section } from './Pixel'
import { MASCOT_FRAMES, MASCOT_SEQUENCE } from '../lib/exercises'

interface Props {
  streak: StreakState
  doneToday: boolean
  onMarkDone: () => void
}

export function StreakPanel({ streak, doneToday, onMarkDone }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <Section title="STREAK" icon={<span aria-hidden="true">💪</span>}>
        <div className="flex flex-col items-center py-1">
          <output className="font-pixel text-3xl leading-none text-ink sm:text-4xl">{streak.count}</output>
          <p className="font-vn mt-2 text-sm leading-none tracking-widest text-ink/70 sm:text-base">NGÀY</p>
          <p className="font-term mt-1.5 text-base leading-none text-ink/55">Tổng cộng: {streak.total} buổi</p>
        </div>
      </Section>

      {/* Mascot */}
      <div className="pixel-in relative flex min-h-[110px] flex-1 items-end justify-center overflow-hidden bg-linear-to-b from-screen-400 to-screen-700 p-2 sm:min-h-[150px]">
        {/* Floor line */}
        <div className="absolute inset-x-0 bottom-0 h-3 bg-wood-700" aria-hidden="true" />
        <FrameAnimation
          frames={MASCOT_FRAMES}
          sequence={MASCOT_SEQUENCE}
          alt="Nhân vật pixel đang giãn cơ"
          className="relative h-[124px] w-[70px] sprite-shadow"
        />
      </div>

      <button
        type="button"
        onClick={onMarkDone}
        disabled={doneToday}
        className={`pixel-btn font-vn px-2 py-3 text-sm leading-tight sm:text-base ${
          doneToday ? '' : 'pixel-btn--green'
        }`}
      >
        {doneToday ? '✓ ĐÃ TẬP HÔM NAY' : 'ĐÁNH DẤU ĐÃ TẬP'}
      </button>
    </div>
  )
}