# 🤖 Zugzbot Harness

> El instalador definitivo de arneses SDD (Spec-Driven Development) para proyectos con OpenCode.

Este paquete NPM te permite inicializar y actualizar instantáneamente el arnés de desarrollo de **Zugzbot** en cualquier proyecto nuevo o existente en segundos.

---

## 🚀 Instalación y Uso Rápido

Para instalar el arnés de Zugzbot en cualquier proyecto, simplemente abre una terminal en la raíz de tu proyecto de destino y ejecuta:

```bash
npx zugzbot
```

¡Eso es todo! El instalador se encargará de copiar y configurar:
*   📁 `.opencode/` — Todo el sistema de agentes, comandos, skills y herramientas personalizadas (incluyendo el catálogo offline de **Oh My Design** con 246 marcas).
*   ⚙️ `opencode.json` — La configuración de seguridad, permisos y servidores MCP de tu bot.
*   🖥️ `tui.json` — Configuración opcional para interfaces TUI.
*   🛡️ `.utils/` — Tus scripts de utilidad ocultos (como exportadores de sesiones y conmutadores de modelos).

---

## 🛠️ Desarrollo Local e Instalación para Pruebas

Si deseas realizar modificaciones en este arnés y probarlas localmente antes de publicarlas:

1.  Clona este repositorio:
    ```bash
    git clone https://github.com/Danielisla96/zugzbot.git
    cd zugzbot
    ```
2.  Enlaza el paquete de forma global:
    ```bash
    npm link
    ```
3.  Ahora puedes ejecutar el comando `zugzbot` de forma global en cualquier parte de tu computadora para probar la instalación.

---

## 📦 Publicar en NPM (Para Desarrolladores)

El nombre de paquete **`zugzbot`** se encuentra totalmente disponible en el registro público de NPM. Para publicarlo por primera vez y dejarlo disponible para todos:

1.  **Inicia sesión en tu cuenta de NPM** (si no tienes una, créala gratis en [npmjs.com](https://www.npmjs.com/)):
    ```bash
    npm login
    ```
2.  **Publica el paquete de forma pública**:
    ```bash
    npm publish --access public
    ```

Cada vez que quieras subir una nueva actualización:
1. Incrementa la versión en el `package.json` (ej: `1.0.1`).
2. Ejecuta `npm publish`.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
