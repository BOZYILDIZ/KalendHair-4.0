import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type BadgeVariant = 'indigo' | 'green' | 'amber' | 'slate' | 'dark'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  slate: 'bg-slate-50 text-slate-600 border-slate-200',
  dark: 'bg-indigo-950 text-indigo-300 border-indigo-800',
}

export function Badge({ variant = 'indigo', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
