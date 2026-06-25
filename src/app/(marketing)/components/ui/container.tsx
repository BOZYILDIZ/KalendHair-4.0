import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ContainerProps {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'article' | 'aside'
}

export function Container({ children, className, as: Tag = 'div' }: ContainerProps) {
  return (
    <Tag className={cn('mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </Tag>
  )
}
