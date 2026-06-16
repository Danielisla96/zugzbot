import React, { useState, useEffect, useRef } from 'react'
import { marked } from 'marked'
import {
  Play,
  Square,
  Plus,
  Terminal,
  Settings,
  Globe,
  RefreshCw,
  User,
  Bot,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Bell,
  BellOff,
  MessageSquare,
  Server,
  Copy,
  Check,
  CornerDownRight,
  Code,
  Sparkles,
  Clock,
  AlertCircle
} from 'lucide-react'

// Interfaces basadas en la API de Opencode
interface Session {
  id: string
  title: string | null
  parent_id?: string | null
  parentID?: string | null // Algunos endpoints de Opencode devuelven camelCase
  agent?: string | null
  model?: any | null
  cost?: number | null
  tokens_input?: number | null
  tokens_output?: number | null
  time_created?: number
}

interface MessagePart {
  type: 'text' | 'reasoning' | 'tool' | string
  text?: string
  tool?: string
  state?: {
    status: string
    input?: any
    output?: any
  }
}

interface Message {
  info: {
    id: string
    session_id: string
    role: 'user' | 'assistant' | 'system'
    time?: {
      created: number
    }
    time_created?: number
  }
  parts: MessagePart[]
}

interface OpencodeInstance {
  port: number
  path: string
  name: string
  isCurrentProject: boolean
}

// Lista estática curada de los mejores modelos de Opencode
const POPULAR_MODELS = [
  { id: 'default', name: '🤖 Modelo por defecto' },
  { id: 'deepseek/deepseek-chat', name: '⚡️ DeepSeek v4 (Chat rápido)' },
  { id: 'deepseek/deepseek-reasoner', name: '💭 DeepSeek R1 (Pensamiento/Razonamiento)' },
  { id: 'google/gemini-3.5-flash', name: '♊️ Gemini 3.5 Flash' },
  { id: 'google/gemini-3.1-pro-preview', name: '🧠 Gemini 3.1 Pro (Complejo)' },
  { id: 'opencode/deepseek-v4-flash-free', name: '🆓 DeepSeek v4 (Flash Gratis)' },
  { id: 'opencode/nemotron-3-ultra-free', name: '🆓 Nemotron 3 Ultra (Gratis)' }
]

const AVAILABLE_AGENTS = [
  {
    id: 'build',
    name: '🛠️ Build',
    description: 'Agente de desarrollo estándar. Tiene todas las herramientas de lectura, escritura y bash habilitadas para programar.',
    color: '#3b82f6'
  },
  {
    id: 'plan',
    name: '📋 Plan',
    description: 'Agente de solo lectura/planificación. Útil para analizar el código base y planificar cambios de forma segura sin editarlos directamente.',
    color: '#a855f7'
  },
  {
    id: 'sdd-orchestrator',
    name: '🤖 Sdd-Orchestrator',
    description: 'Coordinador principal del flujo SDD (Spec-Driven Development). Automatiza los subagentes spec-writer, coder y tester.',
    color: '#10b981'
  }
]

export default function App() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>('')
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [tunnelUrl, setTunnelUrl] = useState<string>('')
  const [expandedParts, setExpandedParts] = useState<Record<string, boolean>>({})
  const [refreshInterval, setRefreshInterval] = useState<number>(3000)
  const [errorMsg, setErrorMsg] = useState<string>('')
  
  // Soporte para multi-instancia / selección de proyectos
  const [instances, setInstances] = useState<OpencodeInstance[]>([])
  const [currentPort, setCurrentPort] = useState<number>(4096)
  const [showInstanceDropdown, setShowInstanceDropdown] = useState(false)

  // Opciones de prompt
  const [selectedModel, setSelectedModel] = useState<string>('default')
  const [copiedMessageId, setCopiedMessageId] = useState<string>('')

  // Estados para la nueva vista /new y agente activo
  const [isNewSessionView, setIsNewSessionView] = useState<boolean>(false)
  const [newSessionTitle, setNewSessionTitle] = useState<string>('')
  const [newSessionAgent, setNewSessionAgent] = useState<string>('build')
  const [newSessionModel, setNewSessionModel] = useState<string>('default')
  const [newSessionFirstPrompt, setNewSessionFirstPrompt] = useState<string>('')
  const [selectedAgent, setSelectedAgent] = useState<string>('build')

  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false)

  const navigateTo = (path: string) => {
    window.history.pushState(null, '', path)
    setIsNewSessionView(path === '/new')
    if (path === '/new') {
      // Pre-rellenar un título por defecto para la nueva sesión
      const formattedDate = new Date().toLocaleString([], { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      setNewSessionTitle(`Sesión Web ${formattedDate}`)
    }
  }

  // Sincronizar agente de sesión activa
  useEffect(() => {
    if (currentSession) {
      setSelectedAgent(currentSession.agent || 'build')
    }
  }, [currentSession])

  // 1. Cargar estado inicial y levantar listeners
  useEffect(() => {
    fetchTunnelStatus()
    fetchInstances()
    fetchSessions()
    
    // Detectar ruta inicial /new
    if (window.location.pathname === '/new') {
      setIsNewSessionView(true)
      const formattedDate = new Date().toLocaleString([], { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      setNewSessionTitle(`Sesión Web ${formattedDate}`)
    }

    const handlePopState = () => {
      setIsNewSessionView(window.location.pathname === '/new')
    }
    window.addEventListener('popstate', handlePopState)

    // Polling periódico para descubrir nuevas instancias
    const instanceInterval = setInterval(fetchInstances, 5000)

    // Solicitar permiso de notificaciones del navegador si ya estaba activo
    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true)
    }

    return () => {
      window.removeEventListener('popstate', handlePopState)
      clearInterval(instanceInterval)
    }
  }, [])

  // 2. Escuchar cambios de sesión activa o puerto del proxy y polling de mensajes
  useEffect(() => {
    if (!currentSessionId) return
    
    fetchSessionDetails(currentSessionId)
    fetchMessages(currentSessionId)
    fetchSessionStatus()

    // Establecer polling para actualizar mensajes y estado del agente en tiempo real
    const interval = setInterval(() => {
      fetchMessages(currentSessionId)
      fetchSessionStatus()
      fetchSessionDetails(currentSessionId)
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [currentSessionId, currentPort, refreshInterval])

  // 3. Scroll automático inteligente al recibir nuevos mensajes
  useEffect(() => {
    if (!userHasScrolledUp && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // Manejar el desplazamiento del scroll para desactivar/activar el Smart Scroll Anchoring
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
      // Si el usuario sube más de 120px desde el fondo, asumimos que subió manualmente
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 120
      setUserHasScrolledUp(!isAtBottom)
    }
  }

  // Parseador de Markdown seguro usando marked
  const renderMarkdown = (text: string) => {
    try {
      return { __html: marked.parse(text, { gfm: true, breaks: true }) }
    } catch (e) {
      return { __html: text }
    }
  }

  // Notificaciones Push del navegador
  const toggleNotifications = async () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false)
      return
    }

    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      setNotificationsEnabled(true)
      showNotification('¡Notificaciones activadas!', 'Te avisaremos cuando tus flujos en Opencode terminen.')
    } else {
      alert('Permiso de notificación denegado por el navegador.')
    }
  }

  const showNotification = (title: string, body: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico'
      })
    }
  }

  // Copiar al portapapeles
  const handleCopyText = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMessageId(msgId)
      setTimeout(() => setCopiedMessageId(''), 2000)
    })
  }

  // APIs del Servidor / Daemon Custom
  const fetchTunnelStatus = async () => {
    try {
      const res = await fetch('/api-custom/tunnel-status')
      if (res.ok) {
        const data = await res.json()
        setTunnelUrl(data.url || '')
      }
    } catch (e) {
      console.error('Error obteniendo estado del túnel:', e)
    }
  }

  const fetchInstances = async () => {
    try {
      const res = await fetch('/api-custom/instances')
      if (res.ok) {
        const data = await res.json()
        setInstances(data.instances || [])
        setCurrentPort(data.currentPort || 4096)
      }
    } catch (e) {
      console.error('Error obteniendo instancias de Opencode:', e)
    }
  }

  const handleSelectInstance = async (port: number) => {
    try {
      const res = await fetch('/api-custom/select-instance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ port })
      })

      if (res.ok) {
        const data = await res.json()
        setCurrentPort(data.currentPort)
        setShowInstanceDropdown(false)
        setErrorMsg('')
        
        // Limpiar el estado de la sesión actual antes de recargar
        setSessions([])
        setCurrentSessionId('')
        setCurrentSession(null)
        setMessages([])
        
        // Cargar las sesiones de la nueva instancia seleccionada
        fetchSessionsAfterChange()
      }
    } catch (e) {
      alert('Error al conmutar instancia')
    }
  }

  const fetchSessionsAfterChange = async () => {
    try {
      const res = await fetch('/api/session')
      if (res.ok) {
        const data = await res.json()
        const sessionList = Array.isArray(data) ? data : (data.sessions || [])
        setSessions(sessionList)
        if (sessionList.length > 0) {
          setCurrentSessionId(sessionList[0].id)
        } else {
          setCurrentSessionId('')
          setCurrentSession(null)
          setMessages([])
        }
      }
    } catch (e) {
      setErrorMsg('Error al conectar a la nueva instancia')
    }
  }

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/session')
      if (res.ok) {
        const data = await res.json()
        const sessionList = Array.isArray(data) ? data : (data.sessions || [])
        setSessions(sessionList)
        if (sessionList.length > 0 && !currentSessionId) {
          setCurrentSessionId(sessionList[0].id)
        }
      }
    } catch (e) {
      setErrorMsg('No se pudo conectar al Daemon local de Opencode')
    }
  }

  const fetchSessionDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/session/${id}`)
      if (res.ok) {
        const data = await res.json()
        setCurrentSession(data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchMessages = async (id: string) => {
    try {
      const res = await fetch(`/api/session/${id}/message`)
      if (res.ok) {
        const data = await res.json()
        const msgList = Array.isArray(data) ? data : (data.messages || [])
        
        // Alerta al completarse
        if (isProcessing && msgList.length > messages.length) {
          const lastMsg = msgList[msgList.length - 1]
          if (lastMsg.info.role === 'assistant') {
            setIsProcessing(false)
            showNotification('Opencode: ¡Respuesta Recibida!', 'El agente ha completado la ejecución de tu prompt.')
          }
        }
        
        setMessages(msgList)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchSessionStatus = async () => {
    try {
      const res = await fetch('/api/session/status')
      if (res.ok) {
        const data = await res.json()
        if (currentSessionId && data[currentSessionId]) {
          const status = data[currentSessionId]
          const isBusy = status === 'thinking' || status === 'running_tools' || status === 'busy'
          if (isProcessing && !isBusy) {
            setIsProcessing(false)
            showNotification('Opencode: Ejecución Finalizada 🎉', 'El proceso en loop ha concluido de manera exitosa.')
          } else if (!isProcessing && isBusy) {
            setIsProcessing(true)
          }
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleStartNewSession = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!newSessionTitle.trim()) {
      alert('Por favor introduce un título para la sesión')
      return
    }

    try {
      setIsProcessing(true)
      // 1. Crear sesión en la API de Opencode
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newSessionTitle.trim() })
      })

      if (!res.ok) throw new Error('Error al crear sesión')
      const newSess = await res.json()
      
      // 2. Agregar a la lista de sesiones local
      setSessions(prev => [newSess, ...prev])
      setCurrentSessionId(newSess.id)
      setCurrentSession(newSess)
      setMessages([])
      
      // Establecer el agente y modelo seleccionados para esta sesión
      setSelectedAgent(newSessionAgent)
      setSelectedModel(newSessionModel)
      
      // 3. Si hay un primer prompt (instrucción inicial), enviarlo de inmediato
      if (newSessionFirstPrompt.trim()) {
        const bodyPayload: any = {
          parts: [{ type: 'text', text: newSessionFirstPrompt.trim() }],
          agent: newSessionAgent
        }
        
        if (newSessionModel && newSessionModel !== 'default') {
          const [providerID, modelID] = newSessionModel.split('/')
          bodyPayload.model = { providerID, modelID }
        }

        // Llamamos a prompt_async para enviar el prompt asíncronamente
        await fetch(`/api/session/${newSess.id}/prompt_async`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload)
        })

        // Reiniciar campos
        setNewSessionFirstPrompt('')
      }

      // Volver a la vista principal / chat
      navigateTo('/')
      setRefreshInterval(1500)
    } catch (e) {
      alert('Error al iniciar la nueva sesión')
    } finally {
      setIsProcessing(false)
    }
  }

  // Manejar el envío de prompts o la ejecución de comandos diagonal
  const handleSendPrompt = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !currentSessionId) return

    const input = inputValue.trim()
    setInputValue('')
    setIsProcessing(true)
    setUserHasScrolledUp(false) // Forzar autoscroll al enviar

    // Agregar mensaje local temporal de usuario
    const tempUserMessage: Message = {
      info: {
        id: `temp-${Date.now()}`,
        session_id: currentSessionId,
        role: 'user',
        time: { created: Date.now() }
      },
      parts: [{ type: 'text', text: input }]
    }
    setMessages(prev => [...prev, tempUserMessage])

    try {
      if (input.startsWith('/')) {
        // Ejecución de comandos de Opencode
        const parts = input.split(' ')
        const commandName = parts[0].substring(1) // Quitar '/'
        const args = parts.slice(1).join(' ')

        const res = await fetch(`/api/session/${currentSessionId}/command`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            command: commandName,
            arguments: args,
            agent: selectedAgent
          })
        })

        if (!res.ok) throw new Error('Error al ejecutar comando')
      } else {
        // Envío de prompt normal asíncrono
        const bodyPayload: any = {
          parts: [{ type: 'text', text: input }],
          agent: selectedAgent
        }
        
        // Agregar modelo personalizado si se ha seleccionado
        if (selectedModel && selectedModel !== 'default') {
          const [providerID, modelID] = selectedModel.split('/')
          bodyPayload.model = { providerID, modelID }
        }

        const res = await fetch(`/api/session/${currentSessionId}/prompt_async`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload)
        })

        if (!res.ok) throw new Error('Error al enviar prompt')
      }
      
      setRefreshInterval(1500)
    } catch (e) {
      setErrorMsg('Error al conectar. Comprueba el estado de Opencode.')
      setIsProcessing(false)
    }
  }

  // Activa comandos rápidos desde un botón de un solo clic
  const handleQuickCommand = async (commandName: string, args: string = '') => {
    if (!currentSessionId) return
    setIsProcessing(true)
    setUserHasScrolledUp(false) // Forzar autoscroll al enviar

    const fullCommandText = `/${commandName} ${args}`.trim()
    
    // Agregar mensaje temporal local
    const tempUserMessage: Message = {
      info: {
        id: `temp-${Date.now()}`,
        session_id: currentSessionId,
        role: 'user',
        time: { created: Date.now() }
      },
      parts: [{ type: 'text', text: fullCommandText }]
    }
    setMessages(prev => [...prev, tempUserMessage])

    try {
      const res = await fetch(`/api/session/${currentSessionId}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: commandName,
          arguments: args,
          agent: selectedAgent
        })
      })

      if (!res.ok) throw new Error('Error al ejecutar comando rápido')
      setRefreshInterval(1500)
    } catch (e) {
      setErrorMsg('No se pudo ejecutar el comando rápido.')
      setIsProcessing(false)
    }
  }

  const handleAbort = async () => {
    if (!currentSessionId) return
    try {
      const res = await fetch(`/api/session/${currentSessionId}/abort`, {
        method: 'POST'
      })
      if (res.ok) {
        setIsProcessing(false)
        setRefreshInterval(3000)
        showNotification('Opencode: Abortado', 'La sesión en ejecución ha sido cancelada forzadamente.')
      }
    } catch (e) {
      console.error(e)
    }
  }

  const togglePartExpansion = (id: string) => {
    setExpandedParts(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Formateador de modelo para evitar colapsos
  const formatModelName = (model: any): string => {
    if (!model) return 'default'
    if (typeof model === 'string') {
      return model.split('/').pop() || model
    }
    if (typeof model === 'object') {
      if (model.modelID) return model.modelID
      if (model.id) return model.id
      return JSON.stringify(model).substring(0, 20)
    }
    return 'default'
  }

  // Formateador robusto de fecha de mensaje
  const formatMessageTime = (info: any): string => {
    const rawTime = info?.time?.created || info?.time_created
    if (!rawTime) return 'En curso...'
    try {
      const date = new Date(rawTime)
      if (isNaN(date.getTime())) {
        return 'En curso...'
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch (e) {
      return 'En curso...'
    }
  }

  // Estructura Jerárquica del Árbol de Subagentes
  // Separar las sesiones en principales (raíz) e hijas (subagentes)
  const rootSessions = sessions.filter(s => !s.parent_id && !s.parentID)
  
  const getSubagentsFor = (parentId: string) => {
    return sessions.filter(s => s.parent_id === parentId || s.parentID === parentId)
  }

  // Obtener la instancia activa del Daemon
  const activeInstance = instances.find(inst => inst.port === currentPort)

  return (
    <div className="flex h-screen bg-[#09090b] text-[#f4f4f5] overflow-hidden antialiased font-sans select-none">
      
      {/* SIDEBAR: Lista de Sesiones e Instancias con Árbol de Subagentes */}
      <div className="w-80 bg-[#0c0c0e] border-r border-[#1f1f23] flex flex-col justify-between shrink-0">
        
        {/* Encabezado Principal */}
        <div className="p-4 border-b border-[#1f1f23] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#ffffff] rounded-md text-[#09090b]">
              <Terminal size={18} className="font-bold animate-pulse" />
            </div>
            <span className="font-bold tracking-tight text-lg">ZugzWeb</span>
          </div>
          <button
            onClick={() => navigateTo('/new')}
            className="p-1.5 bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] rounded-md transition duration-200 cursor-pointer"
            title="Nueva Sesión"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* SELECTOR DE PROYECTOS / INSTANCIAS */}
        <div className="px-3 pt-3 pb-1 relative">
          <div className="text-[10px] text-[#71717a] uppercase font-bold tracking-wider px-2 mb-1.5 flex items-center gap-1">
            <Server size={10} />
            <span>Instancia Activa de Opencode</span>
          </div>
          <button
            onClick={() => setShowInstanceDropdown(!showInstanceDropdown)}
            className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#121215] border border-[#1f1f23] text-left hover:bg-[#18181b] transition duration-200 cursor-pointer text-xs"
          >
            <div className="truncate flex flex-col gap-0.5">
              <span className="font-semibold text-white truncate">
                {activeInstance ? activeInstance.name : `Puerto: ${currentPort}`}
              </span>
              <span className="text-[10px] text-[#71717a] truncate font-mono">
                {activeInstance ? activeInstance.path : 'Buscando proyecto...'}
              </span>
            </div>
            <ChevronDown size={14} className="text-[#a1a1aa] shrink-0 ml-1" />
          </button>

          {/* Menú de selección de Instancias */}
          {showInstanceDropdown && (
            <div className="absolute left-3 right-3 top-16 z-50 bg-[#0c0c0e] border border-[#2e2e33] rounded-lg shadow-2xl p-1.5 space-y-1 max-h-60 overflow-y-auto">
              <div className="text-[9px] text-[#71717a] font-bold uppercase tracking-wider px-2 py-1 border-b border-[#1f1f23]/40">
                Proyectos / TUIs Detectados ({instances.length})
              </div>
              {instances.length === 0 ? (
                <div className="text-[11px] text-[#71717a] p-3 text-center italic animate-pulse">
                  No se detectaron otras TUIs activas...
                </div>
              ) : (
                instances.map(inst => (
                  <button
                    key={inst.port}
                    onClick={() => handleSelectInstance(inst.port)}
                    className={`w-full text-left p-2 rounded-md flex flex-col gap-0.5 transition duration-150 cursor-pointer ${
                      inst.port === currentPort
                        ? 'bg-[#1c1c1f] text-white border-l-2 border-white'
                        : 'hover:bg-[#121215] text-[#a1a1aa] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="truncate">{inst.name}</span>
                      <span className="text-[9px] font-mono text-[#71717a] bg-[#1c1c1f] px-1 py-0.5 rounded">
                        :{inst.port}
                      </span>
                    </div>
                    <span className="text-[9px] text-[#71717a] truncate font-mono">{inst.path}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Separador */}
        <div className="px-4 py-1.5 text-[10px] text-[#71717a] uppercase font-bold tracking-wider flex items-center gap-1 select-none">
          <MessageSquare size={10} />
          <span>Árbol de Sesiones y Subagentes</span>
        </div>

        {/* BARRA LATERAL SCROLLABLE: Jerarquía de Sesiones */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#71717a] italic">
              No se encontraron sesiones en este puerto
            </div>
          ) : (
            rootSessions.map(root => {
              const isRootActive = root.id === currentSessionId
              const subagents = getSubagentsFor(root.id)
              const hasSubagents = subagents.length > 0

              return (
                <div key={root.id} className="space-y-1">
                  {/* Sesión Principal */}
                  <button
                    onClick={() => {
                      setCurrentSessionId(root.id)
                      setErrorMsg('')
                      navigateTo('/')
                    }}
                    className={`w-full text-left p-3 rounded-lg flex flex-col gap-1 transition duration-200 cursor-pointer ${
                      isRootActive
                        ? 'bg-[#1c1c1f] border border-[#2e2e33]'
                        : 'hover:bg-[#121215] border border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`font-semibold truncate text-sm ${isRootActive ? 'text-white' : 'text-[#a1a1aa]'}`}>
                        📂 {root.title || `Sesión: ${root.id.substring(0, 8)}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#71717a]">
                      <span>{root.agent || 'build'}</span>
                      <span>{formatModelName(root.model)}</span>
                    </div>
                  </button>

                  {/* Subagentes (Hijas) en Árbol */}
                  {hasSubagents && (
                    <div className="ml-4 pl-3 border-l border-[#1f1f23] space-y-1 py-1">
                      {subagents.map(sub => {
                        const isSubActive = sub.id === currentSessionId
                        return (
                          <button
                            key={sub.id}
                            onClick={() => {
                              setCurrentSessionId(sub.id)
                              setErrorMsg('')
                              navigateTo('/')
                            }}
                            className={`w-full text-left p-2 rounded-md flex flex-col gap-0.5 transition duration-150 cursor-pointer text-xs ${
                              isSubActive
                                ? 'bg-[#18181c] border border-[#2e2e33]/50 text-white'
                                : 'hover:bg-[#0f0f12] text-[#71717a] hover:text-[#a1a1aa]'
                            }`}
                          >
                            <div className="flex items-center gap-1 font-medium truncate">
                              <CornerDownRight size={11} className="text-[#a1a1aa] shrink-0" />
                              <span className="truncate">🤖 {sub.title || `Subagente: ${sub.id.substring(0, 6)}`}</span>
                            </div>
                            <div className="flex items-center justify-between text-[9px] text-[#52525b] pl-4 font-mono">
                              <span>{sub.agent || 'subagent'}</span>
                              <span>{formatModelName(sub.model)}</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Notificaciones y Estado del Túnel */}
        <div className="p-4 bg-[#09090b] border-t border-[#1f1f23] space-y-3">
          <button
            onClick={toggleNotifications}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-medium border transition cursor-pointer ${
              notificationsEnabled
                ? 'bg-transparent border-[#22c55e]/30 hover:border-[#22c55e]/50 text-[#22c55e]'
                : 'bg-transparent border-[#27272a] hover:border-[#3f3f46] text-[#a1a1aa]'
            }`}
          >
            {notificationsEnabled ? (
              <>
                <Bell size={14} />
                <span>Notificaciones Activas</span>
              </>
            ) : (
              <>
                <BellOff size={14} />
                <span>Activar Alertas Navegador</span>
              </>
            )}
          </button>

          {tunnelUrl && (
            <div className="p-2 bg-[#1c1c1f]/50 border border-[#2e2e33] rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] text-[#a1a1aa] font-medium">
                <Globe size={11} className="text-[#3b82f6] animate-pulse" />
                <span>Túnel Remoto Activo</span>
              </div>
              <a
                href={tunnelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-[#3b82f6] hover:underline flex items-center gap-1 font-mono break-all"
              >
                {tunnelUrl}
                <ExternalLink size={8} />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* CHAT / MAIN AREA */}
      <div className="flex-1 flex flex-col bg-[#09090b] relative overflow-hidden">
        {isNewSessionView ? (
          <>
            {/* Header de Nueva Sesión */}
            <div className="h-14 border-b border-[#1f1f23] flex items-center justify-between px-6 bg-[#09090b]/80 backdrop-blur-md z-10 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-400 animate-pulse" />
                <h1 className="text-sm font-bold text-[#fafafa]">Crear Nueva Sesión de Desarrollo</h1>
              </div>
              {sessions.length > 0 && (
                <button
                  onClick={() => navigateTo('/')}
                  className="text-xs text-[#71717a] hover:text-white border border-[#1f1f23] hover:border-[#27272a] px-2.5 py-1 rounded-md transition cursor-pointer"
                >
                  Cancelar
                </button>
              )}
            </div>

            {/* Formulario de Nueva Sesión */}
            <div className="flex-1 overflow-y-auto p-8 max-w-2xl mx-auto w-full space-y-6">
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>🚀 Comenzar un nuevo flujo</span>
                </h2>
                <p className="text-xs text-[#71717a]">
                  Elige el agente y modelo adecuados para estructurar tu especificación, codificar o auditar tu aplicación de forma guiada y asíncrona.
                </p>
              </div>

              <form onSubmit={handleStartNewSession} className="space-y-5">
                {/* INPUT: TÍTULO DE LA SESIÓN */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">Título de la Sesión</label>
                  <input
                    type="text"
                    value={newSessionTitle}
                    onChange={e => setNewSessionTitle(e.target.value)}
                    placeholder="Ej. Crear Login Form, Refactorizar Auth..."
                    className="w-full bg-[#0c0c0e] border border-[#27272a] focus:border-[#3f3f46] rounded-xl px-4 py-3 text-sm text-[#fafafa] placeholder-[#52525b] outline-none transition font-medium"
                    required
                  />
                </div>

                {/* SELECCIÓN DE AGENTES: CARDS INTERACTIVAS */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">Agente Primario Inicial</label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {AVAILABLE_AGENTS.map(agent => {
                      const isSelected = newSessionAgent === agent.id
                      return (
                        <button
                          key={agent.id}
                          type="button"
                          onClick={() => setNewSessionAgent(agent.id)}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex gap-3 cursor-pointer relative ${
                            isSelected
                              ? 'bg-[#121215] border-white/60 shadow-[0_0_12px_rgba(255,255,255,0.05)]'
                              : 'bg-[#0c0c0e] border-[#1f1f23] hover:border-[#27272a]'
                          }`}
                        >
                          <div
                            className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${agent.color}15`, color: agent.color }}
                          >
                            {agent.id === 'build' ? <Settings size={16} /> : agent.id === 'plan' ? <Code size={16} /> : <Sparkles size={16} />}
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{agent.name}</span>
                              {agent.id === 'build' && (
                                <span className="text-[9px] bg-white/10 text-white/80 font-mono px-1 rounded uppercase tracking-wider">Por defecto</span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#71717a] leading-relaxed">{agent.description}</p>
                          </div>
                          {isSelected && (
                            <div className="absolute right-4 top-4 h-4 w-4 bg-white rounded-full flex items-center justify-center text-[#09090b]">
                              <Check size={10} strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* SELECTOR DE MODELO */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">Modelo Objetivo</label>
                  <div className="relative">
                    <select
                      value={newSessionModel}
                      onChange={e => setNewSessionModel(e.target.value)}
                      className="w-full bg-[#0c0c0e] border border-[#27272a] rounded-xl py-3 pl-4 pr-10 text-sm text-[#fafafa] hover:border-[#27272a] focus:border-[#3f3f46] outline-none transition cursor-pointer appearance-none font-medium"
                    >
                      {POPULAR_MODELS.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#71717a]">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>

                {/* TEXTAREA: PRIMERA INSTRUCCIÓN (OPCIONAL) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider">Primera Instrucción (Opcional)</label>
                    <span className="text-[10px] text-[#52525b]">Arranca de inmediato</span>
                  </div>
                  <textarea
                    value={newSessionFirstPrompt}
                    onChange={e => setNewSessionFirstPrompt(e.target.value)}
                    placeholder="Ej. @sdd-spec-writer Crea un contrato para una calculadora..."
                    className="w-full bg-[#0c0c0e] border border-[#27272a] focus:border-[#3f3f46] rounded-xl px-4 py-3 text-sm text-[#fafafa] placeholder-[#52525b] outline-none transition h-24 resize-none"
                  />
                </div>

                {/* BOTÓN DE CREAR */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-white hover:bg-[#e4e4e7] text-[#09090b] disabled:bg-[#18181b] disabled:text-[#71717a] font-bold py-3 px-4 rounded-xl transition duration-200 cursor-pointer text-sm shadow-md flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Plus size={14} strokeWidth={2.5} />
                  )}
                  <span>{isProcessing ? 'Iniciando sesión...' : 'Crear e Iniciar Sesión'}</span>
                </button>
              </form>
            </div>
          </>
        ) : (
          <>
            {/* Header de la Sesión */}
            <div className="h-14 border-b border-[#1f1f23] flex items-center justify-between px-6 bg-[#09090b]/80 backdrop-blur-md z-10 shrink-0">
              <div className="flex flex-col">
                <h1 className="text-sm font-bold m-0 p-0 text-[#fafafa] flex items-center gap-2">
                  {currentSession?.title || 'Cargando sesión...'}
                  {isProcessing && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]"></span>
                    </span>
                  )}
                </h1>
                {currentSession && (
                  <div className="flex items-center gap-2 text-[11px] text-[#71717a] mt-0.5">
                    <span>ID: <code className="text-[10px] font-mono bg-transparent p-0">{currentSession.id}</code></span>
                    <span>•</span>
                    <span>Costo: <span className="text-[#22c55e] font-mono">${(currentSession.cost || 0).toFixed(6)}</span></span>
                    <span>•</span>
                    <span>Tokens: In: {currentSession.tokens_input || 0} | Out: {currentSession.tokens_output || 0}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {errorMsg && (
                  <span className="text-xs text-red-400 bg-red-950/40 border border-red-900/50 py-1 px-3 rounded-md animate-pulse flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errorMsg}
                  </span>
                )}
                <button
                  onClick={() => {
                    if (currentSessionId) {
                      fetchMessages(currentSessionId)
                      fetchSessionDetails(currentSessionId)
                      fetchSessionStatus()
                    }
                  }}
                  className="p-1.5 bg-[#1c1c1f] border border-[#2e2e33] hover:bg-[#27272a] text-[#a1a1aa] hover:text-[#ffffff] rounded-md transition duration-200 cursor-pointer"
                  title="Actualizar"
                >
                  <RefreshCw size={14} className={isProcessing ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* PANEL DE COMANDOS RÁPIDOS SUPERIOR */}
            {currentSessionId && (
              <div className="bg-[#0c0c0e]/60 border-b border-[#1f1f23] px-6 py-2 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
                <span className="text-[10px] text-[#71717a] font-bold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1 select-none">
                  <Code size={11} />
                  <span>Comandos Rápidos:</span>
                </span>
                <button
                  onClick={() => handleQuickCommand('status')}
                  className="py-1 px-2.5 bg-[#121215] hover:bg-[#1c1c1f] border border-[#1f1f23] text-[11px] text-[#e4e4e7] rounded-md transition cursor-pointer shrink-0 font-medium font-mono"
                >
                  /status
                </button>
                <button
                  onClick={() => handleQuickCommand('undo')}
                  className="py-1 px-2.5 bg-[#121215] hover:bg-[#1c1c1f] border border-[#1f1f23] text-[11px] text-[#e4e4e7] rounded-md transition cursor-pointer shrink-0 font-medium font-mono"
                  title="Deshacer última edición de archivo"
                >
                  /undo
                </button>
                <button
                  onClick={() => handleQuickCommand('reset')}
                  className="py-1 px-2.5 bg-[#121215] hover:bg-[#1c1c1f] border border-[#1f1f23] text-[11px] text-[#e4e4e7] rounded-md transition cursor-pointer shrink-0 font-medium font-mono"
                  title="Reiniciar y limpiar sesión"
                >
                  /reset
                </button>
                <button
                  onClick={() => handleQuickCommand('loop', prompt('Introduce la tarea para el loop autónomo:', '') || '')}
                  className="py-1 px-2.5 bg-[#ffffff] hover:bg-[#e4e4e7] text-[#09090b] text-[11px] font-bold rounded-md transition cursor-pointer shrink-0 flex items-center gap-1"
                >
                  <Sparkles size={10} />
                  <span>Iniciar Autopiloto (/loop)</span>
                </button>
              </div>
            )}

            {/* HISTORIAL DE MENSAJES */}
            <div 
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-6 space-y-6"
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#71717a] space-y-3">
                  <MessageSquare size={36} className="text-[#27272a]" />
                  <div className="text-center">
                    <p className="text-sm font-medium">No hay mensajes en esta sesión</p>
                    <p className="text-xs mt-0.5">Escribe una instrucción, comando o inicia un loop de desarrollo abajo.</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isUser = msg.info.role === 'user'
                  // Consolidar todo el texto de las partes del mensaje para copiar
                  const fullTextMessage = msg.parts
                    .filter(p => p.type === 'text')
                    .map(p => p.text)
                    .join('\n\n')

                  return (
                    <div
                      key={msg.info.id || idx}
                      className={`flex gap-4 max-w-4xl mx-auto ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="h-8 w-8 rounded-full border border-[#2e2e33] bg-[#18181b] flex items-center justify-center text-[#fafafa] shrink-0">
                          <Bot size={16} />
                        </div>
                      )}

                      <div
                        className={`rounded-xl px-4 py-3 space-y-3 max-w-[85%] border shadow-sm group relative ${
                          isUser
                            ? 'bg-[#18181b] text-[#ffffff] border-[#2e2e33]'
                            : 'bg-[#0c0c0e] text-[#f4f4f5] border-[#1f1f23]'
                        }`}
                      >
                        {/* Encabezado del mensaje con fecha corregida */}
                        <div className="flex justify-between items-start border-b border-[#1f1f23]/40 pb-1 text-[11px] text-[#71717a] font-medium gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span>{isUser ? 'TÚ' : 'AGENTE'}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-mono">
                              <Clock size={10} />
                              {formatMessageTime(msg.info)}
                            </span>
                          </div>
                          
                          {/* Botón de copiar resultado en la burbuja */}
                          {fullTextMessage && (
                            <button
                              onClick={() => handleCopyText(fullTextMessage, msg.info.id || String(idx))}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#1f1f23] text-[#a1a1aa] hover:text-white rounded transition cursor-pointer"
                              title="Copiar texto"
                            >
                              {copiedMessageId === (msg.info.id || String(idx)) ? (
                                <Check size={12} className="text-green-500" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          )}
                        </div>

                        {/* Partes del mensaje */}
                        <div className="space-y-3">
                          {msg.parts.map((part, pIdx) => {
                            const partId = `${msg.info.id || idx}-${pIdx}`
                            const isExpanded = expandedParts[partId]

                            // 1. TEXT PART
                            if (part.type === 'text') {
                              return (
                                <div 
                                  key={pIdx} 
                                  className="text-sm leading-relaxed prose prose-invert max-w-none text-[#e4e4e7] markdown-content"
                                  dangerouslySetInnerHTML={renderMarkdown(part.text || '')}
                                />
                              )
                            }

                            // 2. REASONING PART
                            if (part.type === 'reasoning') {
                              return (
                                <div key={pIdx} className="border border-[#2e2e33]/50 rounded-lg overflow-hidden bg-[#121215]/30">
                                  <button
                                    onClick={() => togglePartExpansion(partId)}
                                    className="w-full flex items-center justify-between p-2 text-xs font-medium text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#1c1c1f]/30 transition duration-200 cursor-pointer"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <span className="h-1.5 w-1.5 rounded-full bg-[#a855f7] animate-pulse"></span>
                                      <span>Pensamiento del modelo</span>
                                    </div>
                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                  </button>
                                  {isExpanded && (
                                    <div className="p-3 border-t border-[#1f1f23] text-xs font-mono text-[#a1a1aa] bg-[#0c0c0e]/80 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                                      {part.text}
                                    </div>
                                  )}
                                </div>
                              )
                            }

                            // 3. TOOL CALL PART
                            if (part.type === 'tool') {
                              const status = part.state?.status || 'unknown'
                              const toolName = part.tool || 'Desconocido'
                              const hasOutput = !!part.state?.output

                              return (
                                <div key={pIdx} className="border border-[#1f1f23] rounded-lg overflow-hidden bg-[#0a0a0c]">
                                  <button
                                    onClick={() => togglePartExpansion(partId)}
                                    className="w-full flex items-center justify-between p-2.5 text-xs font-mono text-[#e4e4e7] hover:bg-[#121215] transition duration-200 cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Settings size={13} className="text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
                                      <span className="font-semibold text-amber-400">Herramienta: {toolName}</span>
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                        status === 'success' || status === 'completed'
                                          ? 'bg-green-950/20 text-green-400 border-green-900/50'
                                          : 'bg-yellow-950/20 text-yellow-500 border-yellow-900/50'
                                      }`}>
                                        {status}
                                      </span>
                                    </div>
                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                  </button>

                                  {isExpanded && (
                                    <div className="p-3 border-t border-[#1f1f23] bg-[#09090b] text-xs font-mono space-y-3">
                                      <div>
                                        <div className="text-[10px] text-[#71717a] font-bold uppercase tracking-wider mb-1">Entrada / Parámetros:</div>
                                        <pre className="p-2 bg-[#0c0c0e] rounded border border-[#1f1f23] text-[#fafafa] overflow-x-auto max-h-40">
                                          {JSON.stringify(part.state?.input || {}, null, 2)}
                                        </pre>
                                      </div>

                                      {hasOutput && (
                                        <div>
                                          <div className="text-[10px] text-[#71717a] font-bold uppercase tracking-wider mb-1">Salida / Resultado:</div>
                                          <pre className="p-2 bg-[#0c0c0e] rounded border border-[#1f1f23] text-[#fafafa] overflow-x-auto max-h-60 overflow-y-auto">
                                            {typeof part.state?.output === 'string' 
                                              ? part.state.output 
                                              : JSON.stringify(part.state?.output, null, 2)}
                                          </pre>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )
                            }

                            return null
                          })}
                        </div>
                      </div>

                      {isUser && (
                        <div className="h-8 w-8 rounded-full border border-[#2e2e33] bg-[#ffffff] flex items-center justify-center text-[#09090b] shrink-0">
                          <User size={16} />
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* CONSOLA DE ENTRADA, SELECCIÓN DE MODELO Y ENVÍO */}
            <div className="p-4 border-t border-[#1f1f23] bg-[#09090b] shrink-0">
              <form onSubmit={handleSendPrompt} className="max-w-4xl mx-auto space-y-3">
                
                {/* Opciones Avanzadas del Prompt: Selector de Agente y Modelo */}
                <div className="flex items-center gap-4 px-1 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#71717a] uppercase font-bold tracking-wider select-none">
                      Agente Activo:
                    </span>
                    <div className="relative">
                      <select
                        value={selectedAgent}
                        onChange={e => setSelectedAgent(e.target.value)}
                        className="bg-[#121215] border border-[#1f1f23] text-[11px] text-[#e4e4e7] rounded-md py-1 pl-2 pr-6 outline-none hover:border-[#27272a] transition cursor-pointer appearance-none font-semibold"
                      >
                        {AVAILABLE_AGENTS.map(a => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-1.5 flex items-center pointer-events-none text-[#71717a]">
                        <ChevronDown size={11} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#71717a] uppercase font-bold tracking-wider select-none">
                      Modelo Objetivo:
                    </span>
                    <div className="relative">
                      <select
                        value={selectedModel}
                        onChange={e => setSelectedModel(e.target.value)}
                        className="bg-[#121215] border border-[#1f1f23] text-[11px] text-[#e4e4e7] rounded-md py-1 pl-2 pr-6 outline-none hover:border-[#27272a] transition cursor-pointer appearance-none font-semibold"
                      >
                        {POPULAR_MODELS.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-1.5 flex items-center pointer-events-none text-[#71717a]">
                        <ChevronDown size={11} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input Textarea principal */}
                <div className="relative border border-[#27272a] focus-within:border-[#3f3f46] rounded-xl bg-[#0c0c0e] overflow-hidden shadow-lg transition duration-200">
                  <textarea
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendPrompt(e)
                      }
                    }}
                    placeholder={
                      inputValue.startsWith('/')
                        ? "Escribe los argumentos para el comando... (ej. /loop Crear login)"
                        : `Instrucción para ${activeInstance?.name || 'Opencode'} usando ${AVAILABLE_AGENTS.find(a => a.id === selectedAgent)?.name || selectedAgent}... (Escribe / para ver comandos, Shift+Enter para nueva línea)`
                    }
                    className="w-full bg-transparent px-4 py-3.5 pr-24 text-sm text-[#f4f4f5] placeholder-[#71717a] outline-none border-none resize-none h-14 max-h-40 min-h-[56px] focus:ring-0 font-medium"
                  />

                  <div className="absolute right-3 bottom-3 flex items-center gap-2">
                    {isProcessing ? (
                      <button
                        type="button"
                        onClick={handleAbort}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow animate-pulse"
                        title="Abortar ejecución"
                      >
                        <Square size={12} className="fill-current" />
                        <span>Abortar</span>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={!inputValue.trim() || !currentSessionId}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ffffff] hover:bg-[#e4e4e7] disabled:bg-[#18181b] text-[#09090b] disabled:text-[#71717a] rounded-lg text-xs font-bold transition cursor-pointer shadow disabled:cursor-not-allowed"
                      >
                        <Play size={10} className="fill-current" />
                        <span>Enviar</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-[#71717a] px-1">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className={`h-1.5 w-1.5 rounded-full ${isProcessing ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></span>
                      <span>{isProcessing ? 'Procesando comando/loop' : 'Listo'}</span>
                    </span>
                    <span>•</span>
                    <span>Enlazado al puerto :{currentPort} de Opencode</span>
                  </div>
                  <span className="font-mono">v1.2.0-web</span>
                </div>
              </form>
            </div>
          </>
        )}
      </div>

    </div>
  )
}
