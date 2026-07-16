# KalendHair — QA Playbook officiel

> Manuel d'utilisation de Manus QA Platform v2.2.1 (contenu détaillé encore v2.1 — voir note de staleness dans README.md)  
> Destination : développeurs, reviewers, responsables release.

---

## 1. Vue d'ensemble

Manus QA Platform est une infrastructure de test automatisé pilotée par un **agent IA navigateur** (Manus). L'agent reçoit un prompt structuré, navigue dans l'application KalendHair, et retourne un rapport JSON de ses observations.

### Principes fondamentaux

- **Aucun Selenium. Aucun Playwright.** Manus agit comme un vrai utilisateur, avec un vrai navigateur.
- **Déterminisme via QA_EXECUTOR** : l'agent suit les étapes exactement, sans improvisation.
- **Fail-fast sur credentials** : si les variables d'environnement sont absentes, le scénario s'arrête proprement avant d'appeler Manus.
- **Dry-run gratuit** : simuler une exécution complète sans consommer un seul crédit.

---

## 2. Installation et configuration

### Prérequis

```bash
node >= 18
pnpm >= 8
tsx (exécuteur TypeScript)
```

### Variables d'environnement (.env.local)

```bash
# Obligatoire
MANUS_API_KEY=sk-...

# URL de l'application testée
BASE_URL=https://votre-preview.vercel.app

# Credentials pour les scénarios authentifiés
QA_OWNER_EMAIL=...
QA_OWNER_PASSWORD=...
QA_ADMIN_EMAIL=...
QA_ADMIN_PASSWORD=...

# Vercel Deployment Protection (seulement si la preview est protégée)
VERCEL_PROTECTION_BYPASS=...

# Si l'intégration native Vercel est activée côté Manus
MANUS_NATIVE_VERCEL_INTEGRATION=true

# Options avancées (optionnel)
MANUS_ENV=local          # local | ci | staging | production
MANUS_API_URL=https://api.manus.ai
MANUS_CREDIT_COST_USD=0.01
MANUS_CREDITS_REMAINING=500
```

> `.env.local` n'est **jamais commité**. `MANUS_API_KEY` et `VERCEL_PROTECTION_BYPASS` ne doivent jamais apparaître dans les logs ou rapports.

---

## 3. Lancement des tests

### Dry-run (recommandé avant tout vrai run)

```bash
npx tsx scripts/manus/run-all.ts --dry-run
```

Génère les prompts, calcule les hashes, vérifie les credentials — **zéro crédit consommé**.

### Run complet

```bash
npx tsx scripts/manus/run-all.ts
```

### Scénario unique

```bash
npx tsx scripts/manus/run-all.ts --scenario booking-public
```

### Filtrage par tag

```bash
npx tsx scripts/manus/run-all.ts --tag smoke
```

### Tags disponibles

| Tag | Scénarios couverts |
|-----|--------------------|
| `smoke` | login-owner, booking-public |
| `auth` | login-owner, admin-login |
| `navigation` | sidebar, mobile-navigation |
| `responsive` | mobile-navigation, responsive |
| `public` | booking-public |

---

## 4. Catalogue des scénarios

| ID | Scénario | Credentials requis | Timeout | Description |
|----|----------|--------------------|---------|-------------|
| SC-001 | `login-owner` | owner | 90s | Connexion propriétaire + accès dashboard |
| SC-002 | `dashboard-overview` | owner | 120s | Vue d'ensemble dashboard — KPIs, widgets |
| SC-003 | `booking-public` | — | 90s | Formulaire de réservation public |
| SC-004 | `admin-login` | admin | 90s | Connexion administrateur |
| SC-005 | `sidebar` | owner | 90s | Navigation sidebar — tous les liens |
| SC-006 | `mobile-navigation` | owner | 90s | Navigation mobile (viewport 390×844) |
| SC-007 | `responsive` | owner | 150s | Test multi-viewport complet |
| SC-T01 | `test-block-merge` | — | — | Scénario de test du blocage de merge |

### Quand utiliser chaque scénario

- **SC-001, SC-003** : smoke test minimal, après chaque PR.
- **SC-001 à SC-005** : run standard avant une release.
- **SC-006, SC-007** : obligatoire avant toute merge touchant le responsive.
- **SC-T01** : réservé à la vérification du Quality Gate.

---

## 5. Lecture du score QA

### Grille de scoring (100 points)

| Dimension | Points max | Règle de calcul |
|-----------|-----------|-----------------|
| Assertions | 30 | Ratio passed/total × 30 |
| Console errors | 20 | 20 − (erreurs × 5), min 0 |
| Network errors | 20 | 20 − (erreurs × 5), min 0 |
| Responsive | 10 | Ratio scénarios mobile/responsive passés |
| Accessibilité | 10 | 10 − (erreurs ARIA × 3), min 0 |
| Screenshots | 5 | Captures valides / scénarios × 5 |
| Performance | 5 | 5 si <30s, 4 si <60s, 3 si <90s, 1 si <120s, 0 sinon |

### Verdict

| Score | Verdict | Signification |
|-------|---------|---------------|
| ≥ 80 | `READY_FOR_MERGE` | ✅ La PR peut merger |
| < 80 | `BLOCK_MERGE` | 🚫 Corriger avant merge |

---

## 6. Quality Gates

Les Quality Gates bloquent automatiquement le merge si l'une des conditions suivantes est vraie :

| Gate | Condition | Conséquence |
|------|-----------|-------------|
| Score global | score < 80 | BLOCK_MERGE |
| Erreurs console | consoleErrors > 0 | WARNING |
| Erreurs réseau | networkErrors > 0 | WARNING |
| Taux de passage | failedScenarios > 0 | BLOCK_MERGE |

---

## 7. Interpréter les rapports

### Artefacts générés après chaque run

```
reports/manus/<runId>/
├── report.json      — données brutes complètes
├── report.md        — rapport lisible (CTO-ready)
├── metadata.json    — métadonnées + versioning
├── timings.json     — durées, crédits, coût
├── network.json     — erreurs réseau
└── console.log      — erreurs console
```

### Champs clés dans report.json

```json
{
  "frameworkVersion": "2.1.0",
  "schemaVersion": "2",
  "promptVersion": "qa-executor-v2",
  "run": {
    "runId": "2026-07-10_13-28-56",
    "totalCreditsConsumed": 0,
    "totalEstimatedCostUsd": 0,
    "scenarios": [
      {
        "scenarioId": "SC-003",
        "name": "booking-public",
        "status": "passed",
        "promptHash": "dac16a2fa6f96298...",
        "capturesAttendues": 1,
        "capturesProduites": 0,
        "capturesInvalides": 1
      }
    ]
  },
  "score": {
    "total": 85,
    "verdict": "READY_FOR_MERGE"
  }
}
```

### Champs importants par scénario

| Champ | Description |
|-------|-------------|
| `scenarioId` | Identifiant stable (SC-001 à SC-007) |
| `status` | `passed` / `failed` / `error` / `timeout` |
| `promptHash` | SHA-256 du prompt exact envoyé à Manus |
| `pollCount` | Nombre de polls effectués |
| `creditsConsumed` | Crédits Manus consommés |
| `estimatedCostUsd` | Coût USD estimé |
| `capturesAttendues` | Screenshots déclarés dans les assertions |
| `capturesProduites` | Screenshots retournés avec URL valide |
| `taskUrl` | Lien direct vers le task dans l'interface Manus |

---

## 8. Investiguer un échec

### Étape 1 — Identifier le scénario en échec

```bash
# Console — lors du run
❌ [SC-001] login-owner — FAILED
```

### Étape 2 — Lire le rapport

```bash
cat reports/manus/<runId>/report.md
```

Chercher la section `## 🔎 Détail — login-owner` et lire les assertions failed.

### Étape 3 — Consulter le task Manus

Dans `report.json`, récupérer le champ `taskUrl` du scénario :

```
https://manus.im/app/<taskId>
```

Ouvrir ce lien pour voir exactement ce que Manus a fait (navigations, screenshots, logs).

### Étape 4 — Comparer avec le run précédent

Dans `report.md`, la section `## 📊 Comparaison` indique :

- `scoreDelta` : écart de score
- `trend` : `improved` | `degraded` | `stable`

### Étape 5 — Vérifier le promptHash

Si le comportement a changé sans modification du code, vérifier que `promptHash` est identique entre deux runs. Un hash différent signifie que le prompt a changé (credential, bypass SSO, mode, etc.).

### Tableau de diagnostic rapide

| Symptôme | Cause probable | Action |
|----------|---------------|--------|
| `status: error` + "credentials manquants" | Variables env absentes | Ajouter dans `.env.local` |
| `status: timeout` | Timeout trop court ou app lente | Augmenter `timeoutSeconds` ou vérifier l'app |
| `status: failed` + assertions failed | Régression fonctionnelle | Inspecter taskUrl sur Manus |
| Score < 80 malgré assertions OK | Erreurs console ou réseau | Corriger les erreurs dans l'app |
| `capturesInvalides > 0` | Manus n'a pas retourné les screenshots | Inspecter le prompt ou la réponse Manus |
| `BLOCK_MERGE` + score > 80 | Quality Gate "failedScenarios" | Au moins un scénario a failed |

---

## 9. Workflow développeur

### Avant d'ouvrir une PR

```bash
# 1. Dry-run pour vérifier les prompts et credentials
npx tsx scripts/manus/run-all.ts --dry-run

# 2. Si smoke test souhaité avant push
npx tsx scripts/manus/run-all.ts --scenario booking-public
```

### Après ouverture de la PR

Le run QA est déclenché (manuellement pour l'instant, automatiquement en v2.2) via :

```bash
npx tsx scripts/manus/run-all.ts
```

### Vérifier le verdict

```bash
cat reports/manus/dashboard.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['latestVerdict'], d['latestScore'])"
```

---

## 10. Workflow reviewer

Avant d'approuver une PR :

1. Vérifier que le dernier run QA est `READY_FOR_MERGE`
2. Lire la section Insights du rapport pour les anomalies
3. Vérifier que le `promptHash` correspond à la version du code
4. Consulter les Quality Gates — toutes doivent être vertes
5. Vérifier les `capturesProduites` — les captures attendues doivent être présentes

---

## 11. Workflow release

Avant toute mise en production :

```bash
# Run complet sur l'URL de staging
BASE_URL=https://staging.votre-app.vercel.app npx tsx scripts/manus/run-all.ts
```

Conditions de go-live :

- [ ] Score QA ≥ 80 sur staging
- [ ] Tous les Quality Gates verts
- [ ] Aucune erreur console ni réseau
- [ ] SC-001 à SC-007 tous `passed` (ou `error: credentials absents` en dry-run)
- [ ] `capturesProduites` > 0 sur au moins SC-003

---

## 12. Dry-run — détail complet

Le flag `--dry-run` simule une exécution complète :

```
✅ Ce qui se passe en dry-run :
  • Génération du prompt final (mode + bypass SSO + spec)
  • Validation des 6 sections obligatoires
  • Calcul du SHA-256 du prompt (promptHash)
  • Vérification que les credentials sont configurés
  • Génération du rapport (report.json, report.md, timings.json)

❌ Ce qui ne se passe PAS :
  • Aucun appel à l'API Manus
  • Zéro crédit consommé
  • Aucune navigation dans le navigateur
```

En dry-run, toutes les assertions sont simulées à `passed: true` avec le message `[DRY-RUN] Assertion non exécutée`.

---

## 13. Règles de sécurité

- `MANUS_API_KEY` — jamais dans les logs, jamais commité, jamais dans un rapport
- `VERCEL_PROTECTION_BYPASS` — mêmes règles
- `QA_OWNER_*`, `QA_ADMIN_*` — jamais commités, jamais loggués
- Tous les rapports (`reports/`) sont dans `.gitignore`
- Toute modification du framework nécessite une validation ChatGPT + PR dédiée

---

## 14. Référence rapide

```bash
# Dry-run
npx tsx scripts/manus/run-all.ts --dry-run

# Scénario public uniquement
npx tsx scripts/manus/run-all.ts --scenario booking-public

# Run complet sur staging
BASE_URL=https://staging.app.vercel.app npx tsx scripts/manus/run-all.ts

# Dashboard
open reports/manus/index.html

# Historique
open reports/manus/history.html

# Dernier rapport
open reports/manus/$(ls reports/manus/ | grep -v json | grep -v html | tail -1)/report.md
```
