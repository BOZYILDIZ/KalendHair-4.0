import { Container } from '../ui/container'

interface TrustItem {
  icon: React.ReactNode
  title: string
  desc: string
}

function GlobeIcon() {
  return (
    <svg
      className="h-5 w-5 text-indigo-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.919 17.919 0 01-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg
      className="h-5 w-5 text-indigo-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function NoCommissionIcon() {
  return (
    <svg
      className="h-5 w-5 text-indigo-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg
      className="h-5 w-5 text-indigo-600"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

const TRUST_ITEMS: TrustItem[] = [
  {
    icon: <GlobeIcon />,
    title: 'Hébergé en Europe',
    desc: 'Serveurs en France et Allemagne',
  },
  {
    icon: <NoCommissionIcon />,
    title: 'Zéro commission',
    desc: 'Chaque réservation vous revient intégralement',
  },
  {
    icon: <ShieldIcon />,
    title: 'Données sécurisées',
    desc: 'Chiffrement TLS, sauvegardes quotidiennes',
  },
  {
    icon: <CalendarIcon />,
    title: 'Sans engagement',
    desc: 'Résiliez à tout moment, sans frais',
  },
]

export function TrustStrip() {
  return (
    <div className="border-y border-slate-200 bg-white">
      <Container>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 py-10 sm:gap-x-8 lg:grid-cols-4">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                {item.icon}
              </div>
              <div className="min-w-0">
                <dt className="text-sm font-semibold text-slate-900">{item.title}</dt>
                <dd className="mt-0.5 text-sm text-slate-500">{item.desc}</dd>
              </div>
            </div>
          ))}
        </dl>
      </Container>
    </div>
  )
}
