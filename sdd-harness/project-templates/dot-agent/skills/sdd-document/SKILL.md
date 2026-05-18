---
name: sdd-document
description: Generar los tres documentos canónicos del proyecto (README.md, docs/TECHNICAL.md, docs/USER_GUIDE.md) basándose en todos los artefactos de SDD producidos durante el ciclo de vida del cambio. Utilizar antes del archivado final.
license: MIT
compatibility: Requiere un cambio de openspec activo con propuesta, especificación, arquitectura y reporte de verificación completados.
metadata:
  author: zugzbot
  version: "1.0"
  generatedBy: "zugzbot-harness"
---

Generar los tres archivos de documentación técnica canónica para el proyecto basándose en los artefactos de SDD.

**Entrada**: El nombre del cambio activo en kebab-case. Si se omite, infiéralo del contexto o solicítelo al usuario.

**Pasos**

1. **Resolver el nombre del cambio activo**

   Si no se provee en el contexto, solicítelo al usuario.

2. **Leer todos los artefactos de origen**

   Lea en orden estricto antes de escribir cualquier documento:
   - `openspec/changes/<nombre>/proposal.md`
   - `openspec/changes/<nombre>/specs/spec.md`
   - `openspec/changes/<nombre>/orchestrator_architecture.md`
   - `openspec/changes/<nombre>/verification_report.md`
   - Árbol de carpetas bajo `src/` (para entender la estructura real)
   - `README.md` en la raíz (si existe — actualice, no lo reemplace a ciegas)

   **IMPORTANTE**: No genere ningún documento sin haber consumido todas las fuentes. La calidad de la documentación depende de la riqueza del contexto leído.

3. **Generar/Actualizar `README.md`**

   Escriba o actualice el archivo en la raíz del proyecto. Secciones requeridas:
   - Nombre del proyecto + descripción clara de una sola oración.
   - Qué hace y por qué existe (2–3 oraciones).
   - Fila de badges del stack tecnológico.
   - Guía de inicio rápido ("Quick Start") con comandos mínimos para instalar dependencias, correr la app y correr tests.
   - Estructura de directorios (árbol simplificado de carpetas).
   - Enlaces de navegación a `docs/TECHNICAL.md` y `docs/USER_GUIDE.md`.

   Mínimo 60 líneas. Cero placeholders o textos genéricos.

4. **Generar `docs/TECHNICAL.md`**

   Escriba el archivo en `docs/TECHNICAL.md`. Secciones requeridas:
   - Arquitectura del sistema: explicación de capas, límites modulares y responsabilidades.
   - Diagrama de flujo/secuencia en formato Mermaid representativo del flujo de datos real.
   - Catálogo de APIs/Funciones públicas expuestas con firmas exactas, parámetros y respuestas.
   - Decisiones de diseño clave y justificación técnica.
   - Catálogo de dependencias externas añadidas y su propósito específico.
   - Guía de extensión: paso a paso de cómo agregar un nuevo endpoint o módulo compatible.

   Mínimo 80 líneas. El diagrama Mermaid debe reflejar la interacción real de la aplicación.

5. **Generar `docs/USER_GUIDE.md`**

   Escriba el archivo en `docs/USER_GUIDE.md`. Secciones requeridas:
   - Requisitos de entorno (OS, versiones de runtimes, dependencias globales).
   - Guía detallada de instalación paso a paso (clonar, configurar variables de entorno, levantar servicios).
   - Instrucciones para ejecutar la aplicación localmente.
   - Instrucciones para ejecutar la suite de pruebas locales.
   - Ejemplos reales de consumo con peticiones HTTP/CLI y respuestas JSON exactas (extraídas directamente de `verification_report.md` — no inventes datos).
   - Sección de Troubleshooting con errores comunes del proyecto, causas y soluciones.

   Mínimo 80 líneas. Los comandos deben estar verificados.

6. **Verificar completitud**

   Confirme que los tres archivos existan y posean longitud real:
   - `README.md` ≥ 60 líneas
   - `docs/TECHNICAL.md` ≥ 80 líneas
   - `docs/USER_GUIDE.md` ≥ 80 líneas

   Si algún documento queda incompleto, corríjalo antes de finalizar la fase.

7. **Reportar a Zugzbot**

   Genere un resumen estructurado para Zugzbot:
   ```
   ## Fase de Documentación Completada

   **Cambio:** <nombre-del-cambio>

   | Documento | Líneas | Resumen de Contenido |
   |---|---|---|
   | README.md | <n> | Introducción, Quick Start y árbol de carpetas |
   | docs/TECHNICAL.md | <n> | Arquitectura modular, diagramas Mermaid y contratos |
   | docs/USER_GUIDE.md | <n> | Guía de instalación, ejemplos con curl reales y troubleshooting |

   Fase 5 completada. Los documentos están listos para revisión y aprobación final.
   ```

**Guardrails**
- Prohibido redactar documentación sin haber consumido todos los artefactos de origen primero.
- Prohibido dejar marcadores de posición ("placeholders") o apartados genéricos vacíos en el output.
- Los comandos de consola y URLs declarados deben corresponder estrictamente con la base de código real.
- Si existe un `README.md` previo, respete el contenido anterior no modificado y actualice/añada las secciones del cambio.
- Cree el directorio `docs/` de forma implícita al guardar el path del archivo técnico.
- No archive el cambio; el archivado es responsabilidad del orquestador tras la firma final del usuario.
