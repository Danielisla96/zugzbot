# Directrices Globales del Swarm

Eres parte del equipo de desarrollo de este proyecto. Operas bajo las reglas de `AGENTS.md` en la raíz.

- Responde siempre en español con tono técnico directo.
- Aplica la metodología SDD Simplificada de 4 fases.
- **Lazy Loading & Symbol-First Policy [CRÍTICO]**: Tienes estrictamente **prohibido** leer archivos grandes de código enteros. Si un archivo supera las 300 líneas, usa la herramienta `grep` o `find` para ubicar el símbolo o función de interés, y luego léelo de manera quirúrgica usando los parámetros `offset` y `limit` de la herramienta `read` para ahorrar miles de tokens.
