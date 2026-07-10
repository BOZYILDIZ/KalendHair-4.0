// ─────────────────────────────────────────────────────────────────────────────
// ⚠️  SCÉNARIO DE TEST CONTRÔLÉ — PAS dans les runs de production
//
// Utilisé UNIQUEMENT pour valider les Quality Gates de l'infrastructure QA.
// Provoque volontairement des échecs d'assertions → score < 80 → BLOCK_MERGE.
//
// Lancement manuel uniquement :
//   tsx scripts/manus/run-all.ts --scenario test-block-merge
//
// Ce scénario N'EST PAS référencé dans run-all.ts (liste par défaut).
// ─────────────────────────────────────────────────────────────────────────────

import {
  expectNoConsoleErrors,
  expectNoNetworkErrors,
  expectText,
  expectVisible,
  expectRoute,
  buildAssertionsBlock,
  assertionNames,
} from "../core/assertions";
import { VIEWPORTS } from "../core/types";
import type { ScenarioDefinition } from "../core/types";

// Assertions délibérément impossibles (contenu inexistant)
const ASSERTIONS = [
  expectNoConsoleErrors(),
  expectNoNetworkErrors(),
  expectText("CONTENU_IMPOSSIBLE_QA_VALIDATION_XYZ123"),
  expectVisible("ELEMENT_INEXISTANT_QA_VALIDATION_ABC456"),
  expectRoute("/route-inexistante-qa-validation-789"),
];

export const testBlockMerge: ScenarioDefinition = {
  scenarioId:  "SC-T01",
  name:        "test-block-merge",
  description: "Scénario de test contrôlé — valide que BLOCK_MERGE se déclenche correctement",
  tags:        ["test", "qa-validation", "controlled-failure"],

  run(_ctx) {
    // Utilise une URL publique garantie accessible pour forcer des assertions à échouer
    // (ctx.baseUrl pointe localhost en local → Manus cloud ne peut pas l'atteindre → timeout)
    const testUrl = "https://example.com";

    const prompt = [
      `# Mission QA — Scénario de validation infrastructure`,
      ``,
      `## Contexte`,
      `Ceci est un scénario de TEST CONTRÔLÉ pour valider l'infrastructure QA KalendHair.`,
      `Son rôle est de démontrer que les Quality Gates fonctionnent correctement.`,
      ``,
      `## Instruction`,
      `Navigue vers : ${testUrl}`,
      ``,
      `## Assertions à vérifier`,
      ``,
      buildAssertionsBlock(ASSERTIONS),
      ``,
      `## Note importante`,
      `Les assertions ci-dessus contiennent du contenu délibérément inexistant.`,
      `Tu dois les vérifier honnêtement — elles échoueront car le contenu n'existe pas.`,
      `C'est le résultat attendu pour ce scénario de validation QA.`,
    ].join("\n");

    return {
      prompt,
      assertionNames: assertionNames(ASSERTIONS),
      timeoutSeconds: 90,
      viewport:       VIEWPORTS.desktop,
    };
  },
};
