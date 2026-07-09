# Manus QA Platform — KalendHair

Infrastructure de tests navigateur automatisés via [Manus](https://manus.ai) (API v2).

---

## Structure

```
scripts/manus/
├── run-all.ts                   # Entry point CLI
├── ping.ts                      # Validation connexion API
├── manus-client.ts              # Legacy (remplacé par client/)
│
├── client/
│   └── index.ts                 # Client Manus API v2 (create + poll)
│
├── core/
│   ├── types.ts                 # Types TypeScript partagés
│   ├── assertions.ts            # Bibliothèque d'assertions
│   ├── context.ts               # Contexte de test (env, baseUrl, creds)
│   └── runner.ts                # Runner de scénarios
│
├── reporters/
│   ├── console.ts               # Reporter console (résumé humain)
│   ├── json.ts                  # Reporter JSON → reports/manus/<id>.json
│   ├── markdown.ts              # Reporter Markdown → reports/manus/<id>.md
│   └── index.ts                 # Exports groupés
│
├── scenarios/
│   ├── login-owner.ts           # Connexion owner + redirection dashboard
│   ├── dashboard-overview.ts    # Vue d'ensemble dashboard v2
│   ├── booking-public.ts        # Prise de RDV public (sans auth)
│   ├── admin-login.ts           # Connexion back-office admin
│   ├── sidebar.ts               # Navigation sidebar
│   ├── mobile-navigation.ts     # Navigation mobile 390px
│   ├── responsive.ts            # Breakpoints critiques
│   └── pr-06-regression.ts      # Régression PR-06 (legacy)
│
├── utils/
│   ├── date.ts                  # nowIso(), runId(), formatDuration()
│   └── env.ts                   # Chargement variables d'environnement
│
├── screenshots/                 # Captures Manus (ignorées par git)
└── artifacts/                   # Artefacts bruts (ignorés par git)

reports/manus/
├── <runId>.json                 # Résultat structuré (pour Codex)
└── <runId>.md                   # Rapport Markdown (pour ChatGPT)
```

---

## Authentification Manus API v2

| Champ          | Valeur                         |
|----------------|--------------------------------|
| Base URL       | `https://api.manus.ai`         |
| Header auth    | `x-manus-api-key: $MANUS_API_KEY` |
| Créer tâche    | `POST /v2/task.create`         |
| Polling statut | `GET /v2/task.detail?task_id=<id>` |

**⛔ Ne PAS utiliser** `Authorization: Bearer` — invalide pour Manus (retourne 401).

---

## Configuration

```bash
# .env.local — jamais commité (.env* est dans .gitignore)
MANUS_API_KEY="sk-..."
MANUS_API_URL="https://api.manus.ai"
MANUS_ENV="local"                      # local | ci | staging | production
BASE_URL="https://staging.kalendhair.fr"   # requis pour ci/staging/production

# Credentials QA (comptes dédiés, jamais les comptes réels)
QA_OWNER_EMAIL="qa-owner@kalendhair.fr"
QA_OWNER_PASSWORD="..."
QA_ADMIN_EMAIL="qa-admin@kalendhair.fr"
QA_ADMIN_PASSWORD="..."
```

---

## Commandes

### Validation de la connexion

```bash
tsx scripts/manus/ping.ts
```

### Lancer tous les scénarios

```bash
tsx scripts/manus/run-all.ts
```

### Lancer un scénario spécifique

```bash
tsx scripts/manus/run-all.ts --scenario login-owner
tsx scripts/manus/run-all.ts --scenario dashboard-overview
```

### Filtrer par tag

```bash
tsx scripts/manus/run-all.ts --tag smoke
tsx scripts/manus/run-all.ts --tag mobile
tsx scripts/manus/run-all.ts --tag dashboard-v2
```

### Cibler un environnement

```bash
MANUS_ENV=staging BASE_URL=https://staging.kalendhair.fr tsx scripts/manus/run-all.ts
```

---

## Scénarios disponibles

| Nom                  | Tags                        | Description |
|----------------------|-----------------------------|-------------|
| `login-owner`        | auth, smoke, owner          | Connexion owner + dashboard |
| `dashboard-overview` | dashboard, smoke, owner     | Vue dashboard v2 complète |
| `booking-public`     | booking, public, smoke      | Réservation sans auth |
| `admin-login`        | auth, admin, smoke          | Back-office admin |
| `sidebar`            | nav, sidebar, smoke         | Navigation sidebar |
| `mobile-navigation`  | mobile, nav, responsive     | Mobile 390px |
| `responsive`         | responsive, visual, regression | Breakpoints 1920/1440/768/390 |

---

## Assertions disponibles

```typescript
expectNoConsoleErrors(allowReactWarnings?)
expectNoNetworkErrors(ignoreCodes?)
expectVisible(selector, label?)
expectText(text, context?)
expectRoute(pathOrPattern)
expectRedirect(fromPath, toPath)
expectElementCount(selector, count, label?)
expectScreenshot(label, description?)
```

---

## Format de rapport Manus

Manus retourne son analyse sous forme de texte libre contenant un bloc JSON :

```json
{
  "assertions": [
    { "name": "no_console_errors", "passed": true, "message": "Aucune erreur." }
  ],
  "urlsVisited": ["https://staging.kalendhair.fr/dashboard"],
  "consoleErrors": [],
  "networkErrors": [],
  "screenshots": [{ "label": "dashboard_overview", "url": null }]
}
```

---

## Règles de sécurité (non négociables)

- ⛔ Ne jamais committer `.env.local`
- ⛔ Ne jamais afficher `MANUS_API_KEY` dans les logs, même partiellement
- ⛔ Ne jamais stocker la clé dans le code source
- ⛔ Ne jamais copier la clé dans un fichier du dépôt
- ✅ Si la clé est exposée dans un chat ou un log → la régénérer immédiatement
- ✅ CI : GitHub Secret `MANUS_API_KEY`
- ✅ Vercel : Environment Variable `MANUS_API_KEY`
