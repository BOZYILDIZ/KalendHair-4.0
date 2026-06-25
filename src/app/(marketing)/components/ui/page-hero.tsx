import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Container } from './container'
import { Badge } from './badge'

interface PageHeroProps {
  badge?: string
  title: string
  subtitle?: string
  actions?: ReactNode
  className?: string
}

export function PageHero({ badge, title, subtitle, actions, className }: PageHeroProps) {
  return (
    <section
      className={cn('relative overflow-hidden bg-slate-950 py-24 sm:py-32', className)}
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(79,70,229,0.25) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          {badge && (
            <div className="mb-6 flex justify-center">
              <Badge variant="dark">{badge}</Badge>
            </div>
          )}
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-6 text-xl leading-8 text-slate-400">{subtitle}</p>
          )}
          {actions && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {actions}
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}
