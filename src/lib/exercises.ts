import raw from '../data/exercises.json'
import type { Category, Difficulty, Exercise, Filters, TimeBudget } from '../types'

export const EXERCISES = raw as Exercise[]

export const AREAS: { key: Category; label: string; sprite: string }[] = [
  { key: 'upper', label: 'Cơ thể trên', sprite: '/assets/sprites/area-upper.png' },
  { key: 'lower', label: 'Cơ thể dưới', sprite: '/assets/sprites/area-lower.png' },
  { key: 'core', label: 'Cơ bụng', sprite: '/assets/sprites/area-core.png' },
  { key: 'full', label: 'Toàn thân', sprite: '/assets/sprites/area-full.png' },
  { key: 'stretch', label: 'Giãn cơ', sprite: '/assets/sprites/area-stretch.png' },
]

export const AREA_LABEL: Record<Category, string> = {
  upper: 'CƠ THỂ TRÊN',
  lower: 'CƠ THỂ DƯỚI',
  core: 'CƠ BỤNG',
  full: 'TOÀN THÂN',
  stretch: 'GIÃN CƠ',
}

export const TIME_BUDGETS: TimeBudget[] = [3, 5, 10]

/**
 * Each exercise has its own two-frame animation, keyed by id. Sharing one icon
 * across many exercises was showing a push-up for side planks and a side bend
 * for every stretch.
 */
export function exerciseFrames(exercise: Exercise): [string, string] {
  return [`/assets/sprites/ex-${exercise.id}-1.png`, `/assets/sprites/ex-${exercise.id}-2.png`]
}

/** The mascot's idle: upright, lean one way, upright, lean the other. */
export const MASCOT_FRAMES = [
  '/assets/sprites/character-1.png',
  '/assets/sprites/character-2.png',
  '/assets/sprites/character-3.png',
] as const
export const MASCOT_SEQUENCE = [0, 1, 0, 2] as const

/** The pair flanking the banner title. */
export const HERO_FRAMES = [
  '/assets/sprites/hero-idle-1.png',
  '/assets/sprites/hero-idle-2.png',
] as const

/**
 * Which duration option to use for a given session length. A 3-minute drill
 * takes the easiest option, 10 minutes takes the longest.
 */
export function pickDuration(exercise: Exercise, time: TimeBudget): number {
  const options = exercise.durationOptions
  if (options.length === 0) return 30
  const index = time === 3 ? 0 : time === 5 ? 1 : options.length - 1
  return options[Math.min(index, options.length - 1)]
}

export function formatAmount(exercise: Exercise, amount: number): string {
  const base = exercise.unit === 'seconds' ? `${amount} GIÂY` : `${amount} LẦN`
  return exercise.perSide ? `${base}/BÊN` : base
}

/**
 * Seconds the timer should run for. Rep-based exercises get a generous three
 * seconds per rep so the countdown stays a useful pace-setter.
 */
export function timerSeconds(exercise: Exercise, amount: number): number {
  return exercise.unit === 'seconds' ? amount : amount * 3
}

export function matchesFilters(exercise: Exercise, filters: Filters): boolean {
  const areaOk = filters.areas.length === 0 || filters.areas.includes(exercise.category)
  return areaOk && exercise.difficulty <= filters.maxDifficulty
}

export function filterExercises(filters: Filters): Exercise[] {
  return EXERCISES.filter((exercise) => matchesFilters(exercise, filters))
}

/** Picks a random exercise, avoiding an immediate repeat when possible. */
export function pickRandom(pool: Exercise[], avoidId?: string): Exercise | null {
  if (pool.length === 0) return null
  const candidates = pool.length > 1 && avoidId ? pool.filter((e) => e.id !== avoidId) : pool
  const list = candidates.length > 0 ? candidates : pool
  return list[Math.floor(Math.random() * list.length)]
}

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  1: 'DỄ',
  2: 'VỪA',
  3: 'KHÓ',
}
