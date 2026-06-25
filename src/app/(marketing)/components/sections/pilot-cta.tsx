import { Container } from '../ui/container'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

const TRUST_PILLS = [
  'Aucune carte bancaire requise',
  'Réponse sous 24 h',
  'Accompagnement personnalisé',
  'Sans engagement',
]

export function PilotCta() {
  return (
    <section
      className="relative overflow-hidden bg-indigo-600 py-24 sm:py-28"
      aria-labelledby="pilot-cta-title"
    >
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      {/* Soft radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(99,102,241,0.5) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <Container className="relative z-10 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="flex justify-center">
            <Badge variant="dark">Accès pilote ouvert</Badge>
          </div>

          <h2
            id="pilot-cta-title"
            className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl"
          >
            Rejoignez les premiers salons pilotes
          </h2>

          <p className="mt-6 text-lg leading-8 text-indigo-100">
            Soyez parmi les premiers à transformer la gestion de votre salon.
            Accès gratuit complet, accompagnement personnalisé, et votre avis compte pour
            construire le produit.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button
              href="/contact?type=essai"
              variant="white"
              size="lg"
            >
              Rejoindre les premiers salons pilotes
            </Button>
            <Button
              href="/demo"
              variant="outline-white"
              size="lg"
            >
              Voir la démo →
            </Button>
          </div>

          <ul
            className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
            aria-label="Garanties"
          >
            {TRUST_PILLS.map((pill) => (
              <li key={pill} className="flex items-center gap-1.5 text-sm text-indigo-100">
                <svg
                  className="h-4 w-4 shrink-0 text-indigo-300"
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
                {pill}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  )
}
