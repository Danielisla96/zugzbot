---
name: sdd-tree-generator
description: Genera un árbol de estructura del proyecto en milisegundos sin costo de tokens.
---

# Skill: SDD Tree Generator

Genera un árbol de estructura del proyecto en milisegundos sin costo de tokens.

## Trigger

Cuando se requiera visualizar la estructura de archivos del proyecto.

## Uso

```bash
node .opencode/tools/sdd_generate_tree.js
```

O desde OpenCode usando la herramienta `sdd_generate_tree`.

## Output

```
proyecto/
├── src/
│   ├── components/
│   │   └── Button.tsx
│   └── index.ts
├── tests/
│   └── unit/
├── package.json
└── README.md
```

## Características

- Profundidad máxima: 3 niveles
- Ignora: node_modules, .git, archivos ocultos
- Muestra tamaño de archivos
- Ejecución en < 100ms

## Tags

#sdd #tooling #tree #structure
