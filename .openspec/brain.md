# 🧠 Zugzbot Brain - Lecciones Aprendidas

## 🚀 Lecciones Técnicas
- **SolidJS en TUI**: La integración de SolidJS con el motor TUI de OpenCode requiere un manejo cuidadoso de los slots para asegurar que la reactividad no afecte el rendimiento del renderizado en terminal.
- **FS Polling vs Events**: Aunque OpenCode emite eventos de actualización de sesión, realizar un respaldo de lectura directa del sistema de archivos (`node:fs/promises`) es vital para la consistencia del Monitor de Costos.

## 🐛 Bugs Solucionados
- **Parsing de Títulos**: Se corrigió un problema donde los títulos de sesión con caracteres especiales rompían el agregador de agentes. Se implementó un regex más robusto en `lib/aggregator.ts`.
- **Rutas de Telemetría**: Las rutas de cuotas en macOS/Darwin difieren de Linux; se abstrajo la lógica en `lib/paths.ts` usando `process.platform`.
