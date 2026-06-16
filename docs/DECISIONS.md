# DECISIONS — Journal des décisions (KalendHair 4.0)

Journal chronologique des décisions techniques et produit. À lire **avant toute décision technique**.

> Format : chaque décision est datée et stable. On n'efface pas une décision, on en ajoute
> une nouvelle qui la révise si besoin.

---

## 2026-06-16 — Décisions fondatrices

- **D-001** — Le nouveau projet s'appelle **KalendHair 4.0**.
- **D-002** — Le repo officiel est **https://github.com/BOZYILDIZ/KalendHair-4.0**.
- **D-003** — L'ancien **kalendhair.fr est la production** et **ne doit pas être touché**.
  KalendHair 4.0 est un projet **isolé**, nouveau départ complet.
- **D-004** — Le **MVP ne contient pas d'IA**.
- **D-005** — Le **MVP ne contient pas Stripe** (architecture prévue seulement, Phase 8).
- **D-006** — Le **MVP ne contient pas de connecteurs actifs**.
- **D-007** — Les **connecteurs sont prévus par architecture** mais **développés plus tard** (Phase 7+).
- **D-008** — **Chaque salon utilise ses propres clés API** pour les connecteurs.
  KalendHair ne fournit pas de clés par défaut. (voir `docs/INTEGRATIONS.md`)
- **D-009** — L'architecture est **multi-tenant dès le départ** : Organization → Salon → (Employees, Services, Appointments, Clients).
- **D-010** — Stack imposée : **Next.js + TypeScript + PostgreSQL + Prisma** (+ Tailwind CSS).
- **D-011** — Organisation du code **par modules / features** pour éviter le spaghetti code.
- **D-012** — Ne **jamais utiliser une base de données de production**.
- **D-013** — Le développement de code ne démarre **qu'après validation de la documentation** par Hasan et ChatGPT.
