'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'
import { ScreenshotFrame } from './screenshot-frame'

export interface DemoTab {
  id: string
  label: string
  screenshotLabel: string
  description: string
  note?: string
}

interface DemoTabsProps {
  tabs: DemoTab[]
}

export function DemoTabs({ tabs }: DemoTabsProps) {
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? '')
  const active = tabs.find((t) => t.id === activeId) ?? tabs[0]

  if (!active) return null

  return (
    <div>
      {/* Tab list */}
      <div
        role="tablist"
        aria-label="Modules KalendHair"
        className="mb-8 flex gap-2 overflow-x-auto pb-1"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeId
          return (
            <button
              key={tab.id}
              role="tab"
              id={`demo-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`demo-panel-${tab.id}`}
              onClick={() => setActiveId(tab.id)}
              className={cn(
                'shrink-0 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab panels */}
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`demo-panel-${tab.id}`}
          aria-labelledby={`demo-tab-${tab.id}`}
          hidden={tab.id !== activeId}
          tabIndex={0}
        >
          <div className="grid items-start gap-8 lg:grid-cols-3 lg:gap-12">
            {/* Screenshot — 2/3 width on desktop */}
            <div className="lg:col-span-2">
              <ScreenshotFrame
                label={tab.screenshotLabel}
                priority={tab.id === tabs[0]?.id}
              />
            </div>

            {/* Description — 1/3 width on desktop */}
            <div className="flex flex-col justify-center">
              <p className="text-lg leading-8 text-slate-600">{tab.description}</p>
              {tab.note && (
                <p className="mt-4 rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
                  {tab.note}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
