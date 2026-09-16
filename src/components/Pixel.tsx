import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

/** A pixel-art image scaled by an integer factor so it never blurs. */
export function Sprite({
  src,
  alt = '',
  scale,
  className = '',
  style,
}: {
  src: string
  alt?: string
  /** Integer upscale factor applied to the sprite's natural size. */
  scale?: number
  className?: string
  style?: CSSProperties
}) {
  return (
    <img
      src={src}
      alt={alt}
      aria-hidden={alt === '' || undefined}
      draggable={false}
      className={`select-none ${className}`}
      style={{
        imageRendering: 'pixelated',
        ...(scale ? { transform: `scale(${scale})`, transformOrigin: 'center' } : null),
        ...style,
      }}
    />
  )
}

/** Wood-framed sidebar section with a title bar, matching the mockup. */
export function Section({
  title,
  icon,
  info,
  children,
  className = '',
  dataTour,
}: {
  title: string
  icon?: ReactNode
  /** Optional explainer rendered beside the title. */
  info?: ReactNode
  children: ReactNode
  className?: string
  /** Marks this section as a stop on the guided tour. */
  dataTour?: string
}) {
  return (
    <section className={`flex flex-col ${className}`} data-tour={dataTour}>
      <header className="panel-wood flex items-center gap-2 px-2 py-1.5 sm:px-3 sm:py-2">
        {icon}
        <h2 className="font-vn text-sm leading-none tracking-wide text-cream-100 text-pixel-shadow-sm sm:text-base">
          {title}
        </h2>
        {info}
      </header>
      <div className="panel-cream mt-1 flex-1 px-2 py-2 sm:px-3 sm:py-3">{children}</div>
    </section>
  )
}

/** Difficulty stars, drawn from the extracted star sprites. */
export function Stars({
  value,
  max = 3,
  size = 20,
  className = '',
}: {
  value: number
  max?: number
  size?: number
  className?: string
}) {
  return (
    <div className={`flex items-center gap-1 ${className}`} role="img" aria-label={`Độ khó ${value} trên ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <img
          key={i}
          src={i < value ? '/assets/sprites/star-full.png' : '/assets/sprites/star-empty.png'}
          alt=""
          draggable={false}
          style={{ width: size, height: size, imageRendering: 'pixelated' }}
          className="select-none"
        />
      ))}
    </div>
  )
}

/** How long each animation frame is held, in milliseconds. */
const FRAME_MS = 520

/**
 * Cycles a list of pixel-art frames. Every frame is rendered and only its
 * visibility is toggled, so later frames are already decoded when the first
 * swap happens — otherwise the sprite blinks on its first cycle.
 *
 * `sequence` indexes into `frames`, which lets a three-frame sprite play
 * neutral → left → neutral → right from only three images.
 */
export function FrameAnimation({
  frames,
  sequence,
  alt = '',
  playing = true,
  frameMs = FRAME_MS,
  className = '',
}: {
  frames: readonly string[]
  sequence?: readonly number[]
  alt?: string
  playing?: boolean
  frameMs?: number
  className?: string
}) {
  const steps = sequence ?? frames.map((_, i) => i)
  const stepCount = steps.length
  const firstFrame = frames[0]
  const [step, setStep] = useState(0)
  const [lastKey, setLastKey] = useState(firstFrame)

  // A different sprite restarts the loop from its rest position.
  if (lastKey !== firstFrame) {
    setLastKey(firstFrame)
    setStep(0)
  }

  useEffect(() => {
    if (!playing || stepCount < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const id = window.setInterval(() => setStep((s) => (s + 1) % stepCount), frameMs)
    return () => window.clearInterval(id)
  }, [playing, frameMs, stepCount, firstFrame])

  const shown = playing ? steps[step] : steps[0]

  return (
    <span className={`relative block ${className}`} role={alt ? 'img' : undefined} aria-label={alt || undefined}>
      {frames.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden="true"
          draggable={false}
          hidden={i !== shown}
          className="absolute inset-0 h-full w-full object-contain select-none"
          style={{ imageRendering: 'pixelated' }}
        />
      ))}
    </span>
  )
}
