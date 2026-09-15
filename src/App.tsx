import { useCallback, useEffect, useMemo, useState } from 'react'
import confetti from 'canvas-confetti'

import type { Exercise, Filters } from './types'
import { AREA_LABEL, filterExercises, formatAmount, matchesFilters, pickDuration } from './lib/exercises'
import { loadJSON, saveJSON } from './lib/storage'
import { sfx } from './lib/audio'
import { useSpin } from './hooks/useSpin'
import { useStreak } from './hooks/useStreak'

import { Banner } from './components/Banner'
import { FilterPanel } from './components/FilterPanel'
import { Generator } from './components/Generator'
import { StreakPanel } from './components/StreakPanel'
import { Terminal } from './components/Terminal'
import { ExerciseDock } from './components/ExerciseDock'

const DEFAULT_FILTERS: Filters = { time: 5, areas: [], maxDifficulty: 2 }

const IDLE_LINES = [
  'Dân văn phòng, đã đến lúc vận động!',
  'Nhấn [SPIN] để chọn bài tập ngẫu nhiên.',
]

const CHEERS = [
  'Ngon lành! Cột sống của bạn vừa gửi lời cảm ơn.',
  'Xong một hiệp. Quay tiếp để nâng cấp buổi tập nào!',
  'Tuyệt vời! Cơ thể đã tỉnh, giờ tới lượt cái deadline.',
  'Hoàn thành! Nhớ uống một ngụm nước trước khi ngồi lại.',
]

export default function App() {
  const [filters, setFilters] = useState<Filters>(() => ({
    ...DEFAULT_FILTERS,
    ...loadJSON<Partial<Filters>>('filters', {}),
  }))
  const [muted, setMuted] = useState(() => loadJSON<boolean>('muted', false))
  const [amount, setAmount] = useState(30)
  const [message, setMessage] = useState<string[]>(IDLE_LINES)

  const { streak, doneToday, markDone } = useStreak()

  useEffect(() => saveJSON('filters', filters), [filters])
  useEffect(() => {
    saveJSON('muted', muted)
    sfx.setMuted(muted)
  }, [muted])

  const pool = useMemo(() => filterExercises(filters), [filters])

  const handleSettle = useCallback(
    (exercise: Exercise) => {
      const next = pickDuration(exercise, filters.time)
      setAmount(next)
      setMessage([
        `>> ${exercise.name.toUpperCase()} — ${AREA_LABEL[exercise.category]}`,
        `Mục tiêu: ${formatAmount(exercise, next)}. Nhấn [BẮT ĐẦU] khi bạn đã sẵn sàng.`,
      ])
    },
    [filters.time],
  )

  const { result, reelItem, spinning, spin, clear } = useSpin(pool, handleSettle)

  const handleFiltersChange = useCallback(
    (next: Filters) => {
      setFilters(next)
      // A filter change can invalidate the current pick — drop it and say so.
      if (result && !matchesFilters(result, next)) {
        clear()
        setMessage(['Bộ lọc đã thay đổi.', 'Nhấn [SPIN] để chọn bài tập mới.'])
      }
    },
    [result, clear],
  )

  const handleSpin = useCallback(() => {
    if (pool.length === 0) {
      setMessage(['Không có bài tập nào khớp bộ lọc!', 'Hãy nới độ khó hoặc bỏ bớt khu vực đã chọn.'])
      sfx.error()
      return
    }
    setMessage(['Đang quay máy chọn bài tập...', 'Chuẩn bị tinh thần nào!'])
    spin()
  }, [pool, spin])

  const handleTimerFinish = useCallback(() => {
    setMessage([
      CHEERS[Math.floor(Math.random() * CHEERS.length)],
      doneToday ? 'Nhấn [SPIN] để tập thêm một bài nữa.' : 'Đừng quên bấm [ĐÁNH DẤU ĐÃ TẬP] để giữ streak!',
    ])
    confetti({
      particleCount: 70,
      spread: 75,
      startVelocity: 38,
      origin: { y: 0.6 },
      colors: ['#f5b425', '#4caf50', '#fff8e7', '#c8402f'],
      disableForReducedMotion: true,
    })
  }, [doneToday])

  const handleMarkDone = useCallback(() => {
    if (doneToday) return
    markDone()
    sfx.streakUp()
    setMessage(['ĐÃ GHI NHẬN! Streak của bạn vừa tăng thêm một ngày.', 'Hẹn gặp lại vào ngày mai nhé.'])
    confetti({
      particleCount: 130,
      spread: 100,
      startVelocity: 45,
      origin: { y: 0.55 },
      colors: ['#f5b425', '#4caf50', '#fff8e7', '#3f6c99'],
      disableForReducedMotion: true,
    })
  }, [doneToday, markDone])

  // Spacebar spins, like an arcade cabinet.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code !== 'Space' && event.key !== ' ') return
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.isContentEditable)) return
      event.preventDefault()
      if (!spinning) handleSpin()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleSpin, spinning])

  return (
    <div className="flex min-h-dvh w-full flex-col items-center px-2 py-3 sm:px-4 sm:py-6">
      {/* ---------- The arcade cabinet ---------- */}
      <main className="cabinet w-full max-w-[1180px] p-2 sm:p-4 md:p-5">
        <div className="screen scanlines relative flex flex-col gap-2.5 p-2 sm:gap-3 sm:p-3 md:p-4">
          <Banner muted={muted} onToggleMute={() => setMuted((m) => !m)} />

          {/* 3-column layout on desktop, stacked on mobile */}
          <div className="grid grid-cols-1 gap-2.5 sm:gap-3 lg:grid-cols-[minmax(170px,210px)_minmax(0,1fr)_minmax(150px,190px)]">
            <div className="order-2 lg:order-1">
              <FilterPanel filters={filters} onChange={handleFiltersChange} matchCount={pool.length} />
            </div>

            <div className="order-1 lg:order-2">
              <Generator
                spinning={spinning}
                reelItem={reelItem}
                result={result}
                poolSize={pool.length}
                time={filters.time}
                amount={amount}
                onAmountChange={setAmount}
                onSpin={handleSpin}
                onFinish={handleTimerFinish}
              />
            </div>

            <div className="order-3">
              <StreakPanel streak={streak} doneToday={doneToday} onMarkDone={handleMarkDone} />
            </div>
          </div>

          <div className="order-4">
            <Terminal lines={message} />
          </div>
        </div>

        {/* ---------- Bottom dock, on the cabinet wood ---------- */}
        <div className="pt-3 pb-1 sm:pt-4">
          <ExerciseDock active={result} spinning={spinning} />
        </div>
      </main>

      <p className="font-term mt-4 text-center text-sm leading-snug text-cream-300/50 sm:text-base">
        Mẹo: nhấn phím [SPACE] để quay · Dữ liệu streak lưu ngay trên máy bạn
      </p>
    </div>
  )
}
