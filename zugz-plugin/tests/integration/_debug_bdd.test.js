import { describe, test, expect } from "vitest"
import { matchBddScenarios, SPEC_TEMPLATE_V1 } from "../../.opencode/tools/sdd_spec_template.js"

describe("debug bdd", () => {
  test("see what happens with english", () => {
    const spec = SPEC_TEMPLATE_V1
      .replace("Dado", "Given")
      .replace("Cuando", "When")
      .replace("Entonces", "Then")
    const sc = matchBddScenarios(spec)
    console.log("scenarios:", sc)
  })
})
