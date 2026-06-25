import { cn } from '@/lib/cn'

export type RoadmapStatus = 'available' | 'soon' | 'later'

export interface RoadmapItem {
  label: string
  description?: string
}

interface RoadmapColumnProps {
  status: RoadmapStatus
  title: string
  items: RoadmapItem[]
}

const STATUS_CONFIG: Record<
  RoadmapStatus,
  {
    header: string
    badge: string
    itemIcon: string
    iconPath: string
  }
> = {
  available: {
    header: 'border-green-200 bg-green-50',
    badge: 'bg-green-100 text-green-700',
    itemIcon: 'text-green-500',
    iconPath: 'M3 8l3.5 3.5L13 4',
  },
  soon: {
    header: 'border-amber-200 bg-amber-50',
    badge: 'bg-amber-100 text-amber-700',
    itemIcon: 'text-amber-500',
    iconPath: 'M8 4v4l3 3M8 16a8 8 0 100-16 8 8 0 000 16z',
  },
  later: {
    header: 'border-slate-200 bg-slate-50',
    badge: 'bg-slate-100 text-slate-500',
    itemIcon: 'text-slate-400',
    iconPath: 'M3 8h.01M8 8h.01M13 8h.01',
  },
}

const STATUS_LABEL: Record<RoadmapStatus, string> = {
  available: 'Disponible',
  soon: 'En préparation',
  later: 'Prévu plus tard',
}

function ItemIcon({
  status,
  config,
}: {
  status: RoadmapStatus
  config: (typeof STATUS_CONFIG)[RoadmapStatus]
}) {
  if (status === 'available') {
    return (
      <svg
        className={cn('mt-0.5 h-4 w-4 shrink-0', config.itemIcon)}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 8l3.5 3.5L13 4" />
      </svg>
    )
  }
  if (status === 'soon') {
    return (
      <svg
        className={cn('mt-0.5 h-4 w-4 shrink-0', config.itemIcon)}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="6" />
        <path d="M8 5v3l2 2" />
      </svg>
    )
  }
  return (
    <svg
      className={cn('mt-0.5 h-4 w-4 shrink-0', config.itemIcon)}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="4" cy="8" r="1" fill="currentColor" />
      <circle cx="8" cy="8" r="1" fill="currentColor" />
      <circle cx="12" cy="8" r="1" fill="currentColor" />
    </svg>
  )
}

export function RoadmapColumn({ status, title, items }: RoadmapColumnProps) {
  const config = STATUS_CONFIG[status]

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {/* Column header */}
      <div className={cn('border-b px-6 py-5', config.header)}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-medium',
              config.badge,
            )}
          >
            {STATUS_LABEL[status]}
          </span>
        </div>
      </div>

      {/* Items list */}
      <ul className="flex-1 divide-y divide-slate-100 px-6 py-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-start gap-3 py-3">
            <ItemIcon status={status} config={config} />
            <div>
              <p className="text-sm font-medium text-slate-700">{item.label}</p>
              {item.description && (
                <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
