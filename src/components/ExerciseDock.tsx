import type { Exercise } from '../types'
import { DOCK_ICONS, ICON_SRC } from '../lib/exercises'
import { Sprite } from './Pixel'

const DOCK_LABEL: Record<string, string> = {
  squat: 'Squat',
  pushup: 'Hít đất',
  crunch: 'Gập bụng',
  situp: 'Gập thân',
  lunge: 'Lunge',
  jumping: 'Nhảy dang tay',
  stretch: 'Giãn cơ',
}

/** The row of mini exercise tiles under the cabinet. Lights up the active one. */
export function ExerciseDock({ active, spinning }: { active: Exercise | null; spinning: boolean }) {
  return (
    <div className="flex flex-wrap items-end justify-center gap-1.5 sm:gap-2.5" role="list" aria-label="Các nhóm bài tập">
      {DOCK_ICONS.map((icon, i) => {
        const isActive = !spinning && active?.icon === icon
        return (
          <div
            key={icon}
            role="listitem"
            title={DOCK_LABEL[icon]}
            className={`panel-cream flex h-11 w-11 items-center justify-center p-1.5 transition-transform duration-100 sm:h-15 sm:w-15 sm:p-2 ${
              isActive ? '-translate-y-1.5 brightness-110' : ''
            } ${spinning ? 'anim-bob' : ''}`}
            style={spinning ? { animationDelay: `${i * 0.12}s` } : undefined}
            aria-current={isActive || undefined}
          >
            <Sprite
              src={ICON_SRC[icon]}
              className={`h-full w-full object-contain sprite-shadow ${isActive ? '' : 'opacity-70'}`}
            />
          </div>
        )
      })}
    </div>
  )
}
