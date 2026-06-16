# WORKFLOW — Méthode de travail (KalendHair 4.0)

---

## Rôles

| Rôle | Personne | Responsabilité |
|---|---|---|
| **Décideur produit** | **Hasan** | Décide quoi construire et valide. |
| **Architecte / CTO / Reviewer** | **ChatGPT** | Prépare les missions, valide ou corrige. |
| **Exécutant technique** | **Claude Code** | Exécute les missions techniques. |

---

## Cycle de travail

1. **ChatGPT** prépare la mission.
2. **Hasan** colle la mission dans **Claude Code**.
3. **Claude Code** exécute **sur une branche dédiée**.
4. **Claude Code** met à jour `docs/PROJECT_STATE.md` et `docs/SESSION_LOG.md`.
5. **Hasan** transmet le résumé / les fichiers à **ChatGPT**.
6. **ChatGPT** valide ou corrige.
7. **Seulement après validation**, on continue (étape suivante).

---

## Workflow officiel (vue d'ensemble)

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

---

## 🔁 Règle Git officielle — fin de chaque tâche validée

À la fin de chaque tâche, Claude applique cette procédure **dans l'ordre** :

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

---

## Règles Git

- **Ne jamais travailler directement sur `main`** pour une fonctionnalité.
- **Une fonctionnalité = une branche.**
- `main` doit **rester propre**.

### Exemples de branches

- `feature/auth`
- `feature/salons`
- `feature/employees`
- `feature/services`
- `feature/appointments`

### Bonnes pratiques

- Commits clairs et atomiques.
- Une branche reste focalisée sur **un seul domaine**.
- Fusion dans `main` uniquement après validation (étape 6 du cycle).

---

## 🛠️ Outil Git : GitHub CLI (`gh`)

**Privilégier GitHub CLI (`gh`) lorsqu'il est disponible.** Commandes de référence :

| Besoin | Commande |
|---|---|
| Créer une Pull Request | `gh pr create --base main --head <branche> --title "..." --body "..."` |
| Voir les infos d'une PR | `gh pr view <numéro\|branche>` |
| Lister les PR | `gh pr list` |
| État des branches / PR | `gh pr status` |
| Afficher l'URL d'une PR | `gh pr view --json url -q .url` (ou `--web` pour ouvrir) |

> ⚠️ Ne **jamais** exécuter `gh pr merge` automatiquement. La PR est créée et son URL
> est transmise pour review ; le merge vers `main` n'intervient qu'**après validation**.

---

## Rappel des rituels Claude

- **Début de session** : lire `PROJECT_STATE.md`, `CURRENT_SPRINT.md`, `DECISIONS.md`.
- **Avant modification** : proposer un **plan**.
- **Fin de session** : mettre à jour `PROJECT_STATE.md` et `SESSION_LOG.md`.
