# Checklist de Implementación: Activación de Plugin de Monitoreo

## 🛠️ Fase 3: Preparación del Entorno
- [ ] Crear el directorio `.opencode/plugins/zugzbot-sdd` si no existe.
- [ ] Mover el contenido de `plugin/` a `.opencode/plugins/zugzbot-sdd/`.
- [ ] Verificar que `plugin.json` esté presente en el nuevo destino.
- [ ] Eliminar el directorio `plugin/` original (si está vacío después de mover).

## ⚙️ Fase 4: Configuración
- [ ] Modificar `opencode.json` para añadir `"plugin": ["zugzbot-sdd"]` en el nivel raíz del objeto JSON.

## 🧪 Fase 5: Verificación de Funcionalidad
- [ ] Configurar la variable de entorno `OPENCODE_EXPERIMENTAL=true`.
- [ ] Iniciar OpenCode (o simular el inicio en el entorno de pruebas).
- [ ] Probar la activación del sidebar mediante la tecla "b".
- [ ] Verificar que el sidebar muestre la información de monitoreo (Fase activa, tareas, logs).

## 🏁 Fase 6: QA y Cierre
- [ ] Ejecutar `sdd_bdd_tester` para validar los escenarios definidos en `spec.md`.
- [ ] Asegurar que no hay errores de carga del plugin en la consola de OpenCode.
