import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'white' | 'outline-white'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  href?: string
  external?: boolean
  className?: string
  children: ReactNode
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  onClick?: () => void
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus-visible:ring-indigo-500',
  secondary:
    'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 focus-visible:ring-indigo-500',
  ghost:
    'text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-500',
  white:
    'bg-white text-indigo-700 shadow-sm hover:bg-indigo-50 focus-visible:ring-white',
  'outline-white':
    'border border-white/30 text-white hover:bg-white/10 focus-visible:ring-white',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-7 py-3.5 text-base gap-2',
}

export function Button({
  variant = 'primary',
  size = 'md',
  href,
  external,
  className,
  children,
  type = 'button',
  disabled,
  onClick,
}: ButtonProps) {
  const base = cn(
    'inline-flex items-center justify-center rounded-lg font-semibold',
    'transition-all duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none',
    variants[variant],
    sizes[size],
    className,
  )

  if (href && !disabled) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={base}>
          {children}
        </a>
      )
    }
    return (
      <Link href={href} className={base}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={base} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
}
