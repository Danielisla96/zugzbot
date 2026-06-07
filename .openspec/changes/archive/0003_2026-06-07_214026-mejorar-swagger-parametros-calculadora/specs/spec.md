---
spec_version: "1.0"
change_name: "mejorar-swagger-parametros-calculadora"
modo_qa: "automatizado"
design_skill: "ninguna"
archivos_afectados:
  - "backend/src/models/calculadora.py (Líneas 1-16) — enriquecer modelos con pydantic.Field()"
  - "backend/src/routers/calculadora.py (Líneas 1-22) — añadir endpoint GET /api/v1/sumar y eliminar endpoint POST existente"
  - "backend/tests/integration/test_sumar.py (Líneas 52 en adelante) — añadir tests para GET y eliminar tests del POST"
criterios_aceptacion:
  - id: "CA1"
    descripcion: "GET /api/v1/sumar?a=2&b=3 retorna status 200 y resultado 5.0"
  - id: "CA2"
    descripcion: "GET /api/v1/sumar?a=-5&b=-3 retorna status 200 y resultado -8.0"
  - id: "CA3"
    descripcion: "GET /api/v1/sumar?a=3.14&b=2.86 retorna status 200 y resultado 6.0"
  - id: "CA4"
    descripcion: "GET /api/v1/sumar (sin parámetro 'a') retorna status 422"
  - id: "CA5"
    descripcion: "GET /api/v1/sumar (sin parámetro 'b') retorna status 422"
  - id: "CA6"
    descripcion: "GET /api/v1/sumar?a=hola&b=3 retorna status 422 por tipo inválido"
  - id: "CA7"
    descripcion: "Modelos Pydantic tienen Field() con description, examples, gt=-1000, lt=1000 visibles en /docs"
  - id: "CA8"
    descripcion: "GET /api/v1/sumar?a=1000&b=1 retorna 422 por exceder lt=1000 en modelo subyacente (validación cruzada)"
---

# Especificación Técnica del Cambio

## 1. Diagnóstico y Archivos Afectados

**Problema**: El endpoint `POST /api/v1/sumar` expone un request body JSON crudo en Swagger UI. El usuario debe escribir manualmente `{"a": 5, "b": 3}`, lo cual no es amigable ni descubrible. No existe un endpoint con query parameters que muestre campos individuales con inputs numéricos directos.

**Stack**: Python 3.10+ / FastAPI / Pydantic v2 / pytest

**Archivos afectados**:

| Archivo | Estado | Cambio |
|---|---|---|
| `backend/src/models/calculadora.py` (Líneas 1-16) | 🔧 MODIFICAR | Enriquecer `SumaRequest` con `pydantic.Field(description=..., examples=..., gt=-1000, lt=1000)` |
| `backend/src/routers/calculadora.py` (Líneas 1-22) | 🔧 MODIFICAR | Añadir endpoint `GET /api/v1/sumar` con query parameters usando `fastapi.Query` y validación Pydantic; eliminar endpoint POST existente |
| `backend/tests/integration/test_sumar.py` (Líneas 52 en adelante) | 🔧 MODIFICAR | Añadir tests de integración para GET y eliminar tests del POST |
| `backend/src/services/calculadora.py` (Líneas 1-14) | ✅ SIN CAMBIOS | Lógica pura de suma — no requiere modificación |
| `backend/main.py` (Líneas 1-30) | ✅ SIN CAMBIOS | El router se incluye automáticamente; no requiere cambios |

## 2. Consenso con el Usuario

- **No se requiere frontend**: El cambio es 100% backend. La mejora de UX se logra vía Swagger UI generado automáticamente por FastAPI. Por tanto, `design_skill` se declara como `ninguna`.
- **El nuevo endpoint será GET** con query parameters `a` y `b`, utilizando el mismo service `sumar()` existente.
- **Se elimina el endpoint POST**: Por decisión del usuario, el endpoint `POST /api/v1/sumar` se elimina por completo. Solo existirá el endpoint GET.
- **Se usa `pydantic.Field()`** en lugar de `fastapi.Query()` para el enriquecimiento del modelo (description, examples, gt, lt) porque el Field persiste en la documentación independientemente del endpoint.
- **Validación cruzada**: Los parámetros del GET se validan contra el modelo `SumaRequest` enriquecido (con gt/lt) para mantener consistencia con el modelo Pydantic.
- **Tests**: Se añaden al archivo existente `test_sumar.py` (no se crea archivo nuevo) para mantener cohesión del módulo "sumar".
- **No se requieren nuevas dependencias**: FastAPI ya incluye soporte para Query parameters y Pydantic Field.

## 3. Propuesta de Solución

### 3.1 Enriquecer modelos (`models/calculadora.py`)

Se modifica `SumaRequest` para que todos sus campos usen `pydantic.Field()` con metadatos de documentación:

```python
from pydantic import BaseModel, Field

class SumaRequest(BaseModel):
    a: float = Field(
        ..., 
        description="Primer número a sumar",
        examples=[5],
        gt=-1000,
        lt=1000,
    )
    b: float = Field(
        ..., 
        description="Segundo número a sumar",
        examples=[3],
        gt=-1000,
        lt=1000,
    )
```

Esto hará que Swagger UI muestre descripciones, ejemplos, y límites mínimo/máximo para ambos campos en el endpoint GET.

### 3.2 Nuevo endpoint GET (`routers/calculadora.py`)

Se añade una nueva función `sumar_get_endpoint` que:
1. Declara `a` y `b` como query parameters usando `fastapi.Query()` con los mismos metadatos (description, examples, gt, lt)
2. Reutiliza `sumar()` del service
3. Retorna el mismo `SumaResponse`

**Estrategia de validación**: Aunque los query parameters se validan con `fastapi.Query(gt=..., lt=...)`, también se instancia el modelo `SumaRequest` internamente para cruzar validaciones sobre el modelo enriquecido con `pydantic.Field()`.

```python
@router.get("/sumar", response_model=SumaResponse)
async def sumar_get_endpoint(
    a: float = Query(..., description="Primer número a sumar", examples=[5], gt=-1000, lt=1000),
    b: float = Query(..., description="Segundo número a sumar", examples=[3], gt=-1000, lt=1000),
):
    # Validación cruzada contra el modelo Pydantic
    request = SumaRequest(a=a, b=b)
    resultado = sumar(request.a, request.b)
    return SumaResponse(resultado=resultado)
```

### 3.3 Eliminación del endpoint POST

El endpoint `POST /api/v1/sumar` existente se elimina por completo. Esto implica:

1. Eliminar la función `sumar_post_endpoint` (o su equivalente) en `routers/calculadora.py`
2. Si el modelo `SumaRequest` deja de usarse exclusivamente para POST, se mantiene igualmente para la validación cruzada del GET
3. Eliminar los tests de integración correspondientes al POST en `test_sumar.py`

### 3.4 Tests de integración

Se añaden 6 nuevos tests al archivo `test_sumar.py` que cubren:

- **CA1-CA3**: Casos felices (positivos, negativos, decimales)
- **CA4-CA6**: Casos de error (parámetros faltantes, tipo inválido)
- **CA7-CA8**: Validación de límites (gt/lt)

### 3.5 Árbol de decisión de validación

```
GET /api/v1/sumar?a=...&b=...
  │
  ├─ ¿Falta 'a' o 'b'? ──Sí──> 422 (Validation Error)
  │
  ├─ ¿'a' o 'b' no son float? ──Sí──> 422 (Validation Error)
  │
  ├─ ¿a <= -1000 o b <= -1000? ──Sí──> 422 (gt violation)
  │
  ├─ ¿a >= 1000 o b >= 1000? ──Sí──> 422 (lt violation)
  │
  └─ Todo OK ──> 200 { "resultado": a + b }
```

## 4. Especificaciones de Comportamiento (BDD)

Escenario: Suma exitosa con enteros positivos vía GET
  Dado que el endpoint GET /api/v1/sumar está disponible
  Cuando se envía una solicitud GET con "a=2" y "b=3"
  Entonces la respuesta debe tener status code 200
  Y el body debe ser exactamente {"resultado": 5.0}

Escenario: Suma exitosa con enteros negativos vía GET
  Dado que el endpoint GET /api/v1/sumar está disponible
  Cuando se envía una solicitud GET con "a=-5" y "b=-3"
  Entonces la respuesta debe tener status code 200
  Y el body debe ser exactamente {"resultado": -8.0}

Escenario: Suma exitosa con decimales vía GET
  Dado que el endpoint GET /api/v1/sumar está disponible
  Cuando se envía una solicitud GET con "a=3.14" y "b=2.86"
  Entonces la respuesta debe tener status code 200
  Y el body debe ser exactamente {"resultado": 6.0}

Escenario: Parámetro 'a' faltante en GET
  Dado que el endpoint GET /api/v1/sumar está disponible
  Cuando se envía una solicitud GET sin el parámetro "a"
  Entonces la respuesta debe tener status code 422

Escenario: Parámetro 'b' faltante en GET
  Dado que el endpoint GET /api/v1/sumar está disponible
  Cuando se envía una solicitud GET sin el parámetro "b"
  Entonces la respuesta debe tener status code 422

Escenario: Parámetro no numérico en GET
  Dado que el endpoint GET /api/v1/sumar está disponible
  Cuando se envía una solicitud GET con "a=hola" y "b=3"
  Entonces la respuesta debe tener status code 422

Escenario: Límite inferior (gt) en GET
  Dado que el endpoint GET /api/v1/sumar está disponible
  Cuando se envía una solicitud GET con "a=-1001" y "b=5"
  Entonces la respuesta debe tener status code 422
  Porque el valor -1001 está por debajo del límite gt=-1000

Escenario: Límite superior (lt) en GET
  Dado que el endpoint GET /api/v1/sumar está disponible
  Cuando se envía una solicitud GET con "a=1000" y "b=1"
  Entonces la respuesta debe tener status code 422
  Porque el valor 1000 está por encima del límite lt=1000

Escenario: Documentación enriquecida visible en Swagger
  Dado que la aplicación está ejecutándose
  Cuando se accede a /docs (OpenAPI/Swagger UI)
  Entonces los campos "a" y "b" deben mostrar description, examples y límites gt/lt
  Y el modelo SumaRequest debe incluir los metadatos definidos con pydantic.Field()

## 5. Criterios de Aceptación

- [ ] **CA1**: GET /api/v1/sumar?a=2&b=3 retorna status 200 y resultado 5.0
- [ ] **CA2**: GET /api/v1/sumar?a=-5&b=-3 retorna status 200 y resultado -8.0
- [ ] **CA3**: GET /api/v1/sumar?a=3.14&b=2.86 retorna status 200 y resultado 6.0
- [ ] **CA4**: GET /api/v1/sumar (sin parámetro 'a') retorna status 422
- [ ] **CA5**: GET /api/v1/sumar (sin parámetro 'b') retorna status 422
- [ ] **CA6**: GET /api/v1/sumar?a=hola&b=3 retorna status 422 por tipo inválido
- [ ] **CA7**: Modelos Pydantic tienen Field() con description, examples, gt=-1000, lt=1000 visibles en /docs
- [ ] **CA8**: GET /api/v1/sumar?a=1000&b=1 retorna 422 por exceder lt=1000
