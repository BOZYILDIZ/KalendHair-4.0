# ARCHITECTURE — KalendHair 4.0

Objectif : un vrai SaaS **multi-tenant**, **modulaire**, **testable**, et **sans spaghetti code**.

---

## 1. Principe multi-tenant

Hiérarchie des données :

```
Organization
 └── Salon
      ├── Employees
      ├── Services
      ├── Appointments
      └── Clients (via SalonClient)
```

- Une **Organization** est le tenant racine (le compte du professionnel).
- Une Organization pourra gérer **plusieurs salons** plus tard.
- Le MVP démarre avec **un seul salon par organization**.
- Toute donnée métier est **scopée** à une organization / un salon.
  Aucune requête ne doit pouvoir lire ou écrire les données d'un autre tenant.

---

## 2. Organisation modulaire (par features)

Objectif : Claude doit pouvoir modifier **une fonctionnalité précise** sans relire tout le projet.

```
src/
  app/                 # routes Next.js (App Router) — fines, délèguent au métier
  components/          # composants UI réutilisables, sans logique métier
  features/            # un dossier par domaine métier
    auth/
    organizations/
    salons/
    employees/
    services/
    appointments/
    clients/
    calendar/
    integrations/
  lib/
    db/                # client Prisma, helpers d'accès DB
    auth/              # session, helpers d'authentification
    permissions/       # règles de permissions centralisées
    validations/       # schémas de validation centralisés (ex: Zod)
prisma/                # schema.prisma, migrations
```

### Contenu type d'un module `features/<domaine>/`

- `*.service.ts` — logique métier (cas d'usage, règles).
- `*.repository.ts` (ou accès via `lib/db`) — accès aux données.
- `*.schema.ts` — validations propres au domaine (référencent `lib/validations`).
- `components/` — composants UI propres au domaine.
- `types.ts` — types du domaine.

> Règle : un module ne dépend pas des **détails internes** d'un autre module.
> Les modules communiquent via des **services** exposés, pas en fouillant dans la DB des autres.

---

## 3. Séparation des couches

Trois couches strictement séparées :

1. **UI** (`app/`, `components/`, `features/**/components/`)
   - Affichage et interaction uniquement.
   - Pas de requêtes DB directes, pas de règles métier.

2. **Logique métier** (`features/**/*.service.ts`)
   - Cas d'usage, règles, orchestration.
   - Indépendante du framework et de l'UI autant que possible.

3. **Accès DB** (`lib/db`, repositories)
   - Seul endroit qui parle à Prisma.
   - Toujours scoper par tenant (organizationId / salonId).

Flux : `UI → service métier → accès DB`. Jamais l'inverse, jamais de raccourci.

---

## 4. Validations centralisées

- Schémas de validation dans `lib/validations` (et `features/**/*.schema.ts` pour le spécifique).
- Toute entrée externe (formulaires, API, réservation publique) est **validée avant** d'atteindre le métier.

---

## 5. Permissions centralisées

- Toutes les règles d'autorisation dans `lib/permissions`.
- Vérifier systématiquement : *cet utilisateur a-t-il le droit d'agir sur ce tenant / cette ressource ?*
- Aucune vérification de permission dispersée dans l'UI.

---

## 6. Services métier

- La logique vit dans des **services** par domaine.
- Les routes/`app` restent **fines** : elles valident, appellent un service, renvoient un résultat.

---

## 7. Composants réutilisables

- `components/` contient les briques UI génériques (boutons, formulaires, layout).
- Les composants métier vivent dans `features/**/components/`.
- Pas de duplication : un composant générique = un seul endroit.

---

## 8. Architecture testable

- Logique métier isolée → testable unitairement sans UI ni DB réelle.
- Accès DB isolé → mockable.
- Validations et permissions centralisées → testables séparément.

---

## 9. Comment on évite le spaghetti code (résumé)

- Un domaine = un module isolé.
- Séparation UI / métier / DB stricte.
- Communication entre modules via services exposés.
- Validations et permissions centralisées, jamais dispersées.
- Tenant scoping systématique.
- Pas de logique métier dans l'UI, pas d'accès DB hors de la couche DB.
