# 05_CONTINUOUS_INTEGRATION — Intégration Continue KalendHair

> Ce document décrit le pipeline CI GitHub Actions du projet.
> Fichier de référence : `.github/workflows/ci.yml`

---

## Badge de statut

```markdown
[![CI](https://github.com/BOZYILDIZ/KalendHair-4.0/actions/workflows/ci.yml/badge.svg)](https://github.com/BOZYILDIZ/KalendHair-4.0/actions/workflows/ci.yml)
```

À ajouter dans `README.md` pour visibilité immédiate du statut CI.

---

## Triggers

| Événement | Branche | Comportement |
|---|---|---|
| `push` | `main` | CI complète, résultat tracé dans l'historique |
| `pull_request` | `main` | CI complète, résultat visible sur la PR GitHub |

Le CI se déclenche à **chaque commit pushé** vers `main` ou vers une branche avec PR ouverte vers `main`.

---

## Concurrence

```yaml
concurrency:
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}
```

**Sur une PR** : si un nouveau commit est pushé pendant qu'un CI tourne sur la même PR, le run précédent est **annulé automatiquement**. Cela évite de consommer inutilement les minutes GitHub Actions.

**Sur main** : aucune annulation. Chaque commit de production est tracé.

---

## Pipeline — Étapes détaillées

### Environnement d'exécution
- **Runner** : `ubuntu-latest` (Ubuntu 24.04 LTS)
- **Node.js** : `22` (lu depuis `.nvmrc`)
- **pnpm** : `11`
- **Timeout** : 20 minutes

### Étape 1 — Checkout
```yaml
uses: actions/checkout@v4
```
Clone le dépôt avec toutes les branches et l'historique minimal (shallow clone par défaut).

### Étape 2 — Setup pnpm
```yaml
uses: pnpm/action-setup@v4
with:
  version: 11
```
Installe pnpm 11. **Doit précéder `setup-node`** pour activer le cache pnpm intégré.

### Étape 3 — Setup Node.js + Cache
```yaml
uses: actions/setup-node@v4
with:
  node-version-file: .nvmrc
  cache: pnpm
```
- Lit la version Node.js depuis `.nvmrc` (`22`).
- Active le **cache pnpm store** : clé basée sur `pnpm-lock.yaml`. Si le lockfile n'a pas changé, `node_modules` est restauré depuis le cache → **gain de 2-3 minutes**.

### Étape 4 — Installation
```bash
pnpm install --frozen-lockfile
```
- `--frozen-lockfile` : bloque l'installation si `pnpm-lock.yaml` est désynchronisé avec `package.json`.
- Garantit la reproductibilité exacte des dépendances.
- En cas d'échec : la PR est bloquée jusqu'à synchronisation du lockfile.

### Étape 5 — Prisma Generate
```bash
pnpm exec prisma generate
```
- Génère le Prisma Client TypeScript à partir de `prisma/schema.prisma`.
- **Aucune connexion à la base de données requise.**
- Produit les types dans `node_modules/.prisma/client/`.

### Étape 5b — Prisma Validate (conditionnel)
```bash
pnpm exec prisma validate
```
- Valide la cohérence du schéma Prisma contre la base de données réelle.
- **Exécuté uniquement si `DATABASE_URL` est configuré** comme GitHub Secret.
- Si le secret est absent : l'étape est ignorée (`⏭️ Non configuré`).
- **Jamais de migration, jamais de seed, jamais de modification de données.**

### Étape 6 — Lint
```bash
pnpm lint
```
- Exécute ESLint sur tout le projet.
- Configuration dans `eslint.config.mjs`.
- 0 erreur requise. Les warnings ne bloquent pas mais sont visibles.

### Étape 7 — Typecheck
```bash
rm -rf .next
pnpm typecheck   # = tsc --noEmit
```
- **`rm -rf .next` est obligatoire** : `tsconfig.json` inclut `.next/types/**/*.ts`.
  Si `.next/` existe d'un build précédent, TypeScript détecte des identifiants en double
  et retourne des erreurs `TS6200` / `TS2300`. La suppression préalable est donc systématique.
- `tsc --noEmit` : vérification de types pure, sans émission de fichiers.

### Étape 8 — Build
```bash
pnpm build   # = prisma generate && next build
```
- `prisma generate` : re-génère le client (idempotent avec l'étape 5).
- `next build` : compilation complète de l'application.
  - Routes statiques (○) : pages marketing et légales, pré-rendues.
  - Routes dynamiques (ƒ) : compilées mais non exécutées au build (no DB call).
- **`DATABASE_URL` non requis** : toutes les routes métier sont en mode `force-dynamic`.
  Le Prisma Client est importé mais n'ouvre aucune connexion pendant la compilation.
- Env variable de build : `NEXT_PUBLIC_APP_URL` (lecture depuis `vars.NEXT_PUBLIC_APP_URL` ou fallback `https://kalendhair.fr`).
- `NEXT_TELEMETRY_DISABLED=1` : désactive la télémétrie Next.js en CI.

### Étape 9 — CI Summary
Résumé GitHub Actions affiché dans l'onglet "Summary" de chaque run :
```
## KalendHair CI — 2026-07-09 10:00 UTC

| Étape           | Résultat     |
|-----------------|--------------|
| 📦 Install      | ✅ OK        |
| 🔧 Prisma Gen   | ✅ OK        |
| 🔍 Prisma Valid | ⏭️ Non conf. |
| 🎨 Lint         | ✅ OK        |
| 📝 Typecheck    | ✅ OK        |
| 🏗️ Build        | ✅ OK        |

Node.js : `22` | pnpm : `11` | Ref : `main` | SHA : `1fec403`
```

---

## Configuration GitHub requise

### Secrets (Settings → Secrets and variables → Actions → Secrets)

| Secret | Valeur | Obligatoire |
|---|---|---|
| `DATABASE_URL` | URL PostgreSQL Neon (lecture seule) | ⚠️ Optionnel (active `prisma validate`) |

> Si `DATABASE_URL` n'est pas configuré : le CI fonctionne normalement à 100%.
> `prisma validate` est simplement ignoré.

### Variables (Settings → Secrets and variables → Actions → Variables)

| Variable | Valeur | Obligatoire |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://kalendhair.fr` | ⚠️ Optionnel (fallback: `https://kalendhair.fr`) |

---

## Temps d'exécution estimé

| Étape | Cache froid | Cache chaud |
|---|---|---|
| Checkout | ~5s | ~5s |
| Setup pnpm | ~15s | ~5s |
| Setup Node.js | ~10s | ~5s |
| Install (pnpm) | ~3min | ~30s |
| Prisma generate | ~15s | ~10s |
| Lint | ~30s | ~25s |
| Typecheck | ~20s | ~20s |
| Build | ~5min | ~4min |
| **Total estimé** | **~10 min** | **~6 min** |

Le cache pnpm est la variable clé. À partir du deuxième run sur une même branche sans changement de `pnpm-lock.yaml`, le gain est de ~2-3 minutes.

---

## Limitations actuelles

### 1. Manus QA non intégré
Les tests navigateur Manus s'exécutent actuellement **manuellement** (`pnpm exec tsx scripts/manus/run-all.ts`). Ils ne font pas partie du CI GitHub Actions pour deux raisons :
- `MANUS_API_KEY` est une clé personnelle à usage contrôlé.
- Manus ne peut pas atteindre `localhost:3000` ; une URL déployée (Vercel preview) est requise.

**Évolution prévue** : voir §Évolution future.

### 2. Tests automatisés absents
Il n'existe pas encore de tests unitaires (Jest) ni de tests E2E (Playwright). Le CI se limite aux vérifications statiques (lint, types, build). Cela signifie qu'un bug logique peut passer à travers le CI.

### 3. DATABASE_URL en CI
`prisma validate` est conditionnel. Sans `DATABASE_URL`, le schéma est validé localement uniquement. Une dérive entre le schéma `schema.prisma` et la base de données réelle ne serait détectée qu'à l'exécution.

### 4. Pas de staging automatique
Il n'existe pas de déploiement staging déclenché par CI. Les previews Vercel sont automatiques sur chaque branche, mais ce sont des déploiements de preview, pas de staging validé.

### 5. NODE_VERSION drift
`.nvmrc` dit `22` mais le développement local peut tourner sur une version différente (actuellement v26.4.0 en local). Cela peut créer des différences de comportement subtiles entre local et CI.

---

## Évolution future

### Manus CI (prochaine étape recommandée)
Intégration de Manus dans le CI sur les PRs importantes :

```yaml
# Étape future — non implémentée
- name: Manus QA (smoke test)
  if: github.event_name == 'pull_request'
  run: pnpm exec tsx scripts/manus/run-all.ts --scenario login-owner
  env:
    MANUS_API_KEY: ${{ secrets.MANUS_API_KEY }}
    BASE_URL: ${{ steps.vercel_preview.outputs.url }}  # URL preview Vercel
  # Requiert : MANUS_API_KEY en secret + URL Vercel preview récupérée
```

Prérequis :
1. Récupérer l'URL preview Vercel après déploiement (action `vercel/action@v1` ou `nwtgck/actions-vercel@v3`).
2. Configurer `MANUS_API_KEY` en GitHub Secret.
3. Passer `BASE_URL=<preview-url>` au runner Manus.

### Tests automatisés
```yaml
# Étape future
- name: Unit Tests
  run: pnpm test          # Jest (à configurer)

- name: E2E Tests
  run: pnpm test:e2e      # Playwright (à configurer)
```

### Pipeline complet cible (2027)

```
Checkout
  → Install (cache)
  → Prisma Generate
  → Prisma Validate (si DATABASE_URL)
  → Lint
  → Typecheck
  → Unit Tests (Jest)
  → Build
  → Deploy Preview (Vercel)
  → Manus QA (smoke test sur URL preview)
  → E2E Tests (Playwright sur URL preview)
  → Notification (Slack / email)
```

---

## Commandes de debug CI local

Pour reproduire exactement le CI en local :

```bash
# Simuler le CI complet
pnpm install --frozen-lockfile
pnpm exec prisma generate
pnpm lint
rm -rf .next && pnpm typecheck
pnpm build
```

Pour vérifier que le CI passera avant de pusher :

```bash
# Check rapide pré-push
pnpm lint && rm -rf .next && pnpm typecheck && pnpm build && echo "✅ CI vert"
```
