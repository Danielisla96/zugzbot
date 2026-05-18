---
name: sdd-verify
description: Validar el cambio implementado mediante análisis estático de código, ejecución de pruebas unitarias/funcionales y verificación real de integración con curl. Produce un reporte formal verification_report.md. Utilizar después de completar la fase de desarrollo (y diseño visual si aplica).
license: MIT
compatibility: Requiere acceso a terminal bash para ejecutar herramientas de calidad, suites de test y levantar el servidor local. Acceso de lectura y escritura a openspec/ y tests/ es requerido.
metadata:
  author: zugzbot
  version: "1.0"
  generatedBy: "zugzbot-harness"
---

Validar el cambio implementado y producir el reporte de verificación formal.

**Entrada**: El nombre del cambio activo en kebab-case. Si se omite, infiéralo del contexto o solicítelo al usuario.

**Pasos**

1. **Leer el contexto completo antes de correr comandos**

   Consuma en orden:
   - `openspec/changes/<nombre>/proposal.md`
   - `openspec/changes/<nombre>/specs/spec.md`
   - `openspec/changes/<nombre>/orchestrator_tasks.md` (para confirmar que todas las tareas están `- [x]`)
   - El árbol actual de `src/` (para entender qué fue realmente implementado)

   Si alguna tarea bajo `orchestrator_tasks.md` permanece abierta (`- [ ]`), DETENGA su ejecución y repórtelo a Zugzbot.

2. **Puerta de Calidad Estática (Linters / Compilador)**

   Corra los chequeos estáticos adecuados para el stack técnico del proyecto utilizando la terminal (`bash`):

   ```bash
   # Stack Python
   python -m py_compile src/**/*.py
   ruff check src/ || flake8 src/

   # Stack JavaScript / TypeScript
   npx eslint src/ --ext .js,.ts,.jsx,.tsx

   # Otros lenguajes: Adapte los comandos a las herramientas declaradas en la propuesta.
   ```

   Si se detecta cualquier error estático o de compilación:
   - Registre exhaustivamente cada error indicando archivo, línea y descripción.
   - Detenga el flujo inmediatamente y notifique a Zugzbot compartiendo la lista de incidencias.
   - No prosiga con la ejecución de la suite de pruebas.

3. **Escribir la Suite de Pruebas**

   Cree o modifique archivos de test bajo `tests/` con una estructura alineada al modelo BDD (Given/When/Then):

   Reglas:
   - Mapeo BDD 1:1 estricto: escriba exactamente una función de prueba por cada escenario de comportamiento detallado en `specs/spec.md`.
   - Cada función de test debe poseer un docstring/comentario referenciando explícitamente el escenario del spec que valida.
   - Incluya como mínimo: un escenario de camino feliz, un caso de error/fallo y dos casos de límites de datos o valores de frontera.
   - Convención de nombres clara: `test_<escenario>_<condicion>_<resultado_esperado>`.

   ```python
   # Ejemplo en Pytest (Python)
   def test_crear_usuario_payload_valido_retorna_201():
       """Escenario 1 — Camino feliz: creación exitosa de usuario"""
       ...

   def test_crear_usuario_email_faltante_retorna_422():
       """Escenario 2 — Error: falta campo requerido email"""
       ...
   ```

4. **Ejecutar la Suite de Pruebas**

   Corra la suite de tests desde la terminal (`bash`):

   ```bash
   pytest tests/ -v --tb=short
   ```

   - Si todos los tests pasan exitosamente: prosiga al Paso 5.
   - Si alguna prueba falla:
     1. Capture detalladamente el error y el stack trace.
     2. Escriba el log de fallo en `openspec/changes/<nombre>/failure_log.md`.
     3. Reporte el fallo a Zugzbot de inmediato para reactivar el bucle de auto-curación del implementador.
     4. Detenga el flujo y no prosiga a la verificación de integración.

5. **Verificación de Integración Real (Servidor Local)**

   Levante el servidor de desarrollo local en segundo plano desde la terminal (`bash`):

   ```bash
   # Stack Python (Uvicorn / FastAPI)
   uvicorn src.app.main:app --reload --port 8000 &
   sleep 3

   # Stack Node.js (Vite / Express)
   npm run dev &
   sleep 4
   ```

   Para cada endpoint o flujo de servicio definido en `specs/spec.md`, realice un llamado real mediante la herramienta `curl`:

   ```bash
   curl -s -X POST http://localhost:8000/<endpoint> \
     -H "Content-Type: application/json" \
     -d '{"key": "value"}' | python3 -m json.tool
   ```

   Capture con precisión milimétrica:
   - El comando `curl` exacto utilizado.
   - El código de estado HTTP y el cuerpo JSON de respuesta obtenido.
   - Una validación lógica que confirme si el resultado obtenido coincide con lo especificado en `specs/spec.md`.

   Apague limpiamente el servidor local tras realizar las pruebas:

   ```bash
   pkill -f "uvicorn\|npm run dev" 2>/dev/null || true
   ```

6. **Escribir `verification_report.md`**

   Escriba en el archivo `openspec/changes/<nombre>/verification_report.md`:

   ```markdown
   # Reporte de Verificación — <nombre-del-cambio>

   ## Resumen de Calidad
   | Control | Resultado |
   |---|---|
   | Análisis Estático | ✅ Aprobado / ❌ Fallido |
   | Suite de Pruebas | ✅ Aprobado (<n> tests) / ❌ Fallido (<n> fallos) |
   | Integración Real | ✅ Aprobado / ❌ Fallido |

   ## Análisis Estático / Linter
   <Logs o comandos del linter, o mensaje "Cero incidencias encontradas.">

   ## Suite de Pruebas Automatizadas
   ```
   <Inserte la salida literal de la suite de pruebas (ej: pytest -v)>
   ```

   ## Verificación de Integración (Llamados Reales)

   ### Endpoint: <METODO> /<ruta>
   **Llamado de Prueba:**
   ```bash
   curl -s -X <METODO> http://localhost:<puerto>/<ruta> \
     -H "Content-Type: application/json" \
     -d '<payload>'
   ```
   **Respuesta (HTTP <codigo_estado>):**
   ```json
   <respuesta json literal>
   ```
   **Resultado:** ✅ Coincide con la especificación / ❌ Desviación detectada: <detalle>

   <!-- Repita para cada flujo/endpoint verificado -->

   ## Conclusión del Reporte
   <"Todos los controles en verde. Listo para fase de documentación técnica." o "Se detectaron fallas lógicas. Regresando a fase de desarrollo.">
   ```

7. **Reportar a Zugzbot**

   ```
   ## Fase de Verificación Completada

   **Cambio:** <nombre-del-cambio>
   **Análisis Estático (Linter):** ✅ / ❌
   **Pruebas Automatizadas:** <n> exitosas / <n> fallidas
   **Integración Real:** ✅ / ❌
   **Reporte de Verificación escrito en:** openspec/changes/<nombre>/verification_report.md

   Fase 4 completada. Todo en verde. Lista para documentación.
   ```

**Guardrails**
- Se prohíbe estrictamente realizar modificaciones en los archivos fuente bajo `src/`. Las correcciones son exclusivas del implementador.
- Jamás omita la validación real por `curl` bajo el supuesto de que "los tests unitarios ya pasaron".
- Asegúrese de apagar siempre los procesos del servidor local antes de entregar el control para evitar puertos ocupados.
- Registre respuestas e información real. No invente llamadas ni payloads simulados en el reporte final.
