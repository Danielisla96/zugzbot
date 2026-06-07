# 🔍 Diagnóstico F0 — `dockerizar-documentar-fastapi`

> Generado por **sdd-explorer** (Fase 0).

---

## 🔍 Stack Profile Detectado

| Campo | Valor |
|-------|-------|
| **Profile ID** | `python` |
| **Score** | 2 |
| **Reglas que matchearon** | `files_any: pyproject.toml`, `files_any: requirements.txt` |
| **Path del profile** | `profiles/python.json` |
| **Subproyecto** | `backend/` |

### Convenciones del Stack

| Convención | Valor |
|------------|-------|
| Test runner | `pytest` (detectado via `pyproject.toml` → `[tool.pytest.ini_options]`) |
| Linter | `ruff` (detectado via `pyproject.toml` → `[tool.ruff]`) |
| Formatter | `ruff format` (vía `pyproject.toml`) |
| Deploy kind | `dev-server` |
| Dev command | `python -m uvicorn main:app --reload` |
| Source dir | `src/` |
| Test dirs | `tests/unit`, `tests/integration` |

---

## 📁 Árbol de Archivos (backend/)

```
backend/
├── main.py                    ← FastAPI app (entry point, health check)
├── requirements.txt           ← Dependencias core + dev
├── pyproject.toml             ← PEP 621, pytest config, ruff config
├── src/
│   ├── __init__.py
│   ├── routers/calculadora.py  ← POST /api/v1/sumar
│   ├── models/calculadora.py   ← SumaRequest, SumaResponse (Pydantic)
│   ├── services/calculadora.py ← sumar(a,b) → float (lógica pura)
│   └── middleware/__init__.py   ← Espacio para middlewares (vacío)
└── tests/
    ├── __init__.py
    ├── unit/test_sumador.py     ← 5 tests (enteros, negativos, decimales, cero)
    └── integration/test_sumar.py ← 6 tests (HTTP 200, 422, campos faltantes)
```

---

## 📊 Análisis del Estado Actual

### App

| Aspecto | Detalle |
|---------|---------|
| **Framework** | FastAPI 0.110+ |
| **Puerto** | `8000` |
| **Host** | `0.0.0.0` |
| **Hot reload** | Sí (uvicorn `reload=True`) |
| **Endpoints** | `GET /health` → `{"status": "ok"}` |
| | `POST /api/v1/sumar` → `{"resultado": <float>}` |
| **Python** | `>=3.10` (pyproject.toml), Python 3.11 local (cache) |
| **Tests** | 11 tests (5 unit + 6 integration), todos pasan |
| **Calidad** | Ruff configurado en `pyproject.toml` |

### Dependencias (requirements.txt)

| Dependencia | Versión | Propósito |
|-------------|---------|-----------|
| `fastapi` | >=0.110.0 | Web framework |
| `uvicorn[standard]` | >=0.29.0 | ASGI server |
| `pydantic` | >=2.0.0 | Validación de datos |
| `pytest` | >=8.0.0 | Testing |
| `httpx` | >=0.27.0 | HTTP client para tests |
| `pytest-asyncio` | >=0.23.0 | Soporte async en pytest |
| `ruff` | >=0.3.0 | Linter/formatter |

### Arquitectura

```
Cliente HTTP
    │
    ▼
main.py (FastAPI app factory)
    │
    ▼
src/routers/calculadora.py  ← router = APIRouter(prefix="/api/v1")
    │                          @router.post("/sumar")
    ▼
src/services/calculadora.py  ← sumar(a, b) → float
    │
    ▼
src/models/calculadora.py   ← SumaRequest, SumaResponse (Pydantic BaseModel)
```

---

## 🐳 Plan Docker

### Archivos a crear

| Archivo | Propósito |
|---------|-----------|
| `backend/Dockerfile` | Imagen multi-stage (builder + runtime) |
| `backend/docker-compose.yml` | Orquestación local con hot-reload |
| `backend/.dockerignore` | Excluir caches y artefactos locales |

### Dockerfile (multi-stage)

**Stage 1 — Builder:**
- Base: `python:3.11-slim`
- Instalar dependencias desde `requirements.txt`
- No copiar código fuente (solo dependencias para cache layer)

**Stage 2 — Runtime:**
- Base: `python:3.11-slim`
- Copiar site-packages desde builder
- Copiar `main.py`, `src/`, `pyproject.toml`
- Puerto expuesto: `8000`
- Comando: `python -m uvicorn main:app --host 0.0.0.0 --port 8000`

### docker-compose.yml

```yaml
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    volumes:
      - .:/app          # Hot-reload bind mount
    command: python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### .dockerignore

Excluir:
- `__pycache__/`
- `.pytest_cache/`
- `.ruff_cache/`
- `.git/`
- `.env`
- `*.pyc`
- `.DS_Store`

---

## 📝 Plan Documentación

### Archivos a crear/modificar

| Archivo | Propósito |
|---------|-----------|
| `backend/README.md` | Documentación completa del proyecto |

### README.md — Estructura propuesta

1. **Título y descripción** — "Sumador API — FastAPI modular"
2. **Requisitos** — Python 3.10+, Docker (opcional)
3. **Instalación local** — `pip install -r requirements.txt`, `uvicorn main:app`
4. **Instalación con Docker** — `docker compose up --build`
5. **Uso (curl)** — Ejemplos de `POST /api/v1/sumar` y `GET /health`
6. **Estructura del proyecto** — Árbol de directorios
7. **Testing** — `pytest` (11 tests, unitarios + integración)
8. **Referencia de API** — Endpoints, request/response schemas, códigos de error
   - Opción A: Sección en README
   - Opción B: Archivo separado `docs/API.md`
   - **Recomendación**: Incluir en README (suficiente para proyecto pequeño)

---

## ⚠️ Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Hot-reload con bind mount en macOS lento | Baja | Medio | Usar `.dockerignore` y polling_interval |
| Conflicto de puerto 8000 local | Baja | Bajo | Documentar cambio en compose |
| Cache layer de pip rota con requirements.txt | Baja | Bajo | Mantener `requirements.txt` estable |

**Riesgo general: NINGUNO SIGNIFICATIVO.** El proyecto es simple y los cambios son aditivos (no modifican código existente).

---

## 🔥 Archivos Calientes (Hot Files)

Estos archivos serán tocados durante las fases F2–F4 de este cambio:

| Archivo | Acción |
|---------|--------|
| `backend/Dockerfile` | **CREAR** — Docker multi-stage |
| `backend/docker-compose.yml` | **CREAR** — Orquestación local |
| `backend/.dockerignore` | **CREAR** — Exclusiones Docker |
| `backend/README.md` | **CREAR** — Documentación completa |
| `backend/requirements.txt` | **LEER** (referencia para Dockerfile) |

---

## 📋 Resumen del Cambio

| Aspecto | Valor |
|---------|-------|
| **Change name** | `dockerizar-documentar-fastapi` |
| **Stack** | `python` (FastAPI) |
| **Archivos a crear** | 4 (Dockerfile, docker-compose.yml, .dockerignore, README.md) |
| **Archivos a modificar** | 0 (cambio puramente aditivo) |
| **Tests existentes** | 11 (5 unit + 6 integration) |
| **Complejidad** | Baja |
| **Fase actual** | F0 ✅ (Completada) |
| **Siguiente fase** | F1 — Spec (definir criterios de aceptación) |
