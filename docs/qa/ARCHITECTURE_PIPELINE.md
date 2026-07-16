# Manus QA Platform — Pipeline d'observabilité (v2.5)

> Décrit le trajet complet d'un événement, de sa production à son archivage,
> et les garanties de sécurité à chaque étape. Complète
> `docs/qa/SECURITY_POLICY.md` (v2.3) et `docs/qa/RUNTIME_COVERAGE.md` (v2.4).

## Diagramme du pipeline

```
┌─────────────────┐
│   Producteur     │  core/runner.ts, client/index.ts, core/safe-mode.ts,
│   d'événement    │  core/permissions.ts, core/capabilities.ts, core/profiles.ts
└────────┬─────────┘
         │ eventLog.emit(eventType, severity, payload, opts)
         │ (le producteur ne connaît AUCUN sink — v2.5, mission 1)
         ▼
┌─────────────────────────────────────────────────────────────┐
│                         EventBus                              │
│  1. Construit RuntimeEvent (+ eventSchemaVersion, timestamp,  │
│     runId, frameworkVersion)                                  │
│  2. Applique secretRedactionEngine.redactObject(payload)      │
│     ── UNE SEULE FOIS, ICI, avant toute distribution ──       │
│  3. Distribue l'événement rédigé à chaque sink enregistré     │
└────────┬───────────┬───────────┬───────────┬──────────────────┘
         │           │           │           │
         ▼           ▼           ▼           ▼
   ┌─────────┐ ┌───────────┐ ┌──────────┐ ┌─────────────────────┐
   │ Memory  │ │  JsonlSink │ │ Console  │ │   DashboardSink      │
   │  Sink   │ │ (streaming)│ │  Sink    │ │ (agrégation compteurs)│
   │(défaut) │ │            │ │(WARN+)   │ │                      │
   └─────────┘ └─────┬──────┘ └──────────┘ └──────────┬───────────┘
                      │                                 │
                      ▼                                 ▼
          reports/manus/<runId>/            reports/manus/<runId>/
             events.jsonl                     events-summary.json
                      │                                 │
                      └───────────────┬─────────────────┘
                                      ▼
                        ┌──────────────────────────┐
                        │   Politique de rétention   │  core/event-retention.ts
                        │   (invocation explicite,    │  maxEvents / maxAgeDays /
                        │    hors cycle de vie du run) │  maxSizeBytes → archive
                        └──────────┬───────────────────┘
                                   ▼
                        reports/manus/_archive/<runId>.jsonl
                        (compression : préparée, non implémentée)

   ┌─────────────────┐     ┌──────────────────┐
   │  WebhookSink      │     │   OtelSink         │   Sinks de PRÉPARATION —
   │  (non implémenté) │     │  (non implémenté)  │   enregistrables sans
   └──────────────────┘     └──────────────────┘   modifier un seul producteur
```

## Garanties de sécurité à chaque étape

| Étape | Garantie | Preuve |
|---|---|---|
| Producteur → EventBus | Le producteur ne peut pas contourner la redaction — elle n'est pas optionnelle, elle a lieu dans `emit()` avant tout retour ou distribution | `core/event-bus.ts::emit()` — lecture de code + `events.test.ts` |
| EventBus → Sinks | Un sink qui échoue (sync ou async) n'interrompt ni l'émission ni les autres sinks — l'observabilité ne devient jamais un point de défaillance du framework QA | `event-bus.test.ts` — "sink cassé n'empêche pas les autres" (démontré par test) |
| EventBus → réseau (chemins réels) | Tout appel réseau réel (`client/index.ts`) passe par `assertNotSafeMode()` AVANT le `fetch()` — indépendamment du fait qu'un événement soit émis ou non | `docs/qa/RUNTIME_COVERAGE.md` + `runtime-coverage.test.ts` (v2.4, toujours valide) |
| Sinks à effet de bord réel (JSONL, dashboard) | Jamais enregistrés au chargement du module (`core/events.ts`) — uniquement au point d'entrée applicatif réel (`core/runner.ts::runAll()`), garantissant qu'un simple test unitaire n'écrit jamais sur le disque réel | Constaté : `grep` confirme l'enregistrement conditionnel dans `runner.ts`, jamais dans `events.ts` |
| WebhookSink (futur) | Le jour de son implémentation réelle, elle DEVRA passer par `assertNotSafeMode("NETWORK_CALL", ...)` comme tout autre appel réseau — documenté explicitement dans le fichier lui-même | `core/sinks/webhook-sink.ts` (commentaire de tête) — **analyse architecturale, pas encore appliquée puisque non implémentée** |

## Pourquoi la redaction a lieu dans le bus, pas dans chaque sink

Si chaque sink devait rédiger lui-même son payload avant de l'écrire, un
nouveau sink (webhook, OpenTelemetry, un futur exportateur vers un SIEM
d'entreprise) pourrait **oublier** cette étape — exactement le type d'erreur
qui a justifié la création du moteur de redaction en v2.4 (`report.json`
écrivait `rawOutput` sans garde-fou centralisé). En centralisant la redaction
dans `EventBus.emit()`, aucun sink futur ne peut réintroduire cette classe de
fuite, même par omission.

## Ce qui est câblé vs. ce qui est préparé (disclosure explicite — mise à jour v2.5.1)

- **Câblé et actif** dans `core/runner.ts::runAll()` : JsonlSink, ConsoleSink, DashboardSink.
- **Câblé ET visuel (v2.5.1)** : `DashboardSink` écrit `events-summary.json` ; `generate-dashboard.ts` le lit désormais (`loadEventsSummaries` + `aggregateRuntimeEvents`), l'agrège sur tous les runs disponibles, et l'affiche dans une section "Runtime Events" du dashboard HTML (total événements, répartition par type/sévérité, SAFE_MODE_BLOCKED, PERMISSION_DENIED, NETWORK_REQUEST/RESPONSE, coûts estimés/réels). Les runs antérieurs à v2.5 (sans `events-summary.json`) sont ignorés proprement, jamais une erreur. Prouvé par test E2E (`e2e-observability.test.ts`).
- **Résilience de `DashboardSink` (mission corrective Devil's Advocate)** : un audit adversarial a démontré qu'avant correction, `events-summary.json` n'était écrit qu'une seule fois en toute fin de run — toute interruption (crash, Ctrl+C, kill -9, timeout CI) avant cet instant faisait disparaître 100% de l'agrégation runtime, alors que `events.jsonl` (le même flux, en brut, via `JsonlSink`) survivait intact. `DashboardSink` écrit désormais `events-summary.json` de façon **incrémentale** (après chaque événement, pas seulement en fin de run) et **atomique** (fichier temporaire + `rename()`, jamais un `writeFileSync` direct sur le fichier final — voir le commentaire d'en-tête de `core/sinks/dashboard-sink.ts` pour la garantie exacte, non aspirationnelle). Prouvé par test (`sinks.test.ts`).
- **Invocation manuelle explicite (v2.5.1)** : `retention-cli.ts` — CLI dédié avec modes `--preview` (défaut, aucune écriture) et `--apply` (purge/archive réelle). Le run le plus récent n'est **jamais** candidat à la rétention, quel que soit le mode. Chaque action émet `RETENTION_PREVIEW`/`RETENTION_APPLIED`. Toujours **non automatisé** — aucun cron, aucune étape de `run-all.ts` ne l'invoque ; reste une action opérateur délibérée. Voir recommandations v2.6.
- **Préparé, non câblé, non implémenté** : `WebhookSink`, `OtelSink` — classes présentes, conformes à `EventSink`, testées pour leur comportement de non-effet-de-bord (tests de contrat v2.5.1, `sinks-contract.test.ts`), mais leur `handle()` ne fait rien de réel. Enregistrables via `eventLog.registerSink(...)` le jour où une implémentation réelle existera, sans toucher à `core/runner.ts` ni à aucun producteur d'événement. **Ceci reste volontairement hors périmètre de la finalisation v2.5.1** (aucune nouvelle fonctionnalité "préparée" n'a été ajoutée par cette mission — seules les fonctionnalités déjà préparées en v2.5 restent en l'état).
- **Typage des payloads (v2.5.1)** : `core/events-payloads.ts` associe une forme attendue à chaque `eventType`, avec validation runtime permissive — un événement dont le payload ne correspond pas exactement (legacy, ou champ additionnel) reste lisible, jamais rejeté. `getTypedPayload()` retourne `null` plutôt que de lever une exception.
