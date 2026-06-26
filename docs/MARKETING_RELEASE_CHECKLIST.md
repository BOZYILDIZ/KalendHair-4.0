# MARKETING_RELEASE_CHECKLIST — Checklist de lancement vitrine KalendHair

> À valider avant de considérer la vitrine marketing comme prête pour la mise en production publique.  
> Dernière mise à jour : Juin 2026.

---

## 1. Branding

| Item | État | Notes |
|---|---|---|
| SVG favicon `app/icon.svg` | ✅ Livré | Logo K indigo, scalable, moderne |
| Apple Touch Icon `app/apple-icon.tsx` | ✅ Livré | 180×180 via ImageResponse, généré dynamiquement |
| Open Graph image `(marketing)/opengraph-image.tsx` | ✅ Livré | 1200×630, KalendHair branding dark |
| Twitter image `(marketing)/twitter-image.tsx` | ✅ Livré | 1200×630, même branding |
| Logo PNG haute résolution `public/logo.png` | ⬜ À créer | 800×200 min, fond transparent, format PNG |
| Favicon ICO `public/favicon.ico` | ⬜ À créer | 32×32 + 16×16 multi-résolution ICO |
| PWA icon 192×192 `public/icon-192.png` | ⬜ À créer | Pour manifest.webmanifest |
| PWA icon 512×512 `public/icon-512.png` | ⬜ À créer | Pour manifest.webmanifest |
| Charte couleurs officielle | ⬜ À valider | Indigo #4f46e5 utilisé partout — confirmer avec Hasan |
| Police officielle | ✅ Livré | Geist (Google) — Next.js font optimization |

---

## 2. SEO

| Item | État | Notes |
|---|---|---|
| `sitemap.xml` généré | ✅ Livré | 11 URLs, priority/changeFrequency adaptées |
| `robots.txt` configuré | ✅ Livré | Allow `/`, disallow admin/dashboard/login/book/api |
| `manifest.webmanifest` | ✅ Livré | PWA-ready, theme indigo |
| metadataBase `https://kalendhair.fr` | ✅ Livré | Root layout + marketing layout |
| Title unique sur chaque page | ✅ Livré | Pattern `Page — KalendHair` |
| Description unique sur chaque page | ✅ Livré | Mots-clés salon de coiffure inclus |
| Open Graph sur toutes les pages marketing | ✅ Livré | title/description/url/type |
| Twitter Cards sur toutes les pages marketing | ✅ Livré | `summary_large_image` pour pages produit, `summary` pour légales |
| Canonical URL sur chaque page | ✅ Livré | `alternates.canonical` explicite |
| JSON-LD `Organization` | ✅ Livré | Homepage — name/url/logo/contactPoint |
| JSON-LD `SoftwareApplication` | ✅ Livré | Homepage — category/OS/offers (pilote gratuit) |
| JSON-LD `BreadcrumbList` sur pages secondaires | ✅ Livré | /contact /mentions-legales /confidentialite /conditions-utilisation |
| JSON-LD `FAQPage` sur `/aide` | ⬜ À faire | Ajouter après merge de la branche PR #55 |
| JSON-LD `BreadcrumbList` sur pages PR #53–#55 | ⬜ À faire | /fonctionnalites /demo /tarifs /a-propos /roadmap /aide |
| Soumission Google Search Console | ⬜ À faire | Après go-live public |
| Vérification Bing Webmaster Tools | ⬜ À faire | Optionnel |
| Validation schema.org Rich Results Test | ⬜ À faire | Après go-live |

---

## 3. Responsive

| Page | Desktop | Tablette 768px | Mobile 375px | État |
|---|---|---|---|---|
| `/` (Homepage) | ✅ | ✅ | ✅ | Vérifié code |
| `/contact` | ✅ | ✅ | ✅ | Vérifié code |
| `/mentions-legales` | ✅ | ✅ | ✅ | Vérifié code |
| `/confidentialite` | ✅ | ✅ | ✅ | Vérifié code |
| `/conditions-utilisation` | ✅ | ✅ | ✅ | Vérifié code |
| `/fonctionnalites` | ⬜ | ⬜ | ⬜ | Test à faire après merge PR #54 |
| `/demo` | ⬜ | ⬜ | ⬜ | Test à faire après merge PR #54 |
| `/tarifs` | ⬜ | ⬜ | ⬜ | Test à faire après merge PR #55 |
| `/a-propos` | ⬜ | ⬜ | ⬜ | Test à faire après merge PR #55 |
| `/roadmap` | ⬜ | ⬜ | ⬜ | Test à faire après merge PR #55 |
| `/aide` | ⬜ | ⬜ | ⬜ | Test à faire après merge PR #55 |
| Navigation mobile | ✅ | ✅ | ✅ | Hamburger avec Escape, resize |
| Footer | ✅ | ✅ | ✅ | grid-cols-2 → lg:grid-cols-4 |

---

## 4. Accessibilité

| Item | État | Notes |
|---|---|---|
| Skip navigation link | ✅ Livré | "Aller au contenu principal" — visible au focus clavier |
| `<main id="main-content">` | ✅ Livré | Cible du skip nav |
| `<header>` landmark | ✅ | MarketingNav utilise `<header>` |
| `<nav>` landmark avec aria-label | ✅ | "Navigation principale" + "Navigation mobile" |
| `<main>` landmark | ✅ | MarketingLayout |
| `<footer>` landmark | ✅ | MarketingFooter |
| `aria-expanded` sur hamburger | ✅ | Géré dans MarketingNav |
| `aria-controls="mobile-menu"` | ✅ | Géré dans MarketingNav |
| `aria-label` sur hamburger | ✅ | "Ouvrir/Fermer le menu" |
| `aria-expanded` sur dropdowns desktop | ✅ | Produit/Ressources |
| `aria-hidden="true"` sur SVGs décoratifs | ✅ | Implémenté dans tous les composants |
| Focus ring visible sur tous les éléments interactifs | ✅ | `focus-visible:ring-2 focus-visible:ring-indigo-500` |
| `role="alert"` sur erreurs formulaire | ✅ | PilotContactForm |
| `aria-describedby` sur champs invalides | ✅ | PilotContactForm |
| `aria-invalid` sur champs en erreur | ✅ | PilotContactForm |
| `aria-busy` sur submit pending | ✅ | PilotContactForm |
| `<fieldset>/<legend>` sur groupe modules | ✅ | PilotContactForm |
| Contraste texte ≥ 4.5:1 | ✅ | slate-900 sur blanc, slate-400 sur dark |
| Ordre logique des titres H1→H2→H3 | ✅ | Vérifié sur toutes les pages existantes |
| Textes alternatifs sur images | ⬜ | À vérifier quand les captures seront ajoutées |
| Test axe-core / Lighthouse Accessibility | ⬜ | À faire après go-live |

---

## 5. Captures produit

> Voir `docs/SCREENSHOTS_SPEC.md` pour les spécifications détaillées.

| Capture | Module | Dimensions | Priorité | État |
|---|---|---|---|---|
| Agenda jour (vue complète) | Agenda | 1280×800 | ★★★ | ⬜ À créer |
| Agenda semaine (multi-coiffeurs) | Agenda | 1280×800 | ★★★ | ⬜ À créer |
| Réservation publique (étape 1) | Booking | 375×812 | ★★★ | ⬜ À créer |
| Réservation publique (confirmation) | Booking | 375×812 | ★★ | ⬜ À créer |
| CRM — fiche client | CRM | 1280×800 | ★★ | ⬜ À créer |
| KPI dashboard | KPI | 1280×800 | ★★★ | ⬜ À créer |
| Paiements — caisse | Caisse | 1280×800 | ★★ | ⬜ À créer |
| Stocks — inventaire | Stocks | 1280×800 | ★★ | ⬜ À créer |
| Super Admin | Admin | 1280×800 | ★ | ⬜ À créer |
| DemoTabs (6 onglets) | Demo | 1280×720 | ★★★ | ⬜ À créer |

**Prérequis** : Constituer le salon de démonstration "L'Atelier Lumière" (voir onboarding Super Admin).

---

## 6. Lighthouse (estimations)

> Estimations basées sur l'analyse du code. Validation réelle requise via Chrome DevTools ou PageSpeed Insights.

| Métrique | Estimation | Facteurs favorables |
|---|---|---|
| Performance | ~95–98 | SSG pur (○ Static), Geist via `next/font`, pas de JS côté client inutile, pas de grandes images pour l'instant |
| Accessibility | ~92–96 | Skip nav ✅, ARIA complet ✅, labels ✅, focus rings ✅ — risque sur contrastes à valider visuellement |
| Best Practices | ~95–100 | HTTPS ✅, no console errors attendus, manifest ✅ |
| SEO | ~100 | metadataBase ✅, sitemap ✅, robots ✅, canonical ✅, meta description ✅ |

**Points à surveiller** :
- Performance : ajouter `loading="lazy"` sur toutes les images quand les captures seront intégrées
- Performance : préférer `next/image` avec `priority` pour les images above-the-fold
- Accessibility : vérifier visuellement les contrastes sur les états hover/focus

---

## 7. Lancement marketing

| Étape | État | Responsable |
|---|---|---|
| Validation ChatGPT — Phase marketing terminée | ✅ | ChatGPT |
| Merge séquentiel PR #53→#54→#55→#56→#57→#58→#59 | ⬜ | Hasan |
| Test de régression post-merge (login/dashboard/book) | ⬜ | Hasan / Claude |
| Vérification kalendhair.fr (toutes pages) | ⬜ | Hasan |
| Soumission sitemap Google Search Console | ⬜ | Hasan |
| Validation Rich Results Test (JSON-LD) | ⬜ | Hasan |
| Test Lighthouse production (PageSpeed Insights) | ⬜ | Hasan |
| Constitution salon "L'Atelier Lumière" | ⬜ | Hasan |
| Capture des 20 screenshots produit | ⬜ | Hasan |
| Intégration screenshots dans les pages | ⬜ | Claude |
| Activation Resend (`CONTACT_TO_EMAIL`) | ⬜ | Hasan — sur validation explicite |
| Communication pilote (email, réseau) | ⬜ | Hasan |
| Sélection premiers salons pilotes (3–5) | ⬜ | Hasan |
| Onboarding premier salon via Super Admin | ⬜ | Hasan / Claude |

---

## Ordre de merge recommandé

Les branches marketing sont stacked (chacune dépend de la précédente) :

```
main
 └─ PR #51 (marketing/pr1-structure-layout) ← mergée ✅
 └─ PR #52 (marketing/pr2-homepage) ← mergée ✅
 └─ PR #53 (pricing teaser + pilot CTA homepage) ← en attente
 └─ PR #54 (fonctionnalites + demo) ← dépend PR #53
 └─ PR #55 (tarifs + a-propos + roadmap + aide) ← dépend PR #54
 └─ PR #56 (contact + merci) ← peut merger indépendamment
 └─ PR #57 (légales) ← dépend PR #56
 └─ PR #58 (SEO) ← dépend PR #57
 └─ PR #59 (polish) ← dépend PR #58
```

Merger dans cet ordre exact pour éviter les conflits.

---

_Document créé : Juin 2026 — Phase marketing vitrine v1 terminée._
