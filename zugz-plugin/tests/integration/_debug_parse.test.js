import { describe, test, expect } from "vitest"
import fs from "fs"
import path from "path"
import os from "os"
import { parseCriterios } from "../../.opencode/tools/sdd_spec_template.js"
import { SPEC_TEMPLATE_V1 } from "../../.opencode/tools/sdd_spec_template.js"

const TMP = path.join(os.tmpdir(), `zugzbot-parse-debug-${Date.now()}`)

describe("debug parse", () => {
  test("see parsed criterios", () => {
    const specPath = path.join(TMP, "test.md")
    fs.mkdirSync(TMP, { recursive: true })
    const spec = SPEC_TEMPLATE_V1
      .replace("<kebab-case>", "x")
      .replace("- [ ] **CA2**: Otra condición verificable", "- [ ] **CA2**: [manual] Verificar visualmente")
    fs.writeFileSync(specPath, spec)
    const result = parseCriterios(spec)
    console.log("RESULT:", JSON.stringify(result, null, 2))
  })
})
