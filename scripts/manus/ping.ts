/**
 * Ping Manus — validation minimale de la connexion API v2.
 *
 * Lancement (crée une tâche réelle, consomme quelques crédits — SAFE_MODE
 * bloque cet appel par défaut) :
 *   tsx scripts/manus/ping.ts --unsafe --i-accept-manus-cost
 *
 * Affiche uniquement : statut HTTP, task_id (si reçu), message d'erreur.
 * Ne logue jamais la clé API.
 */

import { loadEnv, getManusApiUrl } from "./utils/env";
import { pingManus }               from "./client/index";
import { printSafeModeBanner }     from "./core/safe-mode";

// Charge .env.local depuis la racine du projet
loadEnv();

async function main() {
  printSafeModeBanner(process.argv);
  console.log("[Manus] Ping en cours...");
  console.log(`[Manus] URL : ${getManusApiUrl()}`);

  const result = await pingManus();

  if (result.ok) {
    console.log(`✅ Manus opérationnel — HTTP ${result.status}`);
    if (result.taskId) console.log(`   Task ID reçu : ${result.taskId}`);
  } else {
    console.error(`❌ Manus inaccessible — HTTP ${result.status}`);
    console.error(`   Erreur : ${result.error}`);
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error("[Manus] Erreur critique :", msg);
  process.exit(1);
});
