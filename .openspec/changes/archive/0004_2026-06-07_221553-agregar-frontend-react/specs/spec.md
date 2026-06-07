---
spec_version: "1.0"
change_name: "agregar-frontend-react"
modo_qa: "automatizado"
design_skill: "premium"
archivos_afectados:
  - "backend/main.py (Líneas 1-30)"
  - "frontend/package.json (NUEVO)"
  - "frontend/tsconfig.json (NUEVO)"
  - "frontend/vite.config.ts (NUEVO)"
  - "frontend/index.html (NUEVO)"
  - "frontend/src/main.tsx (NUEVO)"
  - "frontend/src/App.tsx (NUEVO)"
  - "frontend/src/App.css (NUEVO)"
  - "frontend/src/components/Calculadora.tsx (NUEVO)"
  - "frontend/src/components/Calculadora.css (NUEVO)"
  - "frontend/Dockerfile (NUEVO)"
  - "frontend/src/__tests__/Calculadora.test.tsx (NUEVO)"
  - "docker-compose.yml (NUEVO, raíz)"
  - "backend/.dockerignore (MODIFICADO, agregar node_modules)"
criterios_aceptacion:
  - id: "CA1"
    descripcion: "El backend expone CORSMiddleware permitiendo origins http://localhost:5173 y http://localhost:3000"
  - id: "CA2"
    descripcion: "La aplicación React se renderiza sin errores en el DOM"
  - id: "CA3"
    descripcion: "El componente Calculadora muestra dos inputs numéricos (a, b) y un botón 'Calcular'"
  - id: "CA4"
    descripcion: "Al ingresar valores válidos (a=5, b=3) y presionar 'Calcular', se muestra el resultado 8.0 consumiendo GET /api/v1/sumar"
  - id: "CA5"
    descripcion: "Al ingresar texto no numérico en un input, se muestra mensaje de validación client-side antes del envío"
  - id: "CA6"
    descripcion: "El componente muestra un indicador de carga (loading) mientras espera la respuesta del servidor"
  - id: "CA7"
    descripcion: "Si el servidor responde con error HTTP (422/500), se muestra un mensaje de error estilizado en la UI"
  - id: "CA8"
    descripcion: "El Dockerfile multistage del frontend construye exitosamente con docker build"
  - id: "CA9"
    descripcion: "El docker-compose.yml raíz levanta ambos servicios (backend:8000 y frontend:3000) simultáneamente"
  - id: "CA10"
    descripcion: "El diseño visual sigue la skill 'premium': tipografía cuidada, espaciado Apple-like, paleta refinada sin colores genéricos"
---

# Especificación Técnica del Cambio

## 1. Diagnóstico y Archivos Afectados

### Diagnóstico
El proyecto actual posee un backend FastAPI funcional con endpoint `GET /api/v1/sumar?a=<float>&b=<float>` que retorna `{"resultado": <float>}`. Sin embargo, carece de:
- Interfaz de usuario (frontend) para consumir visualmente la API.
- Configuración CORS en el backend (necesaria para peticiones cross-origin desde un frontend en puerto distinto).
- Dockerización unificada para levantar backend + frontend simultáneamente.

### Archivos Afectados

| Archivo | Tipo | Descripción |
| :--- | :--- | :--- |
| `backend/main.py` | Modificado | Agregar `CORSMiddleware` permitiendo `http://localhost:5173` y `http://localhost:3000` |
| `frontend/package.json` | Nuevo | Manifiesto Node con React 18, TypeScript, Vite, vitest, @testing-library/react |
| `frontend/tsconfig.json` | Nuevo | Configuración TypeScript para React + Vite |
| `frontend/vite.config.ts` | Nuevo | Configuración Vite con proxy opcional y puerto 5173 |
| `frontend/index.html` | Nuevo | HTML base con div#root y carga de módulo |
| `frontend/src/main.tsx` | Nuevo | Entry point React que renderiza `<App />` en `#root` |
| `frontend/src/App.tsx` | Nuevo | Componente raíz con layout general y título "Calculadora Profesional" |
| `frontend/src/App.css` | Nuevo | Estilos globales con diseño premium (Apple-inspired) |
| `frontend/src/components/Calculadora.tsx` | Nuevo | Componente de calculadora: inputs a/b, botón, resultado, estados (idle/loading/success/error) |
| `frontend/src/components/Calculadora.css` | Nuevo | Estilos específicos del componente Calculadora |
| `frontend/Dockerfile` | Nuevo | Build multistage: compilación Node → serve con nginx:alpine |
| `frontend/src/__tests__/Calculadora.test.tsx` | Nuevo | Test suite del componente con vitest + testing-library |
| `docker-compose.yml` | Nuevo (raíz) | Orquestación unificada: backend (puerto 8000) + frontend (puerto 3000) |
| `backend/.dockerignore` | Modificado | Agregar exclusión de `node_modules` si se copia desde raíz |

## 2. Consenso con el Usuario

- **Design Skill**: Se utilizará la skill `premium` (estilo Apple-inspired: tipografía San Francisco / system-ui, espaciado generoso, paleta de grises neutros con acento azul profundo, bordes mínimos o nulos, sombras sutiles). Esto aplica a todos los componentes React y estilos CSS.
- **API Backend**: El frontend consumirá únicamente `GET /api/v1/sumar?a=<float>&b=<float>` vía `fetch()` nativo.
- **Sin proxy en desarrollo**: Vite NO usará proxy; las peticiones irán directamente a `http://localhost:8000`. CORS en backend permitirá este origen.
- **Estados del componente Calculadora**: Cuatro estados visuales: `idle` (inicial), `loading` (spinner/animación), `success` (resultado numérico), `error` (mensaje de error estilizado).
- **Validación client-side**: Antes de enviar la petición, se validará que ambos campos contengan números válidos. Si no, se muestra mensaje de error sin llamar al servidor.
- **Docker frontend**: Build multistage con `node:20-alpine` para build y `nginx:alpine` para serve. El HTML generado se sirve en el puerto 80 dentro del contenedor, mapeado al 3000 en el host.
- **Docker Compose unificado**: Archivo `docker-compose.yml` en la raíz del proyecto que orquesta ambos servicios. El compose del backend en `backend/` se mantiene para uso standalone.
- **Tests**: Se usarán `vitest` + `@testing-library/react` para tests unitarios del componente. Los tests de integración Docker se agregarán al directorio `frontend/src/__tests__/`.
- **No se requiere** autenticación, ni logging complejo, ni store de estado global.

## 3. Propuesta de Solución

### Arquitectura General

```
┌─────────────────────────────────────────────────────────┐
│                    docker-compose.yml (raíz)             │
│                                                         │
│  ┌──────────────┐         ┌──────────────────────────┐  │
│  │  Backend      │         │  Frontend                │  │
│  │  FastAPI      │ ◄────── │  React 18 + Vite + TS   │  │
│  │  Puerto 8000  │  fetch  │  Puerto 3000 (nginx)     │  │
│  │               │         │  Puerto 5173 (dev)       │  │
│  └──────────────┘         └──────────────────────────┘  │
│         │                           │                    │
│         ▼                           ▼                    │
│  CORS: origins localhost:5173  Nginx sirve static        │
│        y localhost:3000         build/                   │
└─────────────────────────────────────────────────────────┘
```

### Backend - Modificación CORS

En `backend/main.py` se agregará al inicio:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # Docker / nginx
    ],
    allow_methods=["GET"],
    allow_headers=["*"],
)
```

### Frontend - Árbol de Componentes

```
<App>
  ├── Header (título "Calculadora Profesional", diseño premium)
  └── <Calculadora>
        ├── InputGroup "a" (label + input numérico)
        ├── InputGroup "b" (label + input numérico)
        ├── Botón "Calcular"
        ├── Spinner/Loading (estado loading)
        ├── Resultado (estado success: "Resultado: 8.0")
        └── ErrorBox (estado error: mensaje estilizado)
```

### Flujo de Datos

1. Usuario ingresa valores numéricos en inputs `a` y `b`.
2. Al presionar "Calcular":
   - Validación client-side: ¿son números válidos y están dentro de rango (-1000, 1000)?
   - Si inválido: muestra error en UI, no llama a la API (CA5).
   - Si válido: setea estado `loading` (CA6), hace fetch a `http://localhost:8000/api/v1/sumar?a=<a>&b=<b>`.
3. Recepción de respuesta:
   - HTTP 200: renderiza resultado (CA4).
   - HTTP 4xx/5xx: renderiza mensaje de error estilizado (CA7).
   - Network error: renderiza mensaje de error de conexión.

## 4. Especificaciones de Comportamiento (BDD)

Escenario: Carga inicial del frontend
  Dado que el usuario abre la aplicación en el navegador
  Cuando la página se carga completamente
  Entonces se muestra un título "Calculadora Profesional" con tipografía premium
  Y se muestran dos inputs numéricos etiquetados "a" y "b"
  Y se muestra un botón con texto "Calcular"
  Y el área de resultado está vacía (estado idle)

Escenario: Suma exitosa de dos números válidos
  Dado que el usuario ha ingresado valores numéricos válidos (a=5, b=3)
  Cuando el usuario hace clic en el botón "Calcular"
  Entonces se muestra un indicador de carga (loading) mientras se procesa
  Y se realiza una petición GET a `http://localhost:8000/api/v1/sumar?a=5&b=3`
  Y cuando el servidor responde con HTTP 200 y `{"resultado": 8.0}`
  Entonces se oculta el indicador de carga
  Y se muestra el texto "Resultado: 8.0" en el área de resultado

Escenario: Validación client-side por valor no numérico
  Dado que el usuario ha ingresado texto no numérico en el campo "a" (ej: "hola")
  Cuando el usuario hace clic en el botón "Calcular"
  Entonces NO se realiza ninguna petición al servidor
  Y se muestra un mensaje de error de validación en la UI
  Y el área de resultado muestra el mensaje "Por favor, ingrese números válidos"

Escenario: Error del servidor (422 - parámetro fuera de rango)
  Dado que el usuario ha ingresado valores numéricos fuera del rango permitido (a=2000, b=1)
  Cuando el usuario hace clic en el botón "Calcular"
  Entonces se realiza la petición GET al servidor
  Y el servidor responde con HTTP 422
  Entonces se muestra un mensaje de error estilizado indicando "Error del servidor: parámetros inválidos"

Escenario: Error de red / servidor caído
  Dado que el servidor backend no está disponible
  Cuando el usuario hace clic en el botón "Calcular"
  Entonces se realiza la petición GET al servidor
  Y la petición falla con un error de red
  Entonces se muestra un mensaje de error estilizado indicando "Error de conexión: no se pudo contactar el servidor"

Escenario: CORS permite peticiones cross-origin
  Dado que el backend tiene CORSMiddleware configurado
  Cuando el frontend (origen http://localhost:5173) hace una petición GET a http://localhost:8000/api/v1/sumar
  Entonces la respuesta incluye el header `Access-Control-Allow-Origin: http://localhost:5173`
  Y el navegador acepta la respuesta sin errores CORS

Escenario: Construcción Docker multistage del frontend
  Dado que existe el archivo `frontend/Dockerfile`
  Cuando se ejecuta `docker build -t frontend-calc ./frontend`
  Entonces la construcción finaliza con código de salida 0
  Y la imagen resultante incluye nginx sirviendo en el puerto 80
  Y los archivos estáticos compilados existen en la imagen

Escenario: Docker Compose unificado levanta ambos servicios
  Dado que existe `docker-compose.yml` en la raíz del proyecto
  Cuando se ejecuta `docker compose up -d`
  Entonces el contenedor `backend` queda saludable (healthcheck pasa)
  Y el contenedor `frontend` responde HTTP 200 en `http://localhost:3000`

## 5. Criterios de Aceptación

- [ ] **CA1**: El backend expone CORSMiddleware permitiendo origins `http://localhost:5173` y `http://localhost:3000`. Verificable mediante test de integración que inspecciona los headers del middleware.
- [ ] **CA2**: La aplicación React se renderiza sin errores en el DOM. Verificable mediante test con `@testing-library/react` que renderiza `<App />` y busca el título.
- [ ] **CA3**: El componente Calculadora muestra dos inputs numéricos (`a`, `b`) con labels y un botón "Calcular". Verificable mediante test que busca `getByLabelText` y `getByRole('button')`.
- [ ] **CA4**: Al ingresar valores válidos (a=5, b=3) y presionar "Calcular", se muestra el resultado 8.0 consumiendo `GET /api/v1/sumar`. Verificable mockeando fetch y comprobando que el resultado se renderiza.
- [ ] **CA5**: Al ingresar texto no numérico en un input, se muestra mensaje de validación client-side sin realizar fetch. Verificable mockeando fetch y comprobando que NO se llama a la API.
- [ ] **CA6**: El componente muestra un indicador de carga (loading) mientras espera la respuesta del servidor. Verificable mockeando fetch con delay y comprobando que aparece un spinner/texto de carga.
- [ ] **CA7**: Si el servidor responde con error HTTP (422/500), se muestra un mensaje de error estilizado en la UI. Verificable mockeando fetch con respuesta 422 y comprobando mensaje de error.
- [ ] **CA8**: El Dockerfile multistage del frontend construye exitosamente con `docker build`. Verificable ejecutando `docker build -t frontend-test ./frontend` y comprobando código de salida 0.
- [ ] **CA9**: El `docker-compose.yml` raíz levanta ambos servicios (backend:8000 y frontend:3000). Verificable ejecutando `docker compose up -d` y comprobando que ambos contenedores están saludables.
- [ ] **CA10**: El diseño visual sigue la skill `premium`: tipografía system-ui / -apple-system, espaciado generoso entre elementos, paleta de colores neutros con acento azul, sin bordes genéricos ni colores por defecto del navegador. Verificable mediante inspección visual y test de estilos computados.
