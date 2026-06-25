# PRODUCTION_CHECKLIST — KalendHair 4.0

> Document de référence production. À lire avant toute opération sur les domaines, la base ou les variables.

---

## État production (2026-06-25)

### Domaines

| Domaine | Projet Vercel | Statut |
|---|---|---|
| `kalendhair.fr` | `kalendhair-4-0` | ✅ Actif |
| `www.kalendhair.fr` | `kalendhair-4-0` | ✅ Actif |
| `pro.kalendhair.fr` | `kalendhair-4-0` | ✅ Actif |
| `admin.kalendhair.fr` | `kalendhair-4-0` | ✅ Actif |

DNS : IONOS — nameservers Third Party → Vercel CNAME. **Ne jamais modifier les DNS IONOS.**

### Projet Vercel

| Élément | Valeur |
|---|---|
| Projet actif | `kalendhair-4-0` |
| Project ID | `prj_LPWnqPSHjs7flRGkAi9ksJzuyoEy` |
| Team ID | `team_b5XkOy4IBizI9JSyszlclmEH` |
| Dernier déploiement | `dpl_9ErGzhzRYvoRvnvHYAVZHYdrfm7C` |
| Projet rollback | `kalend-hair-2-0` (conservé, non supprimé) |
| Plan | Hobby |
| Node.js | 24.x |
| Build script | `prisma generate && next build` |

### Base de données Neon

| Élément | Valeur |
|---|---|
| Projet | `kalendhair-4-prod` |
| Région | Frankfurt (`aws-eu-central-1`) |
| Tables | 44 tables + 24 enums |
| Migrations appliquées | 13 (toutes) |
| AdminUser prod | `hasan@netzinformatique.fr` |
| BillingPlans | ESSENTIAL / PRO / BUSINESS |

---

## Variables requises

| Variable | Rôle | Requis |
|---|---|---|
| `DATABASE_URL` | Connexion Neon PostgreSQL | ✅ Obligatoire |
| `JWT_SECRET` | Signature JWT tenant (HS256) | ✅ Obligatoire |
| `CRON_SECRET` | Authentification endpoint CRON | ✅ Obligatoire |

## Variables optionnelles

| Variable | Rôle | Défaut si absent |
|---|---|---|
| `ADMIN_JWT_SECRET` | Secret dédié Super Admin | Utilise `JWT_SECRET` |
| `RESEND_API_KEY` | Envoi emails transactionnels | Notifications → SKIPPED |
| `RESEND_FROM_EMAIL` | Adresse expéditeur | `noreply@kalendhair.fr` |
| `RESEND_FROM_NAME` | Nom expéditeur | `KalendHair` |
| `SENTRY_DSN` | Observabilité serveur | Sentry désactivé |
| `NEXT_PUBLIC_SENTRY_DSN` | Observabilité client | Sentry désactivé |

---

## Procédure de déploiement standard

```bash
# 1. Masquer vercel.json (CRON Hobby incompatible hourly)
mv vercel.json vercel.json.bak

# 2. Déployer
vercel deploy --prod --yes

# 3. Restaurer vercel.json
mv vercel.json.bak vercel.json

# 4. Vérifier les routes
curl -I https://kalendhair.fr
curl -I https://admin.kalendhair.fr/admin/login
```

---

## Procédure rollback domaine

Si une erreur survient après bascule, restaurer les domaines vers `kalend-hair-2-0` :

```bash
# Variables
OLD="prj_OHDUmrIHCSLwx8vb1jIIRwv7YYVa"  # kalend-hair-2-0
NEW="prj_LPWnqPSHjs7flRGkAi9ksJzuyoEy"  # kalendhair-4-0
TEAM="team_b5XkOy4IBizI9JSyszlclmEH"
TOKEN="<VERCEL_TOKEN>"

# Pour chaque domaine (en sens inverse : apex → www → admin → pro)
for DOMAIN in "kalendhair.fr" "www.kalendhair.fr" "admin.kalendhair.fr" "pro.kalendhair.fr"; do
  curl -X DELETE "https://api.vercel.com/v9/projects/${NEW}/domains/${DOMAIN}?teamId=${TEAM}" \
    -H "Authorization: Bearer ${TOKEN}"
  curl -X POST "https://api.vercel.com/v9/projects/${OLD}/domains?teamId=${TEAM}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"${DOMAIN}\"}"
done
```

Temps de rollback : ~30 secondes. Aucune modification DNS requise.

---

## Procédure rollback Vercel (déploiement)

Via CLI :
```bash
# Lister les déploiements récents
vercel ls --scope hasan-bicers-projects

# Promouvoir un déploiement précédent
vercel promote <deployment-url> --scope hasan-bicers-projects
```

Via Dashboard : Vercel → `kalendhair-4-0` → Deployments → choisir → `···` → Promote to Production.

---

## Procédure incident — Admin Login

### Symptôme : 500 sur `/admin/login`

1. Récupérer les logs : Vercel Dashboard → `kalendhair-4-0` → Logs → filtrer ERROR
2. Si erreur `P2022` (column not found) :
   - Vérifier que le build script inclut `prisma generate` : `cat package.json | grep build`
   - Redéployer : `vercel deploy --prod --yes`
3. Si erreur JWT : vérifier que `JWT_SECRET` est bien configuré sur Vercel
4. Si redirect loop : vérifier que `/admin/login` n'est pas dans le route group `(protected)`

### Symptôme : Mot de passe admin perdu

```bash
# Régénérer un mot de passe (via script)
npx tsx -e "
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pwd = crypto.randomBytes(16).toString('base64url');
bcrypt.hash(pwd, 12).then(h => console.log('PWD:', pwd, '\nHASH:', h));
"
# Puis mettre à jour via Neon Console :
# UPDATE admin_users SET password_hash = '<hash>' WHERE email = 'hasan@netzinformatique.fr';
```

---

## Procédure incident — Prisma

### Erreur P2022 (column not found)

Cause : Prisma Client déployé sans `prisma generate` (cache pnpm).

Fix : `package.json` `build` script doit être `prisma generate && next build` — **déjà appliqué (PR #45)**.

### Erreur P2002 (unique constraint)

Cause : donnée dupliquée (email/slug). Inspecter via Neon Console.

### Erreur P1001 (can't reach database)

1. Vérifier `DATABASE_URL` sur Vercel : Settings → Environment Variables
2. Vérifier le projet Neon : [console.neon.tech](https://console.neon.tech)
3. Vérifier que l'endpoint Neon est actif (pas suspendu)

---

## Procédure incident — Base de données

### Sauvegarde Neon

Neon effectue des sauvegardes automatiques continues (Point-in-Time Recovery).
- Plan Free : rétention 7 jours
- Consulter : Neon Console → projet `kalendhair-4-prod` → Branches → Restore

### Restauration

Via Neon Console :
1. Créer une branche depuis un point dans le temps (`Restore to point in time`)
2. Tester sur la branche restaurée
3. Promouvoir si validé (avec validation ChatGPT)

⚠️ **Ne jamais restaurer directement sur la branche `main` sans validation.**

---

## Checklist avant ouverture client

### Technique
- [ ] `DATABASE_URL` pointe vers Neon prod (Frankfurt)
- [ ] `JWT_SECRET` ≥ 32 caractères, généré aléatoirement
- [ ] `CRON_SECRET` configuré sur Vercel
- [ ] `RESEND_API_KEY` configuré et testé (email de confirmation)
- [ ] Build script : `prisma generate && next build`
- [ ] `prisma validate` passe sans erreur
- [ ] Toutes les routes répondent : `/`, `/login`, `/admin/login`, `/admin`, `/dashboard`

### Sécurité
- [ ] Mot de passe Super Admin changé (mot de passe temporaire remplacé)
- [ ] Cookie `admin_session` : httpOnly, secure, sameSite=strict, maxAge=8h ✅
- [ ] Cookie `session` : httpOnly, secure, sameSite=lax, maxAge=24h ✅
- [ ] Rate limiting actif sur `/login` et `/admin/login` (in-memory, best-effort)
- [ ] `/admin` inaccessible sans `admin_session` valide ✅
- [ ] `/dashboard` inaccessible sans `session` valide ✅

### Données
- [ ] BillingPlan ESSENTIAL/PRO/BUSINESS présents en DB
- [ ] Aucune donnée DEV en production (owner@test.local, admin@kalend.dev)
- [ ] 0 organisation test

### Observabilité
- [ ] Vercel Analytics actif (gratuit, intégré)
- [ ] Vercel Speed Insights actif (gratuit, intégré)
- [ ] Sentry configuré si `SENTRY_DSN` disponible
- [ ] Logs Vercel accessibles (Dashboard → Logs)

### Domaines
- [ ] `kalendhair.fr` → 200
- [ ] `www.kalendhair.fr` → 200
- [ ] `pro.kalendhair.fr` → 200
- [ ] `admin.kalendhair.fr/admin/login` → 200
- [ ] Certificats HTTPS valides (verified=true sur Vercel)
- [ ] DNS IONOS inchangés

---

## Test de fumée production

| URL | Méthode | Résultat attendu |
|---|---|---|
| `https://kalendhair.fr` | GET | 200 — page d'accueil |
| `https://www.kalendhair.fr` | GET | 200 — page d'accueil |
| `https://pro.kalendhair.fr/login` | GET | 200 — formulaire ProUser |
| `https://admin.kalendhair.fr/admin/login` | GET | 200 — formulaire Super Admin |
| `https://admin.kalendhair.fr/admin` | GET | 307 → `/admin/login` (non authentifié) |
| `https://pro.kalendhair.fr/dashboard` | GET | 307 → `/login` (non authentifié) |
| `POST /admin/login` (credentials valides) | POST | Redirect → `/admin` |
| `POST /api/admin/logout` | POST | Redirect → `/admin/login` |
| `POST /login` (credentials valides) | POST | Redirect → `/dashboard` |
| `POST /api/auth/logout` | POST | Redirect → `/login` |
| `https://admin.kalendhair.fr/admin/account` | GET (authentifié) | 200 — page changement mdp |

---

_Dernière mise à jour : 2026-06-25 — Phase Stabilisation Production_
