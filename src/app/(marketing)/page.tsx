import type { Metadata } from 'next'
import { Container } from './components/ui/container'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'

export const metadata: Metadata = {
  title: 'KalendHair — Logiciel de gestion pour salons de coiffure',
  description:
    'Gérez votre salon avec une seule plateforme : agenda, réservation en ligne, caisse, stocks et clients. Essayez KalendHair gratuitement.',
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950">
      <Container>
        <div className="py-32 text-center">
          <div className="mb-6 flex justify-center">
            <Badge variant="dark">Vitrine en cours de construction — Sprint Marketing</Badge>
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            KalendHair
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-slate-400">
            Votre salon, géré depuis une seule application.
            <br />
            Agenda, caisse, stocks et clients — tout en un.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button href="/contact?type=essai" size="lg">
              Essayer gratuitement
            </Button>
            <Button href="/demo" variant="outline-white" size="lg">
              Voir la démo →
            </Button>
          </div>
          <p className="mt-12 text-sm text-slate-500">
            L&apos;application professionnelle est disponible sur{' '}
            <a
              href="https://pro.kalendhair.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 transition-colors hover:text-indigo-300"
            >
              pro.kalendhair.fr
            </a>
          </p>
        </div>
      </Container>
    </div>
  )
}
