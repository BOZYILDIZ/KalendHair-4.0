# MVP — KalendHair 4.0

Définition **stricte** du MVP. Tout ce qui n'est pas listé dans « contenu du MVP »
est **hors périmètre** pour la première version.

---

## ✅ Contenu du MVP

- **Landing page professionnelle**
- **Inscription salon** (création de compte pro)
- **Connexion pro**
- **Création d'une organization**
- **Création d'un salon**
- **Dashboard salon**
- **Gestion des employés**
- **Gestion des services**
- **Horaires d'ouverture**
- **Page publique de réservation**
- **Prise de rendez-vous client / invité**
- **Calendrier pro simple**
- **Comptes clients basiques**

---

## ❌ Hors MVP (volontairement exclu)

- IA
- SMS
- WhatsApp
- Stripe
- Facturation
- Fidélité
- Marketplace avancée
- Application mobile native
- Franchise / multi-salons avancé
- Comptabilité
- Caisse / POS
- Automatisations marketing avancées

---

## Notes

- Le **multi-tenant** est en place **dès le départ** (Organization → Salon),
  même si le MVP démarre avec **un seul salon par organization**.
- Stripe et les connecteurs sont **prévus en architecture** mais **non développés**
  dans le MVP (voir `docs/INTEGRATIONS.md` et `docs/ROADMAP.md`).
