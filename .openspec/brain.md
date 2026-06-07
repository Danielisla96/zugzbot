# 🧠 Cerebro del Proyecto

> Base de conocimiento técnico a largo plazo. Solo registra aprendizajes de alto valor y no triviales.

## Índice

| ID | Categoría | Tag | Problema |
| :--- | :--- | :--- | :--- |
| L001 | backend | fastapi-sumar-endpoint | Necesidad de un endpoint que sume dos números con ar... |
| L002 | devops | docker-single-stage-docs | La app FastAPI no tenía Docker ni documentación para... |
| L003 | backend | fastapi-query-params | Swagger mostraba editor JSON crudo para POST /api/v1... |
| L004 | css | css-variable-hardcoded-colors | Hardcoded colors in component CSS (success-bg, dange... |
| L005 | frontend | fastapi-error-parsing | FastAPI ValidationError retorna detail como array de... |

## Lecciones

### L001: fastapi-sumar-endpoint
- **Tags**: #backend #fastapi_sumar_endpoint
- **Problema**: Necesidad de un endpoint que sume dos números con arquitectura escalable para el futuro
- **Solución**: FastAPI con arquitectura 3-capas (Router → Service → Models), endpoint POST /api/v1/sumar con validación Pydantic, 11 tests (5 unit + 6 integración)
- **Fecha**: 2026-06-07

### L002: docker-single-stage-docs
- **Tags**: #devops #docker_single_stage_docs
- **Problema**: La app FastAPI no tenía Docker ni documentación para developers
- **Solución**: Dockerfile single-stage (1 imagen, non-root), docker-compose con hot-reload, .dockerignore, README.md con API reference y curl examples
- **Fecha**: 2026-06-07

### L003: fastapi-query-params
- **Tags**: #backend #fastapi_query_params
- **Problema**: Swagger mostraba editor JSON crudo para POST /api/v1/sumar. El usuario tenía que escribir {"a":5,"b":3} manualmente.
- **Solución**: Reemplazado POST por GET con query params a y b. Modelos enriquecidos con pydantic.Field(description, examples, gt, lt). Swagger ahora muestra inputs numéricos individuales. 23 tests pasando.
- **Fecha**: 2026-06-07

### L004: css-variable-hardcoded-colors
- **Tags**: #css #css_variable_hardcoded_colors
- **Problema**: Hardcoded colors in component CSS (success-bg, danger-text) break theming
- **Solución**: Add CSS custom properties for color variants (--color-success-bg, --color-danger-text) in :root, then reference via var() in component CSS for maintainable theming.
- **Fecha**: 2026-06-07

### L005: fastapi-error-parsing
- **Tags**: #frontend #fastapi_error_parsing
- **Problema**: FastAPI ValidationError retorna detail como array de objetos; concatenar directamente con template string mostraba [object Object] en el frontend
- **Solución**: Detectar si errData.detail es Array, mapear cada error a "campo: mensaje", unir con "; ". Fallback a string o mensaje por defecto.
- **Fecha**: 2026-06-07
