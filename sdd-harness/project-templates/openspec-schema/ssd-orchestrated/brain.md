# 🧠 Cerebro del Proyecto: Memoria y Reglas de Larga Duración

Este archivo actúa como la memoria a largo plazo y el cerebro del proyecto para todos sus subagentes. Su objetivo es consolidar restricciones técnicas, lecciones aprendidas, patrones recurrentes del stack y decisiones de arquitectura críticas específicas de esta base de código para evitar repetir errores y garantizar un desarrollo coherente a lo largo de futuros ciclos de vida del cambio.

---

## 📌 Restricciones Técnicas y Reglas del Stack
*Aquí se documentan particularidades inamovibles de la tecnología del proyecto (ej. nomenclatura, restricciones de runtimes, limitaciones de APIs, convenciones de archivos, etc.).*

### 🛠️ [Nombre del Stack o Componente]
- **[Regla de Nomenclatura o Estructura]**: Descripción de la restricción o convención organizativa del código (ej. prefijos, carpetas obligatorias).
- **[Restricción de Runtime / Entorno]**: Explicación de limitaciones del entorno de ejecución o de dependencias (ej. APIs no disponibles, versiones de motor de ejecución).
- **[Regla de Integridad / Seguridad]**: Convenciones críticas de seguridad, compilación o empaquetado del código.

---

## 💻 Entorno de Simulación Local (Mocks & Mapeos)
*Aquí se documentan las reglas de simulación para pruebas manuales o automatizadas en localhost (ej. puertos de red, mocks de objetos globales, simulación de respuestas de APIs externas, etc.).*

### ⚙️ [Nombre del Servicio o API a Simular]
- **[Descripción del Mock]**: Explicar cómo simular el comportamiento de dependencias externas o APIs nativas en desarrollo local.
- **[Estructura del Objeto Mockeado]**: Definir la interfaz mínima o el objeto simulado que debe inyectarse para evitar errores de tipo o de referencia en `localhost`.
- **[Regla de Mantenimiento]**: Instrucción para mantener las firmas de métodos en sintonía entre los entornos real y local.

---

## 🚀 Comandos de Simulación y Despliegue de Pruebas (Fase 5)
*Comandos específicos para compilar, empaquetar, empujar o levantar el entorno de pruebas manuales por parte de los agentes.*

- **Entorno de Despliegue Directo (ej: Cloud/Google Apps Script)**: `[comando de despliegue]` (ej. `npm run push` o comando de sincronización para subir los cambios a un entorno remoto donde se validará la solución).
- **Entorno de Servidor Local (ej: Backend/Frontend/UI)**: `[comando de arranque]` (ej. `npm run dev` o comandos que levanten la aplicación localmente en un puerto para interactuar).

---

## 📝 Registro Histórico de Lecciones Aprendidas
*Cada vez que se complete un ciclo SDD y se resuelva un bug complejo o se descubra un patrón técnico crítico, el documentador debe añadir una entrada en esta sección siguiendo el formato de fecha y descripción concisa.*

- **[AAAA-MM-DD] [Título Corto del Problema]**: Breve descripción del bug o error recurrente detectado, qué causó la falla y cuál fue la solución adoptada para evitar regresiones futuras.
- **[AAAA-MM-DD] [Título Corto de la Lección]**: Explicación de la lección técnica aprendida respecto al stack o dependencias de la base de código.
