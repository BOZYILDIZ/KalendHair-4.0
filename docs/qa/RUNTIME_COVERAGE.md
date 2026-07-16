# Manus QA Platform — Matrice de couverture runtime (v2.5.1)

> Preuve que chaque chemin de code pouvant émettre un appel réseau réel passe
> obligatoirement par SAFE_MODE avant toute exécution. Cette matrice est
> synchronisée avec `scripts/manus/__tests__/runtime-coverage.test.ts` — le
> test EST la preuve expérimentale, ce document en est la lecture humaine.

## Méthode de preuve

Le test stub `global.fetch` pour détecter tout appel réseau. Chaque fonction
listée ci-dessous est appelée en SAFE_MODE actif (comportement par défaut,
aucun flag `--unsafe`/`--i-accept-manus-cost` dans l'invocation du test). Si
`fetch()` était atteint avant que `assertNotSafeMode()` ne lève son
exception, le test échouerait immédiatement — c'est une preuve par
falsifiabilité, pas une simple lecture de code.

## Matrice

| Chemin de code | Gate avant `fetch()` | Statut | Preuve |
|---|---|---|---|
| `client/index.ts::pingManus()` | `assertNotSafeMode("NETWORK_CALL", ...)` | ✅ Démontré | `runtime-coverage.test.ts` — "pingManus() — bloqué avant fetch" |
| `client/index.ts::createAndPollTask()` (création) | `assertNotSafeMode("MANUS_TASK_CREATION", ...)` | ✅ Démontré | `runtime-coverage.test.ts` — "createAndPollTask() — bloqué avant fetch" |
| `client/index.ts::createAndPollTask()` (polling) | Gate en amont — la boucle de polling n'est jamais atteinte si la création est bloquée | ✅ Démontré (implicitement) | Même test — `fetchCallCount` reste à 0 |
| `ping.ts` (CLI) | Hérite du gate via `pingManus()` — aucun `fetch()` propre au fichier | ✅ Analyse architecturale (pas de test dédié — rien à tester en propre) | Grep confirmé : `ping.ts` ne contient aucun `fetch()` direct |

## Chemin legacy supprimé (préparation PR Enterprise Foundation)

`manus-client.ts` et `scenarios/pr-06-regression.ts` ont été **supprimés
définitivement** du dépôt lors de la préparation de la PR
`feat/manus-enterprise-foundation`, après confirmation exhaustive (imports,
exports, CLI, `package.json`, workflows, docs) qu'aucune référence restante
ne dépendait de ces fichiers. Les lignes de matrice et les tests associés qui
couvraient ce chemin ont été retirés en conséquence — pas seulement marqués
obsolètes — pour que cette matrice ne décrive que des chemins réellement
présents dans le code.

## Ce qui est prouvé expérimentalement vs. analysé architecturalement

- **Prouvé par exécution** (3 tests dans `runtime-coverage.test.ts`, exécutés à chaque `test:manus`) : les deux premières lignes de la matrice — la création de tâche (chemin officiel) et le ping associé ne peuvent jamais atteindre `fetch()` sans franchir `assertNotSafeMode()` — plus un test dédié vérifiant l'émission d'un événement `SAFE_MODE_BLOCKED` à chaque blocage.
- **Analysé architecturalement** (grep + lecture, pas d'exécution dédiée) : `ping.ts` n'a pas de `fetch()` propre — sa protection est *transitive*, héritée de `pingManus()`. Un test dédié à ce fichier ajouterait de la couverture de non-régression si son code évoluait un jour pour appeler `fetch()` directement.

## Limite explicite

Cette matrice couvre `scripts/manus/` uniquement. Si un futur script hors de
ce périmètre réimplémente un appel Manus indépendamment (comme le faisait
historiquement le client legacy désormais supprimé), il ne bénéficiera pas
automatiquement du gate sauf à importer explicitement `assertNotSafeMode`
depuis `core/safe-mode.ts` — et devra alors être ajouté à cette matrice ET au
test `runtime-coverage.test.ts` pour que la garantie reste démontrée plutôt
que supposée.
