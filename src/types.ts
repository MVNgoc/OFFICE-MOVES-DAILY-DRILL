export type Category = 'upper' | 'lower' | 'core' | 'full' | 'stretch'
export type Difficulty = 1 | 2 | 3
export type Unit = 'seconds' | 'reps'
export type IconKey = 'squat' | 'pushup' | 'crunch' | 'situp' | 'lunge' | 'stretch' | 'jumping'

export interface Exercise {
  id: string
  name: string
  category: Category
  icon: IconKey
  unit: Unit
  /** Seconds when `unit` is "seconds", repetitions when `unit` is "reps". */
  durationOptions: number[]
  difficulty: Difficulty
  description: string
  tips: string
}

/** Session length in minutes. */
export type TimeBudget = 3 | 5 | 10

export interface Filters {
  time: TimeBudget
  /** Empty means "every area". */
  areas: Category[]
  /** Highest difficulty allowed. */
  maxDifficulty: Difficulty
}

export interface StreakState {
  count: number
  /** ISO `YYYY-MM-DD` of the last day marked done, or null. */
  lastDate: string | null
  /** Total sessions ever completed. */
  total: number
}
