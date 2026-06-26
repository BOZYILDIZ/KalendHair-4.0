import { Container } from '../ui/container'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { ScreenshotFrame } from '../ui/screenshot-frame'

const TRUST_SIGNALS = [
  'Sans commission sur les réservations',
  'Hébergé en Europe',
  'Sans engagement',
] as const

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-indigo-500"
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

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-slate-950" aria-label="Présentation">
      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden="true"
      />
      {/* Indigo glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 55% 70% at 68% 30%, rgba(79,70,229,0.22) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />
      {/* Bottom fade */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-32"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(15,15,26,0.8))',
        }}
        aria-hidden="true"
      />

      <Container className="relative z-10 pt-28 pb-20 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-36">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16 xl:gap-24">
          {/* ── Text column ── */}
          <div className="mk-animate-fade-up">
            <div className="mb-6">
              <Badge variant="dark">Accès pilote ouvert · Gratuit</Badge>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.5rem] xl:text-6xl leading-[1.1]">
              Votre salon, géré depuis{' '}
              <span className="text-indigo-400">une seule application.</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400 sm:text-xl">
              Rendez-vous, caisse, stocks et clients. KalendHair remplace vos outils
              fragmentés par une plateforme pensée pour les coiffeurs.
            </p>

            <div className="mt-10 flex flex-wrap gap-3 sm:gap-4">
              <Button href="/inscription" size="lg">
                Essayer gratuitement
              </Button>
              <Button href="/demo" variant="outline-white" size="lg">
                Voir la démo →
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2.5">
              {TRUST_SIGNALS.map((signal) => (
                <span
                  key={signal}
                  className="flex items-center gap-1.5 text-sm text-slate-500"
                >
                  <CheckIcon />
                  {signal}
                </span>
              ))}
            </div>
          </div>

          {/* ── Screenshot column ── */}
          <div className="mk-animate-fade-up mk-animate-delay-300">
            <ScreenshotFrame
              label="Dashboard KPI — capture en cours de préparation"
              className="shadow-[0_0_100px_rgba(79,70,229,0.18)] ring-white/10"
            />
          </div>
        </div>
      </Container>
    </section>
  )
}
