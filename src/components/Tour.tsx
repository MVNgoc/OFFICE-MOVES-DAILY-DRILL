import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { TOUR_STEPS } from '../lib/tour'
import { sfx } from '../lib/audio'

/** Gap between the spotlight and the tooltip, and between the tooltip and the viewport edge. */
const GAP = 12
const MARGIN = 10

/**
 * A guided walkthrough of the cabinet. It dims the page, cuts a hole around the
 * element the current step talks about, and parks an explanation next to it.
 *
 * The hole is one hard-edged box shadow — `0 0 0 100vmax` of dark spreading out
 * from the highlighted rect — rather than an SVG mask, so it stays crisp at any
 * zoom and matches the app's flat pixel look.
 *
 * Both the hole and the tooltip are positioned imperatively inside an
 * animation-frame loop instead of from React state: the target can move while
 * the browser smooth-scrolls it into view, and re-rendering on every frame of
 * that scroll would be wasteful.
 */
export function Tour({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [index, setIndex] = useState(0)
  const [wasOpen, setWasOpen] = useState(open)

  // Every run starts from the top. Done during render, not in an effect, so the
  // first frame of a reopened tour never flashes the step it ended on.
  if (wasOpen !== open) {
    setWasOpen(open)
    if (open) setIndex(0)
  }

  const step = TOUR_STEPS[index]
  const last = index === TOUR_STEPS.length - 1

  const spotRef = useRef<HTMLDivElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  /** Element focused before the tour opened, so it can be handed back. */
  const returnRef = useRef<HTMLElement | null>(null)

  const finish = useCallback(() => {
    sfx.click()
    onClose()
  }, [onClose])

  const go = useCallback(
    (delta: number) => {
      const next = index + delta
      if (next < 0) return
      if (next >= TOUR_STEPS.length) {
        finish()
        return
      }
      sfx.click()
      setIndex(next)
    },
    [index, finish],
  )

  // Bring the step's target into view, then hand focus to the tour itself.
  useEffect(() => {
    if (!open) return
    // Focus first: moving focus cancels a scroll that is already under way.
    nextRef.current?.focus({ preventScroll: true })
    const el = step.target ? document.querySelector<HTMLElement>(step.target) : null
    // Jumping rather than smooth-scrolling: the spotlight snaps to its target
    // in one frame, so an animated scroll would only let the two disagree.
    el?.scrollIntoView({ block: 'center' })
  }, [open, index, step.target])

  // Remember where focus came from so it can be handed back on the way out.
  // The page is deliberately *not* scroll-locked: each step scrolls its target
  // into view, and the spotlight tracks the target anyway, so letting the page
  // move is both harmless and necessary.
  useEffect(() => {
    if (!open) return
    returnRef.current = document.activeElement as HTMLElement | null
    return () => returnRef.current?.focus?.()
  }, [open])

  // Keyboard: arrows and Enter step through, Escape leaves. Captured so the
  // page's own Space-to-spin shortcut never fires from inside the tour.
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        finish()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        go(1)
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        go(-1)
      } else if (event.code === 'Space' || event.key === ' ') {
        // Let Space activate a focused tour button, but never reach the page.
        event.stopPropagation()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open, go, finish])

  useLayoutEffect(() => {
    if (!open) return
    let frame = 0

    const place = () => {
      frame = requestAnimationFrame(place)

      const spot = spotRef.current
      const tip = tipRef.current
      if (!spot || !tip) return

      const vw = document.documentElement.clientWidth
      const vh = window.innerHeight
      const tipW = tip.offsetWidth
      const tipH = tip.offsetHeight

      const el = step.target ? document.querySelector<HTMLElement>(step.target) : null
      const rect = el?.getBoundingClientRect()

      // No target (or a target that is not rendered right now): collapse the
      // hole to nothing — the shadow then covers the screen evenly — and centre
      // the card.
      if (!rect || rect.width === 0) {
        spot.style.width = '0px'
        spot.style.height = '0px'
        spot.style.left = `${vw / 2}px`
        spot.style.top = `${vh / 2}px`
        tip.style.left = `${Math.round((vw - tipW) / 2)}px`
        tip.style.top = `${Math.round((vh - tipH) / 2)}px`
        return
      }

      // Clamped to the viewport on every side: a target that is partly (or
      // entirely) scrolled away must not produce a negative-sized hole, which
      // would then drag the tooltip off-screen with it.
      const pad = step.padding ?? 6
      const left = Math.min(Math.max(rect.left - pad, 0), vw)
      const top = Math.min(Math.max(rect.top - pad, 0), vh)
      const width = Math.max(Math.min(rect.right + pad, vw) - left, 0)
      const height = Math.max(Math.min(rect.bottom + pad, vh) - top, 0)

      spot.style.left = `${Math.round(left)}px`
      spot.style.top = `${Math.round(top)}px`
      spot.style.width = `${Math.round(width)}px`
      spot.style.height = `${Math.round(height)}px`

      // Below the target by default; above it when below does not fit; and
      // wherever there is more room when neither side does.
      const below = top + height + GAP
      const above = top - GAP - tipH
      let tipTop: number
      if (below + tipH <= vh - MARGIN) tipTop = below
      else if (above >= MARGIN) tipTop = above
      else tipTop = Math.max(vh - tipH - MARGIN, MARGIN)

      const centred = left + width / 2 - tipW / 2
      const tipLeft = Math.min(Math.max(centred, MARGIN), vw - tipW - MARGIN)

      tip.style.left = `${Math.round(tipLeft)}px`
      tip.style.top = `${Math.round(tipTop)}px`
    }

    place()
    return () => cancelAnimationFrame(frame)
  }, [open, index, step.target, step.padding])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Hướng dẫn sử dụng">
      {/* The dimmer and the hole are the same element: everything outside the
          box is covered by its shadow, the box itself stays clear. */}
      <div
        ref={spotRef}
        aria-hidden="true"
        className="pointer-events-none fixed"
        // No transition: the box is repositioned every animation frame, so a
        // CSS transition would be forever chasing a target that has already
        // moved. Snapping also suits the app's hard-edged pixel look.
        style={{ boxShadow: '0 0 0 100vmax rgb(8 14 22 / 0.82), inset 0 0 0 3px var(--color-retro-gold)' }}
      />

      {/* Catches clicks that land on the dimmed area so the page underneath
          cannot be operated mid-tour. */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={() => go(1)}
        className="absolute inset-0 h-full w-full cursor-default"
      />

      <div
        ref={tipRef}
        className="panel-cream fixed w-[min(340px,calc(100vw-20px))] px-3 py-2.5 sm:px-4 sm:py-3"
      >
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-vn text-base leading-none tracking-wide text-ink sm:text-lg">{step.title}</h2>
          <span className="font-term shrink-0 text-sm leading-none text-ink/50 sm:text-base">
            {index + 1}/{TOUR_STEPS.length}
          </span>
        </div>

        <p className="font-term mt-2 text-base leading-snug text-ink sm:text-lg">{step.body}</p>

        <div className="mt-3 flex items-center justify-between gap-2 border-t-2 border-dashed border-ink/20 pt-2.5">
          <button
            type="button"
            onClick={finish}
            className="font-term text-sm leading-none text-ink/50 underline decoration-dotted underline-offset-2 hover:text-ink sm:text-base"
          >
            bỏ qua
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={index === 0}
              className="pixel-btn font-vn px-2 py-1.5 text-sm leading-none sm:text-base"
            >
              ‹ TRƯỚC
            </button>
            <button
              ref={nextRef}
              type="button"
              onClick={() => go(1)}
              className="pixel-btn pixel-btn--green font-vn px-2 py-1.5 text-sm leading-none sm:text-base"
            >
              {last ? 'BẮT ĐẦU!' : 'TIẾP ›'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
