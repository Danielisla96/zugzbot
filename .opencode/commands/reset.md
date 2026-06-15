---
description: Reinicia el estado del arnés SDD a la fase inicial (F0_DETECT) y desactiva el loopMode
---

Se ha ejecutado mecánicamente el reinicio del arnés mediante el siguiente comando:

!`npx tsx -e "import { set_phase } from './.opencode/tools/sdd.ts'; set_phase.execute({ phase: 'F0_DETECT', loopMode: false }, { worktree: '.' }).then(() => console.log('El estado del arnés ha sido reiniciado a F0_DETECT y loopMode=false con éxito.'))"`

Por favor, confirma brevemente al usuario que el arnés ha sido reiniciado por completo de forma limpia, se han detenido servidores anteriores y el piloto automático ha sido desactivado.
