# CODEX.md — Cadre de contribution Codex (KalendHair 4.0)

> Ce fichier définit le rôle, les limites et les conventions que Codex doit respecter
> sur le projet **KalendHair 4.0**. Il doit être lu avant toute tâche déléguée.
>
> **Claude reste architecte, reviewer et responsable final.**
> Codex est un contributeur encadré. Toute ambiguïté se résout en faveur de l'inaction
> et d'une demande de clarification à Claude.

---

## 1. Rôle de Codex dans KalendHair

Codex est un **contributeur mécanique encadré**. Il exécute des tâches précisément
définies par Claude : génération de types TypeScript, composants UI, schémas Zod,
et vérifications documentaires.

| Peut faire | Ne peut pas faire sans validation Claude |
|---|---|
| Générer des types et interfaces TypeScript | Décider de l'architecture |
| Générer des composants UI React | Modifier un service métier |
| Générer des schémas Zod | Modifier le schéma Prisma |
| Vérifier la cohérence documentaire | Créer une migration Prisma |
| Produire des listes et grilles simples | Ajouter une dépendance npm |
| Appliquer des conventions de style | Modifier `package.json` |

---

## 2. Limites strictes

Ces règles sont **non négociables**. En cas de doute, Codex ne fait rien et signale.

### Git
- **Ne jamais merger** une PR.
- **Ne jamais push** sans validation explicite de Claude.
- **Ne jamais toucher à `main`** directement.
- **Ne jamais créer de branche** sans instruction explicite.

### Schéma et base de données
- **Ne jamais modifier `prisma/schema.prisma`** sans validation Claude + ChatGPT.
- **Ne jamais créer une migration** Prisma.
- **Ne jamais modifier une migration existante**.
- **Ne jamais exécuter `db:migrate`, `db:reset`, `db:seed`** sans instruction explicite.

### Architecture
- **Ne jamais prendre de décision d'architecture seul** (structure de routes, patterns,
  choix de services, abstractions).
- **Ne jamais créer un nouveau service métier** si un service existant peut être réutilisé.
- **Ne jamais dupliquer une logique métier** déjà présente dans le projet.
- **Ne jamais modifier les services métier critiques** sans validation Claude :
  `appointment.service.ts`, `slots.service.ts`, `availability.service.ts`,
  `booking.service.ts`, et tout fichier dans `src/lib/`.

### Dépendances
- **Ne jamais ajouter une dépendance npm** sans validation Claude.
- **Ne jamais modifier `package.json` ou `pnpm-lock.yaml`**.
- **Ne jamais modifier `pnpm-workspace.yaml`**.

### Sécurité
- **Ne jamais lire ni afficher** de secrets, tokens, `.env`, `auth.json`, cookies
  ou clés API.
- **Ne jamais contourner l'isolation tenant** (voir §10).
- **Ne jamais accepter depuis le client** : `organizationId`, `salonId`, `price`,
  `priceCents`, `duration`, `role`, `proUserId`, `isActive`.

### Style et configuration
- **Ne jamais changer** le style global (`globals.css`, config Tailwind, `layout.tsx`
  racine).
- **Ne jamais faire de refactor large non demandé** (renommages, réorganisation de
  dossiers, abstraction de code existant).
- **Ne jamais modifier les fichiers de production** `kalendhair.fr`.

---

## 3. Fichiers interdits sans validation Claude

Toute modification de ces fichiers requiert une **validation explicite de Claude**
(et parfois de ChatGPT) :

| Fichier / Répertoire | Raison |
|---|---|
| `prisma/schema.prisma` | Schéma multi-tenant — toute erreur casse la DB |
| `prisma/migrations/` | Migrations immuables |
| `src/proxy.ts` | Auth gateway — erreur = accès non protégé |
| `src/lib/db/prisma.ts` | Client Prisma singleton |
| `src/lib/permissions/` | Permissions multi-tenant |
| `src/lib/auth/` | Logique d'authentification |
| `src/features/*/\*.service.ts` | Services métier critiques |
| `src/features/auth/` | Auth custom |
| `package.json`, `pnpm-lock.yaml` | Dépendances |
| `CLAUDE.md` | Règles permanentes Claude |
| `.env`, `.env.example` | Secrets |
| `next.config.*`, `tsconfig.json` | Configuration build |

---

## 4. Fichiers autorisés selon délégation

Codex peut créer ou modifier ces fichiers **uniquement si Claude le demande
explicitement dans la tâche** :

| Fichier / Répertoire | Condition |
|---|---|
| `src/features/[feature]/types.ts` | Types fournis par Claude |
| `src/features/[feature]/\*.schema.ts` | Interfaces fournies par Claude |
| `src/features/[feature]/components/\*.tsx` | Specs complètes fournies par Claude |
| `docs/\*.md` | Vérifications documentaires uniquement |
| Nouveaux composants UI dans une feature existante | Plan validé par Claude |

---

## 5. Conventions de code

- **Aucun commentaire** sur du code évident. Un commentaire = une contrainte cachée,
  un contournement de bug, ou un invariant non évident.
- **Aucun `console.log`** dans le code livré.
- **Aucun `any`** sans justification explicite documentée dans le retour de tâche.
- **Aucun `@ts-ignore`** sans validation Claude.
- **Limiter les changements** strictement à la tâche demandée. Pas de cleanup
  adjacent, pas de renommage opportuniste.
- **Aucun fichier temporaire** : jamais de `* 2.ts`, `* copy.ts`, `backup_*`,
  `old_*`, `temp_*`.

---

## 6. Conventions Next.js / App Router

- **Named exports obligatoires** pour tous les composants :
  `export function MyComponent()` — jamais `export default function` sauf obligation
  Next.js (pages `page.tsx`, layouts `layout.tsx`, routes API `route.ts`).
- **Server Components par défaut.** N'ajouter `"use client"` que si nécessaire
  (interaction, hooks React, état local).
- **`searchParams` est une `Promise<...>`** en Next.js 16 — toujours `await`.
- **`params` est une `Promise<...>`** en Next.js 16 — toujours `await`.
- **Zéro `useSearchParams`** dans les composants — utiliser `useRouter` ou
  `searchParams` Server Component.
- **`organizationId` vient toujours du JWT** (session côté serveur), jamais des
  `searchParams`, `FormData` ou props client.
- **Pas de logique métier dans les composants UI** — les composants appellent
  uniquement des services, jamais Prisma directement.
- **Zod v4** : utiliser `.issues[0]?.message` (pas `.errors`).

---

## 7. Conventions TypeScript

- **TypeScript strict** : aucun compromis sur `strict: true` et
  `noUncheckedIndexedAccess: true`.
- **Typage explicite** des props de composants (interface ou type local).
- **Importer les types avec `import type`** quand possible.
- Pas de `!` (non-null assertion) sans justification.
- Les tableaux indexés doivent traiter le cas `undefined` (ex: `parts[0] ?? ""`).
- **Pas de casting `as any`**. Utiliser des types discriminés ou des guards.

---

## 8. Conventions Prisma

- **Ne jamais utiliser Prisma directement dans les composants UI.**
- **Ne jamais utiliser Prisma directement dans les pages** — passer par un service.
- **Toujours filtrer par `salonId` ET `organizationId`** dans les requêtes métier.
- **Toujours utiliser `isActive: true`** dans les requêtes qui exposent des données
  à l'utilisateur.
- **Transactions** (`$transaction`) pour toute opération qui touche plusieurs tables.
- **`select` explicite** — ne jamais retourner tous les champs d'un modèle par défaut.

---

## 9. Conventions UI / composants

- **Tailwind CSS v4** uniquement — pas de `style={}` inline sauf pour des valeurs
  dynamiques impossibles à exprimer en Tailwind (ex: `backgroundColor: employee.color`).
- **Responsive** : utiliser `max-w-*`, `grid`, `flex` — pas de largeurs fixes en `px`.
- **Apostrophes dans le JSX** : toujours échapper avec `&apos;` ou utiliser des
  guillemets doubles.
- **Texte français** pour tous les libellés UI.
- **Accessibilité minimale** : attributs `htmlFor` / `id` cohérents sur les champs
  de formulaire, `required` sur les champs obligatoires.
- **Pas de bibliothèques de composants tierces** sans validation Claude.

---

## 10. Conventions sécurité / multi-tenant

L'isolation multi-tenant est **critique**. Une erreur expose les données d'un salon
à un autre.

### Règle d'or
```
organizationId et salonId viennent TOUJOURS du serveur (session JWT ou résolution slug).
Jamais du client, jamais des searchParams, jamais du FormData.
```

### Checklist pour toute requête Prisma exposée publiquement
- [ ] La requête filtre-t-elle par `salonId` résolu côté serveur ?
- [ ] La requête filtre-t-elle par `organizationId` résolu côté serveur ?
- [ ] Le résultat ne contient-il aucun champ appartenant à un autre tenant ?
- [ ] L'accès est-il vérifié par `canAccessTenant()` ou via la façade publique ?

### Pour les routes publiques `/book/[slug]`
- `slug` → `salonId` + `organizationId` uniquement via `getPublicSalon()`.
- Aucun ID interne dans les URLs publiques.
- Les IDs de services et employés provenant des `searchParams` sont toujours
  revalidés en DB (filtrage par `salonId`).

---

## 11. Workflow de contribution

```
Claude définit les interfaces et spécifications
        ↓
Codex génère les fichiers délégués
        ↓
Claude review les outputs (conventions, logique, sécurité)
        ↓
Claude corrige si nécessaire
        ↓
Claude intègre, typecheck/lint/build
        ↓
Claude commit + push + PR
        ↓
ChatGPT review → validation → Claude merge
```

Codex **n'intervient jamais** dans les étapes de commit, push, review ou merge.

---

## 12. Format de rapport attendu après chaque tâche

À la fin de chaque tâche, Codex doit retourner :

```
## Rapport Codex

### Fichiers créés / modifiés
- chemin/fichier.tsx — description en une ligne

### Conventions vérifiées
- [ ] Named exports (pas de export default sauf pages/layouts)
- [ ] Aucun console.log
- [ ] Aucun any non justifié
- [ ] Apostrophes JSX échappées
- [ ] TypeScript strict respecté

### Écarts par rapport aux specs
- (liste des différences, ou "Aucun")

### Points d'attention pour Claude
- (éléments inhabituels, choix de style, zones d'incertitude)
```

---

## 13. Règles Git

- **Ne jamais créer de branche** sans instruction de Claude.
- **Ne jamais committer** sans instruction de Claude.
- **Ne jamais push** sans validation de Claude.
- **Ne jamais merger** une PR.
- **Ne jamais modifier `main`** directement.
- **Ne jamais exécuter `git reset --hard`**, `git push --force`,
  `git checkout -- .`, `git clean -f`.
- Si Codex doit écrire des fichiers, il les écrit sur la branche active
  que Claude lui indique. Il ne gère pas le cycle Git lui-même.

### Co-authorship

Quand Codex contribue matériellement à un commit (génération de fichiers livrés
dans le commit), Claude doit ajouter la ligne suivante dans le message de commit :

```
Co-authored-by: OpenAI Codex <noreply@openai.com>
```

Cette ligne doit figurer dans le corps du commit (après le corps descriptif),
conformément au format GitHub Co-authored-by reconnu par l'interface GitHub.

---

## 14. Que faire en cas de doute

**Si Codex ne sait pas quoi faire → ne rien faire.**

Cas qui nécessitent une clarification de Claude avant toute action :

- La spécification est ambiguë ou incomplète.
- La tâche semble impliquer une décision d'architecture.
- La tâche semble modifier un fichier listé en §3.
- La tâche implique une nouvelle dépendance.
- La tâche touche à la sécurité, l'auth ou l'isolation tenant.
- Le résultat attendu n'est pas clairement défini.
- Un conflit de convention est détecté entre deux règles de ce fichier.

Dans tous ces cas, Codex retourne un message structuré :

```
Clarification requise :
- [description précise du point d'ambiguïté]
- [question spécifique à Claude]
Aucune modification effectuée.
```

---

## Résumé des interdictions absolues

| Interdit | Raison |
|---|---|
| Modifier `prisma/schema.prisma` | Casse la DB |
| Créer une migration | Irréversible sans validation |
| Modifier `src/proxy.ts` | Faille auth potentielle |
| Accepter `organizationId` du client | Faille tenant |
| Dupliquer un service existant | Dette technique |
| Ajouter une dépendance npm | Risque supply chain |
| `export default` sur les composants | Convention projet |
| `console.log` | Fuite de données potentielle |
| `any` non justifié | Perd le typage strict |
| Fichiers `* 2.ts`, `backup_*` | Pollution repo |
| Push sans validation Claude | Workflow non respecté |
| Merger une PR | Réservé à Claude après validation |

---

_Cadre défini le 2026-06-23. Toute modification de ce fichier requiert une validation
explicite de Hasan + Claude._
