import { Sprite } from './Pixel'

export function Banner({ muted, onToggleMute }: { muted: boolean; onToggleMute: () => void }) {
  return (
    <header className="pixel-out relative flex items-center justify-between gap-2 bg-linear-to-b from-screen-400 to-screen-700 px-2 py-2 sm:gap-4 sm:px-4 sm:py-3">
      <Sprite
        src="/assets/sprites/hero-idle.png"
        className="anim-bob hidden h-10 w-auto shrink-0 sprite-shadow sm:block md:h-14"
      />

      <h1 className="font-pixel flex-1 text-center text-[11px] leading-[1.6] tracking-tight text-cream-100 text-pixel-shadow sm:text-base md:text-xl lg:text-2xl">
        OFFICE MOVES:
        <br className="sm:hidden" />
        <span className="sm:ml-3">DAILY DRILL</span>
      </h1>

      <Sprite
        src="/assets/sprites/hero-idle.png"
        className="anim-bob hidden h-10 w-auto shrink-0 -scale-x-100 sprite-shadow sm:block md:h-14"
        style={{ animationDelay: '0.8s' }}
      />

      <button
        type="button"
        onClick={onToggleMute}
        aria-pressed={muted}
        title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        className={`pixel-btn font-pixel absolute top-1.5 right-1.5 shrink-0 px-1.5 py-1.5 text-[7px] leading-none sm:static sm:px-2 sm:py-2 sm:text-[9px] ${
          muted ? '' : 'pixel-btn--green'
        }`}
      >
        <span aria-hidden="true">{muted ? 'SFX\u00A0OFF' : 'SFX\u00A0ON'}</span>
        <span className="sr-only">{muted ? 'Bật âm thanh' : 'Tắt âm thanh'}</span>
      </button>
    </header>
  )
}
