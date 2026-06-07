# 🔍 Diagnóstico F0 — `mejorar-swagger-parametros-calculadora`

> Generado por: **sdd-explorer** (Fase 0)
> Fecha: 2026-06-07
> Objetivo: Enriquecer Swagger con endpoint GET + metadata Pydantic para `POST /api/v1/sumar`

---

## 📦 Stack Profile Detectado

| Campo | Valor |
|---|---|
| **Profile ID** | `python` (FastAPI + Pydantic v2) |
| **Path del Profile** | `node_modules/zugzbot-sdd/profiles/python.json` |
| **Reglas de detección** | `files_any: pyproject.toml`, `files_any: requirements.txt` (en `backend/`) |
| **CWD del subproyecto** | `backend/` |
| **Root profile** | `node-javascript` (solo orquestación `zugzbot-sdd`) |

### Convenciones del Stack

| Convención | Valor |
|---|---|
| **Test Runner** | `pytest` (`python -m pytest`) |
| **Linter** | `ruff` (`ruff check .`) |
| **Formatter** | `ruff format` (vía `pyproject.toml`) |
| **Servidor Dev** | `uvicorn main:app --reload` |
| **Source Dir** | `backend/src` |
| **Test Dir** | `backend/tests` |
| **Unit Tests** | `backend/tests/unit/` |
| **Integration Tests** | `backend/tests/integration/` |
| **Version File** | `backend/pyproject.toml` |

### Dependencias Clave Detectadas

| Dependencia | Versión | Rol |
|---|---|---|
| `fastapi` | ≥0.110.0 | Web framework |
| `uvicorn[standard]` | ≥0.29.0 | ASGI server |
| `pydantic` | ≥2.0.0 | Validación y serialización |
| `pytest` | ≥8.0.0 | Test runner |
| `httpx` | ≥0.27.0 | HTTP client para tests async |
| `pytest-asyncio` | ≥0.23.0 | Soporte async en pytest |
| `ruff` | ≥0.3.0 | Linter/formatter |

---

## 📂 Estructura del Proyecto

```
/
├── .openspec/
│   ├── brain.md                       # 🧠 Lecciones previas (2 entradas)
│   ├── CHANGELOG.md
│   ├── sdd-lock.json
│   └── changes/
│       ├── archive/
│       └── mejorar-swagger-parametros-calculadora/    ← NUEVO
│           ├── specs/                                  ← Vacío (para F1)
│           └── diagnostics.md                          ← Este archivo
├── backend/                            ← 🎯 PROYECTO A MODIFICAR
│   ├── main.py                         ← Entry point (FastAPI app)
│   ├── pyproject.toml                  ← Config Python (pytest, ruff)
│   ├── requirements.txt                ← Dependencias
│   ├── Dockerfile                      ← Docker build
│   ├── docker-compose.yml              ← Docker compose dev
│   ├── src/
│   │   ├── __init__.py
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   └── calculadora.py          ← 🎯 POST /api/v1/sumar
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── calculadora.py          ← 🎯 SumaRequest / SumaResponse
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── calculadora.py          ← 🎯 Lógica pura de suma
│   │   └── middleware/
│   │       └── __init__.py
│   └── tests/
│       ├── __init__.py
│       ├── unit/
│       │   ├── __init__.py
│       │   └── test_sumador.py         ← Tests unitarios de sumar()
│       └── integration/
│           ├── __init__.py
│           ├── test_sumar.py           ← Tests integración POST endpoint
│           └── test_docker.py          ← Tests docker/infra
├── package.json                        ← Orquestación Node (zugzbot-sdd)
└── opencode.json                       ← Configuración de agentes
```

---

## 🎯 Archivos a Modificar (Hot Files)

### 1. `backend/src/models/calculadora.py` — **Enriquecer modelos Pydantic**
- **Estado actual**: `SumaRequest` con campos `a: float` y `b: float` sin metadata
- **Qué hacer**: Añadir `Field(description=..., examples=..., gt=..., lt=...)` a cada campo
- **Punto de inserción**: Línea 9-10 (campos del modelo)

### 2. `backend/src/routers/calculadora.py` — **Añadir endpoint GET**
- **Estado actual**: Solo `POST /api/v1/sumar` con `SumaRequest` body
- **Qué hacer**: Añadir `GET /api/v1/sumar` con query params `a` y `b`
- **Punto de inserción**: Después de la línea 22 (después del endpoint POST)

### 3. `backend/tests/integration/test_sumar.py` — **Tests del nuevo GET**
- **Estado actual**: 6 tests para POST endpoint
- **Qué hacer**: Añadir tests para GET /api/v1/sumar (200 OK, 422 validation, etc.)
- **Punto de inserción**: Después de la última prueba (línea 52)

### 4. `backend/tests/unit/test_sumador.py` — **Tests unitarios adicionales**
- **Estado actual**: 5 tests para `sumar()` function
- **Qué hacer**: Ya cubre suficientes casos; probablemente sin cambios

### 5. `backend/main.py` — **Posible configuración adicional Swagger**
- **Estado actual**: FastAPI app básica con title/description
- **Qué hacer**: Añadir metadatos OpenAPI si se desea personalizar Swagger UI

---

## 🔥 Puntos de Inserción Detallados

### Router (`calculadora.py`) — Nuevo endpoint GET

```python
@router.get("/sumar", response_model=SumaResponse)
async def sumar_get_endpoint(a: float, b: float):
    """Suma dos números vía query parameters.
    
    Args:
        a: Primer sumando (query param).
        b: Segundo sumando (query param).
    
    Returns:
        SumaResponse con el resultado de a + b.
    """
    resultado = sumar(a, b)
    return SumaResponse(resultado=resultado)
```

### Models (`calculadora.py`) — Enriquecimiento con Field

```python
from pydantic import BaseModel, Field

class SumaRequest(BaseModel):
    a: float = Field(
        ..., 
        description="Primer sumando",
        examples=[2.0],
        gt=-1e6,
        lt=1e6,
    )
    b: float = Field(
        ..., 
        description="Segundo sumando",
        examples=[3.0],
        gt=-1e6,
        lt=1e6,
    )
```

---

## ⚠️ Riesgos y Consideraciones

| # | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| 1 | **Rama activa incorrecta**: El working tree está en `sdd/change-dockerizar-documentar-fastapi` con cambios sin commit | ⬆️ Alto | Crear rama `sdd/change-mejorar-swagger-parametros-calculadora` desde el estado limpio |
| 2 | **Working tree sucio**: `session-ses_1607.md` está modificado | ⬇️ Bajo | Ignorar o stashear; no afecta código fuente |
| 3 | **FastAPI + Pydantic v2**: La sintaxis `Field` cambió respecto a v1 | ⬇️ Bajo | Usar `from pydantic import Field` (v2 nativa, compatible con ≥2.0.0) |
| 4 | **Compatibilidad POST existente**: No romper el endpoint POST actual | ⬇️ Bajo | GET es ortogonal al POST; ambos pueden coexistir |
| 5 | **Swagger no refresca automáticamente**: Si hay caché del navegador | ⬇️ Bajo | Swagger UI se regenera en cada reload de Uvicorn |

---

## ✅ Checklist de Diagnóstico

- [x] Stack profile detectado: `python` (FastAPI + Pydantic v2)
- [x] Subproject CWD: `backend/`
- [x] Lockfile actualizado con stack_profile y git info
- [x] 5 archivos clave identificados para modificación
- [x] Puntos de inserción mapeados
- [ ] Pendiente: Cambiar rama Git a `sdd/change-mejorar-swagger-parametros-calculadora`
