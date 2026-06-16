import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = 4097
let opencodePort = 4096 // Puerto activo de Opencode por defecto
let tunnelUrl = ''
let detectedInstances = []

// Función auxiliar para escanear en paralelo las instancias de Opencode activas
const scanInstances = async () => {
  const currentDir = process.cwd()
  const scanPromises = []

  // Escanea puertos locales del 4096 al 4115
  for (let p = 4096; p <= 4115; p++) {
    scanPromises.push(
      new Promise((resolve) => {
        const req = http.get(`http://127.0.0.1:${p}/path`, { timeout: 100 }, (res) => {
          let data = ''
          res.on('data', chunk => data += chunk)
          res.on('end', () => {
            if (res.statusCode === 200) {
              try {
                const parsed = JSON.parse(data)
                const projectPath = parsed.path || ''
                const projectName = projectPath.split(/[/\\]/).pop() || `Proyecto en ${p}`
                resolve({
                  port: p,
                  path: projectPath,
                  name: projectName,
                  isCurrentProject: projectPath === currentDir
                })
              } catch (e) {
                resolve(null)
              }
            } else {
              resolve(null)
            }
          })
        })

        req.on('error', () => resolve(null))
        req.on('timeout', () => {
          req.destroy()
          resolve(null)
        })
      })
    )
  }

  const results = await Promise.all(scanPromises)
  detectedInstances = results.filter(Boolean)

  // Autodescubrimiento: si aún estamos en el puerto 4096 pero hay una instancia que coincide con el proyecto actual, nos enlazamos automáticamente
  if (opencodePort === 4096) {
    const currentInstance = detectedInstances.find(inst => inst.isCurrentProject)
    if (currentInstance && currentInstance.port !== opencodePort) {
      opencodePort = currentInstance.port
      console.log(`\x1b[35m%s\x1b[0m`, `✨ Autodescubrimiento: Enlazado automáticamente al puerto ${opencodePort} (Ruta coincidente con este proyecto)`)
    }
  }
}

const startServer = () => {
  const server = http.createServer(async (req, res) => {
    // Cabeceras CORS
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if (req.method === 'OPTIONS') {
      res.writeHead(200)
      res.end()
      return
    }

    // 1. Endpoint: Estado del Túnel
    if (req.url === '/api-custom/tunnel-status') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ url: tunnelUrl }))
      return
    }

    // 2. Endpoint: Obtener Instancias de Opencode Disponibles
    if (req.url === '/api-custom/instances') {
      await scanInstances() // Escaneo dinámico rápido
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        instances: detectedInstances,
        currentPort: opencodePort
      }))
      return
    }

    // 3. Endpoint: Seleccionar Instancia / Cambiar Puerto de Proxy
    if (req.url === '/api-custom/select-instance' && req.method === 'POST') {
      let body = ''
      req.on('data', chunk => body += chunk)
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body)
          const targetPort = parseInt(parsed.port, 10)
          if (targetPort >= 4096 && targetPort <= 4115) {
            opencodePort = targetPort
            console.log(`\x1b[33m%s\x1b[0m`, `🔌 Instancia conmutada: Redireccionando proxy al puerto ${opencodePort}`)
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: true, currentPort: opencodePort }))
          } else {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Puerto fuera de rango válido (4096-4115)' }))
          }
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'JSON inválido' }))
        }
      })
      return
    }

    // 4. Proxy inverso para las APIs de Opencode (prefijo /api)
    if (req.url.startsWith('/api/')) {
      const targetPath = req.url.substring(4) // Quita el '/api'
      proxyRequest(req, res, targetPath)
      return
    }

    // 5. Servir archivos estáticos del frontend React SPA
    serveStatic(req, res)
  })

  server.listen(PORT, '127.0.0.1', async () => {
    console.log('\x1b[36m%s\x1b[0m', `🤖 Daemon de ZugzWeb iniciado localmente en http://127.0.0.1:${PORT}`)
    
    // Escaneo inicial de instancias de Opencode
    await scanInstances()
    console.log('\x1b[33m%s\x1b[0m', `🔌 Proxyando peticiones de la API a Opencode en el puerto ${opencodePort}`)
    
    // Iniciar el túnel de Cloudflare Quick Tunnel
    startTunnel()
  })
}

const proxyRequest = (req, res, targetPath) => {
  const targetUrl = `http://127.0.0.1:${opencodePort}`
  const url = new URL(targetPath, targetUrl)
  
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname + url.search,
    method: req.method,
    headers: { ...req.headers }
  }
  
  // Limpieza de cabeceras de reenvío
  delete options.headers['host']
  delete options.headers['connection']
  
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers)
    proxyRes.pipe(res)
  })
  
  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      error: 'Proxy Error',
      message: `No se pudo conectar con Opencode en el puerto ${opencodePort}. ¿Está activa esta TUI?`,
      detail: err.message
    }))
  })
  
  req.pipe(proxyReq)
}

const serveStatic = (req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url
  filePath = path.join(__dirname, 'client', 'dist', filePath)
  
  const ext = path.extname(filePath)
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  }
  
  const contentType = mimeTypes[ext] || 'application/octet-stream'
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(__dirname, 'client', 'dist', 'index.html'), (err2, indexContent) => {
          if (err2) {
            res.writeHead(404, { 'Content-Type': 'text/plain' })
            res.end('Página no encontrada en el panel web')
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end(indexContent, 'utf-8')
          }
        })
      } else {
        res.writeHead(500)
        res.end(`Error de servidor: ${err.code}`)
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType })
      res.end(content, 'utf-8')
    }
  })
}

const startTunnel = () => {
  console.log('\x1b[35m%s\x1b[0m', '🌐 Abriendo túnel seguro trycloudflare.com...')
  
  const cf = spawn('npx', ['-y', 'cloudflared', 'tunnel', '--url', `http://127.0.0.1:${PORT}`])
  
  cf.stdout.on('data', (data) => {
    parseCfOutput(data.toString())
  })
  
  cf.stderr.on('data', (data) => {
    parseCfOutput(data.toString())
  })
  
  cf.on('close', (code) => {
    console.log(`\x1b[31m%s\x1b[0m`, `⚠️ Túnel de Cloudflare finalizado (código: ${code}). Reintentando...`)
    setTimeout(startTunnel, 5000)
  })
}

const parseCfOutput = (text) => {
  const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/)
  if (match && match[0] !== tunnelUrl) {
    tunnelUrl = match[0]
    console.log('\n\x1b[32m%s\x1b[0m', '=========================================================')
    console.log('\x1b[32m%s\x1b[0m', '🚀 ¡CENTRO DE CONTROL REMOTO DISPONIBLE!')
    console.log('\x1b[32m%s\x1b[0m', '📱 Controla tu arnés Opencode desde cualquier lugar en:')
    console.log('\x1b[36m%s\x1b[0m', `   👉  ${tunnelUrl}  👈`)
    console.log('\x1b[32m%s\x1b[0m', '=========================================================\n')
  }
}

startServer()
