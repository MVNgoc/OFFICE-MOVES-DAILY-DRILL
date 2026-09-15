import type { Exercise, TimeBudget } from '../types'
import { AREA_LABEL, ICON_SRC } from '../lib/exercises'
import { ExerciseCard } from './ExerciseCard'
import { Sprite, Stars } from './Pixel'

interface Props {
  spinning: boolean
  reelItem: Exercise | null
  result: Exercise | null
  poolSize: number
  time: TimeBudget
  amount: number
  onAmountChange: (amount: number) => void
  onSpin: () => void
  onFinish: () => void
}

export function Generator({
  spinning,
  reelItem,
  result,
  poolSize,
  time,
  amount,
  onAmountChange,
  onSpin,
  onFinish,
}: Props) {
  const empty = poolSize === 0

  return (
    <div className="flex flex-col gap-2.5">
      {/* ---------- GENERATOR title bar ---------- */}
      <div className="panel-wood px-3 py-1.5 text-center">
        <h2 className="font-pixel text-[9px] leading-none tracking-widest text-cream-100 text-pixel-shadow-sm sm:text-[11px]">
          GENERATOR
        </h2>
      </div>

      {/* ---------- SPIN button ---------- */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={onSpin}
          disabled={spinning || empty}
          aria-label={spinning ? 'Đang quay' : 'Quay chọn bài tập ngẫu nhiên'}
          className="group relative block transition-transform duration-75 ease-out not-disabled:hover:scale-105 not-disabled:active:translate-y-1 not-disabled:active:scale-95 disabled:cursor-not-allowed"
        >
          <Sprite
            src="/assets/sprites/spin-button.png"
            className={`h-auto w-[170px] sm:w-[210px] ${
              spinning ? 'brightness-75 grayscale-[0.5]' : empty ? 'opacity-50 grayscale' : 'anim-glow'
            }`}
            style={{ filter: 'drop-shadow(4px 5px 0 rgb(0 0 0 / 0.45))' }}
          />
        </button>

        {/* Pointer arrow, like the mockup */}
        <Sprite
          src="/assets/sprites/arrow-down.png"
          className={`-mt-1 h-7 w-auto sprite-shadow sm:h-9 ${spinning ? 'opacity-30' : 'anim-arrow'}`}
        />
      </div>

      {/* ---------- Display: preview / reel / exercise card ---------- */}
      {result && !spinning ? (
        <ExerciseCard
          exercise={result}
          time={time}
          amount={amount}
          onAmountChange={onAmountChange}
          onFinish={onFinish}
        />
      ) : (
        <div className="panel-cream flex min-h-[190px] flex-col sm:min-h-[230px]">
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-3 py-4 text-center">
            {spinning && reelItem ? (
              <>
                <span className="flex h-14 w-20 items-center justify-center sm:h-16 sm:w-24">
                  <Sprite
                    src={ICON_SRC[reelItem.icon]}
                    className="anim-reel h-full w-full object-contain sprite-shadow"
                  />
                </span>
                <p className="font-vn anim-reel text-base leading-[1.4] text-ink sm:text-lg">{reelItem.name}</p>
                <div className="flex items-center gap-2">
                  <span className="font-term bg-screen-500 px-1.5 text-sm text-cream-100 sm:text-base">
                    {AREA_LABEL[reelItem.category]}
                  </span>
                  <Stars value={reelItem.difficulty} size={14} />
                </div>
              </>
            ) : empty ? (
              <>
                <p className="font-vn text-base leading-[1.5] text-retro-red sm:text-lg">KHÔNG CÓ BÀI TẬP</p>
                <p className="font-term text-lg leading-snug text-ink/70 sm:text-xl">
                  Bộ lọc hiện tại không khớp bài nào.
                  <br />
                  Hãy nới độ khó hoặc bỏ bớt khu vực.
                </p>
              </>
            ) : (
              <>
                <Sprite src="/assets/sprites/character.png" className="anim-sway h-16 w-auto sprite-shadow sm:h-20" />
                <p className="font-pixel text-[10px] leading-[1.8] text-ink sm:text-xs">EXERCISE PREVIEW</p>
                <p className="font-vn text-base leading-none text-ink/80 sm:text-lg">XEM TRƯỚC BÀI TẬP</p>
              </>
            )}
          </div>

          <div className="bg-wood-700 px-3 py-1.5 text-center" style={{ boxShadow: 'inset 0 3px 0 0 var(--color-ink)' }}>
            <p
              className={`${
                spinning || empty ? 'font-vn text-sm sm:text-base' : 'font-pixel text-[8px] sm:text-[9px]'
              } leading-none tracking-wider text-cream-300`}
            >
              {spinning ? 'ĐANG QUAY...' : empty ? 'ĐIỀU CHỈNH BỘ LỌC' : 'PRESS TO SPIN'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
