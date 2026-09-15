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
  children,
  className = '',
}: {
  title: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`flex flex-col ${className}`}>
      <header className="panel-wood flex items-center gap-2 px-2 py-1.5 sm:px-3 sm:py-2">
        {icon}
        <h2 className="font-vn text-sm leading-none tracking-wide text-cream-100 text-pixel-shadow-sm sm:text-base">
          {title}
        </h2>
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
