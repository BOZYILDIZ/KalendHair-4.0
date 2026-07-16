// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Sink JSONL (v2.5)
//
// Écrit chaque événement en streaming (une ligne JSON par événement, ajoutée
// immédiatement) dans reports/manus/<runId>/events.jsonl.
//
// Différence avec v2.4 : le v2.4 accumulait les événements en mémoire et les
// écrivait tous d'un coup à la fin du run (writeToFile() explicite appelé
// depuis reporters/json.ts). Ce sink écrit CHAQUE événement immédiatement à
// sa réception — le contenu final du fichier est identique (mêmes lignes,
// même ordre), mais un run interrompu en cours d'exécution (crash, kill)
// conserve désormais son historique partiel au lieu de tout perdre.
// Amélioration délibérée, documentée — pas une régression silencieuse.
// ─────────────────────────────────────────────────────────────────────────────

import { appendFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import type { EventSink } from "../event-bus";
import type { RuntimeEvent } from "../events-schema";

export class JsonlSink implements EventSink {
  readonly name = "jsonl";

  constructor(private readonly reportsRootFn: () => string) {}

  handle(event: RuntimeEvent): void {
    const dir = resolve(this.reportsRootFn(), event.runId);
    mkdirSync(dir, { recursive: true });
    const path = resolve(dir, "events.jsonl");
    appendFileSync(path, JSON.stringify(event) + "\n", "utf-8");
  }

  reset(): void {
    // Sans état interne — chaque écriture est indépendante et immédiate.
  }
}
