---
description: Realiza una auditoría/revisión de código contra el contrato y el linter
agent: sdd-reviewer
---

Por favor, realiza una revisión completa del código actual en src/.

Aquí tienes el resultado de la validación estática combinada (linter y compilación TypeScript):
```json
!`npx tsx -e "import { shift_left_verify } from './.opencode/tools/sdd_testing.ts'; shift_left_verify.execute({}, {worktree: '.'}).then(res => console.log(JSON.stringify(res, null, 2)))"`
```

Y aquí tienes el contrato activo actual para contrastar:
```json
!`cat .openspec/specs/*/contract.json || echo 'No hay contrato activo.'`
```

Determina si cumple estrictamente con el contrato y si la calidad del código es premium. Proporciona un reporte estructurado y tu veredicto final (`APROBADO` o `RECHAZADO`).
