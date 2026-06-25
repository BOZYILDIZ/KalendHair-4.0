import { cn } from '@/lib/cn'
import { Container } from './container'
import { Badge } from './badge'
import { ScreenshotFrame } from './screenshot-frame'

/* ─── Key point bullet ─────────────────────────────────────────────────────── */

function FeaturePoint({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <div
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100"
        aria-hidden="true"
      >
        <svg
          className="h-3 w-3 text-indigo-600"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 6l2.5 2.5L10 3" />
        </svg>
      </div>
      <span className="text-slate-600">{text}</span>
    </li>
  )
}

/* ─── Component ────────────────────────────────────────────────────────────── */

export interface FeatureBlockProps {
  eyebrow?: string
  title: string
  description: string
  points: string[]
  screenshotLabel?: string
  screenshotSrc?: string
  screenshotAlt?: string
  reverse?: boolean
  bg?: 'white' | 'subtle'
}

export function FeatureBlock({
  eyebrow,
  title,
  description,
  points,
  screenshotLabel,
  screenshotSrc,
  screenshotAlt,
  reverse = false,
  bg = 'white',
}: FeatureBlockProps) {
  return (
    <section
      className={cn(
        'py-20 sm:py-24',
        bg === 'subtle' ? 'bg-slate-50' : 'bg-white',
      )}
    >
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-24">
          {/* Text — always first in DOM order for accessibility */}
          <div className={cn(reverse && 'lg:order-2')}>
            {eyebrow && (
              <div className="mb-4">
                <Badge variant="indigo">{eyebrow}</Badge>
              </div>
            )}
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {title}
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">{description}</p>
            <ul className="mt-8 space-y-4" aria-label="Fonctionnalités clés">
              {points.map((point) => (
                <FeaturePoint key={point} text={point} />
              ))}
            </ul>
          </div>

          {/* Screenshot */}
          <div className={cn(reverse && 'lg:order-1')}>
            <ScreenshotFrame
              label={screenshotLabel}
              src={screenshotSrc}
              alt={screenshotAlt}
            />
          </div>
        </div>
      </Container>
    </section>
  )
}
