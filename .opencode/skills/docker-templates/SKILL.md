---
name: docker-templates
description: Plantillas y directrices de Docker optimizadas para desplegar aplicaciones Next.js y FastAPI en contenedores locales
license: MIT
compatibility: opencode
---

## Qué hace esta habilidad

Proporciona plantillas Docker optimizadas y listas para usar, evitando que el subagente `@sdd-deployer` tenga que escribir archivos de configuración desde cero, lo cual reduce tiempos y previene errores comunes (como directorios ausentes, falta de `.dockerignore` o puertos ocupados).

## Cuándo usarme

Úsala al ingresar a la fase **F4_DEPLOYMENT** para guiar la creación del `Dockerfile`, `.dockerignore` y `docker-compose.yml` en la raíz del proyecto.

---

## 📋 Plantillas de Docker de Referencia

### 1. Next.js (App Router y Standalone Mode)

Para Next.js, se debe asegurar que `output: 'standalone'` esté configurado en `next.config.ts` o `next.config.js`.

#### **Dockerfile**
```dockerfile
# Stage 1: Dependencias
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml* package-lock.json* ./
RUN pnpm install --frozen-lockfile || pnpm install || npm install

# Stage 2: Constructor
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build || npm run build

# Stage 3: Ejecutor (Producción)
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Nota: Crear carpeta public por si no existe
RUN mkdir -p public

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

#### 🛠️ **Manejo de Conflictos de Dependencias y Sincronización de Lockfile**
En proyectos donde las dependencias cambian con frecuencia por la adición automática de componentes de Shadcn, es muy común que el comando estricto `npm ci --frozen-lockfile` falle dentro de Docker con errores de desincronización de lockfile (ej: `Invalid: lock file's picomatch... does not satisfy`).

Para solucionar esto de manera robusta:
1. **Solución Local Primaria**: El Coder debe añadir de manera explícita la dependencia par conflictiva en su `package.json` (ej: `"picomatch": "^4.0.4"`) y ejecutar `npm install` localmente para regenerar y sincronizar un `package-lock.json` limpio antes de intentar compilar el contenedor.
2. **Estrategia Fallback en Dockerfile**: Si la sincronización del lockfile sigue presentando conflictos intermitentes e inestabilidad insalvable, el Deployer tiene autorización para modificar el paso de instalación del Dockerfile de un estricto `npm ci` a un dinámico `npm install --no-audit --no-fund` para permitir que el motor de resolución de Node resuelva las dependencias pares de forma adaptativa.

#### **.dockerignore**
```ignore
node_modules
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
```

#### **docker-compose.yml**
```yaml
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_TELEMETRY_DISABLED=1
    restart: unless-stopped
```

---

### 2. FastAPI (Python)

#### **Dockerfile**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema si son necesarias
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install uv && uv pip install --no-cache-dir -r requirements.txt --system || pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### **.dockerignore**
```ignore
__pycache__/
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
```
