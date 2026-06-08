---
name: sdd-auto-api-mocker
description: Autogenera simulaciones (mocks) locales inteligentes de APIs de terceros y objetos globales difíciles de simular.
---

# Skill: SDD Automatic API Mocker

Esta habilidad permite al enjambre (`@sdd-builder`, `@sdd-tester`) autogenerar simulaciones (mocks) locales inteligentes de APIs de terceros y objetos globales difíciles de simular (ej. Google Apps Script como `SpreadsheetApp`, clasp, APIs de pago o servicios externos).

## Trigger

Se activa de manera automática en la **Fase 2 (Construcción)** o **Fase 3 (Calidad)** cuando:
1. El archivo `diagnostics.md` o `spec.md` indica dependencias de APIs o globales inaccesibles localmente.
2. Los tests unitarios fallan debido a referencias indefinidas (`ReferenceError` o `NetworkError`).

## Directrices de Simulación (Mocks)

Al simular una API, el `@sdd-builder` debe seguir estas reglas estructuradas:

### 1. Inyección de Mocks en Entornos Globales
Si el host es un entorno web o un sandbox interactivo sin Node.js (ej. Google Apps Script), inyecta los mocks al inicio del archivo de pruebas o mediante un archivo `global_mock.js` aislado:

```javascript
// global_mock.js
if (typeof SpreadsheetApp === 'undefined') {
  globalThis.SpreadsheetApp = {
    getActiveSpreadsheet: () => ({
      getActiveSheet: () => ({
        getName: () => "Sheet1",
        getDataRange: () => ({
          getValues: () => [["Encabezado 1", "Encabezado 2"], ["Fila 1 Col 1", "Fila 1 Col 2"]]
        }),
        getRange: () => ({
          setValue: () => {},
          getValue: () => "CeldaSimulada"
        })
      })
    })
  };
}
```

### 2. Estructura de Aislamiento de Red (Fetch/REST APIs)
Evita llamadas reales a servicios HTTP/HTTPS externos interceptando `globalThis.fetch` o inyectando simuladores específicos de API:

```javascript
// mock_fetch.js
const mockResponses = {
  "https://api.github.com/repos/": { status: 200, json: async () => ({ name: "zugzbot" }) }
};

globalThis.fetch = async (url) => {
  const match = Object.keys(mockResponses).find(k => url.startsWith(k));
  if (match) return mockResponses[match];
  throw new Error(`[Mock Error] Llamada a red no mockeada para URL: ${url}`);
};
```

## Criterios de Aceptación (QA)

- `[ ]` **No Invasivo:** Ningún mock o código de simulación debe colarse en los archivos de producción final. Deben permanecer exclusivamente bajo la carpeta de pruebas `tests/` o archivos temporales de QA.
- `[ ]` **Transparencia:** Las aserciones de la UI o lógica del negocio no deben detectar la diferencia entre el entorno mockeado y el real.
- `[ ]` **Limpieza:** Una vez completada la validación, el `@sdd-tester` debe restaurar los entornos globales modificados.

## Tags

#sdd #mocking #sandbox #isolation #gas #api
