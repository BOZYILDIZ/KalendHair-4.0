// Server-only — ne jamais importer depuis du code client ("use client").
// La valeur est évaluée au démarrage du processus (env statique Next.js).
// Changer la valeur nécessite un redémarrage du serveur / un nouveau déploiement.
export const DASHBOARD_V2 = process.env.DASHBOARD_V2 === "true";
