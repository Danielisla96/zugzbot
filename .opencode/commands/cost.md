---
description: Muestra el desglose de costos, tokens y archivos cambiados de la sesion actual y los ultimos comandos
---

# /cost — Desglose de consumo y productividad

Has sido invocado con el comando `/cost`. Muestra al usuario de forma directa y visual:

## 1. Sesion actual (live)

```json
!`node -e "
const fs = require('fs');
const path = require('path');
const metricsPath = path.resolve('.openspec/.sdd_session_metrics.json');
const statePath = path.resolve('.openspec/sdd_state.json');
if (!fs.existsSync(metricsPath)) { console.log(JSON.stringify({status: 'NO_SESSION', message: 'No hay sesion activa o no se ha registrado consumo.'})); process.exit(0); }
const m = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
const s = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf8')) : {};
const startedAt = m.startedAt || '';
const lastUpdated = m.lastUpdatedAt || '';
const durationMs = startedAt && lastUpdated ? Math.max(0, Date.parse(lastUpdated) - Date.parse(startedAt)) : 0;
const fmtDur = (ms) => { const s = Math.floor(ms/1000); const m = Math.floor(s/60); return m + 'm ' + (s%60) + 's'; };
const fmtCost = (n) => n < 0.001 ? '$' + n.toFixed(5) : n < 1 ? '$' + n.toFixed(4) : '$' + n.toFixed(3);
const fmtInt = (n) => Math.round(n).toLocaleString('en-US');
const out = {
  status: 'ACTIVE',
  contract: m.contractName || 'fast-track',
  sessionId: m.sessionId || 'n/a',
  phase: s.phase || 'unknown',
  startedAt,
  lastUpdated,
  duration: fmtDur(durationMs),
  totals: {
    cost: fmtCost(m.totals.cost || 0),
    tokensIn: fmtInt(m.totals.tokensIn || 0),
    tokensOut: fmtInt(m.totals.tokensOutput || 0),
    messages: fmtInt(m.totals.messages || 0)
  },
  byAgent: Object.entries(m.byAgent || {}).sort((a,b) => (b[1].cost||0)-(a[1].cost||0)).map(([k,v]) => ({agent: k, cost: fmtCost(v.cost||0), tokensIn: fmtInt(v.tokensIn||0), tokensOut: fmtInt(v.tokensOut||0), messages: fmtInt(v.messages||0)}))
};
console.log(JSON.stringify(out, null, 2));
"`
```

## 2. Ultimos 10 changelogs (historial de comandos)

```json
!`node -e "
const fs = require('fs');
const path = require('path');
const idxPath = path.resolve('.openspec/changelog/INDEX.md');
if (!fs.existsSync(idxPath)) { console.log(JSON.stringify({status: 'NO_CHANGELOGS', message: 'Aun no hay changelogs registrados. Corre un /fast o cierra un ciclo SDD.'})); process.exit(0); }
const content = fs.readFileSync(idxPath, 'utf8');
const lines = content.split('\n').filter(l => l.trim().startsWith('|') && !l.startsWith('|---') && !l.startsWith('| Timestamp'));
const entries = lines.slice(0, 10).map(l => {
  const cells = l.split('|').map(c => c.trim()).filter(Boolean);
  return { timestamp: cells[0], command: cells[1], cost: cells[2], files: cells[3], diff: cells[4] };
});
console.log(JSON.stringify({status: 'OK', count: entries.length, entries}, null, 2));
"`
```

## 3. Historial agregado (todas las sesiones cerradas)

```json
!`node -e "
const fs = require('fs');
const path = require('path');
const logPath = path.resolve('.openspec/archive/_sessions.jsonl');
if (!fs.existsSync(logPath)) { console.log(JSON.stringify({status: 'NO_HISTORY', message: 'Aun no hay sesiones cerradas en el archivo de historial.'})); process.exit(0); }
const lines = fs.readFileSync(logPath, 'utf8').split('\n').filter(l => l.trim());
const fmtCost = (n) => n < 0.001 ? '$' + n.toFixed(5) : n < 1 ? '$' + n.toFixed(4) : '$' + n.toFixed(3);
const fmtInt = (n) => Math.round(n).toLocaleString('en-US');
const sessions = lines.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
const totals = sessions.reduce((acc, s) => ({
  cost: acc.cost + (s.cost || 0),
  tokensIn: acc.tokensIn + (s.tokensIn || 0),
  tokensOutput: acc.tokensOutput + (s.tokensOutput || 0),
  messages: acc.messages + (s.messages || 0)
}), {cost:0, tokensIn:0, tokensOutput:0, messages:0});
const top5 = sessions.sort((a,b) => (b.cost||0) - (a.cost||0)).slice(0,5).map(s => ({contract: s.contractName, cost: fmtCost(s.cost||0), messages: fmtInt(s.messages||0), startedAt: s.startedAt}));
console.log(JSON.stringify({status: 'OK', sessionCount: sessions.length, totals: { cost: fmtCost(totals.cost), tokensIn: fmtInt(totals.tokensIn), tokensOutput: fmtInt(totals.tokensOutput), messages: fmtInt(totals.messages) }, top5}, null, 2));
"`
```

## Instrucciones de presentacion

1. **Sesion actual**: muestra el JSON en una tabla markdown clara. Incluye duracion, costo, tokens y mensajes.
2. **Ultimos changelogs**: si hay, muestra una tabla con timestamp, comando, costo, archivos y +/- . Si no hay, indica que aun no hay historial.
3. **Historial agregado**: muestra el top 5 de specs mas caros y los totales historicos.
4. **Veredicto**: cierra con una linea resumida como "Llevas $X.XX gastados en Y sesiones. El comando mas caro fue `<nombre>` ($X.XX).".
5. **Tip pro**: si el usuario lo invoca seguido, sugiere correr `/reset` para limpiar el contexto y empezar fresco sin perder el changelog (que ya esta persistido en `.openspec/changelog/`).