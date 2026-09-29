import type { CSSProperties } from 'react'

const particles = [
  { x: -316, y: -154, rotate: -220, color: 'var(--primary)', size: 'h-3 w-1.5', shape: 'rounded-[2px]' },
  { x: -278, y: -246, rotate: 184, color: 'var(--highlight)', size: 'size-2.5', shape: 'rounded-full' },
  { x: -238, y: -104, rotate: -148, color: 'var(--success)', size: 'h-2 w-4', shape: 'rounded-[2px]' },
  { x: -196, y: -306, rotate: 238, color: 'var(--foreground)', size: 'h-3.5 w-1.5', shape: 'rounded-[2px]' },
  { x: -154, y: -188, rotate: -194, color: 'var(--primary)', size: 'size-2', shape: 'rounded-full' },
  { x: -112, y: -278, rotate: 166, color: 'var(--highlight)', size: 'h-2 w-4', shape: 'rounded-[2px]' },
  { x: -72, y: -132, rotate: -248, color: 'var(--success)', size: 'h-3 w-1.5', shape: 'rounded-[2px]' },
  { x: -28, y: -332, rotate: 214, color: 'var(--foreground)', size: 'size-2.5', shape: 'rounded-full' },
  { x: 24, y: -244, rotate: -172, color: 'var(--primary)', size: 'h-2 w-4', shape: 'rounded-[2px]' },
  { x: 68, y: -340, rotate: 246, color: 'var(--highlight)', size: 'h-3.5 w-1.5', shape: 'rounded-[2px]' },
  { x: 116, y: -148, rotate: -208, color: 'var(--success)', size: 'size-2', shape: 'rounded-full' },
  { x: 158, y: -282, rotate: 196, color: 'var(--primary)', size: 'h-2 w-4', shape: 'rounded-[2px]' },
  { x: 206, y: -118, rotate: -236, color: 'var(--foreground)', size: 'h-3 w-1.5', shape: 'rounded-[2px]' },
  { x: 252, y: -226, rotate: 168, color: 'var(--highlight)', size: 'size-2.5', shape: 'rounded-full' },
  { x: 306, y: -132, rotate: -184, color: 'var(--success)', size: 'h-2 w-4', shape: 'rounded-[2px]' },
  { x: -342, y: -28, rotate: 142, color: 'var(--highlight)', size: 'h-3.5 w-1.5', shape: 'rounded-[2px]' },
  { x: -292, y: 82, rotate: -214, color: 'var(--success)', size: 'size-2.5', shape: 'rounded-full' },
  { x: -226, y: 156, rotate: 188, color: 'var(--primary)', size: 'h-2 w-4', shape: 'rounded-[2px]' },
  { x: -166, y: 54, rotate: -176, color: 'var(--foreground)', size: 'h-3 w-1.5', shape: 'rounded-[2px]' },
  { x: -108, y: 224, rotate: 232, color: 'var(--highlight)', size: 'size-2', shape: 'rounded-full' },
  { x: -54, y: 118, rotate: -204, color: 'var(--success)', size: 'h-2 w-4', shape: 'rounded-[2px]' },
  { x: 2, y: 262, rotate: 176, color: 'var(--primary)', size: 'h-3.5 w-1.5', shape: 'rounded-[2px]' },
  { x: 58, y: 112, rotate: -236, color: 'var(--highlight)', size: 'size-2.5', shape: 'rounded-full' },
  { x: 114, y: 228, rotate: 212, color: 'var(--success)', size: 'h-2 w-4', shape: 'rounded-[2px]' },
  { x: 172, y: 56, rotate: -158, color: 'var(--foreground)', size: 'h-3 w-1.5', shape: 'rounded-[2px]' },
  { x: 236, y: 164, rotate: 242, color: 'var(--primary)', size: 'size-2', shape: 'rounded-full' },
  { x: 302, y: 82, rotate: -198, color: 'var(--highlight)', size: 'h-2 w-4', shape: 'rounded-[2px]' },
  { x: 356, y: -18, rotate: 154, color: 'var(--success)', size: 'h-3.5 w-1.5', shape: 'rounded-[2px]' },
  { x: -226, y: -18, rotate: -268, color: 'var(--primary)', size: 'size-2', shape: 'rounded-full' },
  { x: 222, y: 10, rotate: 272, color: 'var(--highlight)', size: 'size-2', shape: 'rounded-full' },
]

type CelebrationParticleStyle = CSSProperties & {
  '--particle-color': string
  '--tx': string
  '--ty': string
  '--rot': string
  '--delay': string
}

type KanbanDoneCelebrationProps = {
  eventKey: number
  onComplete: () => void
}

export const KanbanDoneCelebration = ({ eventKey, onComplete }: KanbanDoneCelebrationProps) => {
  return (
    <div key={eventKey} className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      <div
        className="absolute left-1/2 top-[42%] size-1 animate-[kanban-done-celebration-shell_1050ms_var(--ease-out-quart)_forwards]"
        onAnimationEnd={(event) => {
          if (event.currentTarget === event.target) {
            onComplete()
          }
        }}
      >
        <span className="absolute left-0 top-0 block size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-highlight/50 bg-primary/15 animate-[kanban-done-bloom_520ms_var(--ease-out-quart)_forwards]" />
        <span className="absolute left-0 top-0 block size-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-success/20 blur-sm animate-[kanban-done-bloom_640ms_var(--ease-out-quart)_forwards]" />
        {particles.map((particle, index) => {
          const style: CelebrationParticleStyle = {
            '--particle-color': particle.color,
            '--tx': `${particle.x}px`,
            '--ty': `${particle.y}px`,
            '--rot': `${particle.rotate}deg`,
            '--delay': `${index * 7}ms`,
          }

          return (
            <span
              key={`${particle.x}-${particle.y}-${index}`}
              className={`absolute left-0 top-0 block bg-[var(--particle-color)] shadow-sm animate-[kanban-done-confetti_920ms_var(--ease-out-quart)_forwards] ${particle.size} ${particle.shape}`}
              style={style}
            />
          )
        })}
      </div>
    </div>
  )
}
