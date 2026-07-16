// ─────────────────────────────────────────────────────────────────────────────
// KalendHair Manus QA — Générateur de dashboard HTML
//
// Lit reports/manus/dashboard.json et génère reports/manus/index.html.
// Aucune dépendance externe. HTML + CSS + JS natif uniquement.
//
// Usage :
//   npx tsx scripts/manus/generate-dashboard.ts
//   npx tsx scripts/manus/generate-dashboard.ts --history   (génère history.html aussi)
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { resolve }                                               from "path";
import { FRAMEWORK_VERSION }                                     from "./core/version";
import { secretRedactionEngine }                                 from "./core/redaction";
import type { EventsSummary }                                    from "./core/sinks/dashboard-sink";
import type { EventSeverity, EventType }                         from "./core/events-schema";

// ─── Données ──────────────────────────────────────────────────────────────────

const DASHBOARD_PATH = resolve(process.cwd(), "reports", "manus", "dashboard.json");
const INDEX_PATH     = resolve(process.cwd(), "reports", "manus", "index.html");
const HISTORY_PATH   = resolve(process.cwd(), "reports", "manus", "history.html");
const REPORTS_DIR    = resolve(process.cwd(), "reports", "manus");

function loadDashboard(): Record<string, unknown> {
  if (!existsSync(DASHBOARD_PATH)) {
    console.error("❌ reports/manus/dashboard.json introuvable. Lancez d'abord un run.");
    process.exit(1);
  }
  return JSON.parse(readFileSync(DASHBOARD_PATH, "utf-8")) as Record<string, unknown>;
}

function listRunDirs(): string[] {
  if (!existsSync(REPORTS_DIR)) return [];
  // Suffixe milliseconde optionnel depuis le correctif Devil's Advocate sur
  // les collisions de runId (utils/date.ts::runId(), core/paths.ts) — les
  // runs historiques (précision seconde) restent reconnus.
  return readdirSync(REPORTS_DIR)
    .filter((f) => /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}(-\d{3})?$/.test(f))
    .sort()
    .reverse();
}

// ─── Runtime Events — agrégation events-summary.json (v2.5.1) ────────────────
//
// Les runs antérieurs à v2.5 (ou tout run réel qui n'a émis aucun événement,
// cas théorique) n'ont pas de events-summary.json — ignorés proprement, pas
// une erreur.

export interface AggregatedRuntimeEvents {
  totalEvents:         number;
  countsByType:        Partial<Record<EventType, number>>;
  countsBySeverity:    Partial<Record<EventSeverity, number>>;
  totalActualCostUsd:  number;
  estimatedCostRanges: string[];
  runsWithEvents:       number;
  runsWithoutEvents:    number;
}

export function loadEventsSummaries(runDirs: string[], reportsDir: string = REPORTS_DIR): EventsSummary[] {
  const summaries: EventsSummary[] = [];
  for (const runId of runDirs) {
    const path = resolve(reportsDir, runId, "events-summary.json");
    if (!existsSync(path)) continue; // run antérieur à v2.5 — ignoré proprement
    try {
      summaries.push(JSON.parse(readFileSync(path, "utf-8")) as EventsSummary);
    } catch {
      continue; // fichier corrompu — ignoré proprement, jamais une erreur bloquante
    }
  }
  return summaries;
}

export function aggregateRuntimeEvents(summaries: EventsSummary[], totalRunDirs: number): AggregatedRuntimeEvents {
  const countsByType:     Partial<Record<EventType, number>>     = {};
  const countsBySeverity: Partial<Record<EventSeverity, number>> = {};
  let totalEvents = 0;
  let totalActualCostUsd = 0;
  const estimatedCostRanges = new Set<string>();

  for (const s of summaries) {
    totalEvents += s.totalEvents ?? 0;
    totalActualCostUsd += s.totalActualCostUsd ?? 0;
    for (const range of s.estimatedCostRanges ?? []) estimatedCostRanges.add(range);
    for (const [type, count] of Object.entries(s.countsByType ?? {})) {
      const key = type as EventType;
      countsByType[key] = (countsByType[key] ?? 0) + (count ?? 0);
    }
    for (const [sev, count] of Object.entries(s.countsBySeverity ?? {})) {
      const key = sev as EventSeverity;
      countsBySeverity[key] = (countsBySeverity[key] ?? 0) + (count ?? 0);
    }
  }

  return {
    totalEvents,
    countsByType,
    countsBySeverity,
    totalActualCostUsd:  Math.round(totalActualCostUsd * 10_000) / 10_000,
    estimatedCostRanges: [...estimatedCostRanges],
    runsWithEvents:      summaries.length,
    runsWithoutEvents:   Math.max(0, totalRunDirs - summaries.length),
  };
}

// ─── Génération du dashboard index.html ──────────────────────────────────────

export function generateDashboard(dashboard: Record<string, unknown>, runDirs: string[], runtimeEvents: AggregatedRuntimeEvents): string {
  const data = JSON.stringify(dashboard);
  const runs = JSON.stringify(runDirs);
  // Garantie explicite : même si les compteurs agrégés ne contiennent que des
  // nombres/libellés (aucun texte libre issu d'un payload), on repasse par le
  // moteur de redaction avant embarquement HTML — pas de confiance implicite
  // dans l'amont, cohérent avec le reste du framework (v2.4).
  const events = JSON.stringify(secretRedactionEngine.redactObject(runtimeEvents));

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>KalendHair — Manus QA Dashboard</title>
<style>
  :root {
    --bg: #0d1117; --surface: #161b22; --border: #30363d;
    --text: #e6edf3; --muted: #8b949e; --accent: #58a6ff;
    --green: #3fb950; --red: #f85149; --yellow: #d29922;
    --blue: #388bfd; --purple: #a5d6ff;
    --card-bg: #1c2128; --radius: 8px;
    --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --mono: 'SFMono-Regular', Consolas, monospace;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--text); font-family: var(--font); font-size: 14px; line-height: 1.6; }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }

  .header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 16px 24px; display: flex; align-items: center; gap: 12px; }
  .header h1 { font-size: 16px; font-weight: 600; }
  .header .version { font-size: 11px; color: var(--muted); background: var(--border); padding: 2px 8px; border-radius: 20px; }
  .header .spacer { flex: 1; }
  .header .timestamp { font-size: 12px; color: var(--muted); }

  .main { max-width: 1200px; margin: 0 auto; padding: 24px; }

  .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 24px; }
  .kpi { background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; }
  .kpi .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 8px; }
  .kpi .value { font-size: 28px; font-weight: 700; line-height: 1; font-variant-numeric: tabular-nums; }
  .kpi .sub { font-size: 12px; color: var(--muted); margin-top: 4px; }
  .kpi.green .value { color: var(--green); }
  .kpi.red .value { color: var(--red); }
  .kpi.blue .value { color: var(--accent); }
  .kpi.yellow .value { color: var(--yellow); }

  .score-bar-wrap { background: var(--border); border-radius: 4px; height: 6px; margin-top: 8px; overflow: hidden; }
  .score-bar { height: 100%; border-radius: 4px; transition: width 0.6s ease; }

  .verdict-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .verdict-badge.ready { background: rgba(63,185,80,.15); color: var(--green); border: 1px solid rgba(63,185,80,.3); }
  .verdict-badge.block { background: rgba(248,81,73,.15); color: var(--red); border: 1px solid rgba(248,81,73,.3); }

  .section { margin-bottom: 24px; }
  .section-title { font-size: 13px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
  .section-title::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  .chart-wrap { background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; }
  canvas { width: 100% !important; }

  .run-table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; padding: 10px 12px; background: var(--surface); color: var(--muted); font-weight: 500; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid var(--border); position: sticky; top: 0; }
  td { padding: 10px 12px; border-bottom: 1px solid var(--border); vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(255,255,255,0.02); }

  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
  .badge.ready { background: rgba(63,185,80,.15); color: var(--green); }
  .badge.block { background: rgba(248,81,73,.15); color: var(--red); }

  .score-pill { display: inline-flex; align-items: center; gap: 6px; font-variant-numeric: tabular-nums; }
  .mini-bar { display: inline-block; width: 40px; height: 4px; border-radius: 2px; background: var(--border); vertical-align: middle; overflow: hidden; }
  .mini-bar-fill { height: 100%; border-radius: 2px; }

  .filters { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
  .filter-btn { padding: 4px 12px; border-radius: 20px; border: 1px solid var(--border); background: var(--surface); color: var(--muted); cursor: pointer; font-size: 12px; transition: all 0.15s; }
  .filter-btn.active, .filter-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(88,166,255,.08); }

  .trend { font-size: 12px; }
  .trend.up { color: var(--green); }
  .trend.down { color: var(--red); }
  .trend.stable { color: var(--muted); }

  .links-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .link-btn { font-size: 11px; padding: 3px 10px; border-radius: 4px; border: 1px solid var(--border); color: var(--muted); transition: all 0.15s; }
  .link-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(88,166,255,.08); }

  .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .stat-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
  .stat-row:last-child { border-bottom: none; }
  .stat-row .stat-label { color: var(--muted); }
  .stat-row .stat-val { font-weight: 600; font-variant-numeric: tabular-nums; }

  .two-col { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
  @media (max-width: 768px) { .two-col { grid-template-columns: 1fr; } }

  .empty { text-align: center; padding: 40px; color: var(--muted); }
</style>
</head>
<body>
<div class="header">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
  <h1>KalendHair — Manus QA Dashboard</h1>
  <span class="version" id="fw-version">v${FRAMEWORK_VERSION}</span>
  <div class="spacer"></div>
  <span class="timestamp" id="last-updated"></span>
</div>

<div class="main">
  <!-- KPIs -->
  <div class="kpi-grid" id="kpi-grid"></div>

  <!-- Score chart + Stats -->
  <div class="two-col">
    <div class="section">
      <div class="section-title">Évolution du score QA</div>
      <div class="chart-wrap"><canvas id="score-chart" height="160"></canvas></div>
    </div>
    <div class="section">
      <div class="section-title">Statistiques globales</div>
      <div class="chart-wrap" id="stats-panel"></div>
    </div>
  </div>

  <!-- Filters + Runs table -->
  <div class="section">
    <div class="section-title">Historique des runs</div>
    <div class="filters" id="filters">
      <button class="filter-btn active" data-filter="all">Tous</button>
      <button class="filter-btn" data-filter="ready">READY_FOR_MERGE</button>
      <button class="filter-btn" data-filter="block">BLOCK_MERGE</button>
    </div>
    <div class="run-table-wrap">
      <table id="runs-table">
        <thead>
          <tr>
            <th>Run ID</th><th>Date</th><th>Score</th><th>Verdict</th>
            <th>Scénarios</th><th>Console</th><th>Réseau</th><th>Durée</th><th>Liens</th>
          </tr>
        </thead>
        <tbody id="runs-body"></tbody>
      </table>
    </div>
  </div>

  <!-- Runtime Events (v2.5.1 — DashboardSink) -->
  <div class="section">
    <div class="section-title">Runtime Events</div>
    <div id="runtime-events-panel"></div>
  </div>
</div>

<script>
const DASHBOARD = ${data};
const RUN_DIRS = ${runs};
const RUNTIME_EVENTS = ${events};

function scoreColor(s) {
  return s >= 80 ? '#3fb950' : s >= 60 ? '#d29922' : '#f85149';
}
function formatDuration(ms) {
  if (!ms) return '—';
  if (ms < 60000) return (ms/1000).toFixed(1) + 's';
  return Math.floor(ms/60000) + 'm ' + Math.floor((ms%60000)/1000) + 's';
}
function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', {day:'2-digit',month:'2-digit'}) + ' ' +
         d.toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'});
}

// ── KPIs ─────────────────────────────────────────────────────────────────────
function renderKPIs() {
  const h = DASHBOARD.history || [];
  const s = DASHBOARD.stats || {};
  const latest = h[0] || {};
  const prev   = h[1] || {};
  const delta  = latest.score !== undefined && prev.score !== undefined
                 ? latest.score - prev.score : null;
  const deltaStr = delta === null ? '' : (delta >= 0 ? '+' + delta : '' + delta);
  const deltaColor = delta === null ? '' : delta >= 0 ? 'var(--green)' : 'var(--red)';

  const readyCount = h.filter(r => r.verdict === 'READY_FOR_MERGE').length;
  const totalRuns  = h.length;

  document.getElementById('kpi-grid').innerHTML = [
    {cls:'blue', label:'Score actuel', val: latest.score ?? '—', sub: deltaStr ? '<span style="color:'+deltaColor+'">' + deltaStr + ' vs précédent</span>' : 'Premier run'},
    {cls: latest.verdict === 'READY_FOR_MERGE' ? 'green' : 'red', label:'Verdict', val: latest.verdict === 'READY_FOR_MERGE' ? '✅ READY' : '🚫 BLOCK', sub: 'Seuil : 80/100'},
    {cls:'blue', label:'Runs totaux', val: totalRuns, sub: readyCount + ' READY / ' + (totalRuns - readyCount) + ' BLOCK'},
    {cls:'blue', label:'Score moyen', val: s.averageScore ? s.averageScore.toFixed(1) : '—', sub: 'Sur ' + totalRuns + ' runs'},
    {cls:'green', label:'Meilleur score', val: s.bestScore ?? '—', sub: 'All time'},
    {cls:'red', label:'Pire score', val: s.worstScore ?? 0, sub: 'All time'},
    {cls:'yellow', label:'Durée moyenne', val: formatDuration(s.avgDurationMs), sub: 'Par run complet'},
    {cls:'blue', label:'Tendance', val: s.trend === 'improving' ? '↑' : s.trend === 'degrading' ? '↓' : '→', sub: s.trendLabel || ''},
  ].map(k => \`
    <div class="kpi \${k.cls}">
      <div class="label">\${k.label}</div>
      <div class="value">\${k.val}</div>
      <div class="sub">\${k.sub}</div>
      \${k.label === 'Score actuel' ? \`<div class="score-bar-wrap"><div class="score-bar" style="width:\${Math.min(latest.score||0,100)}%;background:\${scoreColor(latest.score||0)}"></div></div>\` : ''}
    </div>
  \`).join('');
}

// ── Score Chart (SVG sparkline) ───────────────────────────────────────────────
function renderChart() {
  const canvas = document.getElementById('score-chart');
  const history = [...(DASHBOARD.history || [])].reverse();
  if (history.length === 0) { canvas.parentElement.innerHTML = '<div class="empty">Aucun run</div>'; return; }

  const W = canvas.parentElement.clientWidth - 32;
  const H = 160;
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const pad = { t:16, r:8, b:28, l:32 };
  const gW  = W - pad.l - pad.r;
  const gH  = H - pad.t - pad.b;
  const max = 100, min = 0;

  const xs = history.map((_, i) => pad.l + (i / Math.max(history.length-1, 1)) * gW);
  const ys = history.map(e => pad.t + gH - ((e.score - min) / (max - min)) * gH);

  // Grid lines
  ctx.strokeStyle = '#30363d'; ctx.lineWidth = 0.5;
  [0,20,40,60,80,100].forEach(v => {
    const y = pad.t + gH - (v/100)*gH;
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W-pad.r, y); ctx.stroke();
    ctx.fillStyle = '#8b949e'; ctx.font = '10px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(v, pad.l - 6, y + 3);
  });

  // Threshold line (80)
  const ty = pad.t + gH - 0.8*gH;
  ctx.strokeStyle = 'rgba(63,185,80,0.4)'; ctx.lineWidth = 1; ctx.setLineDash([4,4]);
  ctx.beginPath(); ctx.moveTo(pad.l, ty); ctx.lineTo(W-pad.r, ty); ctx.stroke();
  ctx.setLineDash([]);

  // Area fill
  if (xs.length > 1) {
    const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t+gH);
    grad.addColorStop(0, 'rgba(88,166,255,0.3)');
    grad.addColorStop(1, 'rgba(88,166,255,0.02)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(xs[0], pad.t+gH);
    xs.forEach((x,i) => ctx.lineTo(x, ys[i]));
    ctx.lineTo(xs[xs.length-1], pad.t+gH);
    ctx.closePath(); ctx.fill();
  }

  // Line
  ctx.strokeStyle = '#58a6ff'; ctx.lineWidth = 2; ctx.beginPath();
  xs.forEach((x,i) => i === 0 ? ctx.moveTo(x,ys[i]) : ctx.lineTo(x,ys[i]));
  ctx.stroke();

  // Dots
  xs.forEach((x,i) => {
    const e = history[i];
    ctx.beginPath(); ctx.arc(x, ys[i], 3, 0, Math.PI*2);
    ctx.fillStyle = scoreColor(e.score); ctx.fill();
  });

  // X labels (dates, max 8)
  ctx.fillStyle = '#8b949e'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
  const step = Math.max(1, Math.floor(history.length / 6));
  history.forEach((e,i) => {
    if (i % step !== 0 && i !== history.length-1) return;
    const d = new Date(e.date);
    const label = (d.getMonth()+1)+'/'+d.getDate();
    ctx.fillText(label, xs[i], H-6);
  });
}

// ── Stats panel ───────────────────────────────────────────────────────────────
function renderStats() {
  const s = DASHBOARD.stats || {};
  const h = DASHBOARD.history || [];
  const readyPct = h.length ? Math.round(h.filter(r=>r.verdict==='READY_FOR_MERGE').length/h.length*100) : 0;
  document.getElementById('stats-panel').innerHTML = \`
    <div class="stat-row"><span class="stat-label">Runs totaux</span><span class="stat-val">\${s.totalRuns||0}</span></div>
    <div class="stat-row"><span class="stat-label">Score moyen</span><span class="stat-val">\${(s.averageScore||0).toFixed(1)}/100</span></div>
    <div class="stat-row"><span class="stat-label">Meilleur score</span><span class="stat-val" style="color:var(--green)">\${s.bestScore||0}/100</span></div>
    <div class="stat-row"><span class="stat-label">Pire score</span><span class="stat-val" style="color:var(--red)">\${s.worstScore||0}/100</span></div>
    <div class="stat-row"><span class="stat-label">Taux READY</span><span class="stat-val">\${readyPct}%</span></div>
    <div class="stat-row"><span class="stat-label">Durée moyenne</span><span class="stat-val">\${formatDuration(s.avgDurationMs)}</span></div>
    <div class="stat-row"><span class="stat-label">Tendance</span><span class="stat-val">\${s.trendLabel||'—'}</span></div>
  \`;
}

// ── Runs table ────────────────────────────────────────────────────────────────
let currentFilter = 'all';
function renderTable(filter) {
  currentFilter = filter;
  const history = DASHBOARD.history || [];
  const rows = history.filter(r => {
    if (filter === 'ready') return r.verdict === 'READY_FOR_MERGE';
    if (filter === 'block') return r.verdict === 'BLOCK_MERGE';
    return true;
  });
  const tbody = document.getElementById('runs-body');
  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="empty">Aucun run correspondant</td></tr>';
    return;
  }
  const hasDir = id => RUN_DIRS.includes(id);
  tbody.innerHTML = rows.map((r,i) => {
    const color = scoreColor(r.score);
    const isReady = r.verdict === 'READY_FOR_MERGE';
    return \`
      <tr>
        <td><code style="font-size:11px;color:var(--muted)">\${r.runId}</code></td>
        <td>\${formatDate(r.date)}</td>
        <td>
          <span class="score-pill">
            <span style="font-weight:700;color:\${color};font-variant-numeric:tabular-nums">\${r.score}</span>
            <span class="mini-bar"><span class="mini-bar-fill" style="width:\${r.score}%;background:\${color}"></span></span>
          </span>
        </td>
        <td><span class="badge \${isReady?'ready':'block'}">\${isReady?'READY':'BLOCK'}</span></td>
        <td>\${r.passedScenarios}✅ \${r.failedScenarios}❌ <span style="color:var(--muted)">/ \${r.totalScenarios}</span></td>
        <td>\${r.consoleErrors > 0 ? '<span style="color:var(--red)">'+r.consoleErrors+'</span>' : '<span style="color:var(--muted)">0</span>'}</td>
        <td>\${r.networkErrors > 0 ? '<span style="color:var(--red)">'+r.networkErrors+'</span>' : '<span style="color:var(--muted)">0</span>'}</td>
        <td style="color:var(--muted)">\${formatDuration(r.durationMs)}</td>
        <td>
          <div class="links-row">
            \${hasDir(r.runId) ? \`<a class="link-btn" href="\${r.runId}/report.md">MD</a><a class="link-btn" href="\${r.runId}/report.json">JSON</a>\` : '<span style="color:var(--muted);font-size:11px">—</span>'}
          </div>
        </td>
      </tr>
    \`;
  }).join('');
}

// ── Runtime Events (v2.5.1 — DashboardSink) ───────────────────────────────────
function severityColor(sev) {
  return sev === 'CRITICAL' ? 'var(--red)' : sev === 'ERROR' ? 'var(--red)' :
         sev === 'WARN' ? 'var(--yellow)' : 'var(--muted)';
}
function renderRuntimeEvents() {
  const panel = document.getElementById('runtime-events-panel');
  const re = RUNTIME_EVENTS;

  if (!re || re.totalEvents === 0) {
    const note = re && re.runsWithoutEvents > 0
      ? \`Aucune donnée Runtime Events disponible — \${re.runsWithoutEvents} run(s) antérieur(s) à la journalisation d'événements (v2.5).\`
      : 'Aucune donnée Runtime Events disponible pour le moment.';
    panel.innerHTML = \`<div class="chart-wrap"><div class="empty">\${note}</div></div>\`;
    return;
  }

  const byType = re.countsByType || {};
  const bySeverity = re.countsBySeverity || {};
  const notable = ['SAFE_MODE_BLOCKED', 'PERMISSION_DENIED', 'NETWORK_REQUEST', 'NETWORK_RESPONSE'];

  const kpiCards = [
    { l: 'Total événements', v: re.totalEvents, c: 'var(--accent)' },
    { l: 'SAFE_MODE_BLOCKED', v: byType['SAFE_MODE_BLOCKED'] || 0, c: (byType['SAFE_MODE_BLOCKED'] || 0) > 0 ? 'var(--red)' : 'var(--green)' },
    { l: 'PERMISSION_DENIED', v: byType['PERMISSION_DENIED'] || 0, c: (byType['PERMISSION_DENIED'] || 0) > 0 ? 'var(--yellow)' : 'var(--green)' },
    { l: 'NETWORK_REQUEST', v: byType['NETWORK_REQUEST'] || 0, c: 'var(--accent)' },
    { l: 'NETWORK_RESPONSE', v: byType['NETWORK_RESPONSE'] || 0, c: 'var(--accent)' },
    { l: 'Coût réel cumulé', v: '$' + (re.totalActualCostUsd || 0).toFixed(4), c: 'var(--green)' },
  ];

  const typeRows = Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => \`
      <div class="stat-row">
        <span class="stat-label">\${type}\${notable.includes(type) ? ' <span style="color:var(--accent)">●</span>' : ''}</span>
        <span class="stat-val">\${count}</span>
      </div>\`).join('');

  const severityRows = Object.entries(bySeverity)
    .map(([sev, count]) => \`
      <div class="stat-row">
        <span class="stat-label" style="color:\${severityColor(sev)}">\${sev}</span>
        <span class="stat-val">\${count}</span>
      </div>\`).join('');

  const estimatedRanges = (re.estimatedCostRanges || []).length > 0
    ? re.estimatedCostRanges.join(', ')
    : '—';

  panel.innerHTML = \`
    <div class="kpi-grid" style="margin-bottom:16px">
      \${kpiCards.map(k => \`
        <div class="kpi">
          <div class="label">\${k.l}</div>
          <div class="value" style="color:\${k.c}">\${k.v}</div>
        </div>\`).join('')}
    </div>
    <div class="two-col">
      <div class="chart-wrap">
        <div class="label" style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:8px">Répartition par type</div>
        \${typeRows || '<div class="empty">—</div>'}
      </div>
      <div class="chart-wrap">
        <div class="label" style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:8px">Répartition par sévérité</div>
        \${severityRows || '<div class="empty">—</div>'}
        <div class="stat-row" style="margin-top:8px;border-top:1px solid var(--border);padding-top:8px">
          <span class="stat-label">Estimations de coût rencontrées</span>
        </div>
        <div style="font-size:12px;color:var(--muted);padding-top:4px">\${estimatedRanges}</div>
      </div>
    </div>
    <div style="font-size:11px;color:var(--muted);margin-top:8px">
      \${re.runsWithEvents} run(s) avec données Runtime Events\${re.runsWithoutEvents > 0 ? \` · \${re.runsWithoutEvents} run(s) antérieur(s) sans ces données\` : ''}
    </div>
  \`;
}

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const ts = DASHBOARD.lastUpdated;
  document.getElementById('last-updated').textContent = ts ? 'Mis à jour ' + formatDate(ts) : '';

  renderKPIs();
  renderStats();
  renderChart();
  renderTable('all');
  renderRuntimeEvents();

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTable(btn.dataset.filter);
    });
  });
});
window.addEventListener('resize', renderChart);
</script>
</body>
</html>`;
}

// ─── Génération history.html ──────────────────────────────────────────────────

function generateHistory(dashboard: Record<string, unknown>): string {
  const data = JSON.stringify(dashboard);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>KalendHair — QA History</title>
<style>
  :root {
    --bg:#0d1117;--surface:#161b22;--border:#30363d;--text:#e6edf3;
    --muted:#8b949e;--accent:#58a6ff;--green:#3fb950;--red:#f85149;
    --yellow:#d29922;--card:#1c2128;--radius:8px;
    --font:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--bg);color:var(--text);font-family:var(--font);font-size:14px;line-height:1.6}
  a{color:var(--accent)}
  .header{background:var(--surface);border-bottom:1px solid var(--border);padding:16px 24px;display:flex;align-items:center;gap:12px}
  .header h1{font-size:16px;font-weight:600}
  .main{max-width:1100px;margin:0 auto;padding:24px}
  .section-title{font-size:13px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px;display:flex;align-items:center;gap:8px}
  .section-title::after{content:'';flex:1;height:1px;background:var(--border)}
  .section{margin-bottom:32px}
  .chart-wrap{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:16px}
  canvas{width:100%!important}
  .stats-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:24px}
  .stat-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:14px}
  .stat-card .label{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:6px}
  .stat-card .val{font-size:22px;font-weight:700;font-variant-numeric:tabular-nums}
  .windows{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:24px}
  @media(max-width:700px){.windows{grid-template-columns:1fr}}
  .window-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:14px}
  .window-card .title{font-size:12px;font-weight:600;color:var(--muted);margin-bottom:10px}
  .w-stat{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border);font-size:13px}
  .w-stat:last-child{border-bottom:none}
  .w-stat .wk{color:var(--muted)}
  .w-stat .wv{font-weight:600;font-variant-numeric:tabular-nums}
</style>
</head>
<body>
<div class="header">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  <h1>KalendHair — QA Historique avancé</h1>
  <span style="font-size:11px;color:var(--muted);background:var(--border);padding:2px 8px;border-radius:20px">v${FRAMEWORK_VERSION}</span>
</div>
<div class="main">
  <div class="stats-cards" id="stats-cards"></div>
  <div class="windows" id="windows"></div>
  <div class="section">
    <div class="section-title">Évolution du score sur 30 runs</div>
    <div class="chart-wrap"><canvas id="chart30" height="180"></canvas></div>
  </div>
  <div class="section">
    <div class="section-title">Évolution du score — 7 derniers runs</div>
    <div class="chart-wrap"><canvas id="chart7" height="140"></canvas></div>
  </div>
</div>
<script>
const D = ${data};
const H = [...(D.history||[])].reverse();
const S = D.stats||{};

function scoreColor(s){return s>=80?'#3fb950':s>=60?'#d29922':'#f85149'}
function fDur(ms){if(!ms)return'—';if(ms<60000)return(ms/1000).toFixed(1)+'s';return Math.floor(ms/60000)+'m '+Math.floor((ms%60000)/1000)+'s'}
function fDate(iso){if(!iso)return'—';const d=new Date(iso);return(d.getMonth()+1)+'/'+d.getDate()+' '+d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}

function movingAvg(arr,n){return arr.map((_,i)=>{const slice=arr.slice(Math.max(0,i-n+1),i+1);return slice.reduce((a,b)=>a+b,0)/slice.length})}

function renderStatCards(){
  const last7=H.slice(-7);const last30=H.slice(-30);
  const avg7=last7.length?last7.reduce((s,e)=>s+e.score,0)/last7.length:0;
  const avg30=last30.length?last30.reduce((s,e)=>s+e.score,0)/last30.length:0;
  const best=Math.max(...H.map(e=>e.score));
  const worst=Math.min(...H.map(e=>e.score));
  const readyPct=H.length?Math.round(H.filter(e=>e.verdict==='READY_FOR_MERGE').length/H.length*100):0;
  const avgDur=H.length?H.reduce((s,e)=>s+(e.durationMs||0),0)/H.length:0;
  document.getElementById('stats-cards').innerHTML=[
    {l:'Runs totaux',v:H.length,c:'var(--accent)'},
    {l:'Moy. mobile 7 runs',v:avg7.toFixed(1)+'/100',c:scoreColor(avg7)},
    {l:'Moy. mobile 30 runs',v:avg30.toFixed(1)+'/100',c:scoreColor(avg30)},
    {l:'Meilleur score',v:best+'/100',c:'var(--green)'},
    {l:'Pire score',v:worst+'/100',c:'var(--red)'},
    {l:'Taux READY',v:readyPct+'%',c:readyPct>=70?'var(--green)':'var(--red)'},
    {l:'Durée moyenne',v:fDur(avgDur),c:'var(--accent)'},
    {l:'Tendance',v:S.trendLabel||'—',c:'var(--muted)'},
  ].map(k=>\`<div class="stat-card"><div class="label">\${k.l}</div><div class="val" style="color:\${k.c}">\${k.v}</div></div>\`).join('');
}

function renderWindows(){
  function windowStats(runs){
    if(!runs.length)return{avg:'—',best:'—',worst:'—',readyPct:'—'};
    const avg=runs.reduce((s,e)=>s+e.score,0)/runs.length;
    return{
      avg:avg.toFixed(1)+'/100',
      best:Math.max(...runs.map(e=>e.score))+'/100',
      worst:Math.min(...runs.map(e=>e.score))+'/100',
      readyPct:Math.round(runs.filter(e=>e.verdict==='READY_FOR_MERGE').length/runs.length*100)+'%'
    };
  }
  const w7=windowStats(H.slice(-7));
  const w30=windowStats(H.slice(-30));
  const wAll=windowStats(H);
  document.getElementById('windows').innerHTML=[
    {t:'7 derniers runs',s:w7},{t:'30 derniers runs',s:w30},{t:'Tous les runs',s:wAll}
  ].map(w=>\`
    <div class="window-card">
      <div class="title">\${w.t}</div>
      <div class="w-stat"><span class="wk">Score moyen</span><span class="wv">\${w.s.avg}</span></div>
      <div class="w-stat"><span class="wk">Meilleur</span><span class="wv">\${w.s.best}</span></div>
      <div class="w-stat"><span class="wk">Pire</span><span class="wv">\${w.s.worst}</span></div>
      <div class="w-stat"><span class="wk">Taux READY</span><span class="wv">\${w.s.readyPct}</span></div>
    </div>
  \`).join('');
}

function drawChart(canvasId,runs){
  const canvas=document.getElementById(canvasId);
  if(!runs.length){canvas.parentElement.innerHTML='<div style="text-align:center;padding:40px;color:var(--muted)">Données insuffisantes</div>';return}
  const W=canvas.parentElement.clientWidth-32;const H=parseInt(canvas.height)||160;
  canvas.width=W;
  const ctx=canvas.getContext('2d');
  const pad={t:16,r:8,b:28,l:36};
  const gW=W-pad.l-pad.r;const gH=H-pad.t-pad.b;

  const scores=runs.map(e=>e.score);
  const ma7=movingAvg(scores,Math.min(7,runs.length));

  const xs=runs.map((_,i)=>pad.l+(i/Math.max(runs.length-1,1))*gW);
  const ys=scores.map(s=>pad.t+gH-(s/100)*gH);
  const yMa=ma7.map(s=>pad.t+gH-(s/100)*gH);

  // Grid
  ctx.strokeStyle='#30363d';ctx.lineWidth=0.5;
  [0,20,40,60,80,100].forEach(v=>{
    const y=pad.t+gH-(v/100)*gH;
    ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(W-pad.r,y);ctx.stroke();
    ctx.fillStyle='#8b949e';ctx.font='10px sans-serif';ctx.textAlign='right';
    ctx.fillText(v,pad.l-6,y+3);
  });

  // Threshold
  const ty=pad.t+gH-0.8*gH;
  ctx.strokeStyle='rgba(63,185,80,.4)';ctx.lineWidth=1;ctx.setLineDash([4,4]);
  ctx.beginPath();ctx.moveTo(pad.l,ty);ctx.lineTo(W-pad.r,ty);ctx.stroke();
  ctx.setLineDash([]);

  // Area
  if(xs.length>1){
    const g=ctx.createLinearGradient(0,pad.t,0,pad.t+gH);
    g.addColorStop(0,'rgba(88,166,255,.2)');g.addColorStop(1,'rgba(88,166,255,.01)');
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(xs[0],pad.t+gH);
    xs.forEach((x,i)=>ctx.lineTo(x,ys[i]));
    ctx.lineTo(xs[xs.length-1],pad.t+gH);ctx.closePath();ctx.fill();
  }

  // Score line
  ctx.strokeStyle='rgba(88,166,255,.5)';ctx.lineWidth=1.5;ctx.beginPath();
  xs.forEach((x,i)=>i===0?ctx.moveTo(x,ys[i]):ctx.lineTo(x,ys[i]));
  ctx.stroke();

  // Moving avg line
  if(xs.length>2){
    ctx.strokeStyle='#d29922';ctx.lineWidth=2;ctx.beginPath();
    xs.forEach((x,i)=>i===0?ctx.moveTo(x,yMa[i]):ctx.lineTo(x,yMa[i]));
    ctx.stroke();
  }

  // Dots
  xs.forEach((x,i)=>{
    ctx.beginPath();ctx.arc(x,ys[i],3,0,Math.PI*2);
    ctx.fillStyle=scoreColor(scores[i]);ctx.fill();
  });

  // X labels
  ctx.fillStyle='#8b949e';ctx.font='10px sans-serif';ctx.textAlign='center';
  const step=Math.max(1,Math.floor(runs.length/6));
  runs.forEach((e,i)=>{
    if(i%step!==0&&i!==runs.length-1)return;
    const d=new Date(e.date);
    ctx.fillText((d.getMonth()+1)+'/'+(d.getDate()),xs[i],H-6);
  });

  // Legend
  ctx.fillStyle='rgba(88,166,255,.7)';ctx.fillRect(W-80,pad.t,12,3);
  ctx.fillStyle='#8b949e';ctx.font='10px sans-serif';ctx.textAlign='left';
  ctx.fillText('Score',W-65,pad.t+5);
  ctx.fillStyle='#d29922';ctx.fillRect(W-80,pad.t+12,12,3);
  ctx.fillText('Moy. mobile',W-65,pad.t+17);
}

document.addEventListener('DOMContentLoaded',()=>{
  renderStatCards();
  renderWindows();
  drawChart('chart30',H.slice(-30));
  drawChart('chart7',H.slice(-7));
});
window.addEventListener('resize',()=>{
  drawChart('chart30',H.slice(-30));
  drawChart('chart7',H.slice(-7));
});
</script>
</body>
</html>`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
//
// Gardé derrière import.meta.url (comme analysis/auto-audit.ts) : ce module
// exporte des fonctions pures (loadEventsSummaries, aggregateRuntimeEvents)
// désormais testées unitairement (__tests__/generate-dashboard.test.ts) — un
// simple `import` ne doit jamais déclencher l'écriture du dashboard réel.

if (import.meta.url === `file://${process.argv[1]}`) {
  const dashboard = loadDashboard();
  const runDirs   = listRunDirs();

  // Runtime Events — agrège events-summary.json sur tous les runs qui en possèdent un.
  const eventsSummaries = loadEventsSummaries(runDirs);
  const runtimeEvents   = aggregateRuntimeEvents(eventsSummaries, runDirs.length);
  if (eventsSummaries.length > 0) {
    console.log(`ℹ️  Runtime Events : ${eventsSummaries.length}/${runDirs.length} run(s) avec données (${runtimeEvents.totalEvents} événements agrégés)`);
  }

  // index.html
  const indexHtml = generateDashboard(dashboard, runDirs, runtimeEvents);
  writeFileSync(INDEX_PATH, indexHtml, "utf-8");
  console.log(`✅ Dashboard → ${INDEX_PATH}`);

  // history.html (toujours généré)
  const historyHtml = generateHistory(dashboard);
  writeFileSync(HISTORY_PATH, historyHtml, "utf-8");
  console.log(`✅ History   → ${HISTORY_PATH}`);
}
