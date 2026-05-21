---
name: sdd-ui-design
description: Revisar y mejorar el frontend (UI/UX) de la solución implementada. Levanta el dev server, toma capturas de pantalla mediante Puppeteer MCP, analiza la interfaz contra las mejores prácticas de UX/UI, aplica mejoras de diseño específicas y genera un reporte visual. Utilizar después del desarrollo si existe un frontend.
license: MIT
compatibility: Requiere un proyecto frontend con un servidor de desarrollo ejecutable. Requiere acceso a herramientas de visualización o al servidor MCP de Puppeteer.
metadata:
  author: zugzbot
  version: "1.1"
  generatedBy: "zugzbot-harness"
---

Revisar y mejorar el frontend (UI/UX) de la solución implementada utilizando percepción visual por medio de Puppeteer MCP.

**Entrada**: El nombre del cambio activo en kebab-case. Si se omite, infiéralo del contexto o solicítelo al usuario.

**Pasos**

1. **Resolver el nombre del cambio y leer el contexto técnico**

   Lea antes de realizar cualquier acción:
   - `.openspec/changes/<nombre>/proposal.md`
   - `.openspec/changes/<nombre>/orchestrator_architecture.md`
   - Árbol de carpetas de `src/` para identificar archivos de frontend.

   Identifique indicadores de interfaz:
   - Archivos de componentes: `.jsx`, `.tsx`, `.vue`, `.svelte`, `.html`.
   - Archivos de estilos: `.css`, `.scss`, `.less`.
   - `package.json` con dependencias de UI (react, vue, svelte, vite, next, etc.).

   **Si no se detecta frontend**: Detenga la ejecución y notifique a Zugzbot: "No se detecta frontend en el proyecto. Omitiendo Fase 4."

2. **Detectar y arrancar el servidor de desarrollo local**

   Busque en `package.json` scripts de inicio tipo `dev`, `start` o `serve`. En su defecto, aplique convenciones del ecosistema:
   - Vite: `npx vite`
   - Next.js: `npm run dev`
   - HTML plano: `python3 -m http.server 8080`

   Levante el servidor en segundo plano usando la terminal (`bash`):

   ```bash
   <comando-dev> &
   sleep 4
   ```

   Identifique el puerto local de escucha del output del comando o de la configuración del proyecto.
   Si el servidor falla al arrancar, registre el error y aborte la fase de diseño.

3. **Capturar pantalla inicial ("Before")**

   Navegue a `http://localhost:<puerto>` utilizando las herramientas del servidor MCP `puppeteer` (ej: ejecutando la herramienta `puppeteer_navigate` con la URL local).
   Tome una captura de pantalla del estado actual de la UI utilizando la herramienta MCP `puppeteer_screenshot`. Esta será su referencia **before** (antes). Guarde o registre esta imagen de manera referencial.

4. **Analizar la UI contra los principios UX/UI de excelencia**

   Evalúe cada uno de los siguientes puntos, marcándolos como ✅ ok / ⚠️ requiere mejora / ❌ crítico:

   | Principio UX/UI | Criterio de Evaluación |
   |---|---|
   | Jerarquía Visual | ¿Existe un punto focal primario claro? |
   | Escala Tipográfica | ¿Tamaños y pesos de texto consistentes y armónicos? |
   | Armonía Cromática | ¿Paleta de colores premium? ¿Contraste WCAG AA? |
   | Espaciado y Ritmo | ¿Paddings/margins consistentes? ¿Respira la UI? |
   | Micro-interacciones | ¿Feedback visual en hovers, focos, transiciones? |
   | Adaptabilidad (Responsive) | ¿Funciona a viewports estrechos sin scroll lateral? |
   | Gestión de Estados vacíos/error | ¿Están diseñados visualmente los hilos de carga o error? |
   | Consistencia Estilística | ¿Mismo lenguaje visual en todos los elementos del flujo? |

5. **Generar la lista priorizada de Issues**

   Redacte una lista ordenada de hasta 10 problemas estéticos prioritarios (crítico → cosmético).
   Para cada problema:
   - **Problema**: Qué está mal y dónde ocurre.
   - **Archivo**: Ruta exacta del archivo CSS o componente a modificar.
   - **Solución**: Cambio específico a aplicar.

6. **Aplicar mejoras visuales**

   Efectúe correcciones directamente en los archivos bajo `src/`. Reglas:
   - Ediciones estrictamente quirúrgicas — evite reescribir componentes completos.
   - Prefiera variables CSS / design tokens por sobre valores directos (hardcoded).
   - No altere en absoluto lógica de negocio, persistencia de datos o enrutamiento.
   - Tras cada bloque de cambios de estilos, capture una pantalla nueva utilizando `puppeteer_screenshot` para verificar las mejoras de forma interactiva y comparar el delta visual.

   Efectúe al menos dos iteraciones completas. Detenga el refinamiento cuando la UI sea de calidad premium.

7. **Apagar limpiamente el servidor de desarrollo**

   Corra el comando en la terminal (`bash`):

   ```bash
   pkill -f "<patron-del-servidor>" 2>/dev/null || true
   ```

8. **Escribir `ui_review_report.md`**

   Escriba en el archivo `.openspec/changes/<nombre>/ui_review_report.md`:

   ```markdown
   # Reporte de Revisión Visual — <nombre-del-cambio>

   ## Stack Frontend Detectado
   <tecnología, comando de inicio dev, puerto>

   ## Comparativa Visual (Antes / Después)
   <capturas de pantalla de Puppeteer o descripción de la evolución visual>

   ## Resumen de Ajustes Aplicados

   | # | Prioridad | Problema Visual | Archivo | Corrección Aplicada |
   |---|---|---|---|---|
   | 1 | Crítico | ... | ... | ... |

   ## Checklist de Principios UX/UI Evaluados
   - ✅ Jerarquía Visual
   - ✅ Escala Tipográfica
   - ⚠️ Armonía Cromática (mejorado)
   - ...

   ## Catálogo de Archivos Modificados
   - `src/styles/main.css` — Se agregaron custom properties para paleta cromática.
   - `src/components/Button.jsx` — Se agregaron transiciones suaves de hover y foco.
   - ...
   ```

9. **Reportar a Zugzbot**

   ```
   ## Fase de Diseño UX/UI Completada

   **Cambio:** <nombre-del-cambio>
   **Issues detectados:** <n>  |  **Issues resueltos:** <n>
   **Archivos modificados:** <lista>
   **Reporte guardado en:** .openspec/changes/<nombre>/ui_review_report.md

   Fase 4 completada. Interfaz pulida y refinada visualmente. Lista para verificación.
   ```

**Guardrails**
- Prohibido modificar lógica de negocio, manejo de estados de la app o rutas de backend. Límite visual estricto.
- Nunca omita las capturas de pantalla; la percepción visual interactiva mediante el servidor MCP de Puppeteer es el valor central de esta fase.
- Si el puerto de desarrollo por defecto genera colisión, pruebe puertos libres alternos (3001, 5173, 8080).
- Asegúrese de apagar el servidor local antes de notificar la finalización para liberar los recursos del sistema.
- Si detecta un bug funcional durante el diseño de la UI, documéntelo y repórtelo como nota informativa para el implementador, sin arreglarlo usted mismo.

**Alternativas de Ejecución y Fallbacks Locales (Si el servidor MCP no está activo o disponible)**
Si por alguna razón de entorno el servidor MCP no está respondiendo o conectado, tienes estrictamente permitido utilizar las siguientes alternativas de consola nativas del sistema:

1. **Capturas de pantalla estáticas rápidas**:
   El sistema del usuario tiene instalado `puppeteer-cli` de forma global. Utilízalo directamente desde la consola para tomar fotos instantáneas:
   ```bash
   puppeteer screenshot http://localhost:5173 <ruta_salida.png> --viewport 1280x800
   ```

2. **Interacciones complejas dinámicas (Clicks, Scrolls, Esperas de llamados API)**:
   Puedes inyectar la variable de entorno `NODE_PATH` para que Node.js localice y cargue el paquete global de Puppeteer del sistema de forma directa, sin necesidad de descargar nada ni inicializar carpetas temporales:
   ```bash
   NODE_PATH=$(npm root -g) node -e "
   const puppeteer = require('puppeteer');
   (async () => {
     const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
     const page = await browser.newPage();
     await page.setViewport({ width: 1280, height: 800 });
     await page.goto('http://localhost:5173');
     await page.waitForSelector('button');
     await page.click('button'); // O el selector del elemento a clickear
     await new Promise(r => setTimeout(r, 2000)); // Esperar respuesta de la API
     await page.screenshot({ path: '<ruta_salida.png>' });
     await browser.close();
   })();
   "
   ```

