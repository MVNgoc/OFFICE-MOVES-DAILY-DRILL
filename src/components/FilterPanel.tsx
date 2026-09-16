import type { Category, Difficulty, Filters, TimeBudget } from '../types'
import { AREAS, TIME_BUDGETS } from '../lib/exercises'
import { Section, Sprite } from './Pixel'
import { InfoTip } from './InfoTip'
import { sfx } from '../lib/audio'

interface Props {
  filters: Filters
  onChange: (next: Filters) => void
  /** How many exercises currently match, shown as live feedback. */
  matchCount: number
}

export function FilterPanel({ filters, onChange, matchCount }: Props) {
  const setTime = (time: TimeBudget) => {
    if (time === filters.time) return
    sfx.click()
    onChange({ ...filters, time })
  }

  const toggleArea = (area: Category) => {
    const active = filters.areas.includes(area)
    sfx.toggle(!active)
    onChange({
      ...filters,
      areas: active ? filters.areas.filter((a) => a !== area) : [...filters.areas, area],
    })
  }

  const setDifficulty = (level: Difficulty) => {
    sfx.click()
    onChange({ ...filters, maxDifficulty: level })
  }

  return (
    <div className="flex flex-col gap-3">
      {/* ---------- Session length ---------- */}
      <Section title="CÀI ĐẶT" icon={<span aria-hidden="true">🕐</span>} dataTour="filters-time">
        <p className="font-term text-base leading-none text-ink/70">THỜI GIAN</p>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {TIME_BUDGETS.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => setTime(time)}
              data-active={filters.time === time}
              aria-pressed={filters.time === time}
              className="pixel-btn font-pixel px-1 py-2 text-[9px] leading-none sm:text-[10px]"
            >
              {time}m
            </button>
          ))}
        </div>
      </Section>

      {/* ---------- Target area ---------- */}
      <Section title="KHU VỰC" icon={<span aria-hidden="true">📍</span>} dataTour="filters-area">
        <div className="grid grid-cols-2 gap-1.5">
          {AREAS.map((area, index) => {
            const active = filters.areas.includes(area.key)
            // A lone trailing tile spans the row instead of leaving a gap.
            const spans = index === AREAS.length - 1 && AREAS.length % 2 === 1
            return (
              <button
                key={area.key}
                type="button"
                onClick={() => toggleArea(area.key)}
                data-active={active}
                aria-pressed={active}
                title={area.label}
                className={`pixel-btn flex items-center justify-center gap-1 px-1 py-1.5 ${
                  spans ? 'col-span-2 flex-row gap-2' : 'flex-col'
                }`}
              >
                <span
                  className={`flex items-center justify-center overflow-hidden ${
                    spans ? 'h-8 w-8 sm:h-9 sm:w-9' : 'h-9 w-full sm:h-11'
                  }`}
                >
                  <Sprite src={area.sprite} className="h-full w-full object-contain sprite-shadow" />
                </span>
                <span className="font-term text-sm leading-none sm:text-base">{area.label}</span>
              </button>
            )
          })}
        </div>
        <p className="font-term mt-2 text-sm leading-tight text-ink/60 sm:text-base">
          {filters.areas.length === 0 ? 'Không chọn = tất cả khu vực' : `Đã chọn ${filters.areas.length} khu vực`}
        </p>
      </Section>

      {/* ---------- Difficulty ceiling ---------- */}
      <Section
        title="ĐỘ KHÓ"
        icon={<span aria-hidden="true">⭐</span>}
        dataTour="filters-difficulty"
        info={
          <InfoTip label="Độ khó nghĩa là gì?">
            <p className="font-vn text-xs leading-none tracking-widest text-ink/60 sm:text-sm">ĐỘ KHÓ LÀ GÌ?</p>
            <p className="font-term mt-1.5 text-base leading-snug text-ink sm:text-lg">
              Đây là mức <b>tối đa</b>, không phải mức chính xác. Chọn 2 sao nghĩa là lấy cả bài 1
              sao lẫn 2 sao.
            </p>
            <ul className="font-term mt-2 border-t-2 border-dashed border-ink/20 pt-1.5 text-base leading-snug text-ink/75 sm:text-lg">
              <li>· 1 sao — làm ngay tại bàn, không đổ mồ hôi</li>
              <li>· 2 sao — cần chút sức, hơi thở gấp</li>
              <li>· 3 sao — nặng, nên khởi động trước</li>
            </ul>
            <p className="font-term mt-2 text-sm leading-snug text-ink/55 sm:text-base">
              Dòng ngay dưới cho biết bộ lọc hiện khớp bao nhiêu bài.
            </p>
          </InfoTip>
        }
      >
        <div className="flex items-center justify-center gap-1.5">
          {([1, 2, 3] as Difficulty[]).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setDifficulty(level)}
              aria-pressed={filters.maxDifficulty === level}
              aria-label={`Tối đa ${level} sao`}
              className="transition-transform hover:scale-110 active:scale-95"
            >
              <img
                src={level <= filters.maxDifficulty ? '/assets/sprites/star-full.png' : '/assets/sprites/star-empty.png'}
                alt=""
                draggable={false}
                className="h-8 w-8 select-none sm:h-9 sm:w-9"
                style={{ imageRendering: 'pixelated' }}
              />
            </button>
          ))}
        </div>
        <p className="font-term mt-1.5 text-center text-sm leading-tight text-ink/60 sm:text-base">
          Tối đa {filters.maxDifficulty} sao · {matchCount} bài
        </p>
      </Section>
    </div>
  )
}
