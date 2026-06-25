import type { Metadata } from 'next'
import { HeroSection } from './components/sections/hero-section'
import { TrustStrip } from './components/sections/trust-strip'
import { ModuleGrid } from './components/sections/module-grid'

export const metadata: Metadata = {
  title: 'KalendHair — Logiciel de gestion pour salons de coiffure',
  description:
    'Gérez votre salon avec une seule plateforme : agenda, réservation en ligne, caisse, stocks et clients. Essayez KalendHair gratuitement.',
  openGraph: {
    title: 'KalendHair — Logiciel de gestion pour salons de coiffure',
    description:
      'Agenda, réservation en ligne, caisse, stocks et clients. Une seule plateforme pour tout gérer.',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustStrip />
      <ModuleGrid />
    </>
  )
}
