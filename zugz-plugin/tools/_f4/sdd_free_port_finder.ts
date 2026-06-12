import { tool } from "@opencode-ai/plugin"
import net from "net"

function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.once("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        resolve(false)
      } else {
        resolve(true)
      }
    })
    server.once("listening", () => {
      server.close(() => {
        resolve(true)
      })
    })
    server.listen(port, "127.0.0.1")
  })
}

export default tool({
  description: "Busca secuencialmente y retorna el primer puerto TCP libre a partir de un puerto base en localhost.",
  args: {
    basePort: tool.schema.number().optional().default(5173).describe("Puerto inicial para comenzar la búsqueda (por defecto 5173)"),
    maxAttempts: tool.schema.number().optional().default(20).describe("Número máximo de puertos a escanear a partir del puerto base (por defecto 20)")
  },
  async execute(args) {
    const startPort = Math.max(1024, Math.min(65535, args.basePort))
    const limit = Math.min(100, Math.max(1, args.maxAttempts))
    
    for (let i = 0; i < limit; i++) {
      const port = startPort + i
      const free = await isPortFree(port)
      if (free) {
        return JSON.stringify({
          status: "SUCCESS",
          port: port,
          reason: `Puerto ${port} está libre y listo para usarse.`
        }, null, 2)
      }
    }

    return JSON.stringify({
      status: "FAILED",
      reason: `No se encontró ningún puerto libre en el rango ${startPort} - ${startPort + limit - 1}.`
    }, null, 2)
  }
})
