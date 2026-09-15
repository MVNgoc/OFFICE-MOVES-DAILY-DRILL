import { useCallback, useEffect, useRef, useState } from 'react'
import { sfx } from '../lib/audio'

interface Options {
  /** Fired once when the countdown reaches zero. */
  onFinish?: () => void
}

/**
 * A wall-clock countdown. It stores the deadline rather than decrementing a
 * counter, so a backgrounded tab (where timers are throttled) still shows the
 * correct remaining time when it comes back.
 */
export function useTimer(totalSeconds: number, { onFinish }: Options = {}) {
  const [remaining, setRemaining] = useState(totalSeconds)
  const [running, setRunning] = useState(false)

  // Reset during render when the caller swaps in a different duration, which is
  // cheaper than an effect that would render twice.
  const [lastTotal, setLastTotal] = useState(totalSeconds)
  if (lastTotal !== totalSeconds) {
    setLastTotal(totalSeconds)
    setRemaining(totalSeconds)
    setRunning(false)
  }

  const deadlineRef = useRef<number>(0)
  const beepedAtRef = useRef<number | null>(null)
  const onFinishRef = useRef(onFinish)

  useEffect(() => {
    onFinishRef.current = onFinish
  }, [onFinish])

  useEffect(() => {
    if (!running) return

    // setInterval rather than requestAnimationFrame: rAF is suspended outright
    // in a hidden tab, so a countdown started before switching away would never
    // reach zero and the session would never be credited. A throttled interval
    // still fires, and the deadline maths keeps the reading correct either way.
    const tick = () => {
      const left = Math.max(0, (deadlineRef.current - Date.now()) / 1000)
      const ceil = Math.ceil(left)
      setRemaining(left)

      // Beep once per second for the last three seconds.
      if (ceil > 0 && ceil <= 3 && beepedAtRef.current !== ceil) {
        beepedAtRef.current = ceil
        sfx.countdownBeep()
      }

      if (left <= 0) {
        window.clearInterval(id)
        setRunning(false)
        setRemaining(0)
        onFinishRef.current?.()
      }
    }

    const id = window.setInterval(tick, 200)
    tick()
    return () => window.clearInterval(id)
  }, [running])

  const start = useCallback(() => {
    setRunning((wasRunning) => {
      if (wasRunning) return true
      setRemaining((left) => {
        const from = left > 0 ? left : totalSeconds
        deadlineRef.current = Date.now() + from * 1000
        beepedAtRef.current = null
        return from
      })
      sfx.start()
      return true
    })
  }, [totalSeconds])

  const pause = useCallback(() => {
    setRunning((wasRunning) => {
      if (!wasRunning) return false
      sfx.pause()
      return false
    })
  }, [])

  const toggle = useCallback(() => {
    if (running) pause()
    else start()
  }, [running, start, pause])

  /** Runs the clock again from the top — used to roll straight into side two. */
  const restart = useCallback(() => {
    beepedAtRef.current = null
    deadlineRef.current = Date.now() + totalSeconds * 1000
    setRemaining(totalSeconds)
    setRunning(true)
  }, [totalSeconds])

  const reset = useCallback(() => {
    setRunning(false)
    setRemaining(totalSeconds)
    beepedAtRef.current = null
    sfx.click()
  }, [totalSeconds])

  return {
    /** Fractional seconds left — round for display, use raw for the progress bar. */
    remaining,
    running,
    finished: remaining <= 0,
    progress: totalSeconds > 0 ? 1 - remaining / totalSeconds : 0,
    start,
    pause,
    toggle,
    reset,
    restart,
  }
}

export function formatClock(seconds: number): string {
  const total = Math.ceil(Math.max(0, seconds))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
