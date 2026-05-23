# Especificaciones: Mascota ASCII Animada

## Escenario: Renderizado Inicial de la Mascota
**Given** que el TUI se inicia correctamente
**When** se carga la barra lateral (sidebar)
**Then** se debe visualizar la mascota ASCII "Zugz" en la parte superior.

## Escenario: Animación de Parpadeo
**Given** que la mascota está visible
**When** transcurren 3 segundos
**Then** los ojos de la mascota deben cambiar de `[o_o]` a `[-_-]` brevemente y volver al estado inicial.

## Escenario: Integración con el Tema
**Given** que el usuario cambia el tema del TUI
**When** la mascota se renderiza
**Then** debe utilizar el color `accent` definido en el tema actual.
