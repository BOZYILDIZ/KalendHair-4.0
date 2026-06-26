# SCREENSHOTS_SPEC — Spécifications captures produit KalendHair

> Référence pour la constitution des captures d'écran destinées aux pages marketing.  
> Dernière mise à jour : Juin 2026.

---

## Environnement de capture

- **Application** : App KalendHair locale (`localhost:3000`) ou staging Vercel
- **Salon de démo** : "L'Atelier Lumière" — à constituer via Super Admin avant toute capture
- **Navigateur** : Chrome stable, DevTools fermés
- **Zoom navigateur** : 100% (ne pas zoomer)
- **OS** : macOS ou Windows — ne pas inclure la barre de titre OS dans les captures
- **Extension recommandée** : GoFullPage ou Screenshotone pour les captures pleine page

---

## Répertoire de destination

```
public/screenshots/
├── agenda-jour.webp
├── agenda-semaine.webp
├── booking-step1.webp
├── booking-confirmation.webp
├── crm-fiche-client.webp
├── kpi-dashboard.webp
├── caisse-paiement.webp
├── stocks-inventaire.webp
├── admin-panel.webp
├── demo-tab-agenda.webp
├── demo-tab-booking.webp
├── demo-tab-crm.webp
├── demo-tab-kpi.webp
├── demo-tab-caisse.webp
├── demo-tab-stocks.webp
```

---

## Format et qualité

| Paramètre | Valeur |
|---|---|
| Format | WebP (préféré) ou PNG en fallback |
| Qualité WebP | 85–90 |
| Résolution écran | 1× (pas de @2x, Next.js gère la densité) |
| Compression | Passer par `squoosh.app` ou `cwebp` si > 300 Ko |
| Données EXIF | Supprimer avant commit (`exiftool -all= *.webp`) |

---

## Spécifications par capture

### Desktop — fenêtre 1280×800

> Taille de la fenêtre du navigateur : 1280 largeur × 800 hauteur (pas la résolution écran).  
> Utiliser DevTools → Device Toolbar → dimension personnalisée.

#### 1. Agenda jour (vue complète)
- **Fichier** : `agenda-jour.webp`
- **Dimensions** : 1280×800
- **Vue** : Planning jour, au moins 3 coiffeurs visibles, créneaux colorés par coiffeur
- **Données demo** : Journée chargée (8h–18h) avec au moins 8 RDV
- **À masquer** : Aucune donnée sensible — le salon est fictif
- **Usage** : Page `/fonctionnalites` section Agenda

#### 2. Agenda semaine (multi-coiffeurs)
- **Fichier** : `agenda-semaine.webp`
- **Dimensions** : 1280×800
- **Vue** : Semaine complète, colonnes par coiffeur
- **Données demo** : Semaine ordinaire avec variation de densité
- **Usage** : Page `/demo` onglet Agenda

#### 3. KPI Dashboard
- **Fichier** : `kpi-dashboard.webp`
- **Dimensions** : 1280×800
- **Vue** : Vue d'ensemble des métriques — CA, RDV, taux remplissage, nouveaux clients
- **Données demo** : Chiffres réalistes pour un salon (CA ~3 500 €/mois)
- **Usage** : Page `/fonctionnalites` section KPI, `/demo` onglet KPI

#### 4. CRM — fiche client
- **Fichier** : `crm-fiche-client.webp`
- **Dimensions** : 1280×800
- **Vue** : Profil client complet — historique RDV, notes, prestations favorites
- **Données demo** : Client fictif "Marie Dupont", 12 visites, fidèle depuis 2 ans
- **Usage** : Page `/fonctionnalites` section CRM

#### 5. Paiements — caisse
- **Fichier** : `caisse-paiement.webp`
- **Dimensions** : 1280×800
- **Vue** : Interface de clôture d'un RDV — récapitulatif prestations, total, mode de paiement
- **Données demo** : Coupe + coloration, total 85 €, paiement CB
- **Usage** : Page `/fonctionnalites` section Caisse

#### 6. Stocks — inventaire
- **Fichier** : `stocks-inventaire.webp`
- **Dimensions** : 1280×800
- **Vue** : Liste des produits en stock, alertes seuil bas visibles
- **Données demo** : 15–20 produits, 2 en alerte stock bas
- **Usage** : Page `/fonctionnalites` section Stocks

#### 7. Super Admin — panel
- **Fichier** : `admin-panel.webp`
- **Dimensions** : 1280×800
- **Vue** : Tableau de bord Super Admin — liste des salons, statuts, métriques globales
- **Données demo** : 3 salons fictifs visibles
- **Usage** : Usage interne — pas nécessairement publié sur la vitrine

---

### Mobile — 375×812 (iPhone SE / iPhone 13 mini viewport)

> DevTools → Device Toolbar → iPhone SE ou dimensions personnalisées 375×812.

#### 8. Réservation publique — étape 1 (choix prestation)
- **Fichier** : `booking-step1.webp`
- **Dimensions** : 375×812
- **Vue** : Page de réservation client — sélection prestation
- **Données demo** : 4–5 prestations listées (Coupe, Coupe + Couleur, Mèches, Soin, Brushing)
- **Usage** : Page `/fonctionnalites` section Booking, homepage

#### 9. Réservation publique — confirmation
- **Fichier** : `booking-confirmation.webp`
- **Dimensions** : 375×812
- **Vue** : Page de confirmation post-réservation — résumé RDV + message de confirmation
- **Données demo** : RDV confirmé pour "Marie Dupont" le [date factice]
- **Usage** : Page `/fonctionnalites` section Booking

---

### Demo page — onglets (DemoTabs)

> Captures de chaque onglet de la page `/demo` pour la section hero.

#### 10–15. Demo tabs (6 captures)
- **Fichiers** : `demo-tab-agenda.webp`, `demo-tab-booking.webp`, `demo-tab-crm.webp`, `demo-tab-kpi.webp`, `demo-tab-caisse.webp`, `demo-tab-stocks.webp`
- **Dimensions** : 1280×720 (16:9 — format vidéo friendly pour les onglets)
- **Vue** : Chaque onglet de la DemoTabs — contenu fictif intégré dans le composant
- **Note** : Ces captures peuvent réutiliser le contenu des captures desktop ci-dessus, recadrées si nécessaire

---

## Checklist avant intégration

- [ ] Toutes les données affichées sont fictives (aucun vrai client, aucun vrai RDV)
- [ ] Aucune information personnelle réelle visible (email, téléphone, adresse)
- [ ] Aucune clé API ou secret visible dans l'URL ou le DOM
- [ ] Les captures sont compressées (< 300 Ko par image WebP)
- [ ] Les dimensions correspondent aux spécifications (vérifier avec Preview.app ou `identify` ImageMagick)
- [ ] Les fichiers sont nommés exactement comme dans ce document
- [ ] Les fichiers sont placés dans `public/screenshots/`

---

## Intégration dans le code

Une fois les captures livrées dans `public/screenshots/`, Claude les intégrera dans les pages via `next/image` :

```tsx
import Image from "next/image"

<Image
  src="/screenshots/agenda-jour.webp"
  alt="Vue de l'agenda jour KalendHair avec planning multi-coiffeurs"
  width={1280}
  height={800}
  className="rounded-xl border border-slate-700/50 shadow-2xl"
  priority={false}
  loading="lazy"
/>
```

Les images above-the-fold (hero section) utiliseront `priority={true}` et `loading="eager"`.

---

_Document créé : Juin 2026 — Phase marketing vitrine v1._
