---
name: sdd-document
description: Generar el documento de referencia canónico del proyecto (README.md en la raíz) consolidando la especificación técnica y el manual de uso en secciones separadas, además de automatizar la creación del mensaje de commit semántico y la actualización quirúrgica de .openspec/CHANGELOG.md. Utilizar antes del archivado final.
license: MIT
compatibility: Requiere un cambio de openspec activo con propuesta, especificación, arquitectura y reporte de verificación completados.
metadata:
  author: zugzbot
  version: "1.2"
  generatedBy: "zugzbot-harness"
---

Generar la documentación técnica consolidada en el archivo README.md de la raíz del proyecto, el mensaje de commit semántico y la actualización de .openspec/CHANGELOG.md.

**Entrada**: El nombre del cambio activo en kebab-case. Si se omite, infiéralo del contexto o solicítelo al usuario.

**Pasos**

1. **Resolver el nombre del cambio activo**

   Si no se provee en el contexto, solicítelo al usuario.

2. **Leer todos los artefactos de origen**

   Lea en orden estricto antes de escribir cualquier documento:
   - `.openspec/changes/<nombre>/proposal.md`
   - `.openspec/changes/<nombre>/specs/spec.md`
   - `.openspec/changes/<nombre>/orchestrator_architecture.md`
   - `.openspec/changes/<nombre>/verification_report.md`
   - Árbol de carpetas bajo `src/` (para entender la estructura real)
   - `README.md` en la raíz (si existe — actualice, no lo reemplace a ciegas)

   **IMPORTANTE**: No genere ningún documento sin haber consumido todas las fuentes. La calidad de la documentación depende de la riqueza del contexto leído.

3. **Generar/Actualizar el `README.md` consolidado**

   Escriba o actualice quirúrgicamente el archivo `README.md` en la raíz del proyecto. Debe estructurarse estrictamente con las siguientes secciones principales:

   - **Información General / Visión Global**:
     - Nombre del proyecto + descripción clara de una sola oración.
     - Qué hace y por qué existe (2–3 oraciones).
     - Fila de badges del stack tecnológico.
     - Estructura de directorios (árbol simplificado de carpetas).

   - **Especificación y Arquitectura Técnica (sección `## 🛠️ Especificación Técnica`)**:
     - Arquitectura del sistema: explicación de capas, límites modulares y responsabilidades.
     - Diagrama de flujo/secuencia en formato Mermaid representativo del flujo de datos real.
     - Catálogo de APIs/Funciones públicas expuestas con firmas exactas, parámetros y respuestas.
     - Decisiones de diseño clave y justificación técnica.
     - Catálogo de dependencias externas añadidas y su propósito específico.
     - Guía de extensión: paso a paso de cómo agregar un nuevo endpoint o módulo compatible.

   - **Manual de Uso e Instalación (sección `## 📖 Manual de Uso / Guía del Usuario`)**:
     - Requisitos de entorno (OS, versiones de runtimes, dependencias globales).
     - Guía detallada de instalación paso a paso (clonar, configurar variables de entorno, levantar servicios).
     - Instrucciones para ejecutar la aplicación localmente y la suite de pruebas locales.
     - Ejemplos reales de consumo con peticiones HTTP/CLI y respuestas JSON exactas (extraídas directamente de `verification_report.md` — no inventes datos).
     - Sección de Troubleshooting con errores comunes del proyecto, causas y soluciones.

   Mínimo 150 líneas en total. Cero placeholders o textos genéricos.

6. **Generar el Mensaje de Commit Semántico**

   Escriba el mensaje de commit convencional e impecable en `.openspec/changes/<nombre>/commit_message.txt`.
   - **Formato Estricto de Conventional Commits (v1.0.0)**:
     ```
     <type>(<scope>): <short description>

     <body>
     - <technical detail 1>
     - <technical detail 2>

     Refs: #<change-name>
     ```
   - **Tipos de commit permitidos**:
     - `feat`: Para nuevas características o adición de servicios.
     - `fix`: Para corrección de fallos.
     - `refactor`: Para mejoras de código limpio o SOLID sin alterar funcionalidad.
     - `docs`: Si únicamente se modificaron archivos de documentación.

7. **Inyección Quirúrgica en `.openspec/CHANGELOG.md`**

   Inyecte el cambio de forma quirúrgica en el archivo `.openspec/CHANGELOG.md`.
   - Si no existe el archivo `.openspec/CHANGELOG.md`, créelo con el formato estándar de **Keep a Changelog**.
   - Busque la sección de desarrollo `## [Unreleased]` del CHANGELOG e inserte la línea agrupada semánticamente:
     - `Added`: Para nuevas funcionalidades (`feat`).
     - `Changed`: Para refactorizaciones o mejoras de arquitectura (`refactor`).
     - `Fixed`: Para correcciones de fallos (`fix`).
   - **Formato de la línea**:
     ```markdown
     - **[<change-name>]**: <short description> (ver sección de especificación técnica en `README.md`).
     ```
   - Garantice no borrar ni alterar otros registros de cambios previos del archivo.

8. **Verificar completitud**

   Confirme que los archivos existan y posean longitud real:
   - `README.md` ≥ 150 líneas (incluyendo manual de uso y especificación técnica)
   - `.openspec/changes/<nombre>/commit_message.txt` estructurado sin firmas de IA.
   - `.openspec/CHANGELOG.md` con la línea inyectada.

9. **Reportar a Zugzbot**

   Genere un resumen estructurado para Zugzbot:
   ```
   ## Fase de Documentación Completada

   **Cambio:** <nombre-del-cambio>

   | Documento | Líneas | Resumen de Contenido |
   |---|---|---|
   | README.md | <n> | Documentación consolidada: Visión Global, Especificación Técnica y Manual de Uso |
   | .openspec/changes/<nombre>/commit_message.txt | <n> | Mensaje de commit semántico convencional (Sin firmas de IA) |
   | .openspec/CHANGELOG.md | <n> | Entrada inyectada bajo la sección correspondiente |

   Fase 7 completada. Documentación y control de versión listos para revisión y aprobación final.
   ```

**Guardrails**
- Prohibido redactar documentación o generar mensajes de commit sin haber consumido todos los artefactos de origen primero.
- Prohibido dejar marcadores de posición ("placeholders") o apartados genéricos vacíos en los archivos de salida.
- **Queda estrictamente prohibida la adición de firmas "Co-Authored-By", marcas de IA, atribuciones de asistentes o nombres de herramientas de automatización en el mensaje de commit generado.** Debe ser puramente convencional y limpio.
- Los comandos de consola y URLs declarados deben corresponder estrictamente con la base de código real.
- Si existe un `README.md` previo, respete el contenido anterior no modificado y actualice/añada las secciones del cambio.
- No cree ningún directorio o archivo en docs/; toda la información técnica y de usuario debe residir en el README.md de la raíz.
- No archive el cambio; el archivado es responsabilidad del orquestador tras la firma final del usuario.
