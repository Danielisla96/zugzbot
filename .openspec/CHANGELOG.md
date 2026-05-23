# Changelog - Zugzbot

Todas las modificaciones notables de este proyecto serán documentadas en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Visualizador de Estado SDD**: Nuevo monitor reactivo en el Sidebar del TUI que muestra la fase actual y el subagente activo en tiempo real.
- **Mascota Dinámica**: La mascota Zugz ahora reacciona visualmente al estado del ciclo SDD.
- **Polling Reactivo**: Implementación de sistema de observación sobre `.openspec/sdd-lock.json` para actualizaciones sin recarga manual.

### Changed
- **Mascota ASCII Animada**: Mejorada con integración de estados SDD.
- Refactorización del Sidebar para optimizar el espacio (límite de 37 caracteres).
