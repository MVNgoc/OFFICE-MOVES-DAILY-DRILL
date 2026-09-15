import { useEffect, useRef, useState } from 'react'

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * The bottom dialogue box. Types the current message out character by
 * character, RPG-style, then leaves a blinking caret behind.
 */
export function Terminal({ lines }: { lines: string[] }) {
  const text = lines.join('\n')

  const [shown, setShown] = useState(text)
  const [lastText, setLastText] = useState(text)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Restart the typewriter during render whenever the message changes.
  if (lastText !== text) {
    setLastText(text)
    setShown(prefersReducedMotion() ? text : '')
  }

  useEffect(() => {
    if (prefersReducedMotion()) return

    let index = 0
    const id = window.setInterval(() => {
      index += 2
      setShown(text.slice(0, index))
      if (index >= text.length) window.clearInterval(id)
    }, 16)

    return () => window.clearInterval(id)
  }, [text])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [shown])

  return (
    <div className="panel-cream relative flex min-h-[86px] flex-col px-2.5 py-2 sm:min-h-[104px] sm:px-3">
      <div ref={scrollRef} className="no-scrollbar flex-1 overflow-y-auto" aria-live="polite" aria-atomic="true">
        <p className="font-term text-base leading-snug whitespace-pre-line text-ink sm:text-xl">{shown}</p>
      </div>
      <p className="font-term mt-0.5 text-base leading-none text-ink/70 sm:text-xl">
        {'>'}
        <span className="anim-caret ml-0.5 inline-block h-[0.85em] w-[0.5em] translate-y-[0.1em] bg-ink" />
      </p>
      <span className="font-term absolute right-2 bottom-1 text-sm leading-none text-ink/40" aria-hidden="true">
        ▼
      </span>
    </div>
  )
}
