# Reporte de Despliegue en Entorno de Desarrollo (Fase 4)

## 🚀 Despliegue a Desarrollo / Sandbox
- **Comando Ejecutado**: `python -m uvicorn main:app --host 0.0.0.0 --port 8001`
- **Entorno Destino**: Desarrollo local (FastAPI con Uvicorn)
- **Estado final del deploy**: ÉXITO
- **Métricas / Archivos subidos**:
  - Servidor Uvicorn iniciado correctamente en `http://0.0.0.0:8001`
  - Puerto alternativo 8001 usado (8000 estaba ocupado por otro proceso)
  - 3/3 smoke tests pasaron satisfactoriamente
  - Servidor detenido después de las pruebas

## 🔍 Enlace de Verificación de QA
- **Dirección de Visualización**: `http://localhost:8001` (servidor detenido tras smoke tests)
- **Documentación interactiva**: `http://localhost:8001/docs`
- **OpenAPI Schema**: `http://localhost:8001/openapi.json`

## 📋 Resultados de Smoke Tests

### 1. Suma válida (POST /api/v1/sumar)
```bash
curl -s -X POST http://localhost:8001/api/v1/sumar \
  -H "Content-Type: application/json" \
  -d '{"a": 7, "b": 3}'
```
**Resultado**: `{"resultado":10.0}`
**Estado**: ✅ Correcto (esperado: `{"resultado":10.0}`)

### 2. Error de validación (POST /api/v1/sumar con string)
```bash
curl -s -X POST http://localhost:8001/api/v1/sumar \
  -H "Content-Type: application/json" \
  -d '{"a": "hola", "b": 3}'
```
**Resultado**: `{"detail":[{"type":"float_parsing","loc":["body","a"],"msg":"Input should be a valid number, unable to parse string as a number","input":"hola"}]}`
**Estado**: ✅ Correcto (HTTP 422 con detalle de validación)

### 3. Health Check (GET /health)
```bash
curl -s http://localhost:8001/health
```
**Resultado**: `{"status":"ok"}`
**Estado**: ✅ Correcto (esperado: `{"status":"ok"}`)

## 📋 Criterios a Validar en Caliente
- [x] Servidor inicia correctamente con Uvicorn
- [x] Endpoint POST `/api/v1/sumar` responde con suma correcta (7 + 3 = 10.0)
- [x] Validación Pydantic rechaza entradas no numéricas con 422
- [x] Health check `/health` retorna `{"status":"ok"}`
- [ ] Validar que la interfaz se renderice correctamente en desarrollo (N/A — solo API REST)
- [x] Validar que la lógica nueva responda sin excepciones

## Notas
- El puerto 8000 estaba ocupado por otro proceso (PID 13622), se usó puerto 8001 según instrucciones.
- Dependencias ya instaladas y actualizadas.
- No se modificó ningún archivo de código fuente.
