# 🧠 Cerebro del Proyecto: Memoria y Reglas de Larga Duración

Este archivo actúa como la memoria a largo plazo y el cerebro del proyecto para **Zugzbot** y todos sus subagentes. Su objetivo es consolidar restricciones técnicas, lecciones aprendidas, patrones recurrentes del stack y decisiones de arquitectura críticas específicas de esta base de código para evitar repetir errores y garantizar un desarrollo coherente a lo largo de futuros ciclos de vida de cambio.

---

## 📌 Restricciones Técnicas y Reglas del Stack
*Aquí se documentan particularidades inamovibles de la tecnología del proyecto (ej: nomenclatura, restricciones de runtimes, etc.).*

### 🛠️ Google Apps Script (GAS) & Google Sheets (Ejemplo)
- **Nomenclatura Correlativa**: Los archivos en `src/` deben seguir obligatoriamente un prefijo correlativo (ej: `01_Helpers.gs`, `02_Servicios.gs`, etc.) para garantizar un orden determinista de carga en Google Apps Script y evitar colisiones de nombres o ReferenceErrors en producción.
- **V8 Engine Native**: No intentes importar dependencias pesadas de Node.js en los archivos `.gs` de producción; Google Apps Script ejecuta código JS bajo el runtime de V8 de Google directamente.
- **Entorno de Red Aislado**: Las peticiones externas en Apps Script deben ejecutarse de forma exclusiva con `UrlFetchApp.fetch()`.

### 🛡️ Subresource Integrity (SRI)
- **CDN Hash Validity**: Toda librería cargada desde CDN externo (Chart.js, Marked, SortableJS, etc.) inyectada en archivos HTML (ej: `src/Index.html`) debe contar estrictamente con atributos `integrity` y `crossorigin="anonymous"`. El hash de integridad criptográfica (SHA-384) debe calcularse minuciosamente sobre el recurso crudo exacto para evitar bloqueos del navegador por SRI incorrecto.

---

## 💻 Entorno de Simulación Local (Mocks & Mapeos)
*Aquí se documentan las reglas de simulación para pruebas manuales o automatizadas en localhost (ej: mocks de endpoints, puertos, etc.).*

### ⚙️ google.script.run Mocking (`localhost` / Fase 5 & 4)
- **Simulación del Objeto Global**: En el entorno local (`localhost:3000`), el objeto nativo de Apps Script `google.script.run` no existe de forma predeterminada en el navegador.
- **Mocks Obligatorios**: El servidor local de desarrollo (`sdd-launcher`) debe inyectar dinámicamente o proveer en la ventana global (`window.google`) una simulación completa de todas las funciones backend del proyecto. Ejemplo:
  ```javascript
  window.google = {
    script: {
      run: {
        withSuccessHandler: function(onSuccess) {
          return {
            withFailureHandler: function(onFailure) {
              return {
                obtenerDatosRoadmap: function() {
                  setTimeout(() => onSuccess(DATOS_MOCK), 500);
                }
              };
            }
          };
        }
      }
    }
  };
  ```
- **Firmas Idénticas**: Si agregas o modificas una función backend `.gs` llamada desde el frontend, debes actualizar de forma inmediata su correspondiente contraparte mockeada en el servidor de desarrollo local para evitar que la UI se quede cargando infinitamente o lance `ReferenceError: google is not defined`.

---

## 🚀 Comandos de Simulación y Despliegue de Pruebas (Fase 5)
*Comandos específicos para compilar, empujar o levantar el entorno de pruebas manuales.*
- **Entorno Apps Script**: `npm run push` (o `npx clasp push`) para sincronizar cambios con los servidores de Google.
- **Entorno Backend**: `uvicorn main:app --reload` (FastAPI) o comandos equivalentes.

---

## 📝 Registro Histórico de Lecciones Aprendidas
*Cada vez que se complete un ciclo SDD y se resuelva un bug complejo o se descubra un patrón técnico crítico, el documentador debe añadir una entrada en esta sección.*

- **[2026-05-21] Corrección de SRI en Chart.js**: Se solucionó un bloqueo del navegador por SRI incorrecto en `chart.umd.js`. Se aprendió que los CDN a veces entregan archivos distintos si cambia la versión minificada vs umd, por lo que el hash de integridad debe calcularse exactamente sobre el recurso servido.
- **[2026-05-21] google.script.run ReferenceError**: Se detectó que el Dashboard local se quedaba colgado en "Cargando..." porque no se inyectó el mock del objeto global `google` a tiempo en el frontend. Es obligatorio que el servidor local inicialice `window.google` antes de que se gatillen llamadas a `recargarDatos()` en el evento `DOMContentLoaded`.

