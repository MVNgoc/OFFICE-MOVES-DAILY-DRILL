import { useCallback, useEffect, useState } from 'react'
import type { StreakState } from '../types'
import { daysBetween, loadJSON, saveJSON, todayKey } from '../lib/storage'

const KEY = 'streak'
const EMPTY: StreakState = { count: 0, lastDate: null, total: 0 }

/**
 * Reads the stored streak and expires it if more than one day has been missed.
 * Yesterday keeps the streak alive; anything older resets it to zero.
 */
function reconcile(state: StreakState, today: string): StreakState {
  if (!state.lastDate) return state
  const gap = daysBetween(state.lastDate, today)
  if (gap <= 1) return state
  return { ...state, count: 0 }
}

export function useStreak() {
  const [state, setState] = useState<StreakState>(() =>
    reconcile(loadJSON<StreakState>(KEY, EMPTY), todayKey()),
  )

  useEffect(() => {
    saveJSON(KEY, state)
  }, [state])

  const today = todayKey()
  const doneToday = state.lastDate === today

  const markDone = useCallback(() => {
    setState((prev) => {
      const now = todayKey()
      if (prev.lastDate === now) return prev
      const continues = prev.lastDate !== null && daysBetween(prev.lastDate, now) === 1
      return {
        count: continues ? prev.count + 1 : 1,
        lastDate: now,
        total: prev.total + 1,
      }
    })
  }, [])

  const reset = useCallback(() => setState(EMPTY), [])

  return { streak: state, doneToday, markDone, reset }
}
