---
description: Inicia el centro de control web remoto de ZugzWeb
---

# 🤖 PANEL DE CONTROL WEB REMOTO (ZUGZWEB)

Iniciando el servidor web local y abriendo el túnel seguro de Cloudflare en segundo plano para que puedas controlar y monitorear esta sesión de Opencode desde cualquier lugar del mundo (con internet)...

!`node .utils/zugzweb/daemon.js > /dev/null 2>&1 &`

### 🌍 ¿Cómo ingresar de forma remota?
1. El Daemon se ha levantado en segundo plano en el puerto **4097**.
2. Un túnel seguro de Cloudflare Quick Tunnel se está abriendo automáticamente.
3. **Revisa tu terminal local**: Verás un banner impreso en color verde brillante con la URL pública remota de tipo:
   `👉 https://your-session-id.trycloudflare.com 👈`
4. Abre esa URL en tu teléfono móvil o laptop remota.
5. ¡Podrás enviar prompts, ver el pensamiento del agente, monitorear los costos en tiempo real y habilitar alertas del navegador!
