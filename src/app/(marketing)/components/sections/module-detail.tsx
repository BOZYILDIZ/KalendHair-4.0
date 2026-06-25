import { cn } from '@/lib/cn'
import { Container } from '../ui/container'
import { Badge } from '../ui/badge'
import { ScreenshotFrame } from '../ui/screenshot-frame'

function CheckPoint({ text }: { text: string }) {
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

export interface ModuleDetailProps {
  id: string
  eyebrow?: string
  title: string
  description: string
  points: string[]
  screenshotLabel?: string
  reverse?: boolean
  bg?: 'white' | 'subtle'
}

export function ModuleDetail({
  id,
  eyebrow,
  title,
  description,
  points,
  screenshotLabel,
  reverse = false,
  bg = 'white',
}: ModuleDetailProps) {
  return (
    <section
      id={id}
      className={cn(
        'scroll-mt-24 py-16 sm:py-20',
        bg === 'subtle' ? 'bg-slate-50' : 'bg-white',
      )}
      aria-labelledby={`${id}-title`}
    >
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Text — always first in DOM order for screen readers */}
          <div className={cn(reverse && 'lg:order-2')}>
            {eyebrow && (
              <div className="mb-4">
                <Badge variant="indigo">{eyebrow}</Badge>
              </div>
            )}
            <h2
              id={`${id}-title`}
              className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            >
              {title}
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">{description}</p>
            <ul className="mt-8 space-y-3" aria-label="Fonctionnalités clés">
              {points.map((point) => (
                <CheckPoint key={point} text={point} />
              ))}
            </ul>
          </div>

          {/* Screenshot placeholder */}
          <div className={cn(reverse && 'lg:order-1')}>
            <ScreenshotFrame label={screenshotLabel} />
          </div>
        </div>
      </Container>
    </section>
  )
}
