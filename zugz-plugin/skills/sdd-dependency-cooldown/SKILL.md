---
name: sdd-dependency-cooldown
description: Verifica que las dependencias tengan al menos 3 días de publicadas antes de ser importadas.
---

# Skill: Dependency Cooldown Checker

Verifica que las dependencias tengan al menos **3 días** de publicadas antes de ser importadas.

## Trigger

Cuando se requiera agregar una nueva dependencia npm, antes de cualquier `import` o `require`.

## Uso

```bash
npx -y npm-check-updates <package-name> --dep prod
# o verificar en https://www.npmjs.com/package/<package-name>
```

## Regla SDD Cooldown

| Tipo | Tiempo mínimo |
|:---|:---|
| Dependencias nuevas | 3 días desde publicación |
| Updates mayores (major) | 7 días |
| Dependencias критични (security) | Sin cooldown |

## Verificación Manual

1. Ir a https://www.npmjs.com/package/<nombre-paquete>
2. Buscar "Published" en la sección de metadata
3. Calcular días desde publicación
4. Si >= 3 días, APPROVED
5. Si < 3 días, WAIT con fecha de aprobación

## Criterios de Bloqueo

- ❌ Paquetes con < 3 días
- ❌ Paquetes sin downloads recientes (posible abandonware)
- ❌ Paquetes con vulnerabilities conocidas sin fix

## Tags

#sdd #dependency #npm #cooldown
