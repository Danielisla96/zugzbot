import { tool } from "@opencode-ai/plugin"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"

// Helper to safely resolve root directory (avoiding OpenCode bug where worktree is '/' in non-git repos)
const getRoot = (context: any) => {
  if (context?.directory && context.directory !== "/") return context.directory;
  if (context?.worktree && context.worktree !== "/") return context.worktree;
  if (context?.cwd && context.cwd !== "/") return context.cwd;
  return process.cwd();
};

// Tool: sdd_clean_docker_environment
export const clean_docker_environment = tool({
  description: "Asegura que Docker esté abierto y realiza una limpieza total y agresiva: detiene y elimina TODOS los contenedores (activos o inactivos), remueve TODAS las imágenes, volúmenes y redes para garantizar un lienzo en blanco absoluto antes de desplegar.",
  args: {},
  async execute(args, context) {
    const results: Record<string, string> = {}
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    // 1. Asegurar que Docker daemon esté listo
    let dockerReady = false
    for (let i = 0; i < 12; i++) {
      try {
        execSync("docker info", { stdio: "ignore", timeout: 3000 })
        dockerReady = true
        break
      } catch (e) {
        if (i === 0) {
          try { execSync("open -a Docker", { stdio: "ignore" }) } catch (err) {}
        }
        await sleep(5000)
      }
    }

    if (!dockerReady) {
      return JSON.stringify({
        status: "ERROR",
        message: "No se pudo iniciar o conectar al demonio de Docker. Por favor, asegúrese de que Docker Desktop esté corriendo."
      }, null, 2)
    }

    // 2. Detener y eliminar todos los contenedores de forma agresiva
    try {
      const containerIds = execSync("docker ps -aq", { encoding: "utf8" }).toString().trim()
      if (containerIds) {
        const ids = containerIds.split(/\s+/).join(" ")
        execSync(`docker rm -f ${ids}`, { encoding: "utf8" })
        results.containers = `Todos los contenedores detenidos y eliminados con éxito: ${ids}`
      } else {
        results.containers = "No se encontraron contenedores para eliminar."
      }
    } catch (e: any) {
      results.containers = `Error eliminando contenedores: ${e.message}`
    }

    // 3. Eliminar todas las imágenes de forma agresiva
    try {
      const imageIds = execSync("docker images -aq", { encoding: "utf8" }).toString().trim()
      if (imageIds) {
        const ids = imageIds.split(/\s+/).join(" ")
        execSync(`docker rmi -f ${ids}`, { encoding: "utf8" })
        results.images = `Todas las imágenes eliminadas con éxito: ${ids}`
      } else {
        results.images = "No se encontraron imágenes para eliminar."
      }
    } catch (e: any) {
      results.images = `Error eliminando imágenes: ${e.message}`
    }

    // 4. Eliminar volúmenes huérfanos
    try {
      results.volumes = execSync("docker volume prune -af", { encoding: "utf8" }).toString().trim()
    } catch (e: any) {
      results.volumes = `Error podando volúmenes: ${e.message}`
    }

    // 5. Eliminar redes inactivas
    try {
      results.networks = execSync("docker network prune -f", { encoding: "utf8" }).toString().trim()
    } catch (e: any) {
      results.networks = `Error podando redes: ${e.message}`
    }

    return JSON.stringify({
      status: "SUCCESS",
      message: "Lienzo en blanco garantizado: Docker limpio al 100%.",
      details: results
    }, null, 2)
  }
})

// Tool: sdd_generate_dockerfile
export const generate_dockerfile = tool({
  description: "Genera Dockerfile multi-stage, .dockerignore y docker-compose.yml optimizados a partir del stack del proyecto (nextjs|fastapi|agnostic). Detecta package manager desde package.json.",
  args: {
    stack: tool.schema.enum(["nextjs", "fastapi", "agnostic"]).describe("Stack del proyecto"),
    port: tool.schema.number().default(3000).describe("Puerto de la aplicación"),
  },
  async execute(args, context) {
    const root = getRoot(context)

    if (args.stack === "agnostic") {
      const dockerfileAg = `FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install --prefer-offline || true
CMD ["node", "src/index.js"]
`
      const filesWritten: string[] = []
      let content = dockerfileAg
      let targetName = "src/index.js"
      if (fs.existsSync(path.resolve(root, "src/main.py"))) {
        content = `FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt || true
CMD ["python", "src/main.py"]
`
        targetName = "src/main.py"
      }
      
      const fullPath = path.resolve(root, "Dockerfile")
      fs.writeFileSync(fullPath, content, "utf8")
      filesWritten.push("Dockerfile")
      
      return JSON.stringify({
        status: "SUCCESS",
        message: `Docker artifacts generados de forma agnóstica para el script de entrada: ${targetName}`,
        filesWritten
      }, null, 2)
    }

    if (args.stack === "nextjs") {
      const specsDir = path.resolve(root, ".openspec/specs")
      let filesAffected: string[] = []
      
      const p = "npm"
      let pm = "npm"
      let installCmd = "npm ci --frozen-lockfile"
      let buildCmd = "npm run build"
      if (fs.existsSync(path.resolve(root, "pnpm-lock.yaml"))) {
        pm = "pnpm"
        installCmd = "pnpm install --frozen-lockfile"
        buildCmd = "pnpm build"
      } else if (fs.existsSync(path.resolve(root, "yarn.lock"))) {
        pm = "yarn"
        installCmd = "yarn install --frozen-lockfile"
        buildCmd = "yarn build"
      }

      const nodeImage = "node:20-alpine"

      const dockerfile = `# Stage 1: Dependencias
FROM ${nodeImage} AS deps
WORKDIR /app
COPY package.json ${pm === "npm" ? "package-lock.json* " : pm === "pnpm" ? "pnpm-lock.yaml* " : "yarn.lock* "}./
RUN ${installCmd}

# Stage 2: Constructor
FROM ${nodeImage} AS builder
WORKDIR /app
RUN corepack enable || true
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN ${buildCmd}

# Stage 3: Ejecutor
FROM ${nodeImage} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs \
 && mkdir -p public

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE ${args.port}
ENV PORT=${args.port}
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${args.port}', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

CMD ["node", "server.js"]
`

      const dockerignore = `node_modules
.next
.git
.opencode
.openspec
.env*
*.md
vitest.config.ts
*.test.ts
*.spec.ts
coverage
playwright-report
test-results
`

      const compose = `services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "${args.port}:${args.port}"
    environment:
      - NODE_ENV=production
      - NEXT_TELEMETRY_DISABLED=1
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:${args.port}', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
`

      const filesWritten: string[] = []
      for (const [name, content] of [
        ["Dockerfile", dockerfile],
        [".dockerignore", dockerignore],
        ["docker-compose.yml", compose],
      ] as const) {
        const fullPath = path.resolve(root, name)
        fs.writeFileSync(fullPath, content, "utf8")
        filesWritten.push(path.relative(root, fullPath))
      }

      return JSON.stringify({
        status: "SUCCESS",
        message: `Docker artifacts generados (${pm}, ${nodeImage}, puerto ${args.port})`,
        filesWritten,
        packageManager: pm,
        nodeImage,
      }, null, 2)
    }

    // fastapi path
    const dockerfilePy = `FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
 && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY src/ ./src/
EXPOSE ${args.port}
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "${args.port}"]
`
    const dockerignorePy = `__pycache__/
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.venv/
.git
.opencode
.openspec
.pytest_cache/
tests/
`
    const composePy = `services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "${args.port}:${args.port}"
    environment:
      - ENV=production
    restart: unless-stopped
`
    const filesWritten: string[] = []
    for (const [name, content] of [
      ["Dockerfile", dockerfilePy],
      [".dockerignore", dockerignorePy],
      ["docker-compose.yml", composePy],
    ] as const) {
      const fullPath = path.resolve(root, name)
      fs.writeFileSync(fullPath, content, "utf8")
      filesWritten.push(path.relative(root, fullPath))
    }

    return JSON.stringify({
      status: "SUCCESS",
      message: `Docker artifacts generados para FastAPI (puerto ${args.port})`,
      filesWritten,
    }, null, 2)
  }
})
