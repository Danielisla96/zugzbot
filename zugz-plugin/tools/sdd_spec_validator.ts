import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"

export default tool({
  description: "Audita y valida el plano técnico (spec.md) del cambio de desarrollo activo para asegurar que cumpla con los estándares de calidad y secciones mandatorias de la metodología SDD.",
  args: {
    changeName: tool.schema.string().optional().describe("Nombre del cambio en kebab-case. Por defecto se autodetectará del sdd-lock.")
  },
  async execute(args, context) {
    let projectRoot = context.worktree || context.directory || process.cwd();
    if (projectRoot === "/") {
      projectRoot = process.cwd();
    }
    let changeName = args.changeName;
    let complexity = "high";

    // 1. Detectar cambio activo y complejidad del sdd-lock si no se provee
    const lockfilePath = path.join(projectRoot, ".openspec/sdd-lock.json");
    const altLockPath = path.join(projectRoot, "openspec/sdd-lock.json");
    const activeLockPath = fs.existsSync(lockfilePath) ? lockfilePath : (fs.existsSync(altLockPath) ? altLockPath : null);
    if (activeLockPath) {
      try {
        const lockObj = JSON.parse(fs.readFileSync(activeLockPath, "utf-8"));
        if (!changeName && lockObj.change_name && lockObj.change_name !== "nuevo-cambio") {
          changeName = lockObj.change_name;
        }
        if (lockObj.complexity) {
          complexity = lockObj.complexity;
        }
      } catch (e) {}
    }

    const changeDir = path.join(projectRoot, ".openspec/changes", changeName || "nuevo-cambio");
    let specPath = path.join(changeDir, "specs/spec.md");
    if (!fs.existsSync(specPath)) {
      specPath = path.join(changeDir, "spec.md");
    }

    if (!fs.existsSync(specPath)) {
      return JSON.stringify({
        status: "FAILED",
        reason: `No se encuentra el archivo de especificación spec.md para el cambio '${changeName || "nuevo-cambio"}'. Ruta esperada: .openspec/changes/${changeName || "nuevo-cambio"}/[specs/]spec.md`
      }, null, 2);
    }

    const specContent = fs.readFileSync(specPath, "utf-8");

    // Secciones requeridas y sus expresiones regulares de validación según complejidad
    const requiredSections = [
      { name: "Plano Técnico / Título", regex: /^#\s*Plano\s+Técnico/mi },
      { name: "1. Diagnóstico y Archivos Afectados", regex: /^##\s*1\.\s*Diagnóstico/mi },
      { name: "3. Propuesta de Solución", regex: /^##\s*3\.\s*Propuesta/mi },
      { name: "5. Criterios de Aceptación", regex: /^##\s*5\.\s*Criterios/mi }
    ];

    if (complexity !== "low") {
      requiredSections.push(
        { name: "2. Consenso de Encuesta con el Usuario", regex: /^##\s*2\.\s*Consenso/mi },
        { name: "4. Especificaciones BDD (Comportamiento)", regex: /^##\s*4\.\s*Especificaciones BDD|Feature:/mi }
      );
    }

    const missingSections: string[] = [];
    requiredSections.forEach(section => {
      if (!section.regex.test(specContent)) {
        missingSections.push(section.name);
      }
    });

    if (missingSections.length > 0) {
      return JSON.stringify({
        status: "FAILED",
        changeName,
        complexity,
        reason: "El archivo spec.md no cumple con el formato mandatorio.",
        missingSections,
        message: `❌ VALIDACIÓN FALLIDA [Complejidad: ${complexity}]: Faltan las siguientes secciones requeridas en el plano técnico:\n${missingSections.map(s => `  - ${s}`).join("\n")}\n\nPor favor, pide a @sdd-planner que complete todas las secciones requeridas.`
      }, null, 2);
    }

    // Comprobar si hay placeholders obvios sin completar según complejidad
    const placeholders = [
      /\[nombre-cambio\]/i,
      /\[Un solo párrafo conciso con el enfoque técnico\]/i
    ];

    if (complexity !== "low") {
      placeholders.push(
        /\[Resumen de la duda y decisión adoptada\]/i,
        /\[Caso de prueba principal o flujo clave\]/i,
        /\[Contexto inicial del sistema\]/i,
        /\[Acción que realiza el usuario o sistema\]/i,
        /\[Resultado final esperado\]/i
      );
    }

    const detectedPlaceholders: string[] = [];
    placeholders.forEach(regex => {
      const match = specContent.match(regex);
      if (match) {
        detectedPlaceholders.push(match[0]);
      }
    });

    if (detectedPlaceholders.length > 0) {
      return JSON.stringify({
        status: "FAILED",
        changeName,
        complexity,
        reason: "Se detectaron placeholders sin completar en el plano técnico.",
        detectedPlaceholders,
        message: `❌ VALIDACIÓN FALLIDA [Complejidad: ${complexity}]: El spec.md contiene marcadores de posición (placeholders) que no han sido completados:\n${detectedPlaceholders.map(p => `  - ${p}`).join("\n")}\n\nPor favor, reemplaza estos valores con las especificaciones reales antes de avanzar.`
      }, null, 2);
    }

    // Validar Given-When-Then solo si la complejidad es alta
    if (complexity !== "low") {
      const hasSpanishKeywords = /Dado|Cuando|Entonces|Escenario/i.test(specContent);
      const hasScenario = /Scenario:/i.test(specContent);
      const hasGWT = /Given[\s\S]+When[\s\S]+Then/i.test(specContent);

      if (hasSpanishKeywords) {
        return JSON.stringify({
          status: "FAILED",
          changeName,
          complexity,
          reason: "Se detectaron palabras clave en español en los escenarios BDD.",
          message: `❌ VALIDACIÓN FALLIDA [Complejidad: ${complexity}]: Se detectaron palabras clave en español (Dado, Cuando, Entonces, Escenario) en las especificaciones BDD. La metodología SDD requiere estrictamente el formato en inglés (Scenario:, Given, When, Then, And) para automatizar el mapeo de tests.`
        }, null, 2);
      }

      if (!hasScenario || !hasGWT) {
        return JSON.stringify({
          status: "FAILED",
          changeName,
          complexity,
          reason: "No se encontraron escenarios Given-When-Then estructurados.",
          message: `❌ VALIDACIÓN FALLIDA [Complejidad: ${complexity}]: Se requiere al menos un escenario estructurado 'Scenario:' con pasos Given-When-Then en inglés para habilitar las pruebas automáticas en la Fase 2.`
        }, null, 2);
      }
    }

    return JSON.stringify({
      status: "APPROVED",
      changeName,
      complexity,
      message: `✅ VALIDACIÓN EXITOSA [Complejidad: ${complexity}]: El plano técnico 'specs/spec.md' para '${changeName}' cumple al 100% con los contratos de calidad de la metodología SDD. Está listo para ser implementado en la Fase 2.`
    }, null, 2);
  }
})
