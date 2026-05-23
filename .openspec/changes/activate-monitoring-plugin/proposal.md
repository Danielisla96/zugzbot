# Propuesta Técnica: Activación del Plugin de Monitoreo Zugzbot-SDD

## 1. Resumen
Esta propuesta detalla los pasos necesarios para integrar y activar el plugin `zugzbot-sdd` en el entorno de OpenCode. Este plugin proporciona una interfaz de monitoreo (sidebar) para visualizar el progreso y estado del ciclo SDD.

## 2. Cambios Propuestos

### 2.1. Configuración de OpenCode
Se modificará el archivo `opencode.json` en la raíz del proyecto para registrar el plugin. Se añadirá la clave `"plugin"` con la lista de plugins activos.

```json
{
  "plugin": ["zugzbot-sdd"]
}
```

### 2.2. Organización de Archivos
El contenido actual del directorio `plugin/` se moverá a la ubicación estándar de plugins de OpenCode: `.opencode/plugins/zugzbot-sdd`.
Esto asegura que OpenCode pueda localizar y cargar el plugin correctamente según su convención de nombres.

### 2.3. Activación de Características Experimentales
Dado que el soporte para plugins de TUI es una característica en desarrollo, se requiere ejecutar OpenCode con la variable de entorno:
`OPENCODE_EXPERIMENTAL=true`

## 3. Verificación
La activación se confirmará mediante la disponibilidad de la tecla de acceso rápido 'b' para alternar la visibilidad del sidebar de monitoreo.
