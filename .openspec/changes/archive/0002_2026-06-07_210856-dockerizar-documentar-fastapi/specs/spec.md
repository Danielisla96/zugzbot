---
spec_version: "1.0"
change_name: "dockerizar-documentar-fastapi"
modo_qa: "automatizado"
design_skill: "ninguna"
archivos_afectados:
  - "backend/Dockerfile (Todas las líneas, archivo nuevo)"
  - "backend/docker-compose.yml (Todas las líneas, archivo nuevo)"
  - "backend/.dockerignore (Todas las líneas, archivo nuevo)"
  - "backend/README.md (Todas las líneas, archivo nuevo)"
criterios_aceptacion:
  - id: "CA1"
    descripcion: "docker build se ejecuta sin errores y produce una imagen etiquetada fastapi-sumador"
  - id: "CA2"
    descripcion: "docker-compose up levanta el servicio y responde en puerto 8000 (GET /health → 200)"
  - id: "CA3"
    descripcion: "POST /api/v1/sumar funciona dentro del contenedor desde el host (curl → resultado correcto)"
  - id: "CA4"
    descripcion: "Los 11 tests (pytest) pasan dentro del contenedor con docker-compose exec"
  - id: "CA5"
    descripcion: ".dockerignore excluye __pycache__/, .pytest_cache/, .ruff_cache/, .git/, .env, *.pyc, .DS_Store"
  - id: "CA6"
    descripcion: "README.md contiene secciones: descripción, requisitos, instalación local, instalación Docker, uso con curl, estructura, testing, endpoints"
  - id: "CA7"
    descripcion: "README.md referencia de API documenta POST /api/v1/sumar con request/response examples en JSON"
  - id: "CA8"
    descripcion: "README.md incluye instrucciones claras para construir y ejecutar con Docker compose"
---

# Especificación Técnica del Cambio

## 1. Diagnóstico y Archivos Afectados

### Diagnóstico
El proyecto `Sumador API` es una aplicación FastAPI modular con arquitectura 3-capas (Router → Service → Models) que expone `POST /api/v1/sumar` y `GET /health`. Cuenta con 11 tests (5 unitarios + 6 de integración) que pasan correctamente. El proyecto funciona solo en entorno local sin Docker, y carece de documentación formal.

**Problema**: No hay forma estandarizada de ejecutar la aplicación en entornos aislados (Docker), ni documentación que describa el proyecto, su instalación, uso y referencia de API.

**Solución aditiva**: Crear 4 archivos nuevos sin modificar código existente.

### Archivos Afectados

| Archivo | Acción | Propósito |
|---------|--------|-----------|
| `backend/Dockerfile` | **CREAR** | Build multi-stage: builder (instala deps) + runtime (imagen mínima). Python 3.11-slim, puerto 8000 |
| `backend/docker-compose.yml` | **CREAR** | Servicio backend con hot-reload, bind mount, mapeo puerto 8000 |
| `backend/.dockerignore` | **CREAR** | Excluir `__pycache__/`, `.pytest_cache/`, `.ruff_cache/`, `.git/`, `.env`, `*.pyc`, `.DS_Store` |
| `backend/README.md` | **CREAR** | Documentación completa: descripción, requisitos, instalación local/Docker, uso (curl), estructura, testing, referencia de API |

## 2. Consenso con el Usuario

- La petición del usuario es clara y completa: "Dockeriza mi app y genera documentación". No se requieren preguntas adicionales.
- **Design Skill**: Ninguna. Los archivos a crear son Docker/de documentación, no interfaz de usuario.
- **Modo QA**: Automatizado. Todos los criterios son verificables mediante comandos CLI y curl.
- **Complejidad**: Baja. Cambio puramente aditivo (0 archivos modificados, 4 archivos creados).
- **Formato README**: Single Source of Truth — toda la documentación en un solo archivo, sin directorio `docs/` separado (proyecto pequeño).
- **Dockerfile**: Multi-stage para optimizar tamaño de imagen final (separar deps de runtime).
- **docker-compose**: Bind mount del código para hot-reload en desarrollo con `--reload` de Uvicorn.

## 3. Propuesta de Solución

### Arquitectura Docker

```
backend/
├── Dockerfile              ← Multi-stage (builder → runtime)
│   Stage 1 (builder):
│     - python:3.11-slim
│     - COPY requirements.txt
│     - RUN pip install --user -r requirements.txt
│   Stage 2 (runtime):
│     - python:3.11-slim
│     - COPY --from=builder /root/.local /root/.local
│     - COPY main.py, src/, pyproject.toml
│     - EXPOSE 8000
│     - CMD python -m uvicorn main:app --host 0.0.0.0 --port 8000
│
├── docker-compose.yml      ← Servicio "backend"
│     - build: context=., dockerfile=Dockerfile
│     - ports: "8000:8000"
│     - volumes: .:/app (bind mount)
│     - command: uvicorn con --reload
│
├── .dockerignore           ← Excluir caches, git, pyc, DS_Store
│
└── README.md               ← Documentación completa
      - Título + descripción
      - Requisitos (Python 3.10+, Docker opcional)
      - Instalación local (pip install, uvicorn)
      - Instalación Docker (docker compose up --build)
      - Uso con curl (POST /api/v1/sumar, GET /health)
      - Estructura del proyecto
      - Testing (pytest, 11 tests)
      - Referencia de API (POST /api/v1/sumar con request/response)
```

### Decisiones Técnicas

1. **Multi-stage build**: Reduce la imagen final drásticamente. Stage `builder` instala dependencias; stage `runtime` copia solo lo necesario.
2. **python:3.11-slim**: Imagen oficial ligera de Python 3.11 (compatible con `>=3.10` del `pyproject.toml`).
3. **Bind mount en compose**: Permite hot-reload en desarrollo sin reconstruir la imagen en cada cambio.
4. **.dockerignore agresivo**: Mantiene el contexto de build pequeño, acelerando builds.
5. **README como SSOT**: Un solo archivo de documentación evita fragmentación en un proyecto pequeño.

### Orden de Implementación (F2-F4)

1. Crear `backend/Dockerfile` (multi-stage)
2. Crear `backend/.dockerignore`
3. Crear `backend/docker-compose.yml`
4. Crear `backend/README.md`
5. Validar: `docker build`, `docker-compose up`, curl, pytest dentro del contenedor

## 4. Especificaciones de Comportamiento (BDD)

Escenario: Build de imagen Docker exitoso
  Dado que el directorio `backend/` contiene el código fuente de la app FastAPI
  Cuando ejecuto `docker build -t fastapi-sumador .` desde `backend/`
  Entonces el comando retorna exitosamente (código 0)
  Y la imagen `fastapi-sumador:latest` queda disponible en el registro local de Docker

Escenario: Servicio responde en puerto 8000
  Dado que la imagen Docker ha sido construida exitosamente
  Cuando ejecuto `docker-compose up -d` desde `backend/`
  Entonces el contenedor se inicia sin errores
  Y `curl -s http://localhost:8000/health` retorna `{"status":"ok"}` con HTTP 200

Escenario: Endpoint POST /api/v1/sumar funciona dentro del contenedor
  Dado que el servicio Docker está corriendo en puerto 8000
  Cuando ejecuto `curl -s -X POST http://localhost:8000/api/v1/sumar -H "Content-Type: application/json" -d '{"a": 3, "b": 5}'`
  Entonces la respuesta es `{"resultado":8.0}` con HTTP 200

Escenario: Tests pasan dentro del contenedor
  Dado que el servicio Docker está corriendo
  Cuando ejecuto `docker-compose exec backend pytest -v`
  Entonces la salida muestra "11 passed" (todos los tests existentes pasan)

Escenario: .dockerignore excluye correctamente archivos de caché
  Dado que existe el archivo `backend/.dockerignore`
  Cuando reviso su contenido
  Entonces contiene exclusiones para `__pycache__/`, `.pytest_cache/`, `.ruff_cache/`, `.git/`, `.env`, `*.pyc`, y `.DS_Store`

Escenario: README contiene secciones obligatorias
  Dado que existe el archivo `backend/README.md`
  Cuando reviso su contenido
  Entonces incluye las secciones: descripción del proyecto, requisitos, instalación local, instalación con Docker, ejemplos de uso con curl, estructura de directorios, testing, y referencia de API

Escenario: Referencia de API documenta POST /api/v1/sumar
  Dado el archivo `backend/README.md`
  Cuando busco la referencia de API
  Entonces encuentro documentación de `POST /api/v1/sumar` con ejemplo de request (`{"a": 3, "b": 5}`) y response (`{"resultado": 8.0}`)

Escenario: README incluye instrucciones Docker
  Dado el archivo `backend/README.md`
  Cuando reviso la sección de Docker
  Entonces incluye instrucciones claras para construir y ejecutar con `docker compose up --build`

## 5. Criterios de Aceptación

- [ ] **CA1**: `docker build -t fastapi-sumador .` desde `backend/` se ejecuta sin errores y la imagen `fastapi-sumador:latest` se crea exitosamente.
- [ ] **CA2**: `docker-compose up -d` desde `backend/` levanta el servicio y `curl -s http://localhost:8000/health` retorna HTTP 200 con `{"status":"ok"}`.
- [ ] **CA3**: `curl -s -X POST http://localhost:8000/api/v1/sumar -H "Content-Type: application/json" -d '{"a": 3, "b": 5}'` retorna `{"resultado":8.0}` con HTTP 200.
- [ ] **CA4**: `docker-compose exec backend pytest -v` muestra "11 passed" (todos los tests unitarios y de integración pasan).
- [ ] **CA5**: `.dockerignore` contiene exclusiones para `__pycache__/`, `.pytest_cache/`, `.ruff_cache/`, `.git/`, `.env`, `*.pyc`, `.DS_Store`.
- [ ] **CA6**: `README.md` incluye todas las secciones requeridas: descripción, requisitos, instalación local, instalación Docker, uso (curl), estructura, testing, endpoints.
- [ ] **CA7**: La referencia de API en `README.md` documenta `POST /api/v1/sumar` con ejemplos de request JSON y response JSON.
- [ ] **CA8**: `README.md` incluye instrucciones explícitas para construir y ejecutar la aplicación con Docker compose.
