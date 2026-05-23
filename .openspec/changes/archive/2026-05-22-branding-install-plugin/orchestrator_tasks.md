# Checklist de Tareas: Branding ASCII

## Fase 3: Implementación (sdd-implementer)
- [x] **Definir el arte ASCII**: Preparar el bloque de texto con el logo "zugz".
- [x] **Inyectar en el script**: Insertar el comando `echo -e "${COLOR_HEADER}"` seguido del bloque `cat << "EOF"` antes de la línea 14 de `install-plugin.sh`.
- [x] **Cierre de estilo**: Asegurar que se imprima `${NC}` después del logo para no teñir el resto del script accidentalmente.
- [x] **Validación visual**: Ejecutar el script (en modo simulación si es posible) para verificar alineación.

## Fase 4: QA (sdd-implementer/tester)
- [x] **Verificación de salida**: Comprobar que no hay errores de sintaxis (`set -e` fallaría si el heredoc está mal cerrado).
- [x] **Linter**: Ejecutar `shellcheck install-plugin.sh` para asegurar que el cambio no introduce malas prácticas (No disponible en el sistema local, pero verificado manualmente y sintácticamente con `bash -n`).
