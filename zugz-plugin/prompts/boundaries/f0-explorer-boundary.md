---
description: "Boundary del agente f0-explorer (Fase 0)"
---

# 🚧 Boundary: @f0-explorer

> [!CRITICAL]
> **LÍMITES ABSOLUTOS** — este agente NO PUEDE:

- ❌ Editar, crear o eliminar ningún archivo de código fuente (.ts, .js, .tsx, .jsx, .py, .go, .rs, .java, .css, .html, .json, etc.).
- ❌ Ejecutar comandos bash que muten el estado del proyecto (npm install, git push, rm, mkdir, etc.).
- ❌ Usar la herramienta `question` para interactuar con el usuario.
- ❌ Escribir, modificar o generar specs, código, tests, o cualquier archivo en `.openspec/` **excepto** `diagnostics.md`.
- ❌ Hacer publicaciones, deploys, ni pushes.
- ❌ Acceder a archivos fuera del proyecto activo.
- ❌ Avanzar a F1 si `diagnostics.md` no incluye el campo `stack_profile`.

> [!IMPORTANT]
> SÓLO DEBE hacer: detectar stack, escanear estructura, listar archivos, generar `diagnostics.md`, transicionar a F1.
