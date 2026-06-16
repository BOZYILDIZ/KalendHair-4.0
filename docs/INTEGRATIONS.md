# INTEGRATIONS — KalendHair 4.0

> Statut : **architecture seulement**. Aucun connecteur n'est développé dans le MVP.
> Ce document définit la vision et les contraintes pour la Phase 7+.

---

## Principe fondamental : clés par salon

> **Les connecteurs ne doivent JAMAIS utiliser les clés API de KalendHair par défaut.**

Chaque **salon** renseigne ses **propres** clés / API / tokens. KalendHair fournit la
mécanique de connexion, pas les accès.

Conséquences :

- Pas de quota global KalendHair consommé par les salons.
- Chaque salon est responsable de ses propres accès et facturation côté fournisseur.
- Isolation multi-tenant : les credentials d'un salon ne sont jamais partagés.

---

## Deux types d'intégration

1. **API Key** — le salon colle sa clé (ex : Brevo, WhatsApp Business token).
2. **OAuth** — le salon autorise KalendHair via le flux OAuth du fournisseur (ex : Google Calendar, Outlook).

---

## Connecteurs visés

| Provider | Type | Notes |
|---|---|---|
| WhatsApp Business | API Key / token | Le salon renseigne ses propres accès. |
| Brevo | API Key | Le salon renseigne sa propre clé API. |
| Google Calendar | OAuth | OAuth **par salon**. |
| Outlook | OAuth | OAuth **par salon**. |
| Instagram / Meta | OAuth ou token | Selon l'API. |
| SumUp | — | Prévu plus tard. |
| Square | — | Prévu plus tard. |
| Cegid | — | Prévu plus tard. |
| Pennylane | — | Prévu plus tard. |
| Odoo | — | Prévu plus tard. |
| Sage | — | Prévu plus tard. |

---

## Modèle de données : `IntegrationConnection`

```
IntegrationConnection {
  id
  organizationId
  salonId              // nullable
  provider             // "brevo" | "google_calendar" | "whatsapp" | ...
  authType             // "api_key" | "oauth"
  status               // "connected" | "disconnected" | "error" | ...
  encryptedCredentials // JAMAIS en clair
  settings             // JSON (options spécifiques au provider)
  lastSyncAt
  createdAt
  updatedAt
}
```

Index prévu : `integration_connections(organizationId, provider)`.

---

## 🔐 Règle de sécurité (absolue)

- Les clés API et tokens **ne doivent jamais être stockés en clair**.
- Ils sont **chiffrés** avant stockage (`encryptedCredentials`).
- Le déchiffrement n'a lieu qu'au moment de l'appel au fournisseur, côté serveur.
- Les secrets ne transitent jamais vers le client.
- La clé de chiffrement vit dans la configuration serveur (variable d'environnement), jamais en base.
