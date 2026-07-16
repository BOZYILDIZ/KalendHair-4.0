# KalendHair — Manus QA Framework v2.2.1

Infrastructure QA pilotée par Manus (agent IA navigateur), entièrement dans `scripts/manus/`.

> ⚠️ Ce README couvre encore principalement les fonctionnalités v2.1. Nouveautés
> v2.2/v2.2.1 non détaillées ci-dessous : `--profile smoke|standard|full|nightly`,
> `--concurrency N` (exécution parallèle via sémaphore), l'abstraction
> `AgentProvider` (`ManusProvider` / `MockProvider`), le module `analysis/auto-audit.ts`,
> et la suite de tests unitaires `__tests__/`. Voir `docs/qa/MANUS_ROADMAP.md`
> et le rapport CTO v2.2.1 pour le détail. Une refonte complète de ce README
> est recommandée (cf. Mission 8 — audit documentation, v2.2.1).

---

## Lancement rapide

```bash
# Run complet (production)
tsx scripts/manus/run-all.ts

# Scénario unique
tsx scripts/manus/run-all.ts --scenario login-owner

# Par tag
tsx scripts/manus/run-all.ts --tag smoke

# Simulation complète sans appel Manus (zéro crédit)
tsx scripts/manus/run-all.ts --dry-run
```

---

## Versioning

| Constante          | Valeur            |
|--------------------|-------------------|
| `frameworkVersion` | `2.2.1`           |
| `schemaVersion`    | `2`               |
| `promptVersion`    | `qa-executor-v2`  |

Ces valeurs apparaissent dans `report.json`, `report.md`, `metadata.json`, et la console.

---

## Scénarios

| ID      | Scénario             | Credentials | Mode        | Timeout |
|---------|----------------------|-------------|-------------|---------|
| SC-001  | `login-owner`        | owner       | QA_EXECUTOR | 90s     |
| SC-002  | `dashboard-overview` | owner       | QA_EXECUTOR | 120s    |
| SC-003  | `booking-public`     | —           | QA_EXECUTOR | 90s     |
| SC-004  | `admin-login`        | admin       | QA_EXECUTOR | 90s     |
| SC-005  | `sidebar`            | owner       | QA_EXECUTOR | 90s     |
| SC-006  | `mobile-navigation`  | owner       | QA_EXECUTOR | 90s     |
| SC-007  | `responsive`         | owner       | QA_EXECUTOR | 150s    |
| SC-T01  | `test-block-merge`   | —           | —           | —       |

---

## Dry-Run Mode

Le flag `--dry-run` permet de simuler une exécution complète **sans consommer de crédits Manus** :

- Génère le prompt final pour chaque scénario
- Calcule le SHA-256 du prompt (`promptHash`)
- Vérifie que les credentials sont configurés
- Affiche le JSON attendu (structure des assertions)
- Génère le rapport complet (`report.json`, `report.md`)
- N'appelle **jamais** l'API Manus

```bash
tsx scripts/manus/run-all.ts --dry-run
```

---

## Prompt Validation

Avant chaque appel Manus, le prompt est validé structurellement.
**6 sections obligatoires** :

1. `ROLE` — identité de l'exécuteur
2. `OBJECTIF` — ce qui doit être vérifié
3. `INTERDICTIONS` — ce qui est interdit
4. `CHECKLIST` — étapes à suivre dans l'ordre
5. `FORMAT JSON` — template de réponse
6. `INSTRUCTION FINALE` — ordre d'arrêt immédiat

Si une section est manquante → erreur bloquante, le scénario n'est pas envoyé à Manus.

---

## Prompt Hash (SHA-256)

Chaque prompt final est haché en SHA-256 avant envoi. Le hash apparaît dans :
- `report.json` → champ `promptHash` de chaque scénario
- `report.md` → section Détail de chaque scénario
- Console → `Hash: <16 premiers caractères>…`

Cela permet de vérifier qu'un run donné a utilisé exactement ce prompt.

---

## Screenshot Validation

Après chaque scénario, les captures attendues (assertions `expectScreenshot`) sont comparées à celles retournées par Manus :

| Champ               | Description                                  |
|---------------------|----------------------------------------------|
| `capturesAttendues` | Nombre d'assertions `expectScreenshot`       |
| `capturesProduites` | Screenshots avec URL valide (`http://…`)     |
| `capturesInvalides` | Screenshots absents ou URL invalide          |

---

## Estimation du coût

Le coût est estimé à partir des crédits consommés :

```
1 crédit = $0.01 USD (configurable via MANUS_CREDIT_COST_USD)
```

Champs disponibles par scénario :
- `creditsConsumed` — crédits réels consommés
- `estimatedCostUsd` — coût estimé en USD

Champs disponibles par run :
- `totalCreditsConsumed` — somme des crédits
- `totalEstimatedCostUsd` — coût total estimé

---

## Variables d'environnement

Fichier `.env.local` (jamais commité) :

```
MANUS_API_KEY=...                       # obligatoire
MANUS_API_URL=https://api.manus.ai      # optionnel
MANUS_ENV=local                         # local | ci | staging | production
MANUS_MODE=QA_EXECUTOR                  # QA_EXECUTOR | QA_AGENT
BASE_URL=http://localhost:3000          # URL de l'app à tester
QA_OWNER_EMAIL=...                      # credentials owner
QA_OWNER_PASSWORD=...
QA_ADMIN_EMAIL=...                      # credentials admin
QA_ADMIN_PASSWORD=...
VERCEL_PROTECTION_BYPASS=...            # token bypass SSO (jamais logué)
MANUS_NATIVE_VERCEL_INTEGRATION=true    # désactive le bypass si true
MANUS_CREDIT_COST_USD=0.01              # taux USD par crédit (défaut: 0.01)
MANUS_CREDITS_REMAINING=500             # optionnel — crédits restants
```

---

## Artefacts générés

Pour chaque run, un dossier `reports/manus/<runId>/` est créé :

```
reports/manus/<runId>/
├── report.json       — RunSummary complète (v2.1)
├── report.md         — Rapport CTO-ready
├── metadata.json     — Métadonnées + versioning
├── timings.json      — Durées + crédits + coût par scénario
├── network.json      — Erreurs réseau agrégées
├── console.log       — Erreurs console par scénario
└── screenshots/      — Dossier réservé aux captures locales
```

---

## Architecture

```
scripts/manus/
├── run-all.ts                  ← Point d'entrée (--dry-run, --scenario, --tag)
├── core/
│   ├── types.ts                ← Types TypeScript partagés
│   ├── version.ts              ← Constantes de versioning (v2.1.0)
│   ├── runner.ts               ← Orchestration des scénarios
│   ├── assertions.ts           ← Bibliothèque d'assertions
│   ├── context.ts              ← Construction du TestContext
│   ├── metadata.ts             ← Collecte de métadonnées (git, env)
│   ├── score.ts                ← Calcul du QA Score (0-100)
│   └── compare.ts              ← Comparaison avec run précédent
├── client/
│   └── index.ts                ← Client API Manus + polling backoff
├── scenarios/
│   ├── login-owner.ts          ← SC-001
│   ├── dashboard-overview.ts   ← SC-002
│   ├── booking-public.ts       ← SC-003
│   ├── admin-login.ts          ← SC-004
│   ├── sidebar.ts              ← SC-005
│   ├── mobile-navigation.ts    ← SC-006
│   ├── responsive.ts           ← SC-007
│   └── test-block-merge.ts     ← SC-T01 (test uniquement)
├── reporters/
│   ├── console.ts              ← Rapport console temps réel
│   ├── json.ts                 ← report.json + artefacts
│   └── markdown.ts             ← report.md (CTO-ready)
├── analysis/
│   ├── index.ts                ← Moteur d'analyse
│   ├── history.ts              ← Historique des runs
│   ├── insights.ts             ← Insights automatiques
│   ├── regressions.ts          ← Détection de régressions
│   ├── recommendations.ts      ← Recommandations
│   ├── severity.ts             ← Niveaux de sévérité
│   └── summary.ts              ← Verdict final
└── utils/
    ├── date.ts                 ← Formatage des dates/durées
    ├── env.ts                  ← Chargement des variables d'env
    ├── hash.ts                 ← SHA-256 du prompt (v2.1)
    ├── prompt-validator.ts     ← Validation structurelle du prompt (v2.1)
    └── cost.ts                 ← Estimation du coût USD (v2.1)
```

---

## Quality Gates

| Gate                | Seuil | Conséquence  |
|---------------------|-------|--------------|
| Score QA global     | ≥ 80  | BLOCK_MERGE  |
| Pas d'erreur console| 0     | WARNING      |
| Pas d'erreur réseau | 0     | WARNING      |
| Taux de passage     | ≥ 70% | BLOCK_MERGE  |

---

## Polling Backoff

```
[2000ms, 2000ms, 5000ms, 10000ms, 15000ms, …]
```

Si le timeout du scénario est dépassé : `status: "timeout"` + toutes les assertions marquées `false`.

---

## Règles de sécurité

- `MANUS_API_KEY` — jamais loggué, jamais commité, jamais affiché dans les rapports
- `VERCEL_PROTECTION_BYPASS` — mêmes règles
- Credentials QA (`QA_OWNER_*`, `QA_ADMIN_*`) — jamais commités, jamais loggués
- Aucun commit sans validation ChatGPT préalable
