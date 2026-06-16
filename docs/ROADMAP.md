# ROADMAP — KalendHair 4.0

Découpage du projet en phases. Une phase n'est démarrée qu'après validation de la précédente.

---

## Phase 0 — Fondations (en cours)

- Documentation
- Architecture
- Workflow Claude
- Base propre (repo, conventions, règles)

**Aucun code métier.**

---

## Phase 1 — Initialisation technique

- Next.js + TypeScript
- Prisma + PostgreSQL
- Tailwind CSS
- Structure modulaire `src/` (features, lib, etc.)

---

## Phase 2 — Auth + Organizations + Salons

- Authentification pro
- Création d'organization
- Création de salon
- Multi-tenant opérationnel

---

## Phase 3 — Employés + Services + Horaires

- Gestion des employés
- Gestion des services
- Liaison employés ↔ services
- Horaires d'ouverture du salon
- Horaires par employé
- Jours de fermeture

---

## Phase 4 — Réservation + Calendrier

- Page publique de réservation
- Prise de rendez-vous client / invité
- Calendrier pro simple
- Comptes clients basiques

---

## Phase 5 — Dashboard + Statistiques simples

- Dashboard salon
- Statistiques de base (RDV, activité)

---

## Phase 6 — Notifications email

- Confirmations / rappels par email
- Préférences de notification

---

## Phase 7 — Intégrations (prévues, non prioritaires)

- Architecture des connecteurs (voir `docs/INTEGRATIONS.md`)
- Connexions par salon, avec clés propres au salon
- Développement progressif selon la demande

---

## Phase 8 — Paiement & SaaS

- Stripe
- Abonnements
- Plans SaaS
