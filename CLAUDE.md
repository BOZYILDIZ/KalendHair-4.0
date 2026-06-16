# CLAUDE.md — Règles permanentes pour Claude Code

> Ce fichier définit les règles **non négociables** que Claude Code doit respecter
> sur le projet **KalendHair 4.0**. Il doit être lu au début de chaque session.

---

## 🔴 Rituel de démarrage (obligatoire à chaque session)

Avant toute action, Claude doit lire dans cet ordre :

1. `docs/PROJECT_STATE.md` — où en est le projet maintenant.
2. `docs/CURRENT_SPRINT.md` — ce qui doit être fait dans le sprint en cours.
3. `docs/DECISIONS.md` — avant toute décision technique.

Si une demande contredit ces fichiers, Claude doit **le signaler** avant d'agir.

---

## 🟢 Méthode de travail

- **Toujours proposer un plan avant toute modification.**
- Ne **jamais** modifier l'ensemble du projet sans plan validé.
- Modifier **uniquement** les fichiers strictement nécessaires.
- Travailler **feature par feature** (un domaine métier à la fois).
- Une fonctionnalité = une branche Git dédiée (voir `docs/WORKFLOW.md`).
- `main` doit toujours rester propre.

---

## 🟡 Fin de session (obligatoire)

À la fin de chaque intervention, Claude doit :

- Mettre à jour `docs/PROJECT_STATE.md` (nouvel état du projet).
- Ajouter une entrée dans `docs/SESSION_LOG.md` (date + ce qui a été fait).
- Mettre à jour `docs/CURRENT_SPRINT.md` si un objectif est terminé.

---

## 🔁 Règle Git officielle (fin de chaque tâche validée)

À la fin de chaque tâche, Claude doit appliquer cette procédure **dans l'ordre** :

1. **Mettre à jour la documentation** :
   - `docs/PROJECT_STATE.md`
   - `docs/SESSION_LOG.md`
   - `docs/CURRENT_SPRINT.md` (si nécessaire)
2. **Exécuter les vérifications du projet** (build / lint / tests selon ce qui existe).
3. **Créer un commit** avec un message clair.
4. **Push** sur la branche courante.
5. **Afficher** :
   - les fichiers modifiés
   - le commit créé
   - la branche concernée
6. **Ne jamais merger automatiquement sur `main`.**
7. **Ne jamais supprimer une branche sans validation explicite.**
8. **Après le push**, considérer la tâche comme **terminée** et **attendre la validation**.

### Workflow officiel

```
Hasan
  ↓
ChatGPT prépare la mission
  ↓
Claude Code exécute
  ↓
Commit + Push
  ↓
ChatGPT review
  ↓
Validation
  ↓
Merge vers main
```

> Le merge vers `main` n'est jamais fait par Claude automatiquement : il intervient
> **uniquement après validation**. Voir `docs/WORKFLOW.md`.

---

## ⛔ Interdictions absolues

- Ne **jamais** toucher à `kalendhair.fr` (production actuelle).
- Ne **jamais** modifier l'ancien projet KalendHair.
- Ne **jamais** utiliser une base de données de production.
- Ne **jamais** réutiliser du code sans vérifier qu'il est propre.
- Ne **jamais** coder une fonctionnalité métier avant que l'architecture soit validée.

---

## 🚫 Hors périmètre du MVP (architecture seulement, pas de code)

- **Pas d'IA** dans le MVP.
- **Pas de Stripe** dans le MVP → prévoir uniquement l'architecture.
- **Pas de connecteurs actifs** dans le MVP → prévoir uniquement l'architecture.
- Pas de SMS / WhatsApp / facturation / fidélité / caisse (POS) dans le MVP.

---

## 🧱 Principes d'architecture

- Architecture **multi-tenant dès le départ** : Organization → Salon → (Employees, Services, Appointments, Clients).
- Organisation **par modules / features** pour éviter le spaghetti code.
- Séparation stricte : **UI** / **logique métier (services)** / **accès DB**.
- Validations centralisées (`lib/validations`).
- Permissions centralisées (`lib/permissions`).
- Code **testable** par module.

Détails complets dans `docs/ARCHITECTURE.md`.

---

## 📌 Stack imposée

- Next.js + TypeScript
- PostgreSQL + Prisma
- Tailwind CSS

---

## 👥 Rôles

- **Hasan** = décideur produit.
- **ChatGPT** = architecte / CTO / reviewer.
- **Claude Code** = exécutant technique.

Voir `docs/WORKFLOW.md`.
