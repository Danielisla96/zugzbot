import { describe, test, expect, afterAll } from "vitest"
import fs from "fs"
import path from "path"
import os from "os"
import { fileURLToPath } from "url"
import dryrun from "../../.opencode/tools/sdd_runtime_dryrun.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function makeProject(name, files = {}) {
  const projectPath = path.join(os.tmpdir(), `zugzbot-dryrun-${name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
  fs.mkdirSync(projectPath, { recursive: true })
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(projectPath, rel)
    fs.mkdirSync(path.dirname(full), { recursive: true })
    fs.writeFileSync(full, content, "utf-8")
  }
  return projectPath
}

function ctx(projectPath) {
  return { worktree: projectPath, directory: projectPath, sessionID: "test" }
}

const created = []
function track(p) { created.push(p); return p }

afterAll(() => {
  for (const p of created) {
    try { fs.rmSync(p, { recursive: true, force: true }) } catch (_e) { /* ignore */ }
  }
})

const BUGGY_DOCKERFILE = `# Stage 1: Builder
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
EXPOSE 8000
USER appuser
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
`

const GOOD_DOCKERFILE = `FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /install /usr/local
COPY --chown=appuser:appuser . .
RUN useradd -m appuser
USER appuser
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:8000/health || exit 1
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
`

describe("A2: sdd_runtime_dryrun", () => {
  test("BUGGY Dockerfile (pip --user + USER appuser) → verdict=BLOCK con USER_INSTALL_PATH_INCOMPATIBLE", async () => {
    const projectPath = track(makeProject("buggy", { "Dockerfile": BUGGY_DOCKERFILE }))

    const result = await dryrun.execute(
      { action: "check_dockerfile", filePath: "Dockerfile" },
      ctx(projectPath)
    )
    const parsed = JSON.parse(result)
    expect(parsed.status).toBe("FAILED")
    expect(parsed.verdict).toBe("BLOCK")
    const criticalIssue = parsed.issues.find((i) => i.code === "USER_INSTALL_PATH_INCOMPATIBLE")
    expect(criticalIssue).toBeDefined()
    expect(criticalIssue.severity).toBe("error")
    expect(criticalIssue.fix_suggestion).toMatch(/--prefix=\/install/)
  })

  test("GOOD Dockerfile (--prefix + chown + healthcheck) → verdict=OK con 0 errors", async () => {
    const projectPath = track(makeProject("good", { "Dockerfile": GOOD_DOCKERFILE }))

    const result = await dryrun.execute(
      { action: "check_dockerfile", filePath: "Dockerfile" },
      ctx(projectPath)
    )
    const parsed = JSON.parse(result)
    expect(parsed.status).toBe("SUCCESS")
    expect(parsed.verdict).toBe("OK")
    expect(parsed.summary.errors).toBe(0)
  })

  test("Dockerfile sin USER ni CMD → warnings", async () => {
    const projectPath = track(makeProject("noworkdir", {
      "Dockerfile": "FROM python:3.11-slim\nCOPY . .\n"
    }))

    const result = await dryrun.execute(
      { action: "check_dockerfile", filePath: "Dockerfile" },
      ctx(projectPath)
    )
    const parsed = JSON.parse(result)
    const codes = parsed.issues.map((i) => i.code)
    expect(codes).toContain("NO_CMD_OR_ENTRYPOINT")
  })

  test("multi-stage COPY --from=stage_no_existe → error COPY_FROM_UNKNOWN_STAGE", async () => {
    const projectPath = track(makeProject("badstage", {
      "Dockerfile": "FROM python:3.11-slim\nCOPY --from=ghost /app /app\nCMD echo hi\n"
    }))

    const result = await dryrun.execute(
      { action: "check_dockerfile", filePath: "Dockerfile" },
      ctx(projectPath)
    )
    const parsed = JSON.parse(result)
    const criticalIssue = parsed.issues.find((i) => i.code === "COPY_FROM_MISSING_MULTISTAGE" || i.code === "COPY_FROM_UNKNOWN_STAGE")
    expect(criticalIssue).toBeDefined()
  })

  test("docker-compose.yml con service sin build → error SERVICE_NO_BUILD", async () => {
    const projectPath = track(makeProject("compose", {
      "docker-compose.yml": "services:\n  app:\n    image: nginx\n    ports:\n      - '8080:80'\n"
    }))

    const result = await dryrun.execute(
      { action: "check_docker_compose", filePath: "docker-compose.yml" },
      ctx(projectPath)
    )
    const parsed = JSON.parse(result)
    expect(parsed.services_count).toBe(1)
    const err = parsed.issues.find((i) => i.code === "SERVICE_NO_BUILD")
    expect(err).toBeDefined()
  })

  test("docker-compose.yml con service user: root (workaround) → warning SERVICE_USER_ROOT", async () => {
    const projectPath = track(makeProject("rootuser", {
      "docker-compose.yml": "services:\n  app:\n    build: .\n    user: root\n    ports:\n      - '8000:8000'\n"
    }))

    const result = await dryrun.execute(
      { action: "check_docker_compose", filePath: "docker-compose.yml" },
      ctx(projectPath)
    )
    const parsed = JSON.parse(result)
    const warn = parsed.issues.find((i) => i.code === "SERVICE_USER_ROOT")
    expect(warn).toBeDefined()
    expect(warn.severity).toBe("warning")
  })

  test("check_all escanea todo el scope y reporta aggregate", async () => {
    const projectPath = track(makeProject("all", {
      "Dockerfile": BUGGY_DOCKERFILE,
      "docker-compose.yml": "services:\n  app:\n    build: .\n    user: root\n"
    }))

    const result = await dryrun.execute(
      { action: "check_all" },
      ctx(projectPath)
    )
    const parsed = JSON.parse(result)
    expect(parsed.files_scanned).toBe(2)
    expect(parsed.summary.errors).toBeGreaterThan(0)
    expect(parsed.verdict).toBe("BLOCK")
  })

  test("Dockerfile path absoluto funciona igual que relativo", async () => {
    const projectPath = track(makeProject("abspath", { "Dockerfile": GOOD_DOCKERFILE }))

    const result = await dryrun.execute(
      { action: "check_dockerfile", filePath: path.join(projectPath, "Dockerfile") },
      ctx(projectPath)
    )
    const parsed = JSON.parse(result)
    expect(parsed.verdict).toBe("OK")
  })

  test("Dockerfile inexistente retorna FAILED con reason", async () => {
    const projectPath = track(makeProject("missing", {}))

    const result = await dryrun.execute(
      { action: "check_dockerfile", filePath: "nonexistent.Dockerfile" },
      ctx(projectPath)
    )
    const parsed = JSON.parse(result)
    expect(parsed.status).toBe("FAILED")
    expect(parsed.reason).toMatch(/no encontrado/i)
  })
})
