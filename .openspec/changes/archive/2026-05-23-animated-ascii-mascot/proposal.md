# Propuesta Técnica: Mascota ASCII Animada en TUI

## 1. Resumen
Añadir una mascota ASCII animada en la barra lateral del TUI para mejorar la experiencia de usuario y darle personalidad al asistente. La mascota tendrá una animación simple de parpadeo.

## 2. Diagnóstico Técnico
- **Archivo Destino**: `zugz-plugin/plugins/plugin_tui.tsx`.
- **Tecnología**: SolidJS con `@opentui/solid`.
- **Mecanismo de Animación**: Se utilizará `createSignal` para manejar el frame actual y `setInterval` para alternar entre frames.
- **Ubicación**: Se insertará al principio del `sidebar_content`, encima del monitor de agentes.

## 3. Diseño de la Mascota
Se propone una mascota llamada "Zugz" con dos frames para simular un parpadeo.

**Frame A (Normal):**
```
  [o_o]  
  /| |\  
```

**Frame B (Parpadeo):**
```
  [-_-]  
  /| |\  
```

## 4. Estrategia de Implementación
1.  **Estado Reactivo**: Añadir un signal `frame` (0 o 1).
2.  **Temporizador**: Usar un `setInterval` de ~3000ms para disparar el parpadeo brevemente.
3.  **Renderizado**: Usar un componente `<text>` con la fuente del tema para mostrar el ASCII.
4.  **Estética**: Usar el color `accent` del tema para la mascota.

## 5. Riesgos y Mitigaciones
- **Consumo de CPU**: El intervalo de parpadeo será largo (varios segundos) y el cambio de frame es una operación de renderizado mínima en el TUI.
- **Layout**: Asegurar que el ASCII no desplace excesivamente el contenido útil de la barra lateral. Se mantendrá compacto.
