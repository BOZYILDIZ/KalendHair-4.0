export interface FaqItem {
  question: string
  answer: string
}

interface FaqAccordionProps {
  title?: string
  items: FaqItem[]
  id?: string
  className?: string
}

function ChevronIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 7.5l5 5 5-5" />
    </svg>
  )
}

export function FaqAccordion({ title, items, id, className }: FaqAccordionProps) {
  return (
    <div id={id} className={className}>
      {title && (
        <h3 className="mb-5 text-xl font-semibold text-slate-900">{title}</h3>
      )}
      <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {items.map((item) => (
          <details key={item.question} className="group px-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-medium text-slate-900 [&::-webkit-details-marker]:hidden">
              <span>{item.question}</span>
              <ChevronIcon />
            </summary>
            <div className="pb-5 text-sm leading-7 text-slate-600">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
