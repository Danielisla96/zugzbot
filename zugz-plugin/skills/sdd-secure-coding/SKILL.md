---
name: sdd-secure-coding
description: Impone directivas de codificación segura obligatorias para garantizar que el software sea inmune a vulnerabilidades.
---

# Skill: SDD Secure Coding (Threat Modeling & Sanitization)

Esta habilidad impone directivas de codificación segura obligatorias para el enjambre de agentes en todas las fases de **Construcción (F2)** y **Calidad (F3)**, garantizando que el software desarrollado sea inherentemente inmune a vulnerabilidades de seguridad clásicas.

## Trigger

Se activa obligatoriamente al modificar código relacionado con:
1. Entrada de texto o manipulación del DOM por parte del usuario (Forms, inputs, query params).
2. Interacciones con bases de datos, APIs de persistencia o lectura/escritura de ficheros locales.
3. Actualización de paquetes o importación de nuevas librerías.

## Directivas de Seguridad del Swarm

Todos los subagentes deben aplicar estrictamente las siguientes reglas operativas:

### 1. Inmunización contra XSS (Cross-Site Scripting)
Queda estrictamente prohibido inyectar HTML de forma directa en el DOM sin previa sanitización.
* **Acción:** Utiliza siempre métodos nativos seguros de asignación como `textContent` o `innerText` en lugar de `innerHTML` o `dangerouslySetInnerHTML`.
* Si es mandatorio renderizar HTML dinámico, pasa el contenido por un sanitizador de confianza (como `DOMPurify` o una función de escape robusta local):

```javascript
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
```

### 2. Parametrización Absoluta (SQL & Command Injections)
Cualquier consulta a base de datos, llamada a bash o comandos de ejecución del sistema no debe concatenar strings de variables de usuario.
* **Acción:** Utiliza queries preparadas (parameterized queries) o valida rigurosamente los parámetros antes de pasarlos a ejecutores dinámicos.

### 3. Escaneo Pre-Commit de Secretos
Ningún secreto, clave de API, tokens de autenticación o credenciales privadas de Git debe subirse a producción.
* **Acción:** El `@sdd-tester` y `@sdd-archiver` deben auditar activamente las diferencias en Git (`git diff`) mediante patrones regex de entropía para detectar strings sospechosos.

## Criterios de Aceptación (QA)

- `[ ]` **Seguridad DOM:** Cero uso de asignaciones directas de HTML inseguras (`innerHTML`).
- `[ ]` **Persistencia Limpia:** Todas las consultas externas utilizan interfaces tipadas o parametrizadas.
- `[ ]` **Cero Secretos:** No se filtran API keys en el área de preparación de Git.

## Tags

#sdd #security #xss #sanitization #secrets #sql-injection #secure-coder
