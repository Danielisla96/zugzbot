---
name: sdd-dependency-cooldown
description: Protocolo mandatorio de auditoria y cooldown para nuevas dependencias en el ciclo SDD.
---

# Protocolo Mandatorio de Cooldown de Dependencias (4320 Minutos / 3 Días)

Este protocolo es obligatorio para todos los agentes (`sdd-builder`, `aux-handyman`) antes de proponer, instalar o importar cualquier biblioteca de terceros en este proyecto.

## 🛡️ Regla Crítica del Cooldown

> [!CAUTION]
> **VERIFICACIÓN OBLIGATORIA:**
> Tienes estrictamente **prohibido** instalar o sugerir paquetes cuya última versión publicada (o versión específica objetivo) tenga **menos de 3 días (4320 minutos)** de antigüedad.

### Pasos de Validación

1. **Ejecución de Herramienta [MANDATORIO]:** Antes de cualquier propuesta o instalación de biblioteca de terceros, llama obligatoriamente a la herramienta personalizada `check_dependency_cooldown` especificando el parámetro `package` y la `version` objetivo.
2. **Historial Estable:** Si el estado retornado es `BLOCKED`, tienes estrictamente prohibido usar esa versión. Llama nuevamente a la herramienta con una versión anterior estable hasta obtener `APPROVED`.
3. **Justificación:** Documenta la salida `APPROVED` en el checklist de tareas indicando la versión que superó el cooldown.
