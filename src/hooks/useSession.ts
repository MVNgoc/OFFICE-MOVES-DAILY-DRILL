import { useCallback, useEffect, useState } from 'react'
import type { TimeBudget } from '../types'
import { loadJSON, saveJSON, todayKey } from '../lib/storage'

interface SessionState {
  /** Seconds of work actually completed today. */
  elapsed: number
  /** How many exercises were finished. */
  count: number
  /** Local `YYYY-MM-DD` the tally belongs to. */
  date: string
}

const KEY = 'session'

function fresh(): SessionState {
  return { elapsed: 0, count: 0, date: todayKey() }
}

/**
 * Tracks progress toward the chosen session length. Only a countdown that runs
 * all the way to zero counts, so the tally reflects work actually done rather
 * than exercises merely spun.
 *
 * Changing the session length keeps the elapsed time — the work already done is
 * real — and only moves the target.
 */
export function useSession(budget: TimeBudget) {
  const [state, setState] = useState<SessionState>(() => {
    const stored = loadJSON<SessionState>(KEY, fresh())
    return stored.date === todayKey() ? stored : fresh()
  })

  useEffect(() => {
    saveJSON(KEY, state)
  }, [state])

  /**
   * `finishedExercise` is false for the first leg of a two-sided exercise: the
   * seconds count, but the exercise tally only ticks once the whole thing is done.
   */
  const add = useCallback((seconds: number, finishedExercise = true) => {
    setState((prev) => {
      const today = todayKey()
      // A tally from an earlier day starts over rather than carrying forward.
      const base = prev.date === today ? prev : fresh()
      return {
        elapsed: base.elapsed + seconds,
        count: base.count + (finishedExercise ? 1 : 0),
        date: today,
      }
    })
  }, [])

  const reset = useCallback(() => setState(fresh()), [])

  const target = budget * 60
  const elapsed = state.date === todayKey() ? state.elapsed : 0
  const count = state.date === todayKey() ? state.count : 0

  return {
    elapsed,
    count,
    target,
    remaining: Math.max(0, target - elapsed),
    progress: target > 0 ? Math.min(1, elapsed / target) : 0,
    done: elapsed >= target,
    add,
    reset,
  }
}
