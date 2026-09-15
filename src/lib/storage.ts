/** Namespaced, crash-proof wrappers around localStorage. */

const PREFIX = 'office-moves:'

export function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(PREFIX + key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    // Private mode, blocked site data, or corrupted JSON — fall back quietly.
    return fallback
  }
}

export function saveJSON(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* Storage unavailable or full — the app still works, just without memory. */
  }
}

/** Local calendar date as `YYYY-MM-DD` (not UTC — streaks are a local concept). */
export function todayKey(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Whole days between two `YYYY-MM-DD` keys, ignoring time and DST shifts. */
export function daysBetween(fromKey: string, toKey: string): number {
  const [fy, fm, fd] = fromKey.split('-').map(Number)
  const [ty, tm, td] = toKey.split('-').map(Number)
  const from = Date.UTC(fy, fm - 1, fd)
  const to = Date.UTC(ty, tm - 1, td)
  return Math.round((to - from) / 86_400_000)
}
