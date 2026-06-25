import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type TitleTag = 'h1' | 'h2' | 'h3' | 'h4'
type TitleAlign = 'left' | 'center'

interface SectionTitleProps {
  eyebrow?: string
  title: string
  subtitle?: ReactNode
  align?: TitleAlign
  dark?: boolean
  titleAs?: TitleTag
  titleClassName?: string
  className?: string
  id?: string
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  dark = false,
  titleAs: Tag = 'h2',
  titleClassName,
  className,
  id,
}: SectionTitleProps) {
  return (
    <div className={cn(align === 'center' ? 'text-center' : 'text-left', className)}>
      {eyebrow && (
        <p
          className={cn(
            'mb-3 text-sm font-semibold uppercase tracking-wide',
            dark ? 'text-indigo-400' : 'text-indigo-600',
          )}
        >
          {eyebrow}
        </p>
      )}
      <Tag
        id={id}
        className={cn(
          'text-3xl font-bold tracking-tight sm:text-4xl',
          dark ? 'text-white' : 'text-slate-900',
          titleClassName,
        )}
      >
        {title}
      </Tag>
      {subtitle && (
        <div
          className={cn(
            'mt-4 text-lg leading-relaxed',
            align === 'center' && 'mx-auto max-w-2xl',
            dark ? 'text-slate-400' : 'text-slate-600',
          )}
        >
          {subtitle}
        </div>
      )}
    </div>
  )
}
