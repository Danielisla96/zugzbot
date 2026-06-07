# Reporte de Despliegue en Entorno de Desarrollo (Fase 4)

## 🚀 Despliegue a Desarrollo / Sandbox
- **Comando Ejecutado**: `docker compose up -d --build` en `backend/`
- **Entorno Destino**: Docker local (contenedor `fastapi-sumador`)
- **Estado final del deploy**: ✅ ÉXITO
- **Métricas / Archivos subidos**: Imagen Docker reconstruida desde `Dockerfile`, contenedor `fastapi-sumador` levantado y healthy

## 🔍 Verificación de Salud (Health Check Loop)
- **Healthcheck**: `healthy` (Up 14s) ✅
- **Puerto**: `8000` → mapeado al host

## 📋 Resultados de Pruebas Manuales (Criterios de Aceptación)

| Criterio | Endpoint | Resultado Esperado | Resultado Obtenido | Estado |
|---|---|---|---|---|
| **CA1** | `GET /api/v1/sumar?a=2&b=3` | `{"resultado":5.0}` | `{"resultado":5.0}` | ✅ |
| **CA2** | `GET /api/v1/sumar?a=-5&b=-3` | `{"resultado":-8.0}` | `{"resultado":-8.0}` | ✅ |
| **CA3** | `GET /api/v1/sumar?a=3.14&b=2.86` | `{"resultado":6.0}` | `{"resultado":6.0}` | ✅ |
| **CA4** | `GET /api/v1/sumar?b=3` (sin `a`) | HTTP 422 | HTTP 422 | ✅ |
| **CA5** | `GET /api/v1/sumar?a=2` (sin `b`) | HTTP 422 | HTTP 422 | ✅ |
| **CA6** | `GET /api/v1/sumar?a=hola&b=3` | HTTP 422 | HTTP 422 | ✅ |
| **CA7** | `POST /api/v1/sumar` `{"a":10,"b":20}` | `{"resultado":30.0}` | `{"resultado":30.0}` | ✅ |
| **CA8** | `/docs` (OpenAPI Schema) | Parámetros GET con `description`, `examples`, `gt`, `lt` visibles | Parámetros `a`/`b` con `description`, `examples`, `minimum=-1000`, `maximum=1000` en schema | ✅ |
| **CA9** | `GET /api/v1/sumar?a=1000&b=1` | HTTP 422 (lt=1000 excedido) | HTTP 422 | ✅ |

## 🔍 Enlace de Verificación de QA
- **Dirección de Visualización**: `http://localhost:8000/docs` — Swagger UI
- **OpenAPI JSON**: `http://localhost:8000/openapi.json`
- **Healthcheck**: `http://localhost:8000/health`

## 📋 Criterios a Validar en Caliente
- [x] Validar que la interfaz se renderice correctamente en desarrollo (Swagger UI responde)
- [x] Validar que la lógica nueva responda sin excepciones (9/9 criterios OK)
- [x] Validar retrocompatibilidad del endpoint POST existente
- [x] Validar restricciones de rango (`gt=-1000`, `lt=1000`) documentadas en el schema OpenAPI
