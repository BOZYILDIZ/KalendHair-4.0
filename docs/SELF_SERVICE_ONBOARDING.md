# SELF_SERVICE_ONBOARDING — Architecture du parcours d'inscription autonome

> Document d'architecture de la **Product Phase 2 — Self-Service Onboarding**.  
> Aucune implémentation dans ce document. Uniquement l'architecture cible.  
> Auteur : Claude Sonnet 4.6 · Création : Juin 2026.

---

## Table des matières

1. [Parcours utilisateur complet](#1-parcours-utilisateur-complet)
2. [États possibles](#2-états-possibles)
3. [Wizard d'onboarding](#3-wizard-donboarding)
4. [Données manipulées](#4-données-manipulées)
5. [Gestion des erreurs](#5-gestion-des-erreurs)
6. [Sécurité](#6-sécurité)
7. [Architecture technique](#7-architecture-technique)
8. [Roadmap d'implémentation](#8-roadmap-dimpl%C3%A9mentation)

---

## 1. Parcours utilisateur complet

### Diagramme de flux

```
Homepage (/)
  │
  └─ CTA "Essayer gratuitement"
       │
       ▼
[/inscription] ─── Formulaire d'inscription
  │  Champs : prénom, nom, email, mot de passe
  │  Server Action → $transaction :
  │    1. Vérifier unicité email (P2002 guard)
  │    2. Créer ProUser (OWNER, bcrypt x12)
  │    3. Créer Organization (slug dérivé + unicité)
  │    4. Créer OrganizationSubscription (ESSENTIAL TRIAL 14j)
  │    5. Signer JWT → cookie session
  │
  ▼
[/onboarding] ─── Wizard de configuration (6 étapes)
  │
  ├─ Étape 1 : Informations du salon
  │    → Crée Salon (name, email, phone, timezone)
  │
  ├─ Étape 2 : Adresse
  │    → Met à jour Salon (address, city, postalCode)
  │
  ├─ Étape 3 : Horaires d'ouverture
  │    → Crée SalonSchedule (7 jours, défaut Lun–Sam 9h–18h)
  │
  ├─ Étape 4 : Employés (optionnel, min 0)
  │    → Crée Employee(s) (firstName, lastName, email?)
  │    → Crée ProUser (EMPLOYEE) si email fourni
  │
  ├─ Étape 5 : Prestations (optionnel, min 0)
  │    → Crée Service(s) (name, durationMinutes, priceCents)
  │
  └─ Étape 6 : Confirmation
       → Met à jour Organization.onboardingStep = COMPLETED
       → Redirect → /dashboard
```

### Description étape par étape

| Étape | Route | Action | Résultat |
|---|---|---|---|
| Arrivée homepage | `/` | Clic "Essayer gratuitement" | Redirect → `/inscription` |
| Inscription | `/inscription` | Soumettre formulaire | ProUser + Org + Subscription créés, JWT signé, redirect → `/onboarding` |
| Vérification email | *(différée)* | Clic lien email | *(non implémenté Phase 2 — architecture prévue)* |
| Onboarding étape 1 | `/onboarding` | Soumettre infos salon | Salon créé, wizard step 2 |
| Onboarding étape 2 | `/onboarding?step=2` | Soumettre adresse | Salon mis à jour, wizard step 3 |
| Onboarding étape 3 | `/onboarding?step=3` | Soumettre horaires | SalonSchedule créés, wizard step 4 |
| Onboarding étape 4 | `/onboarding?step=4` | Ajouter employés (ou passer) | Employee(s) créés, wizard step 5 |
| Onboarding étape 5 | `/onboarding?step=5` | Ajouter prestations (ou passer) | Service(s) créés, wizard step 6 |
| Onboarding étape 6 | `/onboarding?step=6` | Confirmer | `onboardingStep = COMPLETED`, redirect → `/dashboard` |
| Dashboard | `/dashboard` | Accès normal | Session active, onboarding terminé |

### Note sur la vérification email

La vérification email n'est **pas** implémentée en Phase 2. Le compte est actif immédiatement après inscription. La vérification email est documentée ci-dessous pour la Phase 3 :

- À l'inscription : générer un token `emailVerificationToken` (UUID v4, 24h) stocké sur `ProUser`
- Envoyer email avec lien `/inscription/verify?token=XXX`
- Route `/inscription/verify` : valider le token, marquer `emailVerifiedAt = now()`
- Le wizard est accessible avant vérification (RESEND inactif jusqu'à validation Hasan)
- Afficher une bannière d'avertissement si email non vérifié

---

## 2. États possibles

### Statuts d'onboarding

L'état d'onboarding est dérivé des données existantes **sans migration initiale**, puis persité via un champ `onboardingStep` ajouté à `Organization` en PR2.

```
INSCRIPTION_COMMENCEE   → ProUser + Organization créés, session active
                          → Salon inexistant → wizard step 1
                          → Redirecté vers /onboarding

EMAIL_NON_VERIFIE       → ProUser.emailVerifiedAt = null
                          → Bannière d'avertissement (non-bloquant Phase 2)
                          → Wizard accessible

ORGANISATION_CREEE      → Organization créée, Salon inexistant
                          → Équivalent à INSCRIPTION_COMMENCEE

ONBOARDING_EN_COURS     → Salon créé, wizard non finalisé
                          → Dérivé de : Organization.onboardingStep ∈ [1..5]
                          → Redirecté vers /onboarding?step=N

ONBOARDING_TERMINE      → Organization.onboardingStep = "COMPLETED"
                          → Dashboard accessible normalement
```

### Règles de dérivation de l'état (sans migration)

Si `onboardingStep` n'existe pas encore sur `Organization` (avant PR2) :

```typescript
function deriveOnboardingStatus(org: Organization, salon: Salon | null): OnboardingStatus {
  if (!salon) return 'INSCRIPTION_COMMENCEE';
  if (!salon.address) return 'ONBOARDING_EN_COURS'; // step 2
  // SalonSchedule check via count query
  // Employee check via count query
  // Service check via count query
  return 'ONBOARDING_TERMINE'; // fallback pour comptes existants
}
```

Pour les **comptes ProUser existants** (créés via Super Admin avant Phase 2) : si `Organization.onboardingStep` est `null`, l'état est traité comme `ONBOARDING_TERMINE` — aucune régression pour les salons pilotes déjà opérationnels.

---

## 3. Wizard d'onboarding

### Principe de navigation

- URL : `/onboarding?step=N` (1 à 6)
- Navigation : URL-driven (searchParams), pas de state React global
- Persistance : chaque étape écrit en base avant de passer à la suivante
- Reprise : le middleware redirige vers l'étape courante si l'utilisateur revient sur `/onboarding`
- Abandons : l'état partiel est conservé — pas de rollback

### Étape 1 — Informations du salon

**URL** : `/onboarding?step=1`  
**Composant** : `OnboardingStep1SalonInfo` (Client Component)  
**Champs** :

| Champ | Type | Validation | Requis |
|---|---|---|---|
| `name` | string | min 2, max 80 | ✅ |
| `email` | string | email format | ❌ |
| `phone` | string | min 8, max 20 | ❌ |
| `timezone` | string | enum IANA (défaut `Europe/Paris`) | ✅ |

**Server Action** : `createSalonAction`  
**Écriture** : `prisma.salon.create({ organizationId, name, slug, email, phone, timezone })`  
**Slug** : `slugify(name) + '-' + cuid().slice(0, 6)` (garantit unicité)  
**Succès** : redirect `/onboarding?step=2`

### Étape 2 — Adresse

**URL** : `/onboarding?step=2`  
**Composant** : `OnboardingStep2Address` (Client Component)  
**Champs** :

| Champ | Type | Validation | Requis |
|---|---|---|---|
| `address` | string | min 5, max 200 | ❌ |
| `city` | string | min 2, max 80 | ❌ |
| `postalCode` | string | regex `/^\d{5}$/` | ❌ |

**Server Action** : `updateSalonAddressAction`  
**Écriture** : `prisma.salon.update({ where: { organizationId }, data: { address, city, postalCode } })`  
**Bouton "Passer"** : disponible → redirect `/onboarding?step=3` sans écriture  
**Succès** : redirect `/onboarding?step=3`

### Étape 3 — Horaires d'ouverture

**URL** : `/onboarding?step=3`  
**Composant** : `OnboardingStep3Schedules` (Client Component)  
**Données** : Grille 7 jours (Lun–Dim), `isOpen / openTime / closeTime` par jour  
**Défaut prérempli** : Lun–Sam 09:00–18:00, Dim fermé  
**Server Action** : `saveOnboardingScheduleAction` — délègue à `saveSalonSchedule()` existant  
**Écriture** : `SalonSchedule` (7 lignes) via `$transaction([deleteMany, createMany])`  
**Bouton "Passer"** : disponible → redirect `/onboarding?step=4` sans écriture  
**Succès** : redirect `/onboarding?step=4`

### Étape 4 — Employés

**URL** : `/onboarding?step=4`  
**Composant** : `OnboardingStep4Employees` (Client Component)  
**UI** : liste dynamique "Ajouter un employé", mini-form par employé  
**Champs par employé** :

| Champ | Type | Validation | Requis |
|---|---|---|---|
| `firstName` | string | min 1, max 50 | ✅ |
| `lastName` | string | min 1, max 50 | ✅ |
| `email` | string | email format, unicité globale | ❌ |

**Server Action** : `addOnboardingEmployeeAction` (une action par ajout)  
**Écriture** : `prisma.employee.create({ organizationId, salonId, firstName, lastName, email })`  
**Note** : pas de ProUser créé à cette étape (géré dans le dashboard, sprint futur)  
**Bouton "Continuer sans employé"** : disponible  
**Succès** : redirect `/onboarding?step=5` quand l'utilisateur clique "Continuer"

### Étape 5 — Prestations

**URL** : `/onboarding?step=5`  
**Composant** : `OnboardingStep5Services` (Client Component)  
**UI** : liste dynamique "Ajouter une prestation", mini-form par prestation  
**Champs par prestation** :

| Champ | Type | Validation | Requis |
|---|---|---|---|
| `name` | string | min 2, max 80 | ✅ |
| `durationMinutes` | number | enum (15, 30, 45, 60, 90, 120) | ✅ |
| `priceCents` | number | > 0 (saisie en euros, conversion action) | ✅ |

**Prestations suggérées préremplies** (checkboxes rapides) :
- Coupe femme · Coupe homme · Coupe enfant · Brushing · Coloration · Mèches · Soin · Shampoing

**Server Action** : `addOnboardingServiceAction` (une action par ajout)  
**Écriture** : `prisma.service.create({ organizationId, salonId, name, durationMinutes, priceCents, currency: 'EUR' })`  
**Bouton "Continuer sans prestation"** : disponible  
**Succès** : redirect `/onboarding?step=6`

### Étape 6 — Confirmation

**URL** : `/onboarding?step=6`  
**Composant** : `OnboardingStep6Confirm` (Server Component)  
**UI** : Récapitulatif lecture seule (salon, adresse, horaires, N employés, N prestations)  
**Appel d'action** : `completeOnboardingAction`  
**Écriture** : `prisma.organization.update({ where: { id: organizationId }, data: { onboardingStep: 'COMPLETED' } })`  
**Succès** : redirect `/dashboard`

---

## 4. Données manipulées

### Vue d'ensemble des entités

```
ProUser ─────────── créé à l'étape Inscription
   │
Organization ───── créée à l'étape Inscription (avec ProUser, dans $transaction)
   │
OrganizationSubscription ─── créée à l'étape Inscription (plan ESSENTIAL TRIAL 14j)
   │
Salon ─────────────── créé à l'étape Wizard 1 (Infos salon)
   │
SalonSchedule (×7) ── créées à l'étape Wizard 3 (Horaires)
   │
Employee ─────────── créé(s) à l'étape Wizard 4 (optionnel)
   │
Service ──────────── créé(s) à l'étape Wizard 5 (optionnel)
```

### Détail des écritures par étape

#### Étape Inscription — `/inscription` (Server Action)

```
$transaction([
  prisma.proUser.create({
    data: {
      email: email.toLowerCase(),
      firstName,
      lastName,
      passwordHash: await hashPassword(password),  // bcrypt x12
      role: 'OWNER',
      isActive: true,
      organization: {
        create: {
          name: organizationName,
          slug: generateUniqueSlug(organizationName),
          isActive: true,
          onboardingStep: 'SALON_INFO',  // nouveau champ (PR2 migration)
          orgSubscription: {
            create: {
              planId: essentialPlanId,
              status: 'TRIAL',
              billingCycle: 'MONTHLY',
              trialEndsAt: addDays(now, 14),
              currentPeriodStart: now,
              currentPeriodEnd: addMonths(now, 1),
            }
          }
        }
      }
    },
    include: { organization: true }
  })
])
→ signToken({ id: proUser.id, organizationId: org.id, role: 'OWNER' })
→ cookies().set('session', token, { httpOnly, secure, sameSite: 'lax', maxAge: 86400 })
→ redirect('/onboarding')
```

#### Étape Wizard 1 — Infos salon

```
prisma.salon.create({
  data: {
    organizationId,
    name,
    slug: generateUniqueSlug(name),
    email: email ?? null,
    phone: phone ?? null,
    timezone,
    isActive: true,
  }
})
+ prisma.organization.update({ data: { onboardingStep: 'ADDRESS' } })
```

#### Étape Wizard 2 — Adresse (si remplie)

```
prisma.salon.update({
  where: { organizationId },
  data: { address, city, postalCode }
})
+ prisma.organization.update({ data: { onboardingStep: 'SCHEDULES' } })
```

#### Étape Wizard 3 — Horaires (si remplis)

```
// Réutilise saveSalonSchedule() existant (src/features/schedules/salon-schedule.service.ts)
saveSalonSchedule(salonId, organizationId, days)
+ prisma.organization.update({ data: { onboardingStep: 'EMPLOYEES' } })
```

#### Étape Wizard 4 — Employés (par ajout)

```
prisma.employee.create({
  data: {
    organizationId,
    salonId,
    firstName,
    lastName,
    email: email?.toLowerCase() ?? null,
    isActive: true,
  }
})
// Pas de mise à jour onboardingStep ici — géré au "Continuer"
```

Quand l'utilisateur clique "Continuer" :
```
prisma.organization.update({ data: { onboardingStep: 'SERVICES' } })
```

#### Étape Wizard 5 — Prestations (par ajout)

```
prisma.service.create({
  data: {
    organizationId,
    salonId,
    name,
    durationMinutes,
    priceCents: Math.round(priceEuros * 100),
    currency: 'EUR',
    isActive: true,
  }
})
// Pas de mise à jour onboardingStep ici — géré au "Continuer"
```

Quand l'utilisateur clique "Continuer" :
```
prisma.organization.update({ data: { onboardingStep: 'CONFIRMATION' } })
```

#### Étape Wizard 6 — Confirmation

```
prisma.organization.update({
  where: { id: organizationId },
  data: { onboardingStep: 'COMPLETED' }
})
→ redirect('/dashboard')
```

### Migration requise (PR2)

```sql
-- Ajout du champ onboardingStep sur organizations
ALTER TABLE organizations ADD COLUMN onboarding_step TEXT;

-- Valeurs possibles : SALON_INFO | ADDRESS | SCHEDULES | EMPLOYEES | SERVICES | CONFIRMATION | COMPLETED
-- NULL = compte existant pré-Phase 2 → traité comme COMPLETED par le middleware
```

> ⚠️ Strictement additive — aucun `ALTER TYPE` sur les enums existants, aucun `DROP`.

---

## 5. Gestion des erreurs

### Abandon du wizard

- L'utilisateur ferme le navigateur ou navigue ailleurs en cours de wizard.
- L'état partiel est **conservé** en base (pas de rollback automatique).
- À la prochaine connexion, le middleware lit `Organization.onboardingStep` et redirige vers `/onboarding?step=N`.
- Si le Salon n'a pas encore été créé (step 1 abandonnée) → redirect `/onboarding?step=1`.

### Reprise plus tard

```
Connexion → /login → session JWT valide
Middleware :
  IF onboardingStep IS NULL OR onboardingStep = 'COMPLETED' → laisser passer vers /dashboard
  ELSE → redirect /onboarding?step=<current>
```

La correspondance `onboardingStep → numéro d'étape` :

| `onboardingStep` | URL cible |
|---|---|
| `SALON_INFO` | `/onboarding?step=1` |
| `ADDRESS` | `/onboarding?step=2` |
| `SCHEDULES` | `/onboarding?step=3` |
| `EMPLOYEES` | `/onboarding?step=4` |
| `SERVICES` | `/onboarding?step=5` |
| `CONFIRMATION` | `/onboarding?step=6` |
| `COMPLETED` ou `null` | laisser passer |

### Compte déjà existant (email déjà utilisé)

- Détecté via `prisma.proUser.findUnique({ where: { email } })` **avant** la transaction.
- Retourner l'erreur Zod : `"Un compte existe déjà avec cet email."`.
- **Ne pas indiquer** si c'est un vrai compte ou non (protection énumération).
- Afficher un lien "Se connecter" en dessous de l'erreur.

### Salon déjà existant (unicité slug)

- Collision de slug : `slugify(name)` peut produire un slug existant.
- Stratégie : append un suffixe `cuid().slice(-6)` jusqu'à unicité (boucle max 3 tentatives).
- Erreur P2002 sur `slug` → régénérer un slug différent.

### Email déjà utilisé (étape employé)

- L'email d'un employé n'est pas unique au niveau de la base (un employé peut exister dans plusieurs salons via son `proUserId`).
- À l'étape 4 du wizard : si `email` fourni, vérifier que l'email n'est pas déjà le compte OWNER courant.
- Pas de création de ProUser EMPLOYEE à cette étape — cela se fait depuis le dashboard.

### Formulaire soumis deux fois (double-submit)

- `aria-busy` sur le bouton submit pendant la Server Action (`useActionState` + `pending`).
- L'action vérifie d'abord si le Salon existe déjà (`prisma.salon.findUnique({ where: { organizationId } })`).
- Si Salon existe déjà → redirect vers l'étape suivante sans recréer.

---

## 6. Sécurité

### Validation serveur

Toutes les données utilisateur passent par des **schémas Zod** dans les Server Actions :

```typescript
// src/lib/schemas/onboarding.schema.ts
export const SignupSchema = z.object({
  firstName: z.string().min(1).max(50).trim(),
  lastName: z.string().min(1).max(50).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(72),          // 72 = max bcrypt
  organizationName: z.string().min(2).max(80).trim(),
});

export const OnboardingStep1Schema = z.object({
  name: z.string().min(2).max(80).trim(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(8).max(20).optional().or(z.literal('')),
  timezone: z.string().refine(isIANATimezone, 'Timezone invalide'),
});

// ... (schémas décrits pour chaque étape du wizard)
```

### Protection CSRF

Next.js App Router **Server Actions** sont protégées nativement contre le CSRF :
- Origin check intégré (refuse les requêtes cross-origin)
- Pas de token CSRF manuel nécessaire
- Référence : https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#security

### Anti-duplication

| Risque | Protection |
|---|---|
| Double inscription même email | `findUnique` avant `$transaction` |
| Double création salon | Guard dans `createSalonAction` : si salon existe → redirect step suivante |
| Double employé même salon | `findFirst({ salonId, firstName, lastName })` → warning (pas blocage) |
| Double slug organization | Boucle de génération avec suffixe aléatoire (max 3 tentatives) |
| Double slug salon | Même stratégie que l'organisation |

### Limitation de débit

Réutilise `checkRateLimit()` de `src/lib/rate-limit/in-memory.ts` :

| Endpoint | Limite | Fenêtre |
|---|---|---|
| `POST /inscription` | 5 tentatives | 15 min par IP |
| `POST /onboarding` (wizard) | 30 actions | 15 min par session |

> Limitation connue héritée de l'existant : en-mémoire par instance Vercel, pas cross-instance.  
> Acceptable pour MVP. Migration vers Vercel KV documentée si nécessaire.

### Journalisation

| Événement | Journalisé | Méthode |
|---|---|---|
| Inscription réussie | ✅ | `prisma.auditLog.create({ action: 'USER_CREATED', actorId: proUser.id })` |
| Inscription échouée (email dupliqué) | ✅ | Log applicatif (`console.warn` côté serveur) |
| Wizard : salon créé | ✅ | `prisma.auditLog.create({ action: 'SALON_CREATED' })` |
| Onboarding terminé | ✅ | `prisma.auditLog.create({ action: 'ONBOARDING_COMPLETED' })` |
| Trop de tentatives (rate limit) | ✅ | Log applicatif |

> `AuditLog` table existante (Sprint 8) — réutilisation sans migration.

### Sécurité du mot de passe

- Hachage : `bcrypt.hash(password, 12)` — réutilise `src/features/auth/password.utils.ts`
- Force minimale : 8 caractères (côté Zod)
- Pas d'indicateur de force dans le wizard (MVP)
- Jamais stocké ou loggué en clair

---

## 7. Architecture technique

### Routes (App Router)

```
src/app/
├── (auth)/                     ← existant (login)
│   └── login/
│
├── (onboarding)/               ← NOUVEAU groupe de routes
│   ├── layout.tsx              ← layout minimaliste (pas de nav dashboard)
│   ├── inscription/
│   │   └── page.tsx            ← formulaire d'inscription
│   └── onboarding/
│       └── page.tsx            ← wizard multi-étapes (searchParam step=1..6)
│
├── (dashboard)/                ← existant
└── (marketing)/                ← existant
```

### Server Actions

```
src/app/(onboarding)/
├── inscription/
│   └── actions.ts              ← signupAction (createProUser + Org + Sub + JWT)
└── onboarding/
    └── actions.ts              ← createSalonAction, updateSalonAddressAction,
                                   saveOnboardingScheduleAction,
                                   addOnboardingEmployeeAction,
                                   addOnboardingServiceAction,
                                   completeOnboardingAction
```

### Composants

```
src/app/(onboarding)/onboarding/
└── components/
    ├── onboarding-progress.tsx          ← Server Component · barre de progression (1/6)
    ├── onboarding-step1-salon-info.tsx  ← Client Component · useActionState
    ├── onboarding-step2-address.tsx     ← Client Component · useActionState
    ├── onboarding-step3-schedules.tsx   ← Client Component · réutilise pattern salon-schedule-form
    ├── onboarding-step4-employees.tsx   ← Client Component · liste dynamique
    ├── onboarding-step5-services.tsx    ← Client Component · liste dynamique + suggestions
    └── onboarding-step6-confirm.tsx     ← Server Component · récapitulatif lecture seule

src/app/(onboarding)/inscription/
└── components/
    └── signup-form.tsx                  ← Client Component · useActionState
```

### Séparation Client / Server Components

| Composant | Type | Justification |
|---|---|---|
| `SignupForm` | Client | `useActionState` (pending state) |
| `OnboardingProgress` | Server | Aucun état interactif, donnée en prop |
| `OnboardingStep1SalonInfo` | Client | `useActionState`, formulaire |
| `OnboardingStep2Address` | Client | `useActionState`, formulaire |
| `OnboardingStep3Schedules` | Client | Grille 7 jours interactive |
| `OnboardingStep4Employees` | Client | Liste dynamique (ajout/suppression) |
| `OnboardingStep5Services` | Client | Liste dynamique + checkboxes suggestions |
| `OnboardingStep6Confirm` | Server | Lecture seule, données Prisma directes |
| `page.tsx` (wizard) | Server | `searchParams` async, dispatch vers composant courant |

### Middleware — modifications requises

Le middleware actuel (`src/middleware.ts`) protège `/dashboard/:path*` et `/admin/:path*`. Il faut ajouter la logique d'onboarding :

```typescript
// Logique à ajouter dans middleware.ts (PR2 ou PR3)

// Si session valide mais onboarding non terminé → /onboarding
if (session && pathname.startsWith('/dashboard')) {
  const onboardingStep = await getOnboardingStep(session.organizationId);
  if (onboardingStep && onboardingStep !== 'COMPLETED') {
    return NextResponse.redirect(new URL(`/onboarding?step=${stepToNumber(onboardingStep)}`, request.url));
  }
}

// /onboarding est accessible uniquement si session valide
if (pathname.startsWith('/onboarding') && !session) {
  return NextResponse.redirect(new URL('/inscription', request.url));
}

// /inscription est accessible uniquement si pas de session
if (pathname.startsWith('/inscription') && session) {
  // Si onboarding non terminé, ne pas boucler
  const onboardingStep = await getOnboardingStep(session.organizationId);
  if (!onboardingStep || onboardingStep === 'COMPLETED') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}
```

> ⚠️ Toute modification du middleware est critique — risque de boucle de redirection.  
> Tester minutieusement les cas : login existant, inscription, onboarding partiel, onboarding terminé.

### Réutilisation de l'existant

| Élément existant | Fichier source | Réutilisé comment |
|---|---|---|
| `signToken` | `src/features/auth/session.utils.ts` | Signer JWT après inscription |
| `verifyToken` | `src/features/auth/session.utils.ts` | Via middleware (inchangé) |
| `hashPassword` | `src/features/auth/password.utils.ts` | Hacher le mot de passe inscription |
| `checkRateLimit` | `src/lib/rate-limit/in-memory.ts` | `/inscription` (5 attempts/15min) |
| `saveSalonSchedule` | `src/features/schedules/salon-schedule.service.ts` | Step 3 horaires |
| `upsertSubscription` | `src/features/billing/billing.service.ts` | Créer l'abonnement TRIAL |
| `SalonScheduleForm` pattern | `src/features/schedules/components/` | Pattern pour Step3Schedules |
| `AuditLog` | `prisma.auditLog` | Journaliser les événements |
| `checkRateLimit` | `src/lib/rate-limit/in-memory.ts` | Wizard (30 actions/15min) |

### Schémas Zod

Nouveau fichier : `src/lib/schemas/onboarding.schema.ts`  
(Évite de polluer les schémas existants par fonctionnalité)

---

## 8. Roadmap d'implémentation

### Vue d'ensemble

```
Phase 2 — Self-Service Onboarding
│
├─ PR1 (onboarding/pr1-architecture) ← CETTE PR
│   Documentation d'architecture uniquement
│
├─ PR2 (onboarding/pr2-signup)
│   Page /inscription + création ProUser + Organization + Subscription
│   Migration additive : onboarding_step sur organizations
│   JWT + cookie session
│
├─ PR3 (onboarding/pr3-wizard-salon)
│   Wizard step 1 (Infos salon) + step 2 (Adresse)
│   Middleware : redirect /onboarding si onboardingStep ≠ COMPLETED
│
├─ PR4 (onboarding/pr4-wizard-config)
│   Wizard step 3 (Horaires) + step 4 (Employés) + step 5 (Prestations)
│
└─ PR5 (onboarding/pr5-finalisation)
    Wizard step 6 (Confirmation)
    Guard dashboard : bloquer si onboarding non terminé
    UI polish (progress bar, animations, mobile)
    Tests manuels complets
```

### PR2 — Inscription

**Branche** : `onboarding/pr2-signup`  
**Fichiers** :

```
src/app/(onboarding)/layout.tsx                 ← layout minimaliste
src/app/(onboarding)/inscription/page.tsx       ← page inscription
src/app/(onboarding)/inscription/actions.ts     ← signupAction
src/app/(onboarding)/inscription/components/signup-form.tsx
src/lib/schemas/onboarding.schema.ts            ← SignupSchema
prisma/migrations/YYYYMMDDHHMMSS_onboarding_step/migration.sql  ← onboarding_step
```

**Critères de sortie** :
- Inscription crée ProUser + Organization + OrganizationSubscription (ESSENTIAL TRIAL) dans `$transaction`
- JWT signé, cookie session posé, redirect `/onboarding?step=1`
- Email déjà existant → message d'erreur + lien login
- Rate limit 5/15min par IP
- `lint` ✅ · `typecheck` ✅ · `build` ✅

### PR3 — Wizard Salon

**Branche** : `onboarding/pr3-wizard-salon`  
**Fichiers** :

```
src/app/(onboarding)/onboarding/page.tsx
src/app/(onboarding)/onboarding/actions.ts     ← createSalonAction, updateSalonAddressAction
src/app/(onboarding)/onboarding/components/onboarding-progress.tsx
src/app/(onboarding)/onboarding/components/onboarding-step1-salon-info.tsx
src/app/(onboarding)/onboarding/components/onboarding-step2-address.tsx
src/middleware.ts                               ← guard /onboarding + redirect si step ≠ COMPLETED
```

**Critères de sortie** :
- Étapes 1 + 2 fonctionnelles
- Middleware ne casse aucune route existante (login, dashboard, admin, booking)
- `lint` ✅ · `typecheck` ✅ · `build` ✅

### PR4 — Wizard Configuration

**Branche** : `onboarding/pr4-wizard-config`  
**Fichiers** :

```
src/app/(onboarding)/onboarding/components/onboarding-step3-schedules.tsx
src/app/(onboarding)/onboarding/components/onboarding-step4-employees.tsx
src/app/(onboarding)/onboarding/components/onboarding-step5-services.tsx
src/app/(onboarding)/onboarding/actions.ts     ← saveOnboardingScheduleAction, addOnboardingEmployeeAction, addOnboardingServiceAction
```

**Critères de sortie** :
- Étapes 3, 4, 5 fonctionnelles
- "Passer" disponible sur chaque étape optionnelle
- `lint` ✅ · `typecheck` ✅ · `build` ✅

### PR5 — Finalisation

**Branche** : `onboarding/pr5-finalisation`  
**Fichiers** :

```
src/app/(onboarding)/onboarding/components/onboarding-step6-confirm.tsx
src/app/(onboarding)/onboarding/actions.ts     ← completeOnboardingAction
src/middleware.ts                               ← guard dashboard (si onboarding non terminé)
```

**Critères de sortie** :
- Étape 6 fonctionnelle, redirect `/dashboard` au clic "Commencer"
- Dashboard inaccessible si `onboardingStep ≠ COMPLETED` (redirect `/onboarding`)
- Parcours complet testé : inscription → wizard → dashboard
- Parcours reprise testée : abandon step 3, reconnexion → redirect step 3
- Comptes existants (pilotes) non impactés (null → COMPLETED)
- `lint` ✅ · `typecheck` ✅ · `build` ✅

---

## Annexe — Contraintes strictes

| Contrainte | Portée |
|---|---|
| Aucun modèle Prisma modifié (PR1) | Uniquement `onboarding_step TEXT` en PR2 |
| Aucune migration (PR1) | Migration additive en PR2 |
| Aucune logique Stripe | Pas de paiement — TRIAL simulé |
| Aucune régression dashboard existant | Guard middleware + tests manuels PR5 |
| Aucune régression Admin / Booking | Middleware étendu, pas remplacé |
| Comptes pilotes existants | `onboardingStep = null` → traité comme COMPLETED |
| RESEND non configuré | Email de vérification différé Phase 3 |

---

_Document créé : Juin 2026 — Phase 2 Self-Service Onboarding — architecture uniquement._  
_Implémentation soumise à validation ChatGPT avant démarrage._
