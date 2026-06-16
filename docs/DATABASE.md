# DATABASE — KalendHair 4.0

Base cible : **PostgreSQL** via **Prisma**.

> Ce document décrit le **modèle conceptuel cible**. Aucun `schema.prisma` n'est encore
> implémenté (Phase 0). L'implémentation se fera en Phase 1+ après validation.

---

## Principes

- **Multi-tenant** : tout est rattaché à une `Organization` puis à un `Salon`.
- Les **clés API des connecteurs ne sont jamais stockées en clair** (chiffrées).
- Les **index critiques** sont prévus dès le départ (voir plus bas).

---

## Entités principales

### Organization
Tenant racine (le compte professionnel). Peut posséder plusieurs salons (à terme).

### ProUser
Utilisateur professionnel (gérant, employé avec accès). Rattaché à une organization.

### Subscription *(prévu, inactif dans le MVP)*
Abonnement SaaS de l'organization. Prévu pour la Phase 8 (Stripe). Pas actif au MVP.

### Salon
Établissement physique. Appartient à une organization. Possède un `slug` public.

### Client
Client final (peut réserver). Compte basique au MVP. Peut être invité (guest).

### Employee
Employé d'un salon. Réalise des services, possède ses propres horaires.

### Service
Prestation proposée par un salon (durée, prix). Activable / désactivable.

### EmployeeService
Table de liaison : quels services un employé peut réaliser.

### SalonSchedule
Horaires d'ouverture du salon (par jour de semaine).

### EmployeeSchedule
Horaires de travail propres à chaque employé.

### ClosedDay
Jours de fermeture (exceptionnels ou récurrents) d'un salon.

### Appointment
Rendez-vous : salon, employé, client, service(s), date/heure, statut.

### AppointmentModification
Historique des modifications d'un rendez-vous (audit métier).

### Review
Avis client sur un salon / un rendez-vous.

### SalonClient
Liaison client ↔ salon (un client peut être lié à plusieurs salons).

### Notification
Notification envoyée (email au MVP) avec son état.

### NotificationPreference
Préférences de notification par utilisateur / salon.

### IntegrationConnection
Connexion à un service externe, **par organization / par salon**, avec credentials chiffrés.
Voir `docs/INTEGRATIONS.md`.

### AuditLog
Journal des actions sensibles (sécurité, traçabilité multi-tenant).

### FeatureFlag
Activation/désactivation de fonctionnalités (par organization / salon).

### FrenchCity
Référentiel des villes françaises (slug, code département) pour la recherche et le SEO local.

---

## Index critiques (à créer dès le départ)

| Table | Index |
|---|---|
| appointments | `(salonId, appointmentDate)` |
| appointments | `(employeeId, appointmentDate)` |
| appointments | `(clientId)` |
| services | `(salonId, isActive)` |
| employees | `(salonId, isActive)` |
| salon_clients | `(salonId, clientId)` |
| reviews | `(salonId)` |
| salons | `(slug)` |
| salons | `(citySlug)` |
| salons | `(departmentCode)` |
| integration_connections | `(organizationId, provider)` |

---

## Règles de modélisation

- Chaque table métier porte un `organizationId` et/ou `salonId` pour le tenant scoping.
- Les credentials d'intégration → champ `encryptedCredentials` (jamais en clair).
- Les dates importantes (`createdAt`, `updatedAt`) sur toutes les entités.
- Suppression : privilégier le soft-delete / désactivation (`isActive`) là où c'est pertinent.
