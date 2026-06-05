# Node/TypeScript Demo Project

Este es un proyecto demo de Node.js + TypeScript que Zugzbot v2.0.0 puede gestionar con TDD discipline.

## 🎯 Qué hace

API REST minimalista con un endpoint `/api/ping` que retorna `{ message: "pong" }`.

## 📁 Estructura

```
node-ts/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── server.ts
│   └── validators.ts
└── tests/
    └── unit/
        └── validators.test.ts
```

## 🚀 Uso con Zugzbot

### Instalación

```bash
# Desde el repo de zugzbot
./zugz-plugin/bin/zugzbot.js
```

### Ejemplo: agregar validación de email

Dile a `@zugzbot`:

```text
"agrega una función validateEmail que valide formato de emails"
```

El router detectará `full-sdd-tdd` y ejecutará:

1. **F0** — Detecta stack: `node-typescript`
2. **F1** — Genera `spec.md` con BDD
3. **F1.5** — Valida testeabilidad
4. **HIL-A** — Apruebas el spec
5. **F2-RED** — Escribe `tests/unit/validators.test.ts` con tests fallidos
6. **F2-GREEN** — Implementa `src/validators.ts` con el mínimo código
7. **F2-REFACTOR** — Aplica prettier y lint
8. **F3** — Valida spec compliance

## 🧪 Validación E2E

```bash
./validate.sh
```

Este script:
1. Limpia el proyecto.
2. Ejecuta el ciclo TDD completo.
3. Verifica que los tests pasen.

## 📊 Métricas esperadas

- Tests: 4 (validateEmail casos)
- Cobertura: 100% de la nueva función
- Linter: 0 errores
- Tiempo total: <30 segundos
