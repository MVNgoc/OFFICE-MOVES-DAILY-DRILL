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
  /** Exercises already finished in the current budget window. */
  doneIds: string[]
}

const KEY = 'session'

function fresh(): SessionState {
  return { elapsed: 0, count: 0, date: todayKey(), doneIds: [] }
}

/**
 * Tracks progress toward the chosen session length. Only a countdown that runs
 * all the way to zero counts, so the tally reflects work actually done rather
 * than exercises merely spun.
 *
 * Changing the session length keeps the elapsed time — the work already done is
 * real — and only moves the target.
 *
 * `doneIds` remembers what was finished inside the current budget window so the
 * reel can stop handing back an exercise you already did. It empties as soon as
 * the window is complete, and a new rotation begins.
 */
export function useSession(budget: TimeBudget) {
  const target = budget * 60

  const [state, setState] = useState<SessionState>(() => {
    const stored = loadJSON<SessionState>(KEY, fresh())
    if (stored.date !== todayKey()) return fresh()
    // Tallies saved before `doneIds` existed load without it.
    return { ...fresh(), ...stored, doneIds: Array.isArray(stored.doneIds) ? stored.doneIds : [] }
  })

  useEffect(() => {
    saveJSON(KEY, state)
  }, [state])

  /**
   * `finishedExercise` is false for the first leg of a two-sided exercise: the
   * seconds count, but the exercise tally only ticks once the whole thing is done.
   * `exerciseId` marks that exercise as spent for the rest of the window.
   */
  const add = useCallback(
    (seconds: number, finishedExercise = true, exerciseId?: string) => {
      setState((prev) => {
        const today = todayKey()
        // A tally from an earlier day starts over rather than carrying forward.
        const base = prev.date === today ? prev : fresh()
        const elapsed = base.elapsed + seconds
        const done = finishedExercise && exerciseId !== undefined

        return {
          elapsed,
          count: base.count + (finishedExercise ? 1 : 0),
          date: today,
          // Completing the window opens every exercise up again for the next one.
          doneIds:
            elapsed >= target
              ? []
              : done && !base.doneIds.includes(exerciseId)
                ? [...base.doneIds, exerciseId]
                : base.doneIds,
        }
      })
    },
    [target],
  )

  const reset = useCallback(() => setState(fresh()), [])

  const today = state.date === todayKey()
  const elapsed = today ? state.elapsed : 0
  const count = today ? state.count : 0

  return {
    elapsed,
    count,
    target,
    doneIds: today ? state.doneIds : [],
    remaining: Math.max(0, target - elapsed),
    progress: target > 0 ? Math.min(1, elapsed / target) : 0,
    done: elapsed >= target,
    add,
    reset,
  }
}
