# 🧠 Consolidado de Contexto de Alta Densidad (SDD Compaction)
Fecha de consolidación: 2026-05-23
Cambio Activo: `simplify-tui-monitor`

---

## 📜 Propuesta y Objetivos
# Propuesta Técnica: Simplificación del Monitor TUI SDD

---

## 📐 Especificaciones y Escenarios
Escenarios BDD no estructurados.

---

## 🏛️ Estructura Arquitectónica
Esquema Arquitectónico:
```mermaid
graph TB
    subgraph "PluginTuiSidebar (entry point)"
        A["PluginTuiSidebar(api)"]
        A --> B["loadLockfile()"]
        A --> C["api.slots.register()"]
    end

    subgraph "sidebar_content (slot order: 100)"
        D["sidebar_content(ctx, props)"]
        D --> E["🔵 Estado (createSignal)"]
        E --> E1["lockState ← loadLockfile()"]
        E --> E2["currentTime ← Date.now()"]

        D --> F["📡 Polling (setInterval 1000ms)"]
        F --> F1["setLockState(loadLockfile())"]
        F --> F2["setCurrentTime(Date.now())"]

        D --> G["📂 getActiveAgentData(state)"]
        G --> G1["Lee phase_history.jsonl"]
        G --> G2["Fallback: constante PHASE_ACTIONS"]

        D --> H["🖥️ SDDMonitor() ← Componente visual"]
        H --> H1["Header (cambio + modo)"]
        H --> H2["Fase activa destacada"]
        H --> H3["Barra de progreso compacta"]
        H --> H4["Tarjeta agente activo"]
        H --> H5["Siguiente paso / ciclo completo"]

        D --> I["onCleanup()"]
        I --> I1["clearInterval(interval)"]

        D --> J["✅ Return JSX"]
        J --> J1["<SDDMonitor/>"]
        J --> J2["<props.children/>"]
    end

    subgraph "🗑️ ELIMINADO (no existe post-simplificación)"
        K["calculateBreakdown()"]
        L["collectSessionIds()"]
        M["extractAgentName()"]
        N["sumMetrics()"]
        O["truncateAgentName()"]
        P["hasMetricsChanged()"]
        Q["SDDUsage()"]
        R["AgentMetricsRow()"]
        S["breakdownState / showBreakdown / previousBreakdown"]
        T["getDefaultAction()"]
        U["getAgentForPhase()"]
        K -.-> L -.-> M -.-> N -.-> O -.-> P -.-> Q -.-> R
    end

    style A fill:#1a1a2e,stroke:#e94560,color:#fff
    style H fill:#16213e,stroke:#0f3460,color:#fff
    style K fill:#3d0000,stroke:#ff0000,color:#ff6666
    style L fill:#3d0000,stroke:#ff0000,color:#ff6666
    style M fill:#3d0000,stroke:#ff0000,color:#ff6666
    style N fill:#3d0000,stroke:#ff0000,color:#ff6666
    style O fill:#3d0000,stroke:#ff0000,color:#ff6666
    style P fill:#3d0000,stroke:#ff0000,color:#ff6666
    style Q fill:#3d0000,stroke:#ff0000,color:#ff6666
    style R fill:#3d0000,stroke:#ff0000,color:#ff6666
    style S fill:#3d0000,stroke:#ff0000,color:#ff6666
    style T fill:#3d0000,stroke:#ff0000,color:#ff6666
    style U fill:#3d0000,stroke:#ff0000,color:#ff6666
```

---

## 📋 Estado del Checklist
Checklist de Tareas: 0/0 completadas.


---

> [!TIP]
> **Acción Recomendada para Limpiar Memoria de Contexto:**
> Si eres un subagente y ves este archivo, tu memoria ha sido compactada con éxito.
> Lee **únicamente** este archivo de consolidación para entender el estado actual y los contratos técnicos previos. Descarta la lectura repetitiva de chats históricos o archivos de logs antiguos.
