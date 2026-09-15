import type { Exercise } from '../types'
import { AREAS } from '../lib/exercises'
import { Sprite } from './Pixel'

/**
 * A tile per body area under the cabinet, tracking the current result's
 * category. It reuses the sidebar's area icons on purpose: the same five
 * symbols mean the same five things in both places, so there is only one set
 * to learn.
 */
export function ExerciseDock({ active, spinning }: { active: Exercise | null; spinning: boolean }) {
  return (
    <div
      className="flex flex-wrap items-end justify-center gap-1.5 sm:gap-2.5"
      role="list"
      aria-label="Các nhóm cơ"
    >
      {AREAS.map((area, i) => {
        const isActive = !spinning && active?.category === area.key
        return (
          <div
            key={area.key}
            role="listitem"
            title={area.label}
            className={`panel-cream flex h-12 w-12 items-center justify-center p-1.5 transition-transform duration-100 sm:h-16 sm:w-16 sm:p-2 ${
              isActive ? '-translate-y-1.5' : ''
            } ${spinning ? 'anim-bob' : ''}`}
            style={{
              ...(spinning ? { animationDelay: `${i * 0.12}s` } : null),
              // A gold ring outside the usual ink outline marks the live tile.
              ...(isActive
                ? { boxShadow: '0 0 0 3px var(--color-ink), 0 0 0 6px var(--color-retro-gold)' }
                : null),
            }}
            aria-current={isActive || undefined}
          >
            <Sprite
              src={area.sprite}
              className={`h-full w-full object-contain sprite-shadow ${isActive ? '' : 'opacity-70'}`}
            />
          </div>
        )
      })}
    </div>
  )
}
