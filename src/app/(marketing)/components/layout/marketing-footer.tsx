import Link from 'next/link'
import { Container } from '../ui/container'

const FOOTER_PRODUCT = [
  { label: 'Fonctionnalités', href: '/fonctionnalites' },
  { label: 'Démonstration', href: '/demo' },
  { label: 'Tarifs', href: '/tarifs' },
  { label: 'Roadmap', href: '/roadmap' },
]

const FOOTER_RESOURCES = [
  { label: 'Pourquoi KalendHair', href: '/pourquoi-kalendhair' },
  { label: 'À propos', href: '/a-propos' },
  { label: 'Aide & Support', href: '/aide' },
  { label: 'Contact', href: '/contact' },
]

const FOOTER_LEGAL = [
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'Politique de confidentialité', href: '/politique-confidentialite' },
  { label: 'CGV', href: '/cgv' },
]

const FOOTER_ACCESS = [
  {
    label: 'Espace professionnel ↗',
    href: 'https://pro.kalendhair.fr/login',
  },
  {
    label: 'Espace admin ↗',
    href: 'https://admin.kalendhair.fr',
  },
]

interface FooterColProps {
  title: string
  links: Array<{ label: string; href: string }>
  external?: boolean
}

function FooterCol({ title, links, external }: FooterColProps) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-white">{title}</h3>
      <ul className="space-y-3">
        {links.map((item) => (
          <li key={item.href}>
            {external ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-400 transition-colors hover:text-white"
              >
                {item.label}
              </a>
            ) : (
              <Link
                href={item.href}
                className="text-sm text-slate-400 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/5 bg-slate-950">
      <Container>
        <div className="grid grid-cols-2 gap-8 py-16 lg:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                K
              </div>
              <span className="font-semibold text-white">KalendHair</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-slate-400">
              Gestion de salon. Simple.
            </p>
            <p className="mt-6 text-xs leading-relaxed text-slate-500">
              © 2026 KalendHair
              <br />
              Fait avec ♥ en France
            </p>
          </div>

          <FooterCol title="Produit" links={FOOTER_PRODUCT} />
          <FooterCol title="Ressources" links={FOOTER_RESOURCES} />

          {/* Legal + Access merged */}
          <div>
            <FooterCol title="Légal" links={FOOTER_LEGAL} />
            <div className="mt-8">
              <FooterCol title="Accès" links={FOOTER_ACCESS} external />
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}
