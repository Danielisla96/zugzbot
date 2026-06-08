---
description: Administra el archivo .gitignore del proyecto interactiva e inteligentemente, detectando y clasificando archivos y carpetas no trackeados.
agent: aux-handyman
subtask: false
model: deepseek/deepseek-v4-flash
---

El desarrollador ha solicitado optimizar/actualizar el archivo `.gitignore` del proyecto.

## Pasos obligatorios:

1. **Cargar el skill de Gitignore Manager:**
   - Invoca `skill({ name: "sdd-gitignore-manager" })` para entender las reglas de clasificación y el flujo.

2. **Analizar el Repositorio:**
   - Ejecuta `sdd_git_awareness` con `action: "status"` para identificar todos los archivos y carpetas no trackeados (`??`).

3. **Clasificar y Preguntar:**
   - Clasifica los archivos detectados en temporales/generados frente a código de producción.
   - Utiliza la herramienta `question` para mostrar un modal interactivo multi-selección (`is_multi_select: true`) al usuario. Las opciones que representan cachés, temporales o entornos deben estar pre-seleccionadas/sugeridas por defecto.

4. **Actualizar y Notificar:**
   - Escribe en el archivo `.gitignore` de la raíz del proyecto las selecciones realizadas por el usuario de forma limpia y ordenada.
   - Entrega un informe a `@zugzbot` listando las carpetas o archivos que fueron ignorados.
