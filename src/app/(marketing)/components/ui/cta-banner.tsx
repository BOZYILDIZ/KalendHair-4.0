import { cn } from '@/lib/cn'
import { Container } from './container'
import { Button } from './button'

type CtaTheme = 'dark' | 'light' | 'indigo'

interface CtaBannerProps {
  title: string
  subtitle?: string
  primaryLabel?: string
  primaryHref?: string
  secondaryLabel?: string
  secondaryHref?: string
  theme?: CtaTheme
  className?: string
}

export function CtaBanner({
  title,
  subtitle,
  primaryLabel = 'Essayer gratuitement',
  primaryHref = '/contact?type=essai',
  secondaryLabel,
  secondaryHref,
  theme = 'dark',
  className,
}: CtaBannerProps) {
  const isDark = theme === 'dark' || theme === 'indigo'

  return (
    <section
      className={cn(
        'py-24',
        theme === 'dark' && 'bg-slate-950',
        theme === 'light' && 'bg-slate-50',
        theme === 'indigo' && 'bg-indigo-600',
        className,
      )}
    >
      <Container>
        <div className="text-center">
          <h2
            className={cn(
              'text-3xl font-bold tracking-tight sm:text-4xl',
              isDark ? 'text-white' : 'text-slate-900',
            )}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className={cn(
                'mx-auto mt-4 max-w-2xl text-lg',
                theme === 'dark' && 'text-slate-400',
                theme === 'light' && 'text-slate-600',
                theme === 'indigo' && 'text-indigo-100',
              )}
            >
              {subtitle}
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button
              href={primaryHref}
              variant={theme === 'indigo' ? 'white' : 'primary'}
              size="lg"
            >
              {primaryLabel} →
            </Button>
            {secondaryHref && secondaryLabel && (
              <Button
                href={secondaryHref}
                variant={theme === 'dark' ? 'outline-white' : 'ghost'}
                size="lg"
              >
                {secondaryLabel}
              </Button>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}
