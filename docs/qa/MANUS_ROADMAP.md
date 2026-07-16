# Manus QA Platform — Roadmap officielle

> Document de planification stratégique  
> Version actuelle : **v2.2.1** (frameworkVersion) — section "Ce qui est livré" ci-dessous encore au niveau v2.1, voir Mission 8 (audit doc v2.2.1) pour le détail des ajouts v2.2/v2.2.1 non répercutés ici  
> Statut : en production sur la branche `fix/manus-vercel-sso-classification`

---

## Version actuelle : v2.1.0

Référence : PR #79 — `feat(manus): QA Platform v2.1`

### Ce qui est livré

- [x] Versioning central (`core/version.ts` — FRAMEWORK_VERSION, SCHEMA_VERSION, PROMPT_VERSION)
- [x] Scenario IDs stables (SC-001 à SC-007 + SC-T01)
- [x] SHA-256 prompt hash (traçabilité exacte des prompts envoyés)
- [x] Dry-run mode (`--dry-run` — zéro crédit, simulation complète)
- [x] Prompt validation (6 sections obligatoires, fail-fast)
- [x] Screenshot validation (capturesAttendues/Produites/Invalides)
- [x] Cost estimation (crédits → USD)
- [x] Framework Quality report (10 checkpoints dans le rapport Markdown)
- [x] Credential check avant `scenario.run()` (fix P0 crash)
- [x] Backoff polling exponentiel [2s, 2s, 5s, 10s, 15s]
- [x] QA Score 100pts avec 7 dimensions

---

## v2.2 — Industrialisation CI/CD

> Priorité : **HAUTE**  
> Estimation : 3-5 jours développement  
> Dépendances : v2.1 mergée, secrets GitHub configurés

### Objectifs

Transformer le framework d'un outil local en une plateforme CI intégrée au workflow GitHub/Vercel.

### Fonctionnalités prévues

**2.2.1 — GitHub Actions activation**
- Activer `qa-manus-preview.yml` (actuellement désactivé)
- Déclenchement automatique sur `deployment_status` Vercel
- Publication des rapports en artefacts GitHub
- Commentaire automatique sur la PR avec le score QA

**2.2.2 — Parallélisation des scénarios**
- Exécution parallèle des scénarios indépendants (SC-001 à SC-007)
- Groupement par credential : owner, admin, public
- Réduction du temps de run : ~10 min → ~3 min
- Gestion des conflits de rate-limit Manus

**2.2.3 — Smoke mode CI**
- `--mode smoke` : exécute uniquement SC-001 + SC-003 (30s)
- `--mode standard` : tous les scénarios (actuellement)
- `--mode full` : scénarios + analyse de régression visuelle

**2.2.4 — Commentaire PR GitHub automatique**
- Score QA, verdict, tableau des assertions
- Lien direct vers le rapport complet
- Comparaison avec le run précédent

**2.2.5 — Dashboard HTML auto-régénéré**
- Appel automatique à `generate-dashboard.ts` après chaque run
- Dashboard toujours à jour après chaque CI

### Risques v2.2

| Risque | Probabilité | Mitigation |
|--------|-------------|------------|
| Rate-limit Manus en parallèle | Moyenne | Configurer une limite de concurrence |
| Coût CI trop élevé | Faible | Smoke mode par défaut en CI |
| Secrets exposés en logs | Faible | Validation garantie dans `utils/env.ts` |

---

## v2.3 — Régression visuelle & coverage

> Priorité : **HAUTE**  
> Estimation : 5-8 jours développement  
> Dépendances : v2.2 stable

### Objectifs

Ajouter la dimension visuelle au QA : détecter les régressions d'interface.

### Fonctionnalités prévues

**2.3.1 — Baseline de captures**
- Commande `--capture-baseline` : enregistrer les captures de référence
- Stockage dans `reports/manus/baseline/<scenarioId>/<label>.png`
- Versioning de la baseline (par commit SHA)

**2.3.2 — Comparaison visuelle**
- Après chaque run : comparer captures produites vs baseline
- Algorithme : pixel diff + seuil de tolérance configurable
- Rapport : `visual-diff.json` + images annotées (zones modifiées)

**2.3.3 — Score visuel**
- Nouvelle dimension au QA Score : +10 pts → total 110 pts (ou redistribué)
- `capturesIdentiques`, `capturesModifiées`, `capturesAbsentes`

**2.3.4 — Revue visuelle humaine**
- Quand des captures diffèrent : workflow de validation manuelle
- `--approve-baseline` pour promouvoir la baseline après validation

**2.3.5 — Coverage des scénarios**
- Rapport de couverture : quelles pages ont été testées
- Quelles assertions sont couvertes par quel scénario
- Gaps de couverture identifiés automatiquement

### Risques v2.3

| Risque | Probabilité | Mitigation |
|--------|-------------|------------|
| Faux positifs (antialiasing, fonts) | Haute | Seuil de tolérance + zone masquée |
| Taille des images en git | Haute | Stockage hors git (S3 ou Vercel Blob) |
| Temps de traitement image | Moyenne | Traitement asynchrone post-run |

---

## v2.4 — Intelligence & self-healing

> Priorité : **MOYENNE**  
> Estimation : 8-12 jours développement  
> Dépendances : v2.3 stable

### Objectifs

Rendre le framework adaptatif : il doit apprendre des runs précédents et se corriger automatiquement.

### Fonctionnalités prévues

**2.4.1 — Self-healing des sélecteurs**
- Quand un scénario échoue sur un élément introuvable : Manus cherche l'élément par contenu sémantique
- Mise à jour automatique du prompt avec le nouveau sélecteur
- PR automatique proposée pour valider la correction

**2.4.2 — Analyse des patterns d'échec**
- Clustering des échecs récurrents (même page, même assertion, même heure)
- Identification des causes racines : flakiness vs régression
- Recommandations priorisées

**2.4.3 — Génération de scénarios automatique**
- À partir des analytics d'usage (chemins utilisateurs les plus fréquents)
- Suggestion de nouveaux scénarios à couvrir
- Draft de scénario TypeScript généré automatiquement pour validation

**2.4.4 — Multi-run consensus**
- Pour les assertions sensibles : exécuter 3 fois, décision à la majorité
- Réduction du bruit et des faux positifs
- Coût multiplié par 3 → à utiliser sélectivement

**2.4.5 — Rapport d'anomalies business**
- Détecter les anomalies dans le flux métier (ex: le calendrier ne montre plus d'horaires)
- Alertes spécifiques au domaine coiffure

### Risques v2.4

| Risque | Probabilité | Mitigation |
|--------|-------------|------------|
| Self-healing qui corrige le mauvais sélecteur | Moyenne | Validation humaine obligatoire via PR |
| Coût élevé multi-run | Haute | Opt-in par assertion, pas par défaut |
| Génération de scénarios incorrects | Haute | Review humaine systématique |

---

## v3.0 — Plateforme QA as a Service

> Priorité : **FAIBLE** (horizon 12-18 mois)  
> Estimation : 20-30 jours développement  
> Dépendances : v2.4 stable, architecture multi-tenant validée

### Objectifs

Extraire Manus QA Platform en un service indépendant, réutilisable pour d'autres projets SaaS.

### Vision

```
KalendHair QA SDK
        ↓
Manus QA Platform v3.0 (service)
        ↓
API REST     Dashboard web     Webhooks     CLI
```

### Fonctionnalités prévues

**3.0.1 — API REST**
- `POST /api/qa/run` : déclencher un run
- `GET /api/qa/runs` : lister les runs
- `GET /api/qa/runs/:id` : détail d'un run
- `GET /api/qa/score` : score actuel
- Authentification JWT

**3.0.2 — Dashboard web (Next.js)**
- Interface web complète (non un simple fichier HTML)
- Temps réel via WebSocket (progression du run)
- Historique illimité (PostgreSQL)
- Comparaison visuelle inline

**3.0.3 — SDK pour autres projets**
- Package npm `@kalendhair/manus-qa`
- Configuration déclarative (YAML ou JSON)
- Scénarios universels + scénarios custom
- CI templates (GitHub Actions, GitLab CI, CircleCI)

**3.0.4 — Multi-tenant**
- Organisation → Projets → Scénarios
- Permissions par rôle
- Quotas Manus par projet
- Facturation basée sur la consommation

**3.0.5 — Notifications**
- Slack, email, webhook sur BLOCK_MERGE
- Rapport hebdomadaire par email
- Alertes de régression en temps réel

### Risques v3.0

| Risque | Probabilité | Mitigation |
|--------|-------------|------------|
| Scope créep (feature bloat) | Haute | MVP strict — API + Dashboard de base uniquement |
| Dépendance Manus (fournisseur unique) | Haute | Abstraction `AgentProvider` dès v3.0 |
| Coûts infrastructure | Moyenne | Serverless-first (Vercel Functions) |
| Adoption externe | Incertaine | Commencer par usage interne KalendHair uniquement |

---

## Résumé des priorités

| Version | Priorité | Valeur | Effort | Risque |
|---------|----------|--------|--------|--------|
| v2.2 | HAUTE | CI automatique = détecter les régressions en temps réel | 3-5j | Faible |
| v2.3 | HAUTE | Régression visuelle = confiance UI | 5-8j | Moyen |
| v2.4 | MOYENNE | Intelligence = moins de maintenance | 8-12j | Élevé |
| v3.0 | FAIBLE | Plateforme = réutilisabilité | 20-30j | Très élevé |

---

## Critères d'entrée par version

| Version | Gate d'entrée |
|---------|---------------|
| v2.2 | PR #79 mergée + secrets GitHub configurés + budget CI Manus validé |
| v2.3 | v2.2 stable depuis ≥ 2 semaines + décision sur stockage images |
| v2.4 | v2.3 stable + 50+ runs analysés + validation ROI self-healing |
| v3.0 | v2.4 stable + décision stratégique produit sur l'extraction |

---

## Décisions architecturales en attente

1. **Stockage des captures visuelles** (v2.3) : Vercel Blob vs S3 vs git-lfs ?
2. **Parallélisation Manus** (v2.2) : rate-limit API Manus à confirmer ?
3. **Budget CI** (v2.2) : quel niveau de dépense mensuelle est acceptable ?
4. **Scope v3.0** : interne KalendHair uniquement ou SaaS public ?

> Ces décisions nécessitent une validation ChatGPT + Hasan avant implémentation.
