import Image from 'next/image'
import { cn } from '@/lib/cn'

interface ScreenshotFrameProps {
  src?: string
  alt?: string
  label?: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export function ScreenshotFrame({
  src,
  alt,
  label,
  width = 1280,
  height = 800,
  className,
  priority,
}: ScreenshotFrameProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl ring-1 ring-slate-200 shadow-2xl bg-white',
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt ?? label ?? 'Capture produit KalendHair'}
          width={width}
          height={height}
          className="w-full"
          priority={priority}
        />
      ) : (
        <div className="flex aspect-[16/10] items-center justify-center bg-slate-50">
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200">
              <svg
                className="h-6 w-6 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="max-w-[220px] text-sm font-medium text-slate-600">
              {label ?? 'Capture produit à venir'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Salon de démonstration en cours de constitution
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
