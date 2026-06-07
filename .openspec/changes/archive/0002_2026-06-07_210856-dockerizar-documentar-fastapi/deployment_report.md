# Reporte de Despliegue en Entorno de Desarrollo (Fase 4)

## 🚀 Despliegue a Desarrollo / Sandbox (Docker — Single-Stage)
- **Comando Ejecutado**: `docker compose build --no-cache && docker compose up -d`
- **Entorno Destino**: Docker local (dev container)
- **Dockerfile**: Single-stage (1 sola imagen, sin dangling `<none>`)
- **Estado final del deploy**: ✅ ÉXITO

### Verificación de Imágenes Docker
```
=== IMÁGENES ===
REPOSITORY        TAG       IMAGE ID       CREATED          SIZE
backend-backend   latest    7200c581a47b   10 seconds ago   337MB
```
- **Conteo de imágenes con label `org.opencontainers.image.title=FastAPI Sumador`**: **1** ✅
- **Sin imágenes `<none>:<none>` dangling**: ✅

### Resumen del Smoke Test (Single-Stage)

| Paso | Descripción | Resultado | Detalle |
|------|-------------|-----------|---------|
| 1 | `docker compose down --rmi all` + `docker image prune -f` | ✅ OK | Limpieza completa de imágenes previas |
| 2 | `docker compose build --no-cache` | ✅ OK | Imagen `backend-backend:latest` construida (single-stage, 337MB) |
| 3 | Verificación de conteo de imágenes | ✅ 1 imagen | Solo `backend-backend:latest`, sin `<none>` ni duplicados |
| 4 | `docker compose up -d` | ✅ OK | Contenedor `fastapi-sumador` levantado como `appuser` (no-root) |
| 5 | `GET /health` | ✅ HTTP 200 | `{"status":"ok"}` |
| 6 | `POST /api/v1/sumar {"a":7,"b":3}` | ✅ HTTP 200 | `{"resultado":10.0}` |
| 7 | `POST /api/v1/sumar {"a":"x"}` | ✅ HTTP 422 | Validación Pydantic: `float_parsing`, `missing` |
| 8 | `pytest tests/ -v` dentro del contenedor | ✅ 19 passed | 19 passed, 2 skipped (tests de build/compose), 0 failures |
| 9 | `docker compose down` | ✅ OK | Limpieza completada |

### Métricas de la Imagen Docker (Single-Stage)

| Métrica | Valor |
|---------|-------|
| **Tamaño de imagen** | ~337 MB (python:3.11-slim base + dependencias) |
| **Etapas (stages)** | 1 (single-stage — sin multi-stage) |
| **Imágenes creadas** | 1 (`backend-backend:latest`) |
| **Imágenes dangling `<none>`** | 0 |
| **Puerto** | 8000 |
| **Usuario por defecto** | `appuser` (UID 1000) — no-root ✅ |
| **Healthcheck** | Configurado (interval 30s, timeout 3s, start 5s, retries 3) |
| **Labels** | `org.opencontainers.image.title`, `.description`, `.version` |

## 🔍 Enlace de Verificación de QA
- **Dirección de Visualización**: `http://localhost:8000` (Docker local)
- **Endpoints verificados**:
  - `GET /health` → `{"status":"ok"}`
  - `POST /api/v1/sumar` → `{"resultado": <float>}`
  - `POST /api/v1/sumar` (input inválido) → `HTTP 422` con detalle Pydantic
- **Tests**: 19 passed / 2 skipped / 0 failures

## 📋 Criterios a Validar en Caliente

| ID | Criterio | Estado |
|----|----------|--------|
| CA1 | `docker build` exitoso (single-stage) | ✅ |
| CA2 | Health check HTTP 200 | ✅ |
| CA3 | Sumador endpoint retorna `{"resultado":10.0}` | ✅ |
| CA4 | Tests pasan dentro del contenedor (19 passed) | ✅ |
| CA5 | `.dockerignore` tiene exclusiones requeridas | ✅ |
| CA6 | `README.md` tiene todas las secciones requeridas | ✅ |
| CA7 | API reference documenta `POST /api/v1/sumar` | ✅ |
| CA8 | README incluye instrucciones Docker | ✅ |
| **FIX** | Dockerfile single-stage — 1 sola imagen, sin `<none>` | ✅ CORREGIDO |
