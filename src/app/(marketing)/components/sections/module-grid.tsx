import Link from 'next/link'
import { Container } from '../ui/container'
import { SectionTitle } from '../ui/section-title'
import { Button } from '../ui/button'
import { cn } from '@/lib/cn'

/* ─── SVG icon primitives ─────────────────────────────────────────────────── */

function Icon({ path, className }: { path: string; className?: string }) {
  return (
    <svg
      className={cn('h-5 w-5', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  )
}

/* ─── Module data ─────────────────────────────────────────────────────────── */

interface Module {
  title: string
  description: string
  href: string
  iconPath: string
}

const MODULES: Module[] = [
  {
    title: 'Rendez-vous',
    description: 'Créez, modifiez et annulez en quelques secondes. Historique complet inclus.',
    href: '/fonctionnalites#rdv',
    iconPath:
      'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  },
  {
    title: 'Agenda visuel',
    description: 'Vue semaine multi-employés en temps réel. Chaque créneau, chaque employé.',
    href: '/fonctionnalites#agenda',
    iconPath:
      'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z',
  },
  {
    title: 'Réservation publique',
    description: 'Votre page de réservation partageable. Disponible 24h/24, sans commission.',
    href: '/fonctionnalites#reservation',
    iconPath:
      'M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.919 17.919 0 01-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418',
  },
  {
    title: 'Clients & CRM',
    description: 'Fiche client, historique des visites, notes internes. Rien ne se perd.',
    href: '/fonctionnalites#clients',
    iconPath:
      'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
  },
  {
    title: 'Caisse & Paiements',
    description: 'Encaissement multi-méthode. Reçus numérotés conformes DGFIP à chaque fois.',
    href: '/fonctionnalites#caisse',
    iconPath:
      'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z',
  },
  {
    title: 'Stocks & Produits',
    description: 'Suivi des quantités, alertes rupture, mouvements. Votre inventaire en temps réel.',
    href: '/fonctionnalites#stocks',
    iconPath:
      'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z',
  },
  {
    title: 'Fournisseurs',
    description: 'Bons de commande, réceptions, états de livraison. Fini les oublis de commande.',
    href: '/fonctionnalites#fournisseurs',
    iconPath:
      'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124l-.514-7.375A1.125 1.125 0 0018.375 9.75H14.25m5.25 0v4.5m-5.25-4.5h-3M14.25 9.75V4.5a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25v10.5',
  },
  {
    title: 'Commissions',
    description: 'Règles automatiques par employé, service ou produit. Calcul sans erreur.',
    href: '/fonctionnalites#commissions',
    iconPath:
      'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z',
  },
  {
    title: 'KPI & Dashboard',
    description: "Chiffre d'affaires, taux de remplissage, top services. Décidez avec les bonnes données.",
    href: '/fonctionnalites#kpi',
    iconPath:
      'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
  },
]

/* ─── Module card ─────────────────────────────────────────────────────────── */

function ModuleCard({ module }: { module: Module }) {
  return (
    <Link
      href={module.href}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 transition-colors group-hover:bg-indigo-100">
        <Icon path={module.iconPath} className="text-indigo-600" />
      </div>
      <h3 className="mb-2 text-sm font-semibold text-slate-900">{module.title}</h3>
      <p className="text-sm leading-relaxed text-slate-500">{module.description}</p>
    </Link>
  )
}

/* ─── Module grid ─────────────────────────────────────────────────────────── */

export function ModuleGrid() {
  return (
    <section className="bg-slate-50 py-24 sm:py-28" aria-labelledby="modules-title">
      <Container>
        <SectionTitle
          id="modules-title"
          eyebrow="Modules"
          title="Tout ce dont votre salon a besoin"
          subtitle="Une plateforme. Pas 5 abonnements."
        />
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((mod) => (
            <ModuleCard key={mod.title} module={mod} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button href="/fonctionnalites" variant="secondary" size="lg">
            Voir toutes les fonctionnalités →
          </Button>
        </div>
      </Container>
    </section>
  )
}
