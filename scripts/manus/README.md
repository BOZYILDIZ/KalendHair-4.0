# Manus QA — KalendHair

Scripts de tests navigateur automatisés via [Manus](https://manus.ai) (API v2).

## Structure

```
scripts/manus/
  manus-client.ts          # Client API Manus v2 (ping, création tâche, polling)
  README.md                # Ce fichier
  scenarios/
    pr-06-regression.ts    # Régression PR-06 Secondary Widgets
```

## Authentification

**Header obligatoire :**
```
x-manus-api-key: $MANUS_API_KEY
```

**⛔ Ne PAS utiliser :**
```
Authorization: Bearer $MANUS_API_KEY   ← invalide, retourne 401
```

## Configuration

```bash
# .env.local  — jamais commité (.env* est dans .gitignore)
MANUS_API_KEY="sk-..."              # clé régénérée depuis le compte Manus
MANUS_API_URL="https://api.manus.ai"
BASE_URL="https://staging.kalendhair.fr"  # ou http://localhost:3000
```

## Prérequis

- Node.js 20+
- `tsx` : `pnpm add -D tsx` (ou `npx tsx`)

## Ping (validation de la clé)

Avant toute campagne, valider que la connexion fonctionne :

```bash
tsx scripts/manus/ping.ts
```

## Lancement des scénarios

```bash
# Régression PR-06
BASE_URL=https://staging.kalendhair.fr \
  tsx scripts/manus/scenarios/pr-06-regression.ts
```

## Règles de sécurité

- ⛔ Ne jamais committer `.env.local`
- ⛔ Ne jamais afficher `MANUS_API_KEY` dans les logs, même partiellement
- ⛔ Ne jamais stocker la clé dans le code source
- ⛔ Si la clé est exposée dans un chat ou un log → la régénérer immédiatement
- ✅ GitHub Secrets : `MANUS_API_KEY` pour CI
- ✅ Vercel Environment Variables : `MANUS_API_KEY` pour staging/prod

## Endpoints v2 utilisés

| Action         | Méthode | Endpoint                                      |
|----------------|---------|-----------------------------------------------|
| Créer une tâche| POST    | `/v2/task.create`                             |
| Polling statut | GET     | `/v2/task.detail?task_id=<id>`                |
