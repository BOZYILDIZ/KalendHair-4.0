# Manus QA Platform — Politique de sécurité et de gouvernance (v2.3)

> Document créé suite à l'incident du 2026-07-11 : un agent d'audit en lecture
> seule a exécuté `run-all.ts` en conditions réelles suite à un bug de parsing
> CLI, sans conséquence financière confirmée mais révélant une faiblesse de
> gouvernance structurelle. Ce document définit les règles permanentes qui
> empêchent techniquement ce type d'incident, indépendamment de la discipline
> de l'agent (humain ou IA) qui invoque le code.

---

## 1. Principe fondamental — "Deny by default"

**Nous préférons bloquer une exécution légitime plutôt que de laisser passer une exécution non autorisée.**

Toute action à effet de bord réel (appel réseau, création de tâche Manus, écriture Git distante) est **refusée par défaut**. Le déverrouillage est toujours explicite, jamais implicite, et jamais mémorisé d'une exécution à l'autre.

---

## 2. Modèle de permissions — 8 niveaux

Défini dans `scripts/manus/core/permissions.ts`.

| Niveau | Ce qu'il permet | Effet de bord possible |
|---|---|---|
| `READ_ONLY` | Lire des fichiers du dépôt | Aucun |
| `ANALYSIS` | Raisonner/synthétiser sur du contenu déjà lu | Aucun |
| `DOCUMENTATION` | Produire des rapports, recommandations écrites | Aucun |
| `CODE_MODIFICATION` | Modifier des fichiers locaux (Edit/Write) | Aucun (local, non exécuté) |
| `LOCAL_EXECUTION` | Lancer tests, lint, typecheck, build, `--dry-run` | Aucun (zéro réseau) |
| `NETWORK_EXECUTION` | Émettre un appel réseau réel (Manus, Vercel...) | **Oui** — nécessite SAFE_MODE désactivé |
| `MANUS_EXECUTION` | Créer une tâche Manus réelle (dépense de crédits) | **Oui, financier** — SAFE_MODE + double confirmation |
| `GIT_OPERATION` | Commit / push / merge / PR | **Oui, distant** — gouverné hors du code (§6) |

**Règle absolue** : un agent d'audit, de review, de benchmark ou de documentation ne reçoit **jamais** `NETWORK_EXECUTION`, `MANUS_EXECUTION` ou `GIT_OPERATION`. Trois profils prédéfinis existent dans `core/permissions.ts` :
- `READ_ONLY_AUDIT_PROFILE` — audit/review/documentation (aucun effet de bord possible)
- `LOCAL_DEV_PROFILE` — développement local (tests, dry-run, jamais de réseau réel)
- `MANUS_CAMPAIGN_PROFILE` — campagne QA réelle, explicitement autorisée pour une exécution donnée

`requirePermission(profile, level)` lève une erreur explicite si le niveau n'est pas accordé — aucune permission n'est jamais déduite implicitement.

---

## 3. SAFE_MODE — le garde-fou technique central

Défini dans `scripts/manus/core/safe-mode.ts`. **C'est la protection qui aurait empêché l'incident du 2026-07-11, indépendamment du bug de parsing CLI qui l'a déclenché.**

- **Actif par défaut**, sur toute invocation.
- Désactivable **uniquement** par la présence simultanée de deux flags CLI : `--unsafe` **et** `--i-accept-manus-cost`.
- Ces flags ne sont **jamais lus depuis `.env.local` ou toute variable d'environnement** — uniquement depuis `process.argv` de l'invocation en cours. Un opérateur ne peut donc jamais "laisser SAFE_MODE désactivé par oubli" : il doit retaper les deux flags à chaque commande réelle.
- Gate câblé aux points d'appel réseau réels, quel que soit l'appelant :
  - `client/index.ts::pingManus()` et `createAndPollTask()` (chemin officiel, utilisé par `ManusProvider`)
  - `ping.ts` (hérite du gate via `pingManus()`, aucune modification propre nécessaire)
  - *(le chemin legacy `manus-client.ts`/`scenarios/pr-06-regression.ts`, gaté en défense en profondeur depuis v2.3, a été supprimé lors de la préparation de la PR Enterprise Foundation — zéro référence résiduelle confirmée par audit avant suppression)*
- `run-all.ts` vérifie SAFE_MODE **avant** tout accès aux credentials/contexte : échec rapide et explicite, pas un crash profond après consommation partielle.
- `--dry-run` n'est **jamais** bloqué par SAFE_MODE (zéro effet de bord par construction) — les deux mécanismes sont indépendants et complémentaires.

---

## 4. Double validation

Toute opération pouvant dépenser de l'argent, appeler Manus, utiliser un token, créer une ressource distante, ou toucher Git nécessite **deux confirmations distinctes** :

1. **Autorisation explicite** de l'utilisateur, donnée pour cette action précise (jamais une autorisation générique passée).
2. **Vérification technique juste avant l'exécution** — le gate `assertNotSafeMode()` s'exécute à l'instant `T` de l'appel réseau lui-même, pas en amont dans le flux d'exécution (empêchant un bypass si un autre chemin de code contourne une vérification faite plus tôt).

**Aucune autorisation ancienne n'est jamais réutilisée automatiquement** — c'est la raison structurelle pour laquelle les flags SAFE_MODE ne sont jamais lus depuis un fichier de configuration persistant.

---

## 5. Dry-run obligatoire

`run-all.ts --dry-run` reste la voie par défaut recommandée pour valider :
- la génération de prompt et son hash SHA-256,
- la présence des credentials requis,
- le format JSON attendu,
- le rapport complet (`report.json`, `report.md`),

**sans jamais appeler l'API Manus.** Toute nouvelle commande critique ajoutée au framework doit suivre le même principe : simulation d'abord, exécution réelle seulement après un déverrouillage explicite et distinct.

---

## 6. GIT_OPERATION — gouvernance hors code

Le framework `scripts/manus/` n'invoque lui-même **aucune commande Git** (aucun `exec("git ...")` dans le code source, confirmé par audit). Le risque `GIT_OPERATION` est donc entièrement **process-level**, pas code-level :

- Aucun commit, push, ou PR n'est jamais effectué sans une instruction fraîche et explicite de l'utilisateur dans le tour de conversation en cours.
- Une autorisation donnée pour une mission précédente ne s'applique jamais à une mission suivante.
- Cette règle est déjà appliquée de façon constante sur l'ensemble des missions de ce projet (`CLAUDE.md`, section "Règle Git officielle").

---

## 7. Cartographie complète des surfaces de risque (audit v2.3)

### 7.1 Appels réseau réels (`fetch()`)

| Fichier | Fonction | Statut |
|---|---|---|
| `client/index.ts:78` | `pingManus()` | ✅ Gaté SAFE_MODE |
| `client/index.ts:121` | `createAndPollTask()` (création) | ✅ Gaté SAFE_MODE |
| `client/index.ts:149` | `createAndPollTask()` (polling) | ✅ Gaté en amont (le gate à la création empêche d'atteindre le polling) |
| ~~`manus-client.ts`~~ | ~~`pingManus()`/`runManusTask()` (legacy)~~ | **SUPPRIMÉ** — plus de surface à gater |

### 7.2 Usages de tokens/clés API

| Fichier | Rôle |
|---|---|
| `utils/env.ts` | Lecture centralisée de `MANUS_API_KEY`, `VERCEL_PROTECTION_BYPASS` — jamais loggée (déjà en place, vérifié) |
| `client/index.ts` | Injection du header `x-manus-api-key` — désormais derrière le gate réseau |
| `core/context.ts` | Construit l'URL de bypass Vercel (`_vercel_share=<token>`) — injectée dans le prompt envoyé à Manus (risque de fuite documenté, hors périmètre de ce durcissement, voir recommandations) |

### 7.3 Points d'entrée exécutables directement

| Fichier | Risque réel | Statut |
|---|---|---|
| `run-all.ts` | Point d'entrée principal, exécution réelle possible | ✅ SAFE_MODE + parsing CLI durci (rejet flags inconnus, rejet valeur=flag suivant, `--help`) |
| `ping.ts` | Ping réseau réel | ✅ Gaté transitivement via `pingManus()` |
| `analysis/auto-audit.ts` | CLI (`if (import.meta.url === ...)`) | Aucun risque — uniquement des lectures locales (`existsSync`/`readFileSync`), pas de réseau |

### 7.4 Surface hors code (comportement de l'agent orchestrateur)

| Risque | Contrôle |
|---|---|
| Un agent IA dispatché pour une tâche d'audit/lecture exécute malgré tout une commande à effet de bord | **Technique** (§3, ne dépend plus de la discipline de l'agent) + **process** : tout agent d'audit futur doit être explicitement briefé "lecture seule, aucune exécution de script" |
| Génération d'un token d'accès externe (ex. bypass Vercel) répétée sans besoin réel | Process : chaque génération de token doit correspondre à un besoin explicite du tour de conversation en cours, jamais automatique |
| Réutilisation d'une autorisation de dépense Manus donnée lors d'une mission précédente | Technique : impossible par construction (§3, §4) — les flags ne sont jamais persistés |

---

## 8. Ce qui reste un risque résiduel (non éliminé par ce durcissement)

- **`core/context.ts` construit une URL contenant le token de bypass Vercel en clair, injectée dans le prompt envoyé à Manus** (déjà signalé par l'audit architecture — fiche « fuite d'identifiants »). SAFE_MODE empêche l'appel réseau tant qu'il n'est pas explicitement déverrouillé, mais une fois déverrouillé pour une campagne légitime, ce risque de fuite via `rawOutput` persisté demeure — corrigé par une redaction dédiée, hors périmètre de cette mission de gouvernance.
- ~~`manus-client.ts` / `scenarios/pr-06-regression.ts` restent du code mort gaté, pas supprimé.~~ **Résolu** : les deux fichiers ont été supprimés lors de la préparation de la PR Enterprise Foundation, après confirmation exhaustive de zéro référence restante.
- **Aucun test d'intégration CI n'exécute la suite de tests** (`test:manus` non appelé par `.github/workflows/ci.yml`) — un futur contournement de SAFE_MODE ne serait pas détecté automatiquement avant un audit manuel. Corrigible uniquement après un commit/push, hors périmètre de cette mission (« aucun commit, aucun push »).
- **La cartographie ci-dessus couvre `scripts/manus/` uniquement** — si un futur script hors de ce périmètre réimplémente un appel Manus indépendamment (comme le faisait historiquement le client legacy désormais supprimé), il ne bénéficiera pas automatiquement du gate sauf à importer explicitement `assertNotSafeMode` depuis `core/safe-mode.ts`.
