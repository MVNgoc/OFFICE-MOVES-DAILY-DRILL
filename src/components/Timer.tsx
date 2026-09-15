import { useCallback, useEffect, useRef, useState } from 'react'
import type { Exercise } from '../types'
import { formatClock, useTimer } from '../hooks/useTimer'
import { timerSeconds } from '../lib/exercises'
import { sfx } from '../lib/audio'

interface Props {
  exercise: Exercise
  amount: number
  /** Fires per side that runs to zero; `lastSide` marks the exercise complete. */
  onFinish: (seconds: number, lastSide: boolean) => void
}

/** Breather between the two sides, so nobody has to scramble. */
const SWITCH_SECONDS = 4

/**
 * Countdown for one exercise. A two-sided exercise runs as two legs with a short
 * change-over in between, so the clock is started once instead of making people
 * remember to reset and repeat.
 */
export function Timer({ exercise, amount, onFinish }: Props) {
  const perSide = timerSeconds(exercise, amount)
  const sides = exercise.perSide ? 2 : 1

  const [side, setSide] = useState(1)
  const [allDone, setAllDone] = useState(false)
  /** Deadline of the change-sides interlude, or null when not switching. */
  const [switchUntil, setSwitchUntil] = useState<number | null>(null)
  const [switchLeft, setSwitchLeft] = useState(SWITCH_SECONDS)

  // Kept in refs so the callbacks below read current values without being
  // rebuilt (and restarting the clock) on every render.
  const sideRef = useRef(side)
  const restartRef = useRef<() => void>(() => {})

  useEffect(() => {
    sideRef.current = side
  }, [side])

  const handleSideComplete = useCallback(() => {
    // Credit each leg as it lands, so quitting halfway still counts what was done.
    const lastSide = sideRef.current >= sides
    onFinish(perSide, lastSide)
    if (!lastSide) {
      sfx.switchSide()
      setSwitchLeft(SWITCH_SECONDS)
      setSwitchUntil(Date.now() + SWITCH_SECONDS * 1000)
    } else {
      sfx.finish()
      setAllDone(true)
    }
  }, [onFinish, perSide, sides])

  const { remaining, running, progress, toggle, reset, restart } = useTimer(perSide, {
    onFinish: handleSideComplete,
  })

  useEffect(() => {
    restartRef.current = restart
  }, [restart])

  useEffect(() => {
    if (switchUntil === null) return
    const id = window.setInterval(() => {
      const left = Math.ceil((switchUntil - Date.now()) / 1000)
      if (left <= 0) {
        window.clearInterval(id)
        setSwitchUntil(null)
        setSide((s) => s + 1)
        restartRef.current()
      } else {
        setSwitchLeft(left)
        sfx.countdownBeep()
      }
    }, 1000)
    return () => window.clearInterval(id)
  }, [switchUntil])

  const handleReset = useCallback(() => {
    setSwitchUntil(null)
    setSwitchLeft(SWITCH_SECONDS)
    setSide(1)
    setAllDone(false)
    reset()
  }, [reset])

  const switching = switchUntil !== null
  const urgent = !switching && !allDone && remaining > 0 && remaining <= 5

  return (
    <div className="flex flex-col gap-2">
      {sides > 1 && (
        <p
          className={`font-vn text-center text-sm leading-none tracking-wide sm:text-base ${
            switching ? 'text-retro-gold' : 'text-cream-100'
          }`}
          aria-live="polite"
        >
          {allDone ? 'XONG CẢ HAI BÊN' : switching ? 'ĐỔI BÊN NGAY!' : `BÊN ${side} / ${sides}`}
        </p>
      )}

      {/* Clock readout */}
      <div
        className={`pixel-in relative overflow-hidden px-3 py-2 text-center ${
          switching ? 'bg-wood-700' : 'bg-screen-900'
        } ${urgent ? 'anim-shake' : ''}`}
      >
        {!switching && (
          <div
            className="absolute inset-y-0 left-0 bg-retro-green-700/45 transition-[width] duration-100 ease-linear"
            style={{ width: `${Math.min(100, progress * 100)}%` }}
            aria-hidden="true"
          />
        )}
        <output
          aria-live="off"
          className={`font-pixel relative text-xl leading-none tracking-wider sm:text-3xl ${
            switching || allDone ? 'text-retro-gold' : urgent ? 'text-retro-red' : 'text-cream-100'
          }`}
        >
          {switching ? switchLeft : formatClock(remaining)}
        </output>
      </div>

      {sides > 1 && !allDone && (
        <p className="font-term -mt-1 text-center text-sm leading-tight text-cream-300/80 sm:text-base">
          Đồng hồ tự chạy 2 chặng — hết một bên sẽ nghỉ {SWITCH_SECONDS} giây rồi vào bên kia.
        </p>
      )}

      {/* Controls */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={toggle}
          disabled={allDone || switching}
          className={`pixel-btn font-vn px-2 py-2.5 text-sm leading-none sm:text-base ${
            running ? 'pixel-btn--red' : 'pixel-btn--green'
          }`}
        >
          {running ? '❚❚ TẠM DỪNG' : allDone ? '✓ XONG' : switching ? '… ĐỔI BÊN' : '▶ BẮT ĐẦU'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="pixel-btn font-vn px-2 py-2.5 text-sm leading-none sm:text-base"
        >
          ↻ LÀM LẠI
        </button>
      </div>
    </div>
  )
}
