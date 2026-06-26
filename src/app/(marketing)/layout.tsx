import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { MarketingNav } from './components/layout/marketing-nav'
import { MarketingFooter } from './components/layout/marketing-footer'

export const metadata: Metadata = {
  metadataBase: new URL("https://kalendhair.fr"),
  openGraph: {
    siteName: "KalendHair",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
}

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Skip navigation — keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none"
      >
        Aller au contenu principal
      </a>
      <MarketingNav />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <MarketingFooter />
    </>
  )
}
