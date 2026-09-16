import { FrameAnimation } from './Pixel'
import { HERO_FRAMES } from '../lib/exercises'

interface Props {
  muted: boolean
  onToggleMute: () => void
  /** Replays the guided tour. */
  onStartTour: () => void
}

export function Banner({ muted, onToggleMute, onStartTour }: Props) {
  return (
    <header className="pixel-out relative flex items-center justify-between gap-2 bg-linear-to-b from-screen-400 to-screen-700 px-2 py-2 sm:gap-4 sm:px-4 sm:py-3">
      <FrameAnimation
        frames={HERO_FRAMES}
        className="hidden h-[59px] w-[48px] shrink-0 sprite-shadow sm:block"
      />

      <h1 className="font-pixel flex-1 text-center text-[11px] leading-[1.6] tracking-tight text-cream-100 text-pixel-shadow sm:text-base md:text-xl lg:text-2xl">
        OFFICE MOVES:
        <br className="sm:hidden" />
        <span className="sm:ml-3">DAILY DRILL</span>
      </h1>

      <FrameAnimation
        frames={HERO_FRAMES}
        frameMs={640}
        className="hidden h-[59px] w-[48px] shrink-0 -scale-x-100 sprite-shadow sm:block"
      />

      {/* Utility buttons. They float over the banner on phones, where there is
          no room for them in the flow, and sit beside the title from sm up. */}
      <div
        data-tour="help"
        className="absolute top-1.5 right-1.5 flex shrink-0 items-center gap-1.5 sm:static"
      >
        <button
          type="button"
          onClick={onStartTour}
          title="Xem hướng dẫn sử dụng"
          className="pixel-btn font-pixel px-1.5 py-1.5 text-[7px] leading-none sm:px-2 sm:py-2 sm:text-[9px]"
        >
          <span aria-hidden="true">?</span>
          <span className="sr-only">Xem hướng dẫn sử dụng</span>
        </button>

        <button
          type="button"
          onClick={onToggleMute}
          aria-pressed={muted}
          title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          className={`pixel-btn font-pixel px-1.5 py-1.5 text-[7px] leading-none sm:px-2 sm:py-2 sm:text-[9px] ${
            muted ? '' : 'pixel-btn--green'
          }`}
        >
          <span aria-hidden="true">{muted ? 'SFX\u00A0OFF' : 'SFX\u00A0ON'}</span>
          <span className="sr-only">{muted ? 'Bật âm thanh' : 'Tắt âm thanh'}</span>
        </button>
      </div>
    </header>
  )
}
