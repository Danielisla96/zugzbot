# 🔍 Diagnóstico Técnico — `agregar-frontend-react`

> **Fase:** F0 (Exploración / Diagnóstico)
> **Fecha:** 2026-06-06
> **Agente:** @sdd-explorer

---

## 📊 Stack Profiles Detectados

### Backend (existente — `backend/`)
| Campo | Valor |
|-------|-------|
| **Profile ID** | `python` |
| **Detectado por** | `pyproject.toml`, `requirements.txt` |
| **Framework** | FastAPI + Uvicorn |
| **Python** | 3.11 (vía Docker) |
| **Test runner** | pytest (configurado en `pyproject.toml`) |
| **Linter** | ruff (configurado en `pyproject.toml`) |
| **Formateador** | ruff-format |
| **Deploy kind** | dev-server (`uvicorn main:app --reload`) |

### Frontend (nuevo a crear — `frontend/`)
| Campo | Valor |
|-------|-------|
| **Profile ID esperado** | `node-typescript` (React con TypeScript) |
| **Tecnología** | React + Vite (recomendado) |
| **Detectores futuros** | `tsconfig.json`, `vite.config.ts`, `package.json` |
| **Test runner recomendado** | vitest (nativo Vite) |
| **Linter recomendado** | eslint + tsc (`tsc --noEmit`) |
| **Deploy kind** | dev-server (`npm run dev`) |

> **Nota:** El proyecto raíz ya tiene un `package.json` (solo con `zugzbot-sdd` como dependencia), pero NO tiene `tsconfig.json` ni `vite.config.*`. El frontend se creará desde cero en `frontend/`.

---

## 🌳 Estructura Actual del Proyecto

```
/Proyecto4
├── backend/                          # ← Backend existente (Python / FastAPI)
│   ├── main.py                       # Entry point FastAPI
│   ├── src/
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   └── calculadora.py        # GET /api/v1/sumar
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── calculadora.py        # Lógica pura de suma
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── calculadora.py        # Pydantic schemas (SumaRequest, SumaResponse)
│   │   └── middleware/
│   │       └── __init__.py
│   ├── tests/
│   │   ├── unit/
│   │   │   └── test_sumador.py       # 5 tests unitarios
│   │   └── integration/
│   │       └── test_sumar.py         # 8 tests de integración
│   ├── Dockerfile                    # Docker backend (single-stage, non-root)
│   ├── docker-compose.yml            # Solo backend :8000
│   ├── requirements.txt              # fastapi, uvicorn, pydantic, pytest, httpx, ruff
│   ├── pyproject.toml                # Config pytest, ruff, metadata
│   ├── .dockerignore
│   └── README.md
│
├── .openspec/
│   ├── sdd-lock.json                 # Lockfile SDD v2
│   ├── brain.md                      # Memoria del proyecto (3 lecciones)
│   ├── CHANGELOG.md                  # Versiones 1.1.0 → 1.2.0
│   └── changes/
│       └── agregar-frontend-react/   # ← Directorio del cambio actual
│           └── diagnostics.md        # ← Este archivo
│
├── package.json                      # Solo dependencia zugzbot-sdd
├── package-lock.json
├── .gitignore
├── opencode.json
├── tui.json
└── zugz-models.json
```

> **Próximamente:** `frontend/` con estructura React + Vite + TypeScript

---

## 🔌 Endpoints del Backend Relevantes

### `GET /health`
```
→ 200 {"status": "ok"}
```
Health check del backend.

### `GET /api/v1/sumar?a=<float>&b=<float>`
```
→ 200 {"resultado": <float>}
→ 422 (validación: faltan parámetros, tipo inválido, fuera de rango)
```
**Parámetros:**
- `a` (float, required): Primer sumando. Rango: -1000 < a < 1000
- `b` (float, required): Segundo sumando. Rango: -1000 < b < 1000

**Ejemplo:**
```bash
curl "http://localhost:8000/api/v1/sumar?a=5&b=3"
# → {"resultado": 8.0}
```

---

## 🐳 Docker Actual

### `backend/Dockerfile`
- Base: `python:3.11-slim`
- Puerto: 8000
- Usuario non-root (`appuser`)
- HEALTHCHECK cada 30s
- Comando: `uvicorn main:app --host 0.0.0.0 --port 8000`

### `backend/docker-compose.yml`
- Servicio: `backend`
- Puerto: `8000:8000`
- Volumen con hot-reload
- Healthcheck configurado

---

## 📋 Archivos Existentes Relevantes (Inventario)

| Archivo | Propósito |
|---------|-----------|
| `backend/main.py` | Entry point FastAPI (app + health) |
| `backend/src/routers/calculadora.py` | Router GET /api/v1/sumar |
| `backend/src/services/calculadora.py` | Lógica `sumar(a, b)` |
| `backend/src/models/calculadora.py` | Schemas Pydantic |
| `backend/tests/unit/test_sumador.py` | 5 tests unitarios |
| `backend/tests/integration/test_sumar.py` | 8 tests integración |
| `backend/Dockerfile` | Imagen backend |
| `backend/docker-compose.yml` | Compose solo backend |
| `backend/requirements.txt` | Dependencias Python |
| `backend/pyproject.toml` | Config proyecto Python |
| `.gitignore` | Ignora node_modules, dist, .env, etc. |
| `package.json` | Solo zugzbot-sdd (root) |

---

## ⚠️ Riesgos y Dependencias

1. **CORS**: El frontend React (puerto 5173 / 3000) necesitará CORS habilitado en el backend FastAPI (`fastapi.middleware.cors`). Actualmente el backend NO tiene CORS configurado.
2. **Docker Compose unificado**: Se necesita un `docker-compose.yml` en la raíz que orqueste **backend** + **frontend**.
3. **Proxy reverso**: Definir si el frontend llama directamente a `localhost:8000` o si se usa un proxy (nginx, traefik) en el Compose.
4. **Node version**: Asegurar compatibilidad de Node (18+ recomendado). Considerar `.nvmrc` o `engines` en `package.json`.
5. **Rama Git**: Este cambio requiere crear rama `sdd/agregar-frontend-react` y commits atómicos.
6. **Test runner nuevo**: El frontend usará `vitest` (ajeno al ecosistema Python actual).
7. **`.gitignore` actualizado**: Considerar agregar `frontend/dist/`, `frontend/node_modules/` etc. al `.gitignore` raíz.
8. **Potential dependency conflict**: El `package.json` raíz tiene dependencias de orquestación (zugzbot-sdd). El frontend tendrá su propio `package.json` en `frontend/` — no deben mezclarse.

---

## 🔥 Archivos Calientes (Hot Files)

Los archivos que probablemente serán tocados durante este cambio:

| Archivo | Por qué |
|---------|---------|
| `backend/main.py` | Agregar middleware CORS |
| `backend/requirements.txt` | Posible agregar `fastapi-cors` si no está incluido |
| (nuevo) `frontend/` | Crear proyecto React + Vite + TypeScript |
| (nuevo) `docker-compose.yml` (raíz) | Orquestar backend + frontend |
| (nuevo) `frontend/Dockerfile` | Dockerizar frontend |
| (nuevo) `frontend/src/App.tsx` | Componente principal (formulario suma) |

---

## 💡 Recomendaciones para el Spec (F1)

1. **Arquitectura del frontend:**
   - React 18+ con TypeScript
   - Vite como bundler (rápido, moderno)
   - Componentes: `App`, `SumarForm` (inputs a/b + botón), `ResultadoDisplay`
   - Testing: vitest + @testing-library/react

2. **Comunicación frontend ↔ backend:**
   - `fetch("http://localhost:8000/api/v1/sumar?a=${a}&b=${b}")`
   - Manejo de errores (422, 500, network errors)

3. **Docker:**
   - Multistage build para frontend (build → nginx/static)
   - Docker Compose raíz con ambos servicios

4. **CORS:**
   - Agregar `CORSMiddleware` en `backend/main.py`
   - Allow origins: `["http://localhost:5173", "http://localhost:3000"]`

5. **Orden sugerido de implementación:**
   1. Habilitar CORS en backend
   2. Crear proyecto frontend con Vite + React + TypeScript
   3. Implementar componente de suma
   4. Agregar tests al frontend
   5. Dockerizar frontend
   6. Crear Docker Compose unificado en la raíz
   7. Documentar e integration-testing

---

*Diagnóstico generado por @sdd-explorer (F0) — listo para transición a F1 (Spec).*
