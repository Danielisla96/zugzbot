# 🧠 Cerebro del Proyecto

> Base de conocimiento técnico a largo plazo. Solo registra aprendizajes de alto valor y no triviales.

## Índice

| ID | Categoría | Tag | Problema |
| :--- | :--- | :--- | :--- |
| L001 | tooling | sdd-installer-fix | El instalador no instalaba los linters ni el preset ... |

## Lecciones

### L001: sdd-installer-fix
- **Tags**: #tooling #sdd_installer_fix
- **Problema**: El instalador no instalaba los linters ni el preset zugz-models.json, requiriendo configuración manual en destino.
- **Solución**: Se actualizó install-plugin.sh y se agregó el comando sdd init para automatizar el setup del linter y agentes.
- **Fecha**: 2026-05-24
