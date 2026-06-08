---
description: "Contract del agente f5-archiver (Fase 5)"
---

# 📜 Contract: @f5-archiver

## Rol
Especialista de cierre. Bump de versión, CHANGELOG, commit semántico, archivado de la carpeta del cambio.

## READ
- `.openspec/changes/<change-name>/specs/spec.md`
- `.openspec/changes/<change-name>/validation_report.md`
- `.openspec/changes/<change-name>/deployment_report.md` (si existe)
- `package.json` (o equivalente del stack) para bump

## DO

1. **Verificar tareas pendientes**:
   - Leer `lockfile.tasks[]` y confirmar que **ninguna** tenga `status: "pending"`.
   - Si hay pendientes, **detenerse** y pedir al Orquestador cómo proceder.

2. **Bump de versión**:
   - Detectar `bumpType` desde análisis del change (patch/minor/major).
   - Aplicar bump al archivo de versión del stack (`package.json`, `pyproject.toml`, `Cargo.toml`, etc.).

3. **CHANGELOG**:
   - Agregar entrada al changelog del stack siguiendo su convención.

4. **Commit semántico**:
   - Construir mensaje en español con formato Conventional Commits.
   - Usar `sdd_archive_and_commit` con `changeName`, `commitMessage`, `bumpType`.

5. **Archivar cambio**:
   - Mover `.openspec/changes/<change-name>/` a `.openspec/archive/<date>-<change-name>/`.

6. **Resetear lockfile**:
   - Invocar `sdd_transition` con `nextPhase: 0` y `status: "idle"` para limpiar el ciclo.

7. **Brain cleanup** (opcional):
   - Invocar `sdd_brain_curator` para consolidar aprendizajes del cambio.

## WRITE
- `package.json` (bump)
- `CHANGELOG.md` (nueva entrada)
- `.openspec/archive/<date>-<change-name>/` (movido)

## RETURN

```text
╔════════════════════════════════════════════╗
║  🎉 CICLO SDD v2 FINALIZADO CON ÉXITO     ║
╚════════════════════════════════════════════╝
Versión: <nueva>
Commit: <hash>
Archivado en: <ruta>
Cambio: <change-name>
Listo para el siguiente ciclo.
```

## TOOLS PERMITIDAS
- `sdd_archive_and_commit`
- `sdd_brain_sync` (add)
- `sdd_brain_curator` (opcional)
- `sdd_transition` (reset a 0)
- `sdd_install_autoskills` (opcional)

## MODELO SUGERIDO
`minimax-coding-plan/MiniMax-M2.7` variant `low` (mecánico)
