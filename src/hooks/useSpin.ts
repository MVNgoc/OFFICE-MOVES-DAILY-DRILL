import { useCallback, useEffect, useRef, useState } from 'react'
import type { Exercise } from '../types'
import { pickRandom } from '../lib/exercises'
import { sfx } from '../lib/audio'

const SPIN_MS = 2400
/** Interval between reel frames at the start and at the end of the spin. */
const FAST_MS = 45
const SLOW_MS = 260

interface SpinResult {
  /** The exercise the reel landed on. */
  result: Exercise | null
  /** What the reel is showing right now — the result once the spin settles. */
  reelItem: Exercise | null
  spinning: boolean
  spin: () => void
  clear: () => void
}

/**
 * Drives the gacha-style reel. The winner is chosen up front, then the reel
 * cycles through the pool with an ease-out cadence before landing on it.
 */
export function useSpin(pool: Exercise[], onSettle?: (exercise: Exercise) => void): SpinResult {
  const [result, setResult] = useState<Exercise | null>(null)
  const [reelItem, setReelItem] = useState<Exercise | null>(null)
  const [spinning, setSpinning] = useState(false)

  const timeoutRef = useRef<number | null>(null)

  // `spin` runs outside React's render cycle, so it reads the latest pool,
  // previous result and callback through refs rather than closing over them.
  const poolRef = useRef(pool)
  const resultRef = useRef<Exercise | null>(result)
  const onSettleRef = useRef(onSettle)

  useEffect(() => {
    poolRef.current = pool
  }, [pool])
  useEffect(() => {
    resultRef.current = result
  }, [result])
  useEffect(() => {
    onSettleRef.current = onSettle
  }, [onSettle])

  const stop = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  useEffect(() => stop, [stop])

  const spin = useCallback(() => {
    const currentPool = poolRef.current
    if (currentPool.length === 0) {
      sfx.error()
      return
    }

    stop()
    const winner = pickRandom(currentPool, resultRef.current?.id) ?? currentPool[0]
    setSpinning(true)
    setResult(null)

    const startedAt = performance.now()

    const step = () => {
      const elapsed = performance.now() - startedAt
      const progress = Math.min(1, elapsed / SPIN_MS)

      if (progress >= 1) {
        setReelItem(winner)
        setResult(winner)
        setSpinning(false)
        timeoutRef.current = null
        sfx.spinComplete()
        onSettleRef.current?.(winner)
        return
      }

      // Show a random face, then wait longer each time (cubic ease-out).
      setReelItem(pickRandom(currentPool) ?? winner)
      sfx.tick(progress)

      const eased = 1 - Math.pow(1 - progress, 3)
      const delay = FAST_MS + (SLOW_MS - FAST_MS) * eased
      timeoutRef.current = window.setTimeout(step, delay)
    }

    step()
  }, [stop])

  const clear = useCallback(() => {
    stop()
    setSpinning(false)
    setResult(null)
    setReelItem(null)
  }, [stop])

  return { result, reelItem, spinning, spin, clear }
}
