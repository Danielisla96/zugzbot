# Habilidades del agente

Defina el comportamiento reutilizable mediante definiciones de SKILL.md

Las habilidades del agente permiten a OpenCode descubrir instrucciones reutilizables de su repositorio o directorio de inicio. Las habilidades se cargan bajo demanda a través de la herramienta nativa `skill`: los agentes ven las habilidades disponibles y pueden cargar el contenido completo cuando sea necesario.

---

## [Colocar archivos](#colocar-archivos)

Cree una carpeta por nombre de habilidad y coloque un `SKILL.md` dentro de ella. OpenCode busca estas ubicaciones:

- Configuración del proyecto: `.opencode/skills//SKILL.md`
- Configuración global: `~/.config/opencode/skills//SKILL.md`
- Compatible con Proyecto Claude: `.claude/skills//SKILL.md`
- Compatible con Claude global: `~/.claude/skills//SKILL.md`
- Compatible con agente de proyecto: `.agents/skills//SKILL.md`
- Compatible con agentes globales: `~/.agents/skills//SKILL.md`

---

## [Entender el descubrimiento](#entender-el-descubrimiento)

Para las rutas locales del proyecto, OpenCode sube desde su directorio de trabajo actual hasta llegar al árbol de trabajo de git. Carga cualquier `skills/*/SKILL.md` coincidente en `.opencode/` y cualquier `.claude/skills/*/SKILL.md` o `.agents/skills/*/SKILL.md` coincidente a lo largo del camino.

Las definiciones globales también se cargan desde `~/.config/opencode/skills/*/SKILL.md`, `~/.claude/skills/*/SKILL.md` y `~/.agents/skills/*/SKILL.md`.

---

## [Escribir la introducción](#escribir-la-introducción)

Cada `SKILL.md` debe comenzar con el frontmatter de YAML. Sólo se reconocen estos campos:

- `name` (obligatorio)
- `description` (obligatorio)
- `license` (opcional)
- `compatibility` (opcional)
- `metadata` (opcional, mapa de cadena a cadena)

Los campos desconocidos se ignoran.

---

## [Validar nombres](#validar-nombres)

`name` debe:

- Tener entre 1 y 64 caracteres.
- Ser alfanuméricos en minúsculas con separadores de guión simple
- No comienza ni termina con `-`
- No contener `--` consecutivos
- Coincide con el nombre del directorio que contiene `SKILL.md`

expresión regular equivalente:

**File**:

```text
^[a-z0-9]+(-[a-z0-9]+)*$
```

---

## [Seguir las reglas de longitud](#seguir-las-reglas-de-longitud)

`description` debe tener entre 1 y 1024 caracteres. Manténgalo lo suficientemente específico para que el agente elija correctamente.

---

## [Usar un ejemplo](#usar-un-ejemplo)

Crea `.opencode/skills/git-release/SKILL.md` así:

**File**:

```markdown
---
name: git-release
description: Create consistent releases and changelogs
license: MIT
compatibility: opencode
metadata:
  audience: maintainers
  workflow: github
---

## What I do

- Draft release notes from merged PRs
- Propose a version bump
- Provide a copy-pasteable `gh release create` command

## When to use me

Use this when you are preparing a tagged release.
Ask clarifying questions if the target versioning scheme is unclear.
```

---

## [Reconocer la descripción de la herramienta](#reconocer-la-descripción-de-la-herramienta)

OpenCode enumera las habilidades disponibles en la descripción de la herramienta `skill`. Cada entrada incluye el nombre y la descripción de la habilidad:

**File**:

```xml

  
    git-release
    Create consistent releases and changelogs
  

```

El agente carga una habilidad llamando a la herramienta:

**File**:

```plaintext
skill({ name: "git-release" })
```

---

## [Configurar permisos](#configurar-permisos)

Controle a qué agentes de habilidades pueden acceder utilizando permisos basados ​​en patrones en `opencode.json`:

**File**:

```json
{
  "permission": {
    "skill": {
      "*": "allow",
      "pr-review": "allow",
      "internal-*": "deny",
      "experimental-*": "ask"
    }
  }
}
```
 ``````

| Permiso Comportamiento |
| --- |
| allow La habilidad se carga inmediatamente |
| deny Habilidad oculta al agente, acceso rechazado |
| ask Se solicita al usuario aprobación antes de cargar |


Los patrones admiten comodines: `internal-*` coincide con `internal-docs`, `internal-tools`, etc.

---

## [Anulación por agente](#anulación-por-agente)

Otorgue a agentes específicos permisos diferentes a los predeterminados globales.

**Para agentes personalizados** (en el frente del agente):

**File**:

```yaml
---
permission:
  skill:
    "documents-*": "allow"
---
```

**Para agentes integrados** (en `opencode.json`):

**File**:

```json
{
  "agent": {
    "plan": {
      "permission": {
        "skill": {
          "internal-*": "allow"
        }
      }
    }
  }
}
```

---

## [Deshabilitar la herramienta de habilidades](#deshabilitar-la-herramienta-de-habilidades)

Deshabilite completamente las habilidades para los agentes que no deberían usarlas:

**Para agentes personalizados**:

**File**:

```yaml
---
tools:
  skill: false
---
```

**Para agentes integrados**:

**File**:

```json
{
  "agent": {
    "plan": {
      "tools": {
        "skill": false
      }
    }
  }
}
```

Cuando está deshabilitada, la sección `` se omite por completo.

---

## [Solucionar problemas de carga](#solucionar-problemas-de-carga)

Si una habilidad no aparece:

1. Verifique que `SKILL.md` esté escrito en mayúsculas.
1. Verifique que el frontmatter incluya `name` y `description`
1. Asegúrese de que los nombres de las habilidades sean únicos en todas las ubicaciones
1. Verifique los permisos: las habilidades con `deny` están ocultas para los agentes
