import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { sfx } from '../lib/audio'

/** Gap kept between the popover and the edge of the viewport. */
const MARGIN = 8

/**
 * A "?" badge with a short explanation. It opens on hover and on focus, and a
 * click pins it open — pointer devices get it instantly, touch devices (which
 * never hover) still work, and keyboard users reach it by tabbing.
 *
 * The panel flips above the badge when there is not enough room below, and
 * slides sideways when it would run past an edge, so it never lands off-screen
 * and never makes the reader scroll to it.
 */
export function InfoTip({ label, children }: { label: string; children: ReactNode }) {
  const [hovered, setHovered] = useState(false)
  const [pinned, setPinned] = useState(false)
  const open = hovered || pinned

  const wrapRef = useRef<HTMLSpanElement>(null)
  const popRef = useRef<HTMLDivElement>(null)
  const id = useId()

  const close = useCallback(() => {
    setHovered(false)
    setPinned(false)
  }, [])

  useEffect(() => {
    if (!pinned) return

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) close()
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [pinned, close])

  /**
   * Place the panel against the viewport. Centring is done here rather than with
   * a utility class: Tailwind v4 writes the separate `translate` property, which
   * would compose with a `transform` written here and double the shift.
   */
  useLayoutEffect(() => {
    const el = popRef.current
    const anchor = wrapRef.current
    if (!open || !el || !anchor) return

    // Start from the default placement: centred, below the badge.
    el.style.transform = 'translateX(-50%)'
    el.style.top = '100%'
    el.style.bottom = 'auto'

    const anchorRect = anchor.getBoundingClientRect()
    const height = el.getBoundingClientRect().height
    const roomBelow = window.innerHeight - anchorRect.bottom - MARGIN
    const roomAbove = anchorRect.top - MARGIN

    // Flip up only when below genuinely does not fit and above fits better.
    if (height > roomBelow && roomAbove > roomBelow) {
      el.style.top = 'auto'
      el.style.bottom = '100%'
    }

    const rect = el.getBoundingClientRect()
    let shift = 0
    if (rect.left < MARGIN) shift = MARGIN - rect.left
    else if (rect.right > window.innerWidth - MARGIN) shift = window.innerWidth - MARGIN - rect.right
    if (shift) el.style.transform = `translateX(calc(-50% + ${Math.round(shift)}px))`
  }, [open])

  return (
    <span
      ref={wrapRef}
      className="relative ml-1.5 inline-block align-middle"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        onClick={() => {
          sfx.click()
          setPinned((v) => !v)
        }}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        aria-expanded={open}
        aria-controls={id}
        aria-label={label}
        className="pixel-btn font-pixel h-4 w-4 text-[7px] leading-none sm:h-5 sm:w-5 sm:text-[8px]"
      >
        ?
      </button>

      {open && (
        <div
          ref={popRef}
          id={id}
          role="dialog"
          aria-label={label}
          // The vertical padding doubles as a hover bridge, so moving the
          // pointer from the badge onto the panel never crosses a dead gap.
          // z-50 keeps it over the CRT scanline overlay, which sits at z-30.
          className="absolute left-1/2 z-50 w-[min(300px,82vw)] py-1.5"
        >
          <div className="panel-cream max-h-[70vh] overflow-y-auto px-2.5 py-2 text-left">{children}</div>
        </div>
      )}
    </span>
  )
}
