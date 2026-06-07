# Reporte de Despliegue en Entorno de Desarrollo (Fase 4)

## 🚀 Despliegue a Desarrollo / Sandbox
- **Comando Ejecutado**: `docker compose -f docker-compose.yml up -d --build`
- **Entorno Destino**: Docker Compose (localhost:8000 + localhost:3000)
- **Estado final del deploy**: ✅ ÉXITO

### Build del Frontend (npm run build)
```
> calculadora-frontend@0.0.1 build
> tsc && vite build

vite v5.4.21 building for production...
✓ 33 modules transformed.
✓ built in 393ms

dist/index.html                   0.41 kB │ gzip:  0.28 kB
dist/assets/index-M8Xv_W4u.css    5.83 kB │ gzip:  1.76 kB
dist/assets/index-CqRKXloa.js   145.39 kB │ gzip: 46.81 kB
```

### Docker Build (ambos servicios reconstruidos)
| Servicio | Imagen | Estado |
|---|---|---|
| `backend` | `proyecto4-backend:latest` | ✅ Reconstruido |
| `frontend` | `proyecto4-frontend:latest` | ✅ Reconstruido (nuevo bundle) |

### Contenedores
| Nombre | Status | Puertos |
|---|---|---|
| `fastapi-sumador` | Up (healthy) | `0.0.0.0:8000->8000/tcp` |
| `react-calculadora` | Up | `0.0.0.0:3000->80/tcp` |

---

## 🔍 Verificaciones en Caliente (Health Check Loop)

### 1. Health Check Backend
```json
$ curl http://localhost:8000/health
{"status":"ok"}
```
✅ **HTTP 200 — Backend saludable**

### 2. Sumar Endpoint — a=5, b=3
```json
$ curl "http://localhost:8000/api/v1/sumar?a=5&b=3"
{"resultado":8.0}
```
✅ **HTTP 200 — Resultado correcto: 8.0**

### 3. Sumar Endpoint — a=1234, b=5 (validación)
```json
$ curl "http://localhost:8000/api/v1/sumar?a=1234&b=5"
{"detail":[{"type":"less_than","loc":["query","a"],"msg":"Input should be less than 1000","input":"1234","ctx":{"lt":1000.0}}]}
```
✅ **HTTP 422 — Mensaje de validación correcto: "Input should be less than 1000"**

### 4. Frontend React
```
HTTP Status: 200
Content-Type: text/html
```
✅ **HTTP 200 — Frontend sirviendo HTML correctamente con el nuevo bundle**

---

## 📋 Criterios a Validar en Caliente

| Check | Resultado |
|-------|-----------|
| ✅ Health check backend (`/health`) → 200 | ✅ `{"status":"ok"}` |
| ✅ Suma válida (`a=5, b=3`) → `{"resultado":8.0}` | ✅ HTTP 200 |
| ✅ Validación (`a=1234`) → mensaje error | ✅ HTTP 422 con detail |
| ✅ Frontend HTML (`localhost:3000`) | ✅ HTTP 200, text/html |

---

## 🔧 Observaciones Técnicas

- El endpoint `/api/v1/sumar` mantiene la validación `lt=1000` en el backend, por lo que `a=1234` devuelve 422 con mensaje descriptivo. Esto es correcto por diseño.
- El frontend se sirve via nginx en el puerto 3000 con el bundle de producción.
- Ambos contenedores están operativos y comunicándose correctamente.

---

*Reporte generado por @sdd-deployer (F4) — Redeploy final — 2026-06-07*
