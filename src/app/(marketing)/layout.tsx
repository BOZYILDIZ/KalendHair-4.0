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
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </>
  )
}
