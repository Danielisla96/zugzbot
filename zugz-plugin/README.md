# Zugzbot SDD Plugin

**Spec-Driven Development Swarm** para OpenCode.

Sistema multi-agente de 6 fases (Explorador → Planner → Builder → Tester → Deployer → Archiver) que guía el desarrollo através de especificaciones aprobadas por el usuario.

---

## Instalación Rápida

```bash
# 1. Instala el paquete:
npm install zugzbot-sdd

# 2. Ejecuta el init:
npx zugzbot-sdd

# 3. Inicia opencode:
opencode

# 4. Invoca al orquestador:
@zugzbot
```

---

## Uso

### Comandos

```bash
./sdd status          # Ver estado actual del ciclo SDD
./sdd reset            # Resetear a Fase 0 (idle)
./sdd autopilot on     # Activar modo automático
./sdd autopilot off    # Desactivar modo automático
./sdd log              # Ver historial de cambios
```

### Flujo SDD

| Fase | Agente | Descripción |
|------|--------|-------------|
| F0 | `@sdd-explorer` | Diagnostica el codebase y detecta stack |
| F1 | `@sdd-planner` | Survey de requerimientos + spec.md |
| F2 | `@sdd-builder` | Implementación según spec |
| F3 | `@sdd-tester` | Validación (linter, auditorías) |
| F4 | `@sdd-deployer` | Deploy y push |
| F5 | `@sdd-archiver` | Cierre: bump, commit, CHANGELOG |

### HIL (Human-In-The-Loop)

- **Post-F1**: Revisión y aprobación del spec.md
- **Post-F4**: QA manual antes de cerrar el ciclo

### Ciclos Correctivos

Si algo sale mal durante el desarrollo:

```
# Ver checkpoints disponibles
@zugzbot checkpoint list

# Restaurar un checkpoint específico
@zugzbot checkpoint restore <id>

# Volver a ejecutar la fase actual
@zugzbot retry

# Retroceder una fase
@zugzbot backward
```

---

## Estructura del Plugin

```
zugzbot-sdd/
├── bin/zugzbot.js       # CLI entry point (init)
├── agents/              # Prompts de agentes (9 archivos)
├── tools/               # Herramientas SDD (16 archivos)
├── plugins/             # Plugins de OpenCode
│   ├── plugin_sdd_core.ts
│   └── plugin_tui.tsx
├── commands/            # Comandos ./sdd
└── sdd                  # Script bash local
```

---

## Configuración

El plugin crea `opencode.json` con todas las referencias a `node_modules/zugzbot-sdd/`. No necesitas copiar archivos manualmente.

Para customizar modelos, edita `zugz-models.json` en la raíz de tu proyecto.

---

## Requisitos

- Node.js >= 18.0.0
- OpenCode instalado

---

## Licencia

MIT - Danielisla96