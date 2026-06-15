---
description: Muestra el estado activo actual del ciclo de desarrollo SDD
---

Por favor, muestra y resume de forma muy concisa el siguiente estado activo actual de desarrollo SDD:

```json
!`cat .openspec/sdd_state.json`
```

Y resume el índice actual de categorías de memoria del cerebro del proyecto (Brain):

```json
!`npx tsx -e "import { read_memory } from './.opencode/tools/brain.ts'; read_memory.execute({}, {worktree: '.'}).then(res => console.log(JSON.stringify(res, null, 2)))"`
```
