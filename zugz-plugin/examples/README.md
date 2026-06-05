# Zugzbot v2.0.0 — Examples

Este directorio contiene proyectos demo que demuestran el uso de Zugzbot v2.0.0 en diferentes stacks.

## 📦 Proyectos Disponibles

| Stack | Path | Descripción |
| :--- | :--- | :--- |
| Node/TypeScript | [`node-ts/`](./node-ts/) | API REST con Express + vitest |
| Python | [`python/`](./python/) | CLI con Click + pytest |
| Go | [`go/`](./go/) | HTTP server con go test |
| Rust | [`rust/`](./rust/) | Library con cargo test |
| Google Apps Script | [`gas/`](./gas/) | Web app con clasp |

Cada subdirectorio contiene:
- El proyecto funcional (no más de 50 líneas).
- Un archivo `RUNBOOK.md` con cómo usar Zugzbot sobre él.
- Un script `validate.sh` que ejecuta el ciclo TDD end-to-end.

## 🚀 Quick Start

```bash
# 1. Clona el repo
git clone https://github.com/Danielisla96/zugzbot.git
cd zugzbot/zugz-plugin/examples/node-ts

# 2. Sigue el RUNBOOK.md
cat RUNBOOK.md

# 3. Ejecuta el ciclo TDD
./validate.sh
```

## 🧪 Validación E2E Automatizada

Los tests en `tests/integration/e2e_demo.test.js` simulan el flujo completo:

```
Router classifies → F0 (stack detect) → F1 (spec) → F1.5 (review)
→ HIL-A → F2-RED (tests) → F2-GREEN (impl) → F2-REFACTOR (clean)
→ F3 (validate) → ready for F4/F5
```

87/87 tests pasando.

## 📚 Más Información

- [README principal](../../README.md)
- [Guía rápida](../../ZUGZ.md)
- [Changelog](../../CHANGELOG.md)
- [Reglas de contribución](../../AGENTS.md)
