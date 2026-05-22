---
name: sdd-dependency-cooldown
description: Protocolo mandatorio de auditoria y cooldown para nuevas dependencias en el ciclo SDD.
---

# Protocolo Mandatorio de Cooldown de Dependencias (4320 Minutos / 3 Días)

Este protocolo es obligatorio para todos los agentes (`sdd-architect`, `sdd-implementer`, `aux-handyman`) antes de proponer, instalar o importar cualquier biblioteca de terceros en este proyecto.

## 🛡️ Regla Crítica del Cooldown

> [!CAUTION]
> **VERIFICACIÓN OBLIGATORIA:**
> Tienes estrictamente **prohibido** instalar o sugerir paquetes cuya última versión publicada (o versión específica objetivo) tenga **menos de 3 días (4320 minutos)** de antigüedad.

### Pasos de Validación

1. **Auditoría Técnica:** Al planificar una biblioteca, consulta la fecha de publicación oficial de la versión objetivo (ej. en NPM, PyPI o GitHub releases).
2. **Historial Estable:** Identifica la última versión estable que supere la antigüedad de 3 días si la última versión es demasiado reciente.
3. **Justificación:** Si se aprueba la versión estable que cumple el cooldown, documéntala explícitamente en el checklist de tareas indicando que supera la regla de cooldown.
