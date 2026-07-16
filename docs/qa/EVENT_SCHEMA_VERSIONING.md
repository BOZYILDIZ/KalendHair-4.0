# Manus QA Platform — Versionnement du schéma d'événements (v2.5)

> Référence complète des règles d'évolution de `RuntimeEvent`. Les règles
> elles-mêmes sont également documentées en commentaire dans
> `scripts/manus/core/events-schema.ts` (source de vérité pour le code) —
> ce document en est la version narrative, avec exemples.

## Champ `eventSchemaVersion`

Chaque `RuntimeEvent` porte un champ `eventSchemaVersion: string`, distinct de
`frameworkVersion` (version du framework QA lui-même, `core/version.ts`) et de
`SCHEMA_VERSION` (version du format `report.json`, sans rapport avec les
événements). Version actuelle : **`"1"`**.

Cette séparation existe parce que ces trois axes évoluent à des rythmes
différents : un bump de `frameworkVersion` (ex: 2.4.0 → 2.5.0) n'implique pas
forcément un changement de la forme d'un événement.

## Règles d'évolution

| Changement | Impact | Action requise |
|---|---|---|
| Ajout d'un champ optionnel à `RuntimeEvent` | Non-breaking | Aucune — `eventSchemaVersion` reste inchangé |
| Ajout d'un nouveau `eventType` à `EVENT_TYPES` | Non-breaking pour les sinks génériques (JSONL, console) ; potentiellement breaking pour un sink avec un `switch` exhaustif | Tout sink DOIT avoir un comportement par défaut pour un `eventType` inconnu — jamais un `throw` |
| Renommage/suppression d'un champ existant | **Breaking** | Incrémenter `EVENT_SCHEMA_VERSION` |
| Changement de signification d'un champ existant (ex: `severity` devient numérique) | **Breaking** | Incrémenter `EVENT_SCHEMA_VERSION` |

## Compatibilité multi-versions — exemple

Un consommateur qui lit des événements historiques (ex: agrégation de
plusieurs runs passés pour un futur dashboard consolidé) ne doit **jamais**
supposer que tous les événements lus partagent la version courante :

```ts
import { EVENT_SCHEMA_VERSION } from "../core/events-schema";
import type { RuntimeEvent } from "../core/events-schema";

function readSeverity(event: RuntimeEvent): string {
  switch (event.eventSchemaVersion) {
    case "1":
      return event.severity; // forme actuelle
    // case "2": // future forme — à ajouter lors du prochain bump breaking
    //   return mapV2SeverityToV1(event);
    default:
      // Ne jamais planter sur une version inconnue — dégrader proprement.
      console.warn(`[events] eventSchemaVersion inconnue: ${event.eventSchemaVersion}`);
      return "INFO";
  }
}
```

**Anti-pattern à ne jamais reproduire** : `core/compare.ts` fait aujourd'hui
`JSON.parse(content) as RunSummary` sans jamais vérifier `schemaVersion` avant
utilisation (constat d'audit antérieur, toujours vrai, hors périmètre de
cette mission). Le versionnement des événements ne doit pas répéter cette
erreur — tout code qui lit `events.jsonl` pour autre chose qu'un affichage
brut doit vérifier `eventSchemaVersion` avant d'exploiter la forme du
`payload`.

## Ce qui n'est PAS versionné indépendamment

Le `payload: Record<string, unknown>` de chaque événement n'a **aucun schéma
formel par eventType** aujourd'hui (ex: le payload de `MANUS_TASK_CREATED`
n'est pas typé plus précisément qu'un objet libre). C'est une limite connue,
pas un oubli — formaliser un schéma par eventType (via Zod, déjà présent
comme dépendance du projet) est une piste pour une v2.6, pas traitée ici.
