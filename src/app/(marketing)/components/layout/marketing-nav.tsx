'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/cn'

const NAV_PRODUCT = [
  {
    label: 'Fonctionnalités',
    href: '/fonctionnalites',
    desc: '14 modules pour votre salon',
  },
  {
    label: 'Démonstration',
    href: '/demo',
    desc: 'Explorez les écrans du produit',
  },
  {
    label: 'Pourquoi KalendHair',
    href: '/pourquoi-kalendhair',
    desc: 'Bénéfices métier concrets',
  },
]

const NAV_RESOURCES = [
  { label: 'À propos', href: '/a-propos', desc: 'Notre histoire et notre vision' },
  { label: 'Roadmap', href: '/roadmap', desc: 'Ce qui arrive prochainement' },
  { label: 'Aide & Support', href: '/aide', desc: 'FAQ, tutoriels et guides' },
]

type DropdownKey = 'produit' | 'ressources' | null

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<DropdownKey>(null)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null)
        setMobileOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  const linkColor = scrolled
    ? 'text-slate-700 hover:text-slate-900'
    : 'text-white/90 hover:text-white'

  const logoColor = scrolled ? 'text-slate-900' : 'text-white'

  const mobileLinkClass = scrolled
    ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
    : 'text-white/80 hover:bg-white/10 hover:text-white'

  const mobileSeparator = scrolled ? 'bg-slate-200' : 'bg-white/10'
  const mobileGroupLabel = scrolled ? 'text-slate-400' : 'text-white/40'

  return (
    <header
      ref={navRef}
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 shadow-sm backdrop-blur-md'
          : mobileOpen
            ? 'bg-slate-950'
            : 'bg-transparent',
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className={cn('flex items-center gap-2.5 transition-colors', logoColor)}
            onClick={closeMobile}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white shadow-sm"
              aria-hidden="true"
            >
              K
            </div>
            <span className="font-semibold tracking-tight">KalendHair</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
            {/* Dropdown : Produit */}
            <div
              className="relative"
              onMouseEnter={() => setOpenDropdown('produit')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                type="button"
                aria-expanded={openDropdown === 'produit'}
                aria-haspopup="true"
                className={cn(
                  'flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  linkColor,
                  openDropdown === 'produit' &&
                    (scrolled ? 'bg-slate-100' : 'bg-white/10'),
                )}
                onClick={() =>
                  setOpenDropdown(openDropdown === 'produit' ? null : 'produit')
                }
              >
                Produit
                <svg
                  className={cn(
                    'h-3.5 w-3.5 opacity-60 transition-transform duration-150',
                    openDropdown === 'produit' && 'rotate-180',
                  )}
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </button>
              {openDropdown === 'produit' && (
                <div
                  role="menu"
                  className="absolute left-0 top-full mt-1 w-64 rounded-xl bg-white p-2 shadow-lg ring-1 ring-slate-100"
                >
                  {NAV_PRODUCT.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      className="flex flex-col rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-50"
                      onClick={() => setOpenDropdown(null)}
                    >
                      <span className="text-sm font-medium text-slate-900">
                        {item.label}
                      </span>
                      <span className="mt-0.5 text-xs text-slate-500">{item.desc}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Dropdown : Ressources */}
            <div
              className="relative"
              onMouseEnter={() => setOpenDropdown('ressources')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                type="button"
                aria-expanded={openDropdown === 'ressources'}
                aria-haspopup="true"
                className={cn(
                  'flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  linkColor,
                  openDropdown === 'ressources' &&
                    (scrolled ? 'bg-slate-100' : 'bg-white/10'),
                )}
                onClick={() =>
                  setOpenDropdown(openDropdown === 'ressources' ? null : 'ressources')
                }
              >
                Ressources
                <svg
                  className={cn(
                    'h-3.5 w-3.5 opacity-60 transition-transform duration-150',
                    openDropdown === 'ressources' && 'rotate-180',
                  )}
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </button>
              {openDropdown === 'ressources' && (
                <div
                  role="menu"
                  className="absolute left-0 top-full mt-1 w-64 rounded-xl bg-white p-2 shadow-lg ring-1 ring-slate-100"
                >
                  {NAV_RESOURCES.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      className="flex flex-col rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-50"
                      onClick={() => setOpenDropdown(null)}
                    >
                      <span className="text-sm font-medium text-slate-900">
                        {item.label}
                      </span>
                      <span className="mt-0.5 text-xs text-slate-500">{item.desc}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/tarifs"
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                linkColor,
              )}
            >
              Tarifs
            </Link>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-2 md:flex">
            <a
              href="https://pro.kalendhair.fr/login"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                linkColor,
              )}
            >
              Se connecter
            </a>
            <Link
              href="/inscription"
              className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              Essayer gratuitement
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            type="button"
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            className={cn(
              'rounded-lg p-2 transition-colors md:hidden',
              scrolled
                ? 'text-slate-700 hover:bg-slate-100'
                : 'text-white hover:bg-white/10',
            )}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav id="mobile-menu" aria-label="Navigation mobile">
            <div
              className={cn(
                'flex flex-col gap-1 border-t pb-4 pt-2',
                scrolled ? 'border-slate-200' : 'border-white/10',
              )}
            >
              <p
                className={cn(
                  'px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                  mobileGroupLabel,
                )}
              >
                Produit
              </p>
              {NAV_PRODUCT.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    mobileLinkClass,
                  )}
                  onClick={closeMobile}
                >
                  {item.label}
                </Link>
              ))}

              <div className={cn('my-2 h-px', mobileSeparator)} />

              <p
                className={cn(
                  'px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                  mobileGroupLabel,
                )}
              >
                Ressources
              </p>
              {NAV_RESOURCES.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    mobileLinkClass,
                  )}
                  onClick={closeMobile}
                >
                  {item.label}
                </Link>
              ))}

              <div className={cn('my-2 h-px', mobileSeparator)} />

              <Link
                href="/tarifs"
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  mobileLinkClass,
                )}
                onClick={closeMobile}
              >
                Tarifs
              </Link>

              <div className={cn('my-3 h-px', mobileSeparator)} />

              <a
                href="https://pro.kalendhair.fr/login"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  mobileLinkClass,
                )}
              >
                Se connecter ↗
              </a>
              <Link
                href="/inscription"
                className="mt-1 flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                onClick={closeMobile}
              >
                Essayer gratuitement
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
