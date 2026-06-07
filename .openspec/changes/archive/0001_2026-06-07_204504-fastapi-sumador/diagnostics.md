# 🔍 Diagnóstico del Proyecto — fastapi-sumador

> Generado por **sdd-explorer** (Fase 0)

---

## 🔎 Stack Profile Detectado

| Campo | Valor |
|-------|-------|
| **Profile ID** | `python` |
| **Display Name** | Python (Django / FastAPI / Flask / CLI) |
| **Subproyecto** | `backend/` |
| **Framework elegido** | FastAPI |
| **Python mínimo** | 3.10+ |
| **Path del profile** | `.opencode/profiles/python.json` |

### Reglas de detección que matchearon

| Regla | Archivo detectado |
|-------|-------------------|
| `files_any: pyproject.toml` | `backend/pyproject.toml` |
| `files_any: requirements.txt` | `backend/requirements.txt` |

### Convenciones del stack (extraídas del profile)

| Convención | Valor |
|------------|-------|
| **Test runner** | `pytest` / `python -m pytest` |
| **Linter** | `ruff check .` |
| **Formatter** | `ruff format .` |
| **Test dir** | `tests/` |
| **Unit test dir** | `tests/unit/` |
| **Integration test dir** | `tests/integration/` |
| **Source dir** | `src/` |
| **Dev server** | `python -m uvicorn main:app --reload` |
| **Build** | `python -m build` |

---

## 📁 Estructura de Directorios Propuesta

```
backend/
├── main.py                  ← Entry point FastAPI (app factory)
├── requirements.txt         ← Dependencias de producción
├── pyproject.toml           ← Configuración del proyecto (PEP 621)
├── src/
│   ├── __init__.py
│   ├── routers/             ← Routers modulares (cada endpoint en su archivo)
│   │   └── __init__.py
│   ├── models/              ← Schemas Pydantic (request/response)
│   │   └── __init__.py
│   ├── services/            ← Lógica de negocio pura, sin dependencias de framework
│   │   └── __init__.py
│   └── middleware/          ← Middlewares personalizados (logging, CORS, etc.)
│       └── __init__.py
└── tests/
    ├── __init__.py
    ├── unit/                ← Tests unitarios (sin I/O ni HTTP)
    │   └── __init__.py
    └── integration/         ← Tests de integración (con TestClient)
        └── __init__.py
```

### 📌 Justificación de escalabilidad

| Decisión | Motivo |
|----------|--------|
| **Routers separados** (`src/routers/`) | Cada nuevo endpoint es un archivo independiente — no se acumula lógica en `main.py`. Escala horizontalmente. |
| **Capa de servicios** (`src/services/`) | La lógica de negocio vive separada del transporte HTTP. Se puede testear sin FastAPI. |
| **Modelos Pydantic** (`src/models/`) | Schemas reutilizables entre routers, services y tests. Validación centralizada. |
| **Middlewares** (`src/middleware/`) | CORS, timing, logging, rate-limiting — todo modular y desacoplado. |
| **Tests separados** (unit / integration) | Los tests unitarios son rápidos (no requieren app); los de integración usan TestClient. Se pueden ejecutar por separado. |
| **pyproject.toml** (PEP 621) | Estándar moderno de Python. Un solo archivo para metadatos, dependencias, pytest config y ruff config. |

---

## 🧰 Herramientas Detectadas / Configuradas

| Herramienta | Estado | Comando |
|-------------|--------|---------|
| **pytest** | ✅ Configurado en `pyproject.toml` | `pytest` o `python -m pytest` |
| **ruff (lint)** | ✅ Configurado en `pyproject.toml` | `ruff check .` |
| **ruff (format)** | ✅ Configurado en `pyproject.toml` | `ruff format .` |

### Configuraciones activas en `pyproject.toml`

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
asyncio_mode = "auto"

[tool.ruff]
target-version = "py310"
line-length = 100
```

---

## 📦 Dependencias Necesarias

### Producción

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `fastapi` | ≥0.110.0 | Framework web asíncrono |
| `uvicorn[standard]` | ≥0.29.0 | Servidor ASGI |
| `pydantic` | ≥2.0.0 | Validación de datos / schemas |

### Desarrollo

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `pytest` | ≥8.0.0 | Test runner |
| `httpx` | ≥0.27.0 | Cliente HTTP para tests de integración |
| `pytest-asyncio` | ≥0.23.0 | Soporte asyncio en pytest |
| `ruff` | ≥0.3.0 | Linter + formatter |

---

## ⚠️ Riesgos Identificados

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| Ninguno significativo para este cambio | 🟢 Bajo | Cambio simple de un endpoint de suma. La estructura escalable ya está preparada para crecimiento futuro. |

---

## 🚀 Plan de Acción Recomendado

| Fase | Acción |
|------|--------|
| **F1** | Definir spec del endpoint `/sumar` con parámetros `a` y `b`, response `{resultado: number}`. Criterios de aceptación claros (números positivos, negativos, decimales, error si no son números). |
| **F2-RED** | Escribir tests que fallen (unit: servicio suma; integración: GET /sumar?a=2&b=3 → 5) |
| **F2-GREEN** | Implementar la lógica mínima para que los tests pasen (servicio puro + router) |
| **F2-REFACTOR** | Limpiar con ruff, mejorar tipos, asegurar cobertura |
| **F3** | Validar contra spec + regression test |
| **F4** | Levantar servidor de desarrollo local y verificar manualmente |
| **F5** | Archivar y cerrar |

---

## 🔥 Archivos Calientes (Hot Files)

Estos archivos serán tocados con alta probabilidad en las próximas fases:

| Archivo | Fase probable | Razón |
|---------|---------------|-------|
| `backend/main.py` | F2-GREEN | Se importarán y conectarán los routers al `app` |
| `backend/src/services/sumador.py` | F2-GREEN / F1 | Lógica de suma (aún no creado, se creará en F2) |
| `backend/src/routers/sumar.py` | F2-GREEN | Endpoint `/sumar` (aún no creado) |
| `backend/src/models/schemas.py` | F1 / F2 | Schemas Pydantic de request/response |
| `backend/tests/integration/test_sumar.py` | F2-RED | Tests de integración para el endpoint |
| `backend/tests/unit/test_sumador.py` | F2-RED | Tests unitarios para el servicio de suma |
