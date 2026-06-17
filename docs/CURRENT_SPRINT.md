# CURRENT_SPRINT — Sprint en cours (KalendHair 4.0)

> À lire **avant d'agir**. Claude ne travaille que sur ce qui est dans ce sprint.

---

## Sprint actuel

**Sprint 4 — Authentification ProUser (OWNER)** — auth custom `jose`.

## Objectifs du sprint

- [x] Branche `feature/sprint4-auth` créée.
- [x] Dépendances installées : `jose@6.2.3` · `bcryptjs@3.0.3` · `tsx@4.22.4`.
- [x] `JWT_SECRET` ajouté à `.env` et `.env.example`.
- [x] `src/features/auth/types.ts` — `SessionUser { id, organizationId, role }`.
- [x] `src/features/auth/password.utils.ts` — `hashPassword()` / `verifyPassword()`.
- [x] `src/features/auth/session.utils.ts` — `signToken()` / `verifyToken()` via jose.
- [x] `src/features/auth/auth.service.ts` — `validateCredentials()` OWNER uniquement.
- [x] `src/lib/auth/session.ts` — `getSession()` / `requireSession()` / `getCurrentUser()`.
- [x] `src/lib/auth/permissions.ts` — placeholder commenté (Sprint 5+).
- [x] `src/app/api/auth/logout/route.ts` — POST → supprime cookie → redirect `/login`.
- [x] `src/app/(auth)/layout.tsx` — redirect `/dashboard` si session présente.
- [x] `src/app/(auth)/login/actions.ts` — Server Action `login()`.
- [x] `src/app/(auth)/login/page.tsx` — formulaire email/password avec `useActionState`.
- [x] `src/app/(dashboard)/layout.tsx` — `requireSession()` + `force-dynamic`.
- [x] `src/app/(dashboard)/page.tsx` — placeholder "Connecté · Organisation".
- [x] `src/proxy.ts` — protection `/dashboard/:path*` (convention Next.js 16).
- [x] `prisma/seed.ts` — Organisation "Salon Test" + ProUser `owner@test.local / Test1234!`.
- [x] `package.json` — script `db:seed` + config `prisma.seed`.
- [x] `pnpm typecheck` ✅
- [x] `pnpm lint` ✅
- [x] `pnpm build` ✅
- [x] `pnpm db:seed` ✅ — ProUser OWNER confirmé en base.
- [ ] Validation ChatGPT + merge PR vers `main`. Tag `v0.5.0-auth`.

## Décisions techniques Sprint 4

| Décision | Valeur |
|---|---|
| Librairie JWT | `jose@6.2.3` (no next-auth) |
| Hachage | `bcryptjs@3.0.3` (pure JS) |
| Session | Cookie `HttpOnly`, `sameSite: lax`, `maxAge: 86400` |
| Expiration JWT | 24 heures |
| Payload JWT | `sub` + `organizationId` + `role` (sans email) |
| Rôle | OWNER uniquement (MANAGER/EMPLOYEE Sprint 5+) |
| Proxy | `src/proxy.ts` (convention Next.js 16, matcher `/dashboard/:path*`) |
| Seed | `owner@test.local / Test1234!` — DEV uniquement |

## Hors périmètre de ce sprint

- Inscription publique.
- Reset de mot de passe.
- OAuth / SSO.
- Rôles MANAGER et EMPLOYEE.
- Permissions fines (placeholder uniquement).
- Dashboard métier, pages salon/RDV/services.

## Condition de sortie du sprint

> PR `feature/sprint4-auth` validée par ChatGPT, mergée dans `main`, tag `v0.5.0-auth`.

---

## Sprints précédents (clôturés)

- **Phase 0 — Fondation documentaire** ✅ — tag `v0.1.0-foundations`.
- **Sprint 1 — Bootstrap technique** ✅ — tag `v0.2.0-bootstrap`.
- **Sprint 2 — Schéma Prisma** ✅ — tag `v0.3.0-prisma-schema`.
- **Sprint 3 — Migration PostgreSQL** ✅ — tag `v0.4.0-db-migration`.

---

_Dernière mise à jour : 2026-06-17._
