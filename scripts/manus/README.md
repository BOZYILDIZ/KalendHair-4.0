# Manus QA — KalendHair

Scripts de tests navigateur automatisés via [Manus](https://manus.im).

## Structure

```
scripts/manus/
  manus-client.ts          # Client API Manus (polling, artefacts)
  README.md                # Ce fichier
  scenarios/
    pr-06-regression.ts    # Régression PR-06 Secondary Widgets
    pr-07-*.ts             # (à venir)
```

## Prérequis

- Node.js 20+
- `tsx` installé : `pnpm add -D tsx` (ou `npx tsx`)
- Clé API Manus dans `.env.local`

## Configuration

```bash
# .env.local
MANUS_API_KEY=sk-...           # clé régénérée depuis le compte Manus
MANUS_API_URL=https://api.manus.im
BASE_URL=https://staging.kalendhair.fr  # ou http://localhost:3000
```

## Lancement

```bash
# Régression PR-06
BASE_URL=https://staging.kalendhair.fr \
  tsx scripts/manus/scenarios/pr-06-regression.ts
```

## Règles de sécurité

- ⛔ Ne jamais committer `.env.local`
- ⛔ Ne jamais afficher `MANUS_API_KEY` dans les logs
- ⛔ Ne jamais stocker la clé dans le code
- ✅ GitHub Secrets : `MANUS_API_KEY` pour CI
- ✅ Vercel Environment Variables : `MANUS_API_KEY` pour staging/prod
