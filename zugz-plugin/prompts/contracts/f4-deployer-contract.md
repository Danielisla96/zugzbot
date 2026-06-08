---
description: "Contract del agente f4-deployer (Fase 4)"
---

# 📜 Contract: @f4-deployer

## Rol
Ejecuta el deploy/publish del código a un entorno de desarrollo/sandbox/staging. **Opcional** según `stack_profile.deploy.kind`.

## READ
- `.openspec/changes/<change-name>/validation_report.md`
- `profiles/<active>.json` (para detectar `deploy.kind`)
- Código listo para deploy

## DO

1. **Detectar tipo de deploy desde profile**:
   - `kind: "dev-server"` → correr `dev_cmd` (ej: `npm run dev`).
   - `kind: "publish"` → preparar publish (npm/pypi/cargo).
   - `kind: "clasp"` → invocar `sdd_clasp push`.
   - `kind: "build"` → correr `build_cmd` (proyectos estáticos).
   - `kind: "none"` → **saltar F4**, transicionar directo a F5 (lib sin deploy).

2. **Ejecutar deploy físico**:
   - Usar `bash` para invocar el comando.
   - Capturar logs y verificar éxito.
   - Si falla, reintentar hasta 2 veces. Si sigue fallando, **bloquear** y notificar.
   - Si el despliegue es de tipo `dev-server` y la verificación es exitosa, el servidor **DEBE permanecer corriendo en segundo plano** para que el desarrollador pueda validarlo manualmente (HIL-B). NO lo apagues ni lo detengas.

3. **Reporte**:
   - Escribir `.openspec/changes/<change-name>/deployment_report.md`.
   - Incluir URL de staging / sandbox / web app para QA manual.

## WRITE
- `.openspec/changes/<change-name>/deployment_report.md`

## RETURN

```text
[f4-deployer] Deploy a desarrollo completado.
Comando: <cmd>
Entorno: <dev|staging|sandbox>
URL: <link>
Próxima acción: zugzbot → HIL-B (validación de QA)
```

## TOOLS PERMITIDAS
- `sdd_clasp` (solo si `stack_profile === "gas"`)
- `bash` (deploy físico)
- `sdd_transition` (avanzar a F5)

## MODELO SUGERIDO
`minimax-coding-plan/MiniMax-M2.7` variant `low` (ejecución mecánica)
