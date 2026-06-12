import { tool } from "@opencode-ai/plugin"

export type Workflow = "full-sdd-tdd" | "quick-fix" | "audit" | "refactor" | "explain" | "oracle"

interface KeywordSet {
  workflow: Workflow
  keywords: string[]
  weight: number
}

const KEYWORD_SETS: KeywordSet[] = [
  {
    workflow: "oracle",
    keywords: [
      "qué es", "qué son", "qué significa",
      "diferencia entre", "diferencias entre",
      "cómo funciona en general", "teoría de", "concepto de",
      "principio de", "fundamento de",
      "el patrón", "patrón singleton", "patrón factory", "patrón observer", "patrón strategy"
    ],
    weight: 1.2
  },
  {
    workflow: "explain",
    keywords: [
      "qué hace", "qué hacen", "qué es esto",
      "explícame el", "explícame la", "explica el", "explica la", "explica este", "explica esta",
      "muéstrame cómo", "muéstrame el flujo",
      "por qué este", "por qué esta", "por qué hace",
      "cómo funciona este", "cómo funciona esta", "cómo funciona el",
      "walkthrough", "estructura del proyecto", "este código", "este módulo"
    ],
    weight: 0.9
  },
  {
    workflow: "audit",
    keywords: [
      "audita", "auditoría", "revisa la calidad",
      "qué deuda técnica", "deuda técnica",
      "code smells", "smells",
      "vulnerabilidades", "security audit", "audit de seguridad",
      "pasa el linter", "corre el linter",
      "hay problemas de", "qué mejorar", "qué se puede mejorar"
    ],
    weight: 0.9
  },
  {
    workflow: "refactor",
    keywords: [
      "refactoriza", "refactor", "haz refactor",
      "limpia este", "limpia la", "limpia el",
      "reorganiza", "reorganiza el", "reorganiza la",
      "extrae función", "extrae una función", "extraer función",
      "aplica el patrón", "aplica patrón",
      "mejora la legibilidad", "mejora legibilidad",
      "simplifica", "simplifica la", "simplifica el", "simplifica este",
      "reestructura", "reestructura el", "reestructura la",
      "aplica clean architecture", "aplica solid"
    ],
    weight: 0.95
  },
  {
    workflow: "quick-fix",
    keywords: [
      "arregla typo", "fix typo", "typo en", "typo del", "typo de", "typo a",
      "renombrar", "renombra", "renombra la", "renombra el",
      "bump versión", "bump la versión", "bump a", "bumpear",
      "actualiza una constante", "actualiza el comentario", "actualiza constante",
      "cambia el mensaje", "cambia formato", "cambia el color", "cambia el texto",
      "agrega un comment", "ajusta el texto", "ajusta texto"
    ],
    weight: 0.95
  },
  {
    workflow: "full-sdd-tdd",
    keywords: [
      "agrega feature", "agrega funcionalidad", "agrega un endpoint", "agrega la funcionalidad",
      "agrega un módulo", "agrega una ruta", "agrega autenticación", "agrega una",
      "agrega un", "agrega el", "agrega la",
      "implementa", "implementa el", "implementa la", "implementar",
      "crea módulo", "crea un módulo", "crea el módulo", "crea una",
      "desarrolla", "desarrolla la feature", "desarrolla el módulo",
      "el bug es", "no funciona", "está roto", "está fallando",
      "necesito una", "necesito un", "necesito el",
      "endpoint nuevo", "feature nueva",
      "construye el módulo", "construye la feature",
      "programa el", "el login está roto"
    ],
    weight: 0.85
  }
]

const TRIVIAL_CHANGE_PATTERN = /\b(typo|bump|comment|constante|formato|color|mensaje|texto|README|CHANGELOG)\b/i
const MULTI_FILE_INDICATOR = /\b(todo el módulo|todos los archivos|refactoriza el sistema|múltiples archivos)\b/i

export function classify(prompt: string): { workflow: Workflow; confidence: number; matched_keywords: string[]; reasoning: string } {
  const lower = prompt.toLowerCase()
  const scores: Record<Workflow, { score: number; matches: string[] }> = {
    "full-sdd-tdd": { score: 0, matches: [] },
    "quick-fix": { score: 0, matches: [] },
    "audit": { score: 0, matches: [] },
    "refactor": { score: 0, matches: [] },
    "explain": { score: 0, matches: [] },
    "oracle": { score: 0, matches: [] }
  }

  for (const set of KEYWORD_SETS) {
    for (const kw of set.keywords) {
      if (lower.includes(kw)) {
        scores[set.workflow].score += set.weight
        scores[set.workflow].matches.push(kw)
      }
    }
  }

  if (MULTI_FILE_INDICATOR.test(prompt)) {
    scores["full-sdd-tdd"].score += 0.5
    scores["quick-fix"].score = Math.max(0, scores["quick-fix"].score - 0.5)
  }

  if (TRIVIAL_CHANGE_PATTERN.test(prompt) && scores["quick-fix"].score > 0) {
    scores["quick-fix"].score += 0.3
  }

  const entries = Object.entries(scores) as Array<[Workflow, { score: number; matches: string[] }]>
  entries.sort((a, b) => b[1].score - a[1].score)

  const top = entries[0]
  const second = entries[1]
  const totalScore = entries.reduce((sum, [, s]) => sum + s.score, 0)
  const confidence = totalScore > 0 ? top[1].score / totalScore : 0

  const isAmbiguous = top[1].score > 0 && second[1].score > 0 &&
    (top[1].score - second[1].score) < 0.3

  return {
    workflow: top[1].score === 0 ? "full-sdd-tdd" : top[0],
    confidence: Math.min(1, confidence),
    matched_keywords: top[1].matches,
    reasoning: isAmbiguous
      ? `Ambigüedad detectada: '${top[0]}' (${top[1].score.toFixed(2)}) vs '${second[0]}' (${second[1].score.toFixed(2)}). Recomendado: preguntar al usuario.`
      : `Mejor match: '${top[0]}' con ${top[1].matches.length} keyword(s) y score ${top[1].score.toFixed(2)}.`
  }
}

export default tool({
  description: `Clasificador de intent del router. Dado un prompt del usuario, retorna el workflow apropiado y la confianza.
  
  Workflows posibles: full-sdd-tdd | quick-fix | audit | refactor | explain | oracle.
  
  Esta herramienta es read-only: NO modifica nada, solo clasifica.
  
  Útil para que @zugzbot tenga un mecanismo determinista de routing (vs. solo confiar en heurísticas del LLM).`,
  args: {
    prompt: tool.schema.string().describe("El prompt del usuario a clasificar")
  },
  async execute(args) {
    const result = classify(args.prompt)
    return JSON.stringify({
      status: "SUCCESS",
      ...result
    }, null, 2)
  }
})
