// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Moteur de redaction centralisé (v2.4 — Runtime Trust ;
// robustesse renforcée par la mission corrective Devil's Advocate)
//
// Garantit qu'aucun secret connu (mot de passe QA, clé API Manus, token de
// bypass Vercel) ne puisse être écrit dans un artefact — report.md,
// report.json, metadata.json, console.log, dashboard.json, events.jsonl,
// events-summary.json, dashboard HTML, ou tout futur reporter.
//
// Deux couches de défense :
//   1. Redaction par VALEUR CONNUE — la plus fiable : le framework connaît
//      la valeur exacte des secrets au runtime (credentials.*.password,
//      MANUS_API_KEY, VERCEL_PROTECTION_BYPASS) et les enregistre dès leur
//      lecture. Toute occurrence de cette chaîne, SOUS SA FORME BRUTE, SON
//      ÉCHAPPEMENT JSON, OU SON ENCODAGE URL (voir secretVariants() plus bas),
//      où qu'elle apparaisse dans un texte ou un objet, est remplacée.
//   2. Redaction par MOTIF GÉNÉRIQUE — filet de sécurité pour les formats de
//      secrets reconnaissables structurellement même sans connaître la valeur
//      exacte (clé Manus "sk-...", token _vercel_share, champ JSON
//      "password", en-tête Authorization Bearer).
//
// Défense en profondeur : appliqué à la SOURCE (core/runner.ts, avant de
// stocker rawOutput) ET en dernier recours à chaque reporter — un secret qui
// échapperait à la couche 1 doit encore être intercepté par la couche 2.
//
// Limite explicite et documentée (pas résolue, pas cachée) : un secret encodé
// en base64 ou par tout autre encodage non déterministe à partir de la valeur
// brute reste indétectable par cette approche de correspondance de
// sous-chaîne. Voir le commentaire de secretVariants() et
// __tests__/redaction.test.ts.
// ─────────────────────────────────────────────────────────────────────────────

export interface SecretRegistryEntry {
  label: string;
  value: string;
}

// ─── Motifs génériques (couche 2 — filet de sécurité) ─────────────────────────
// Ordre important : les motifs les plus spécifiques d'abord, pour éviter
// qu'un motif générique ne masque un label plus précis inutilement.
// Un marqueur déjà rédigé ne doit jamais être re-capturé par un motif
// générique plus tardif (sinon un label précis, ex. QA_OWNER_PASSWORD, se
// ferait écraser par un label générique, ex. JSON_PASSWORD_FIELD).
const ALREADY_REDACTED = /^\*\*\*REDACTED_/;

const GENERIC_PATTERNS: Array<{ label: string; pattern: RegExp; replacer: (m: string, ...groups: string[]) => string }> = [
  {
    label: "MANUS_API_KEY",
    pattern: /sk-[A-Za-z0-9_-]{10,}/g,
    replacer: (m) => (ALREADY_REDACTED.test(m) ? m : "***REDACTED_MANUS_API_KEY***"),
  },
  {
    label: "VERCEL_BYPASS_TOKEN",
    // Capture uniquement la valeur du token — préserve le préfixe "_vercel_share=".
    pattern: /(_vercel_share=)([A-Za-z0-9]+)/g,
    replacer: (_m, prefix, token) => (ALREADY_REDACTED.test(token) ? _m : `${prefix}***REDACTED_VERCEL_BYPASS_TOKEN***`),
  },
  {
    label: "BEARER_TOKEN",
    // Capture uniquement le token — préserve le préfixe "Bearer ".
    pattern: /(Bearer\s+)([A-Za-z0-9._-]+)/g,
    replacer: (_m, prefix, token) => (ALREADY_REDACTED.test(token) ? _m : `${prefix}***REDACTED_BEARER_TOKEN***`),
  },
  {
    label: "JSON_PASSWORD_FIELD",
    pattern: /"password"\s*:\s*"([^"]*)"/gi,
    replacer: (m, value) => (ALREADY_REDACTED.test(value) ? m : `"password":"***REDACTED_JSON_PASSWORD_FIELD***"`),
  },
  {
    label: "JSON_APIKEY_FIELD",
    pattern: /"(api[_-]?key)"\s*:\s*"([^"]*)"/gi,
    replacer: (m, key, value) => (ALREADY_REDACTED.test(value) ? m : `"${key}":"***REDACTED_JSON_APIKEY_FIELD***"`),
  },
];

function applyGenericPatterns(text: string): string {
  let out = text;
  for (const { pattern, replacer } of GENERIC_PATTERNS) {
    out = out.replace(pattern, replacer as (...args: string[]) => string);
  }
  return out;
}

// ─── Variantes d'un secret connu (couche 1 — robustesse) ──────────────────────
//
// Correctif Devil's Advocate (P0 — redaction robuste) : la redaction par
// valeur connue ne cherchait auparavant que la forme BRUTE, exacte, d'un
// secret. Or `redactObject()` fait un aller-retour JSON.stringify() avant
// d'appeler `redact()` — si un secret contient un caractère que
// JSON.stringify échappe (guillemet ", antislash \, saut de ligne, tabulation,
// autre caractère de contrôle), la forme échappée dans le texte sérialisé ne
// correspond plus, caractère pour caractère, à la valeur brute enregistrée :
// le secret fuyait intact (sous forme échappée) dans report.json,
// events.jsonl, metadata.json — tout artefact produit via redactObject().
//
// `secretVariants()` calcule, en plus de la valeur brute, sa forme échappée
// JSON (couvre guillemets/antislash/sauts de ligne/tabulations/Unicode de
// contrôle) et sa forme URL-encodée (couvre query params et URLs). Les trois
// formes sont recherchées et rédigées indépendamment.
//
// Limite explicite, non résolue par ce correctif (documentée, pas cachée) :
// un secret encodé en base64, ou par tout autre encodage non déterministe à
// partir de la valeur brute (ex. un hash, un chiffrement), reste indétectable
// par une approche de correspondance de sous-chaîne — seule une redaction à
// la SOURCE (avant l'encodage, au moment où le secret est encore en clair)
// peut garantir sa non-fuite dans ce cas. Voir __tests__/redaction.test.ts
// pour un test qui documente explicitement cette limite plutôt que de
// prétendre la résoudre.
function secretVariants(value: string): string[] {
  const variants = new Set<string>([value]);
  // Forme échappée JSON, sans les guillemets englobants ajoutés par
  // JSON.stringify — c'est exactement la transformation subie par une chaîne
  // qui traverse redactObject()'s JSON.stringify(obj).
  variants.add(JSON.stringify(value).slice(1, -1));
  // Forme URL-encodée — couvre les query params et fragments d'URL.
  variants.add(encodeURIComponent(value));
  return [...variants];
}

// ─── Moteur ───────────────────────────────────────────────────────────────────

class SecretRedactionEngine {
  private known: SecretRegistryEntry[] = [];

  /**
   * Enregistre une valeur secrète connue. Ignore silencieusement les valeurs
   * vides/undefined (rien à rédiger) — évite d'avoir à tester la présence
   * partout où l'on enregistre un secret potentiellement absent.
   */
  registerSecret(label: string, value: string | undefined | null): void {
    if (!value || value.length === 0) return;
    // Évite les doublons si la même valeur est enregistrée deux fois.
    if (this.known.some((e) => e.value === value)) return;
    this.known.push({ label, value });
  }

  /** Vide le registre — utilisé entre deux runs dans le même process (tests). */
  reset(): void {
    this.known = [];
  }

  /** Nombre de secrets actuellement enregistrés (diagnostic, jamais les valeurs). */
  registeredCount(): number {
    return this.known.length;
  }

  /** Rédige un texte brut : valeurs connues d'abord (couche 1), puis motifs génériques (couche 2). */
  redact(text: string): string {
    if (!text) return text;
    let out = text;
    // Trier par longueur décroissante : si un secret est une sous-chaîne d'un
    // autre (rare mais possible), le plus long doit être remplacé en premier.
    const sorted = [...this.known].sort((a, b) => b.value.length - a.value.length);
    for (const { label, value } of sorted) {
      for (const variant of secretVariants(value)) {
        if (variant.length > 0 && out.includes(variant)) {
          out = out.split(variant).join(`***REDACTED_${label}***`);
        }
      }
    }
    return applyGenericPatterns(out);
  }

  /**
   * Rédige un objet arbitraire via un aller-retour JSON. Sûr pour tout objet
   * sérialisable (ScenarioResult, RunSummary, Dashboard, payload d'événement).
   * Les valeurs non sérialisables (fonctions, undefined) sont perdues comme
   * avec tout JSON.stringify — comportement attendu pour des artefacts.
   */
  redactObject<T>(obj: T): T {
    const json = JSON.stringify(obj);
    if (json === undefined) return obj;
    const redacted = this.redact(json);
    return JSON.parse(redacted) as T;
  }
}

// Singleton — un seul registre par process, alimenté dès le chargement des
// credentials (core/context.ts) et consulté par tous les reporters + le
// journal d'événements.
export const secretRedactionEngine = new SecretRedactionEngine();
