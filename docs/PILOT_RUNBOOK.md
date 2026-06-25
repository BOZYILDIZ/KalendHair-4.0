# PILOT_RUNBOOK — Phase Pilote Fermé KalendHair 4.0

> Document opérationnel pour la conduite du pilote fermé.
> À utiliser par l'équipe interne uniquement.
> Version initiale — 2026-06-25.

---

## Table des matières

1. [Objectifs du pilote fermé](#1-objectifs-du-pilote-fermé)
2. [Critères de sélection des salons pilotes](#2-critères-de-sélection-des-salons-pilotes)
3. [Durée recommandée du pilote](#3-durée-recommandée-du-pilote)
4. [Checklist avant onboarding d'un salon](#4-checklist-avant-onboarding-dun-salon)
5. [Checklist onboarding salon](#5-checklist-onboarding-salon)
6. [Checklist après 24h](#6-checklist-après-24h)
7. [Checklist après 7 jours](#7-checklist-après-7-jours)
8. [Checklist fin de pilote](#8-checklist-fin-de-pilote)
9. [Procédure de rollback](#9-procédure-de-rollback)
10. [Procédure incident production](#10-procédure-incident-production)
11. [Procédure support](#11-procédure-support)
12. [Contacts internes](#12-contacts-internes)
13. [Données à collecter](#13-données-à-collecter)
14. [Métriques à suivre](#14-métriques-à-suivre)
15. [Processus d'onboarding manuel](#15-processus-donboarding-manuel)
16. [Configuration RESEND (en attente)](#16-configuration-resend-en-attente)
17. [Template de suivi pilote](#17-template-de-suivi-pilote)
18. [État de l'environnement de production](#18-état-de-lenvironnement-de-production)

---

## 1. Objectifs du pilote fermé

### Objectif principal

Valider que KalendHair 4.0 est utilisable dans des conditions réelles par de vrais salons de coiffure, avant d'ouvrir la plateforme au public.

### Objectifs spécifiques

**Validation fonctionnelle** — Confirmer que les 14 modules fonctionnent de bout en bout dans un contexte métier réel :

- Gestion organisation & salon
- Gestion employés & services
- Horaires & disponibilités
- Rendez-vous (création, modification, annulation)
- Agenda visuel (jour & semaine)
- CRM Clients
- Réservation publique (`/book/[slug]`)
- Notifications email (dépend de la configuration RESEND)
- Dashboard KPI
- Caisse POS (paiements, reçus)
- Gestion stocks & produits
- Fournisseurs & bons de commande
- Abonnements & facturation
- Super Admin SaaS

**Validation de la robustesse** — Confirmer que la plateforme tient sous l'usage quotidien d'un vrai salon (charge légère, données réelles, erreurs utilisateurs).

**Collecte de feedback qualitatif** — Identifier les points de friction UX, les fonctionnalités manquantes critiques, et les bugs non détectés en phase de test interne.

**Validation du modèle économique** — Confirmer que les plans ESSENTIAL / PRO / BUSINESS correspondent aux besoins réels des salons.

### Ce que le pilote n'est PAS

- Un test de charge ou de performance à grande échelle
- Une phase de développement : aucune nouvelle fonctionnalité ne sera développée pendant le pilote
- Une phase de bêta publique : accès uniquement sur invitation

---

## 2. Critères de sélection des salons pilotes

### Critères obligatoires

| Critère | Détail |
|---|---|
| Structure | Salon de coiffure ou institut de beauté existant, en activité |
| Taille | 1 à 5 employés (périmètre MVP cohérent avec les quotas de plan) |
| Équipement | Ordinateur ou tablette avec accès internet + navigateur moderne (Chrome, Firefox, Safari récent) |
| Engagement | Accepte d'utiliser la plateforme activement pendant la durée du pilote |
| Disponibilité | Référent joignable par email/téléphone sous 24h |
| Relation | Salon connu de l'équipe ou référé par un contact de confiance |

### Critères souhaitables

| Critère | Détail |
|---|---|
| Diversité géographique | Idéalement plusieurs villes différentes |
| Diversité de taille | Mix 1 employé / 2–3 employés / 4–5 employés |
| Diversité de maturité digitale | Un salon déjà habitué aux outils numériques + un salon moins digitalisé |
| Utilisation de prestations variées | Coupe, coloration, soins, produits — pour tester les modules stocks et commissions |
| Disponibilité pour feedback | Accepte un entretien de 30 min en fin de pilote |

### Critères d'exclusion

- Salon déjà client d'un concurrent direct (risque de comparaison défavorable avant maturité)
- Salon avec plus de 10 employés (hors périmètre MVP)
- Salon souhaitant uniquement la réservation publique (sans gestion interne)

### Nombre cible

**3 à 5 salons** pour le pilote fermé initial. Ce nombre permet :
- Une diversité suffisante pour détecter les bugs récurrents
- Un suivi individuel qualitatif possible
- Une charge de support gérable par l'équipe interne

---

## 3. Durée recommandée du pilote

### Phase 1 — Pilote fermé : 4 semaines

| Semaine | Objectif |
|---|---|
| Semaine 1 | Onboarding + prise en main + découverte libre |
| Semaine 2 | Utilisation active quotidienne : rendez-vous, agenda, paiements |
| Semaine 3 | Utilisation des modules avancés : stocks, fournisseurs, KPI, commissions |
| Semaine 4 | Bilan individuel + collecte de feedback + entretien de clôture |

### Critères de passage à la bêta publique

- Aucun bug bloquant (CRITICAL / HIGH) non résolu
- Taux de satisfaction pilote ≥ 3/5 sur les modules core
- Confirmation de la configuration RESEND (notifications email opérationnelles)
- Décision de passage prise par Hasan avec validation ChatGPT

### Extension possible

Si des bugs critiques sont découverts en semaine 1–2, le pilote peut être étendu de 2 semaines supplémentaires après correction.

---

## 4. Checklist avant onboarding d'un salon

### Vérification de l'environnement (réalisée une fois, avant le premier salon)

- [ ] Vercel `kalendhair-4-0` : déploiement actif `dpl_9ErGzhzRYvoRvnvHYAVZHYdrfm7C` — statut READY
- [ ] Neon `kalendhair-4-prod` (Frankfurt) : accessible, 44 tables, 13 migrations appliquées
- [ ] Domaines opérationnels :
  - [ ] `pro.kalendhair.fr` → 200 ✓
  - [ ] `admin.kalendhair.fr` → 200 ✓
  - [ ] `www.kalendhair.fr` → 200 ✓
  - [ ] `kalendhair.fr` → 200 ✓
- [ ] Super Admin accessible : `admin.kalendhair.fr/admin/login` → formulaire visible
- [ ] Plans BillingPlan présents en DB : ESSENTIAL / PRO / BUSINESS
- [ ] AdminUser production : `hasan@netzinformatique.fr` — fonctionnel
- [ ] Aucun utilisateur DEV (`owner@test.local`, `admin@kalend.dev`) présent en production
- [ ] Aucune organisation DEV non maîtrisée en production (seule `salon-beaute-test` acceptée si conservée)
- [ ] Cron `/api/cron/reminders` actif — 08:00 UTC quotidien (vérifié dans Vercel Dashboard)

### Vérification pour chaque nouveau salon

- [ ] Contact du référent salon confirmé (nom, email, téléphone)
- [ ] Plan choisi décidé (ESSENTIAL / PRO / BUSINESS / Gratuit)
- [ ] Accord du salon sur les conditions d'utilisation du pilote
- [ ] Email d'accueil préparé avec les identifiants

---

## 5. Checklist onboarding salon

### Étape 1 — Création de l'organisation (Super Admin)

Se connecter sur `admin.kalendhair.fr` avec le compte Super Admin.

- [ ] Aller dans Super Admin → Organisations → Nouvelle organisation
- [ ] Remplir : Nom de l'organisation, slug (ex. `nom-salon`), email du propriétaire
- [ ] Confirmer la création

### Étape 2 — Création du compte Owner

- [ ] Via Super Admin : créer un ProUser de rôle OWNER pour l'organisation
- [ ] Email : email professionnel du gérant du salon
- [ ] Mot de passe temporaire sécurisé (ex. `KalendPilot2026!`) — à changer à la première connexion
- [ ] Lier le ProUser à l'organisation

### Étape 3 — Choix du plan

- [ ] Via Super Admin → Organisation → Facturation
- [ ] Sélectionner le plan décidé (ESSENTIAL / PRO / BUSINESS)
- [ ] Si plan gratuit : activer `isFree = true` via "Accorder plan gratuit"
- [ ] Vérifier que l'abonnement est bien en statut ACTIVE

### Étape 4 — Vérification de l'accès

- [ ] Se connecter sur `pro.kalendhair.fr` avec les identifiants créés
- [ ] Vérifier : hub `/dashboard` visible avec tous les liens disponibles selon le plan
- [ ] Vérifier : fonctionnalités bloquées cohérentes avec le plan (ESSENTIAL bloque KPI, Stocks, Fournisseurs, Caisse)

### Étape 5 — Envoi des identifiants

- [ ] Préparer un email manuel avec :
  - URL de connexion : `https://pro.kalendhair.fr`
  - Email : [email créé]
  - Mot de passe temporaire : [mot de passe créé]
  - URL de réservation publique : `https://www.kalendhair.fr/book/[slug]`
  - Consigne : changer le mot de passe à la première connexion
- [ ] Envoyer l'email de bienvenue manuellement
- [ ] Confirmer réception par le salon

### Étape 6 — Première connexion accompagnée (optionnel)

- [ ] Appel de 15 min pour guider la première connexion
- [ ] Vérification que le salon peut se connecter sans problème
- [ ] Présentation rapide des modules principaux : Salon, Employés, Rendez-vous

---

## 6. Checklist après 24h

À effectuer le lendemain de chaque onboarding.

- [ ] Confirmer que le salon a bien réussi à se connecter (email ou appel)
- [ ] Vérifier dans le Super Admin que l'organisation est active (statut non suspendu)
- [ ] Vérifier dans les logs Vercel qu'il n'y a pas d'erreur 500 liée à cette organisation
- [ ] Vérifier que la configuration du salon est en cours (profil salon rempli, au moins 1 employé créé)
- [ ] Prendre note des premiers retours : problèmes rencontrés, questions, incompréhensions
- [ ] Résoudre ou escalader tout problème bloquant identifié

---

## 7. Checklist après 7 jours

À effectuer 7 jours après chaque onboarding.

### Vérification de l'activité

- [ ] Via Super Admin : vérifier que l'organisation a au moins 1 rendez-vous créé
- [ ] Via Super Admin : vérifier que l'abonnement est toujours ACTIVE
- [ ] Vérifier les logs Vercel pour erreurs récurrentes liées à ce salon

### Feedback intermédiaire

- [ ] Envoyer un email de suivi : "Comment se passe la prise en main ?"
- [ ] Recueillir : modules utilisés, modules non utilisés, points de blocage, questions
- [ ] Documenter dans le tableau de suivi (section 17)

### Ajustements

- [ ] Si le salon utilise uniquement 2–3 modules : comprendre pourquoi les autres sont non utilisés
- [ ] Si le salon rencontre un bug : créer un ticket et communiquer le délai de correction
- [ ] Si le plan choisi ne correspond pas aux besoins : proposer un changement de plan via Super Admin

---

## 8. Checklist fin de pilote

### Pour chaque salon (semaine 4)

- [ ] Entretien de clôture (30 min) : feedback complet sur chaque module utilisé
- [ ] Recueillir la note globale de satisfaction (1 à 5)
- [ ] Identifier les 3 fonctionnalités manquantes les plus critiques
- [ ] Décision : salon garder comme client bêta publique ? Oui / Non / À décider

### Bilan global

- [ ] Consolider les feedbacks de tous les salons pilotes
- [ ] Lister tous les bugs remontés avec leur statut (résolu / ouvert / accepté)
- [ ] Calculer les métriques clés (voir section 14)
- [ ] Rédiger le rapport de fin de pilote
- [ ] Présenter le rapport à Hasan + ChatGPT
- [ ] Décision go/no-go bêta publique

### Actions post-pilote

- [ ] Résoudre les bugs critiques avant bêta publique
- [ ] Configurer RESEND (notifications email) avant bêta publique
- [ ] Passer sur Vercel Pro si la couverture cron est insuffisante (voir section 16)
- [ ] Définir Sprint 21 avec ChatGPT

---

## 9. Procédure de rollback

> **ATTENTION** : Les actions de rollback affectent tous les salons pilotes simultanément.
> Ne jamais rollback sans validation de Hasan.

### Déclencheur

Rollback uniquement si :
- Bug critique (données corrompues, impossibilité de se connecter, fuite de données)
- Régression majeure introduite par un déploiement accidentel

### Procédure

**Étape 1 — Identifier le commit stable**

```bash
git log --oneline -10
# Identifier le SHA du dernier déploiement stable connu
# SHA actuel de référence : 3ad8143 (HEAD de main après PR #48)
```

**Étape 2 — Déclencher le rollback Vercel**

Via le dashboard Vercel `kalendhair-4-0` :
- Aller dans "Deployments"
- Identifier le déploiement stable précédent
- Cliquer "Promote to Production"

OU via Vercel CLI :
```bash
vercel rollback [deployment-id] --scope [team]
```

**Étape 3 — Vérifier le rollback**

- [ ] `https://pro.kalendhair.fr` → 200
- [ ] `https://admin.kalendhair.fr` → 200
- [ ] Se connecter en Super Admin → vérifier les organisations pilotes

**Étape 4 — Communiquer**

- [ ] Informer les salons pilotes par email de l'interruption et de la résolution
- [ ] Documenter l'incident (date, cause, durée, impact)

### Ce que le rollback NE fait PAS

- Le rollback Vercel ne touche pas la base de données Neon
- Les données créées pendant la période de bug sont conservées
- Si des données sont corrompues, contacter Hasan avant toute action sur Neon

---

## 10. Procédure incident production

### Niveaux de sévérité

| Niveau | Définition | Délai de réponse |
|---|---|---|
| CRITICAL | Impossibilité totale de se connecter / données corrompues / fuite de données | < 1h |
| HIGH | Module clé inutilisable (rendez-vous, paiements) | < 4h |
| MEDIUM | Module secondaire défaillant ou comportement inattendu | < 24h |
| LOW | Bug mineur, problème cosmétique, question UX | < 72h |

### Procédure générale

**1. Détection**

Sources possibles :
- Signalement salon pilote (email / appel)
- Alerte Vercel (logs 500, build failure)
- Vérification manuelle lors des checklists 24h / 7j

**2. Qualification**

- Reproduire le bug sur `pro.kalendhair.fr`
- Identifier le niveau de sévérité
- Vérifier si d'autres salons sont affectés

**3. Communication immédiate (CRITICAL et HIGH)**

- Informer Hasan par le canal habituel
- Si les salons pilotes sont bloqués : les contacter par email dans l'heure

**4. Investigation**

```bash
# Vérifier les logs Vercel en temps réel
vercel logs --follow

# Vérifier l'état de la DB Neon
# Via le dashboard Neon : projet round-dawn-81306391
```

**5. Correction**

- Créer une branche `fix/[description]`
- Appliquer le correctif
- Tester localement
- Push + création PR
- Validation Hasan + ChatGPT si temps disponible (CRITICAL : procédure accélérée possible)
- Merge + déploiement automatique Vercel

**6. Vérification post-correction**

- [ ] Routes clés testées : `/`, `/login`, `/admin/login`, `/dashboard`, `/book/[slug]`
- [ ] Le bug n'est plus reproductible
- [ ] Les données des salons pilotes sont intactes

**7. Post-mortem**

Pour tout incident CRITICAL ou HIGH : documenter dans `docs/SESSION_LOG.md` :
- Date et heure de détection
- Cause racine
- Durée de l'incident
- Salons affectés
- Correctif appliqué
- Actions préventives

---

## 11. Procédure support

### Canal de support

Pendant le pilote fermé, le support est assuré **exclusivement par Hasan** via :
- Email direct (réponse sous 24h en semaine)
- Appel téléphonique pour les incidents CRITICAL / HIGH

Pas de système de tickets automatisé pendant le pilote. Toutes les demandes sont consignées manuellement dans le tableau de suivi (section 17).

### Processus de traitement d'une demande

**1. Réception de la demande**

- Enregistrer dans le tableau de suivi : salon, date, description, module concerné
- Qualifier : bug / question fonctionnelle / demande d'évolution

**2. Question fonctionnelle**

- Répondre par email avec la procédure à suivre
- Si la question révèle un problème UX récurrent : noter pour amélioration future

**3. Bug**

- Reproduire le bug
- Qualifier le niveau (voir section 10)
- Appliquer la procédure incident si CRITICAL / HIGH
- Pour MEDIUM / LOW : noter dans le backlog, corriger lors du prochain cycle

**4. Demande d'évolution**

- Remercier le salon
- Expliquer que la phase pilote n'inclut pas de nouvelles fonctionnalités
- Noter la demande pour le sprint 21 (après pilote fermé)

### Réponses type

**Accès oublié / mot de passe perdu :**
> Aucun système de reset automatique n'est disponible pendant le pilote.
> Hasan réinitialise manuellement le mot de passe via le Super Admin.

**Module non accessible (bloqué par plan) :**
> Selon le plan choisi, certains modules (KPI, Stocks, Fournisseurs, Caisse) sont réservés aux plans PRO et BUSINESS.
> Contacter Hasan pour discuter d'un changement de plan si nécessaire.

**Notifications email non reçues :**
> Les notifications email ne sont pas encore configurées pendant le pilote fermé.
> Les prises de rendez-vous et les rappels sont disponibles mais les emails ne sont pas envoyés.
> Cette fonctionnalité sera activée avant la bêta publique.

**Réservation publique non visible :**
> L'URL de réservation publique est `https://www.kalendhair.fr/book/[votre-slug]`.
> Vérifier que le salon est bien configuré comme actif dans les paramètres.

---

## 12. Contacts internes

| Rôle | Nom | Contact | Périmètre |
|---|---|---|---|
| Décideur produit | Hasan Biçer | hasan@netzinformatique.fr | Toutes décisions, support pilote, incidents |
| Super Admin production | Hasan Biçer | `admin.kalendhair.fr` — `hasan@netzinformatique.fr` | Création orgs, gestion plans, impersonation |
| Architecte / CTO | ChatGPT | Via Hasan | Review technique, validation PR, décisions architecture |
| Exécutant technique | Claude Code | Via session Claude Code | Développement, correction bugs, documentation |

### Accès production

| Système | Accès | Contact si problème |
|---|---|---|
| Vercel `kalendhair-4-0` | Dashboard Vercel — compte Hasan | Hasan |
| Neon `kalendhair-4-prod` | Dashboard Neon — compte Hasan | Hasan — ne jamais modifier sans validation |
| Domaines IONOS | Dashboard IONOS — compte Hasan | Hasan — ne jamais modifier les DNS |
| Super Admin app | `admin.kalendhair.fr` — `hasan@netzinformatique.fr` | Hasan |

---

## 13. Données à collecter

### Pour chaque salon (durant le pilote)

**Données d'usage**

- Nombre de rendez-vous créés par semaine
- Modules utilisés (liste des URLs visitées si accessible via logs)
- Nombre d'erreurs rencontrées signalées
- Nombre de sessions par semaine (connexions)

**Données de satisfaction (collectées à J+7 et en fin de pilote)**

- Note globale (1 à 5) : "Êtes-vous satisfait de KalendHair ?"
- Note par module principal (1 à 5 ou N/A si non utilisé) :
  - Prise de rendez-vous
  - Agenda
  - Gestion clients
  - Caisse / paiements
  - Interface globale
- Verbatim : "Qu'est-ce qui vous a le plus freiné ?"
- Verbatim : "Quelle fonctionnalité vous manque le plus ?"
- Question : "Recommanderiez-vous KalendHair à un confrère ?" (Oui / Non / Peut-être)

**Données incidents**

- Bugs remontés : description, module, fréquence, gravité perçue
- Temps de résolution
- Impact sur l'activité du salon

### Données à ne PAS collecter

- Données personnelles des clients des salons (RGPD — données appartenant aux salons)
- Identifiants de connexion des utilisateurs pilotes
- Données financières des salons (contenu des paiements)

---

## 14. Métriques à suivre

### Métriques de santé de la plateforme

| Métrique | Cible | Source |
|---|---|---|
| Disponibilité | ≥ 99% sur la durée du pilote | Vercel Dashboard |
| Erreurs 500 | < 5 par semaine | Vercel Runtime Logs |
| Bugs CRITICAL ouverts | 0 en fin de pilote | Tableau de suivi |
| Bugs HIGH ouverts | 0 en fin de pilote | Tableau de suivi |
| Déploiements réussis | 100% | Vercel Deployments |

### Métriques d'adoption

| Métrique | Cible | Comment mesurer |
|---|---|---|
| Salons actifs (≥1 connexion/semaine) | 100% des salons pilotes | Super Admin — dernière connexion |
| Salons ayant créé ≥5 RDV | ≥ 80% | Super Admin / DB query |
| Modules utilisés par salon | ≥ 4 modules core | Feedback qualitatif |
| Taux de complétion onboarding | 100% | Checklist section 5 |

### Métriques de qualité

| Métrique | Cible | Comment mesurer |
|---|---|---|
| Satisfaction globale moyenne | ≥ 3.5 / 5 | Enquête J+7 + fin pilote |
| NPS pilote (recommandation) | ≥ 50% "Oui" | Enquête fin pilote |
| Bugs remontés par salon | < 5 MEDIUM/LOW, 0 HIGH/CRITICAL | Tableau de suivi |
| Délai moyen résolution bug HIGH | < 48h | Tableau de suivi |

### Métriques business (indicatives)

| Métrique | Observation | Cible bêta publique |
|---|---|---|
| Plans choisis par les salons pilotes | À observer | — |
| Fonctionnalités les plus utilisées | À observer | — |
| Fonctionnalités jamais utilisées | À observer | Priorisation Sprint 21 |
| Demandes d'évolution les plus fréquentes | À observer | Priorisation Sprint 21 |

---

## 15. Processus d'onboarding manuel

> Le pilote fermé ne dispose d'aucun système d'inscription automatique (pas de `/register`).
> Toute création de compte est effectuée manuellement par Hasan via le Super Admin.

### Flux complet

```
1. Hasan contacte le salon sélectionné
   → Confirmation de participation au pilote
   → Choix du plan

2. Hasan se connecte sur admin.kalendhair.fr
   → Crée l'organisation (nom, slug, email owner)
   → Crée le ProUser OWNER avec mot de passe temporaire
   → Assigne le plan (ou active isFree si plan gratuit décidé)

3. Hasan vérifie l'accès
   → Se connecte sur pro.kalendhair.fr avec les identifiants créés
   → Confirme que le hub /dashboard est visible et conforme au plan choisi
   → Déconnexion

4. Hasan envoie les identifiants manuellement
   → Email avec URL, email, mot de passe temporaire, URL /book/[slug]
   → Instruction de changer le mot de passe à la première connexion

5. Suivi J+1 (voir checklist section 6)
```

### Gestion des cas particuliers

**Remise commerciale**

Via Super Admin → Organisation → Facturation → Créer une remise :
- Type : PERCENTAGE ou FIXED_AMOUNT
- Durée : à définir selon l'accord avec le salon
- Raison : "Remise pilote fermé"

**Plan gratuit (sans facturation)**

Via Super Admin → Organisation → Facturation → "Accorder plan gratuit" :
- Activer `isFree = true`
- Le salon accède au plan PRO sans facturation
- Raison à documenter : "Salon pilote — accès gratuit pendant la phase pilote"

**Réinitialisation de mot de passe**

En l'absence de fonctionnalité self-service :
- Via Super Admin → Organisation → Impersonation
- Ou via Prisma Studio sur Neon (accès Hasan uniquement) pour un bcrypt update
- ⚠️ Ne jamais afficher ni transmettre de hash bcrypt

**Suspension / arrêt anticipé**

Via Super Admin → Organisation → Suspendre :
- Raison : "Fin anticipée de participation au pilote"
- L'organisation reste visible dans le Super Admin (ne jamais supprimer)

---

## 16. Configuration RESEND (en attente)

> **STATUT ACTUEL : NON CONFIGURÉ**
>
> RESEND n'est pas configuré en production pendant le pilote fermé.
> `getResendClient()` retourne `null` → les notifications sont journalisées en statut FAILED.
> Ce comportement est documenté (WARN-03 de la phase Go Live Readiness) et accepté pour le pilote.
> Les fonctionnalités métier ne sont pas affectées.

### Impact pendant le pilote

- Les emails de confirmation de rendez-vous ne sont **pas envoyés**
- Les emails d'annulation de rendez-vous ne sont **pas envoyés**
- Les rappels de rendez-vous (cron 08:00 UTC) ne sont **pas envoyés**
- La réservation publique, la gestion des rendez-vous et tous les autres modules fonctionnent normalement
- Les salons pilotes doivent être informés de cette limitation

### Procédure de configuration (à activer UNIQUEMENT sur validation explicite de Hasan)

> ⚠️ Ne pas configurer RESEND sans validation explicite de Hasan.

Quand Hasan décide d'activer RESEND :

**Étape 1 — Créer un compte RESEND**

- S'inscrire sur [resend.com](https://resend.com)
- Créer un API Key pour le domaine `kalendhair.fr`

**Étape 2 — Configurer les variables Vercel**

Via le dashboard Vercel → Projet `kalendhair-4-0` → Settings → Environment Variables :
```
RESEND_API_KEY    = re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL = noreply@kalendhair.fr
RESEND_FROM_NAME  = KalendHair
```
> Ne jamais copier ces valeurs depuis un autre projet sans validation.

**Étape 3 — Configurer le DNS IONOS**

> ⚠️ Ne modifier aucun DNS IONOS sans validation Hasan.

Les enregistrements suivants doivent être ajoutés sur `kalendhair.fr` :
- **SPF** : `TXT @ "v=spf1 include:amazonses.com ~all"` (ou selon les instructions RESEND)
- **DKIM** : entrée CNAME fournie par RESEND
- **DMARC** : `TXT _dmarc "v=DMARC1; p=none; rua=mailto:dmarc@kalendhair.fr"`

Hasan valide et applique ces modifications dans le dashboard IONOS.

**Étape 4 — Vérifier dans RESEND**

- Confirmer que le domaine est vérifié dans le dashboard RESEND
- Envoyer un email de test

**Étape 5 — Redéployer sur Vercel**

Le redéploiement est automatique après ajout des variables d'environnement.
Vérifier dans les logs Vercel que `getResendClient()` ne retourne plus `null`.

**Étape 6 — Tester**

- Créer un rendez-vous de test → vérifier réception de l'email de confirmation
- Annuler le rendez-vous → vérifier réception de l'email d'annulation
- Attendre le cron 08:00 UTC pour les rappels (ou tester manuellement)

### Note sur le cron de rappels

Le cron `/api/cron/reminders` tourne à **08:00 UTC (10:00 Paris CEST)** chaque jour.
La fenêtre de rappel couvre les rendez-vous entre **06:00 UTC et 10:00 UTC le lendemain** (08:00–12:00 Paris CEST).

Les rendez-vous hors de cette plage ne reçoivent pas de rappel avec le plan Hobby Vercel.

**Avant la bêta publique**, envisager :
- Passer sur Vercel Pro (permet plusieurs crons par jour)
- Ou adapter la logique de fenêtre dans `reminder.service.ts`

---

## 17. Template de suivi pilote

### Tableau de suivi — Salons pilotes

| ID | Salon | Contact | Ville | Plan | Date d'entrée | Statut |
|---|---|---|---|---|---|---|
| P01 | [Nom du salon] | [Nom + email + tél] | [Ville] | ESSENTIAL / PRO / BUSINESS / Gratuit | JJ/MM/AAAA | En cours / Terminé / Abandonné |
| P02 | | | | | | |
| P03 | | | | | | |
| P04 | | | | | | |
| P05 | | | | | | |

### Suivi par salon

Pour chaque salon, maintenir une fiche avec :

```
--- Salon P01 : [Nom du salon] ---

ONBOARDING
- Date onboarding : JJ/MM/AAAA
- Plan choisi : [plan]
- Modules activés : tous / restreints (ESSENTIAL)
- Premier accès confirmé : Oui / Non

MODULES TESTÉS
- Rendez-vous       : ✅ / ❌ / 🔄 En cours
- Agenda            : ✅ / ❌ / 🔄
- Clients           : ✅ / ❌ / 🔄
- Réservation pub.  : ✅ / ❌ / 🔄
- Paiements         : ✅ / ❌ / 🔄
- KPI               : ✅ / ❌ / 🔄
- Stocks            : ✅ / ❌ / 🔄
- Fournisseurs      : ✅ / ❌ / 🔄
- Commissions       : ✅ / ❌ / 🔄

PROBLÈMES / INCIDENTS
| Date | Description | Module | Sévérité | Statut |
|---|---|---|---|---|
| | | | | |

FEEDBACK J+7
- Note globale :  /5
- Commentaire :

FEEDBACK FIN DE PILOTE
- Note globale :  /5
- NPS : Oui / Non / Peut-être
- Top 3 fonctionnalités manquantes :
  1.
  2.
  3.
- Verbatim :

DÉCISION
- Passage en bêta publique : Oui / Non / À décider
- Notes :
```

### Tableau des incidents

| Date | Salon | Description | Module | Sévérité | Statut | Résolution | Délai |
|---|---|---|---|---|---|---|---|
| | | | | CRITICAL/HIGH/MEDIUM/LOW | Ouvert/Résolu/Accepté | | |

---

## 18. État de l'environnement de production

> Photographié au 2026-06-25. À vérifier avant chaque onboarding.

### Vercel

| Élément | Valeur |
|---|---|
| Projet | `kalendhair-4-0` |
| Déploiement actif | `dpl_9ErGzhzRYvoRvnvHYAVZHYdrfm7C` |
| SHA | `3ad8143` |
| Plan | Hobby |
| Build command | `prisma generate && next build` |
| Cron | `/api/cron/reminders` — `0 8 * * *` (08:00 UTC quotidien) |

### Neon

| Élément | Valeur |
|---|---|
| Projet | `round-dawn-81306391` |
| Nom | `kalendhair-4-prod` |
| Région | Frankfurt (`aws-eu-central-1`) |
| Tables | 44 tables + 24 enums |
| Migrations appliquées | 13 (dont `20260624000001` à `20260624000009`) |
| BillingPlan | ESSENTIAL / PRO / BUSINESS (upsert idempotent, 0 donnée DEV) |

### Comptes production

| Compte | Email | Rôle |
|---|---|---|
| Super Admin | `hasan@netzinformatique.fr` | AdminUser production |

### Domaines

| Domaine | Statut | Pointe vers |
|---|---|---|
| `pro.kalendhair.fr` | ✅ Actif | `kalendhair-4-0` |
| `admin.kalendhair.fr` | ✅ Actif | `kalendhair-4-0` |
| `www.kalendhair.fr` | ✅ Actif | `kalendhair-4-0` |
| `kalendhair.fr` | ✅ Actif | `kalendhair-4-0` |

### Données test

| Organisation | Slug | Décision |
|---|---|---|
| Salon Beauté Parisienne | `salon-beaute-test` | ⚠️ Conserver — ne pas supprimer sans validation Hasan |

> La donnée `salon-beaute-test` a été créée via `scripts/create-go-live-test-data.ts` pour la phase Go Live Readiness.
> Elle est isolée (slug distinct, email `@test.kalendhair.fr`), ne perturbe pas les salons pilotes, et peut servir de base de référence pour les tests internes.
> Si suppression nécessaire : `DELETE FROM organizations WHERE slug = 'salon-beaute-test';` — uniquement sur validation explicite de Hasan.

### Variables d'environnement production (état)

| Variable | État |
|---|---|
| `DATABASE_URL` | ✅ Configuré (Neon prod) |
| `JWT_SECRET` | ✅ Configuré |
| `CRON_SECRET` | ✅ Configuré (Vercel injecte automatiquement) |
| `RESEND_API_KEY` | ❌ Non configuré — notifications email désactivées |
| `RESEND_FROM_EMAIL` | ❌ Non configuré |
| `RESEND_FROM_NAME` | ❌ Non configuré |

> Ne jamais afficher DATABASE_URL, JWT_SECRET, CRON_SECRET ou tout hash bcrypt.

---

_Créé le 2026-06-25 — Phase Pilote Fermé KalendHair 4.0. Auteur : Claude Sonnet 4.6._
