---
spec_version: "1.0"
change_name: "fastapi-sumador"
modo_qa: "automatizado"
design_skill: "ninguna"
archivos_afectados:
  - "backend/main.py (Líneas 1-26: importar y registrar router)"
  - "backend/src/routers/calculadora.py (CREAR: endpoint /api/v1/sumar)"
  - "backend/src/services/calculadora.py (CREAR: lógica de suma pura)"
  - "backend/src/models/calculadora.py (CREAR: schemas Pydantic)"
  - "backend/tests/unit/test_sumador.py (CREAR: tests unitarios del servicio)"
  - "backend/tests/integration/test_sumar.py (CREAR: tests de integración con TestClient)"
criterios_aceptacion:
  - id: "CA1"
    descripcion: "Sumar dos números enteros positivos retorna 200 con el resultado correcto"
  - id: "CA2"
    descripcion: "Sumar dos números negativos retorna 200 con el resultado correcto"
  - id: "CA3"
    descripcion: "Sumar dos números decimales (float) retorna 200 con el resultado correcto"
  - id: "CA4"
    descripcion: "Falta de parámetros requeridos retorna 422 con mensaje de validación"
  - id: "CA5"
    descripcion: "Parámetro no numérico retorna 422 con mensaje de validación"
  - id: "CA6"
    descripcion: "El servicio de suma funciona correctamente sin dependencia de FastAPI"
---

# Especificación Técnica del Cambio

## 1. Diagnóstico y Archivos Afectados

Se requiere implementar un endpoint REST en FastAPI que reciba dos números y retorne su suma.
El proyecto ya cuenta con la estructura base (`main.py`, `pyproject.toml`, directorios `src/` y `tests/`)
generada por la Fase 0. Los archivos a crear y modificar son:

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `backend/src/services/calculadora.py` | CREAR | Lógica de suma pura (sin dependencias de FastAPI) |
| `backend/src/models/calculadora.py` | CREAR | Schemas Pydantic para request/response |
| `backend/src/routers/calculadora.py` | CREAR | Endpoint `/api/v1/sumar` con validación |
| `backend/main.py` | MODIFICAR | Importar y registrar el router `calculadora` |
| `backend/tests/unit/test_sumador.py` | CREAR | Tests unitarios del servicio (lógica pura) |
| `backend/tests/integration/test_sumar.py` | CREAR | Tests de integración con TestClient de FastAPI |

## 2. Consenso con el Usuario

- **Endpoint**: `POST /api/v1/sumar` — se elige POST con JSON body en lugar de GET con query params
  porque (a) es una operación de cómputo, no de recuperación de recursos, y (b) permite escalar
  a más parámetros en el futuro sin problemas de longitud de URL.
- **Estructura modular**: El proyecto sigue el patrón de arquitectura limpia con capas separadas:
  `routers → services → models`, facilitando la adición de nuevos endpoints en el futuro.
- **Versionado**: Prefijo `/api/v1` desde el inicio para permitir versionado futuro sin cambios
  disruptivos.
- **Design Skill**: Ninguna — no hay interfaz de usuario (solo API REST).
- **Stack**: Python 3.10+ con FastAPI, Pydantic v2, pytest, httpx.
- **Complejidad**: Baja — un endpoint simple con lógica de suma.

## 3. Propuesta de Solución

### Arquitectura

Se implementa una arquitectura en 3 capas estrictamente separadas:

```
FastAPI Router (src/routers/calculadora.py)
    ↓ llama
Service Layer (src/services/calculadora.py)
    ↓ usa
Pydantic Models (src/models/calculadora.py)
```

**1. Models (`src/models/calculadora.py`)**
   - `SumaRequest(BaseModel)`: campos `a: float` y `b: float`
   - `SumaResponse(BaseModel)`: campo `resultado: float`
   - Validación automática via Pydantic (tipos, rangos, etc.)

**2. Service (`src/services/calculadora.py`)**
   - `def sumar(a: float, b: float) -> float`: función pura, sin I/O, sin dependencias de FastAPI
   - Fácilmente testeable: `assert sumar(2, 3) == 5.0`

**3. Router (`src/routers/calculadora.py`)**
   - `POST /api/v1/sumar`: recibe `SumaRequest`, llama al servicio, retorna `SumaResponse`
   - Manejo de errores: si faltan campos, Pydantic retorna 422 automáticamente

**4. Main (`main.py`)**
   - Importar `calculadora_router` y registrar con `app.include_router(router, prefix="/api/v1")`

### Diagrama de flujo

```
Cliente HTTP
  │ POST /api/v1/sumar {"a": 2, "b": 3}
  ▼
main.py (FastAPI app)
  │ router registrado en /api/v1
  ▼
src/routers/calculadora.py
  │ Valida body con SumaRequest (Pydantic → 422 si inválido)
  ▼
src/services/calculadora.py
  │ sumar(a, b) → resultado
  ▼
src/models/calculadora.py
  │ SumaResponse(resultado=5.0)
  ▼
Response 200 {"resultado": 5.0}
```

### Escalabilidad futura

| Escenario | Cómo se maneja |
|-----------|----------------|
| Nuevo endpoint (resta, multi, div) | Nuevo archivo en `routers/` + `services/` |
| Autenticación | Middleware en `src/middleware/auth.py` |
| Rate limiting | Middleware en `src/middleware/ratelimit.py` |
| Logging | Middleware existente o decoradores |
| Tests de integración adicionales | Nuevo archivo en `tests/integration/` |

## 4. Especificaciones de Comportamiento (BDD)

Escenario: Suma exitosa de dos números enteros positivos
  Dado que el servicio sumador está operativo
  Cuando se envía una solicitud POST a "/api/v1/sumar" con body {"a": 2, "b": 3}
  Entonces la respuesta debe tener código HTTP 200
  Y el body debe contener {"resultado": 5.0}

Escenario: Suma exitosa de dos números enteros negativos
  Dado que el servicio sumador está operativo
  Cuando se envía una solicitud POST a "/api/v1/sumar" con body {"a": -5, "b": -3}
  Entonces la respuesta debe tener código HTTP 200
  Y el body debe contener {"resultado": -8.0}

Escenario: Suma exitosa de dos números decimales
  Dado que el servicio sumador está operativo
  Cuando se envía una solicitud POST a "/api/v1/sumar" con body {"a": 3.14, "b": 2.86}
  Entonces la respuesta debe tener código HTTP 200
  Y el body debe contener {"resultado": 6.0}

Escenario: Error por falta de parámetro requerido
  Dado que el servicio sumador está operativo
  Cuando se envía una solicitud POST a "/api/v1/sumar" con body {"a": 5}
  Entonces la respuesta debe tener código HTTP 422
  Y el body debe contener un mensaje de error indicando que "b" es requerido

Escenario: Error por parámetro no numérico
  Dado que el servicio sumador está operativo
  Cuando se envía una solicitud POST a "/api/v1/sumar" con body {"a": "hola", "b": 3}
  Entonces la respuesta debe tener código HTTP 422
  Y el body debe contener un mensaje de error indicando que "a" debe ser numérico

Escenario: Servicio de suma funciona sin FastAPI (test unitario)
  Dado el módulo src.services.calculadora
  Cuando se invoca sumar(2, 3) directamente
  Entonces debe retornar 5.0 sin lanzar excepciones

## 5. Criterios de Aceptación

- [ ] **CA1**: Sumar dos números enteros positivos retorna 200 con el resultado correcto.
  - Test: `test_sumar_positivos` → POST `{"a": 2, "b": 3}` → 200 `{"resultado": 5.0}`
- [ ] **CA2**: Sumar dos números negativos retorna 200 con el resultado correcto.
  - Test: `test_sumar_negativos` → POST `{"a": -5, "b": -3}` → 200 `{"resultado": -8.0}`
- [ ] **CA3**: Sumar dos números decimales retorna 200 con el resultado correcto.
  - Test: `test_sumar_decimales` → POST `{"a": 3.14, "b": 2.86}` → 200 `{"resultado": 6.0}`
- [ ] **CA4**: Falta de parámetros requeridos retorna 422 con mensaje de validación.
  - Test: `test_sumar_falta_parametro` → POST `{"a": 5}` → 422
- [ ] **CA5**: Parámetro no numérico retorna 422 con mensaje de validación.
  - Test: `test_sumar_parametro_no_numerico` → POST `{"a": "hola", "b": 3}` → 422
- [ ] **CA6**: El servicio de suma funciona correctamente sin dependencia de FastAPI.
  - Test unitario: `test_sumador_suma` → `sumar(2, 3) == 5.0` sin importar FastAPI
