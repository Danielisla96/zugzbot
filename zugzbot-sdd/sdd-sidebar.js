import { jsx as _jsx, jsxs as _jsxs } from "@opentui/solid/jsx-runtime";
import { createSignal, onCleanup, Show, For } from 'solid-js';
import fs from 'node:fs/promises';
import path from 'node:path';
const id = 'zugzbot.sdd-sidebar';
const SDD_PHASES = [
    { id: 0, name: "F0: Diagnóstico de Entorno", agent: "sdd-architect" },
    { id: 1, name: "F1: Propuesta y Especificación", agent: "sdd-architect" },
    { id: 2, name: "F2: Arquitectura y Planificación", agent: "sdd-architect" },
    { id: 3, name: "F3: Implementación de Código", agent: "sdd-implementer" },
    { id: 4, name: "F4: Percepción y Diseño Visual", agent: "sdd-implementer" },
    { id: 5, name: "F5: Entorno y Pruebas Manuales", agent: "sdd-launcher" },
    { id: 6, name: "F6: Calidad y Pruebas QA", agent: "sdd-release-manager" },
    { id: 7, name: "F7: Documentación Canónica", agent: "sdd-release-manager" },
    { id: 8, name: "F8: Archivación y Cierre", agent: "sdd-release-manager" }
];
function getProgressBar(phaseNum) {
    const percentage = Math.min(100, Math.round((phaseNum / 8) * 100));
    const width = 16;
    const filledLength = Math.round((percentage / 100) * width);
    const emptyLength = width - filledLength;
    const filled = "█".repeat(filledLength);
    const empty = "░".repeat(emptyLength);
    return `[${filled}${empty}] ${percentage}%`;
}
function SidebarContentView(props) {
    const [lock, setLock] = createSignal(null);
    const dir = props.api.state.path.directory || process.cwd();
    const lockFilePath = path.join(dir, '.openspec', 'sdd-lock.json');
    const checkLockFile = async () => {
        try {
            const content = await fs.readFile(lockFilePath, 'utf8');
            const parsed = JSON.parse(content);
            setLock(parsed);
        }
        catch {
            setLock(null);
        }
    };
    // Check immediately
    void checkLockFile();
    // Set up periodic check (750ms)
    const interval = setInterval(() => {
        void checkLockFile();
    }, 750);
    onCleanup(() => {
        clearInterval(interval);
    });
    return (_jsxs("box", { flexDirection: "column", gap: 0, paddingLeft: 1, paddingRight: 1, children: [_jsx("text", { fg: props.api.theme.current.border, children: "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500" }), _jsxs("box", { flexDirection: "row", gap: 1, paddingTop: 1, children: [_jsx("text", { fg: props.api.theme.current.success, children: _jsx("b", { children: "[SDD Monitor]" }) }), _jsx("text", { fg: props.api.theme.current.textMuted, children: "\u2022 v1.4.5" })] }), _jsx(Show, { when: lock(), fallback: _jsx("box", { paddingTop: 1, paddingBottom: 1, children: _jsx("text", { fg: props.api.theme.current.textMuted, children: "\u2693 Esperando inicio de ciclo SDD..." }) }), children: _jsxs("box", { flexDirection: "column", gap: 0, paddingTop: 1, children: [_jsxs("text", { fg: props.api.theme.current.text, children: [_jsx("b", { children: "Cambio:" }), " ", _jsx("span", { style: { fg: props.api.theme.current.success }, children: lock().change_name })] }), _jsxs("box", { flexDirection: "row", gap: 1, paddingTop: 0, children: [_jsx("text", { fg: props.api.theme.current.textMuted, children: _jsx("b", { children: "Modo:" }) }), _jsx(Show, { when: lock().auto_pilot, fallback: _jsx("text", { fg: props.api.theme.current.text, children: "\u2693 INTERACTIVO" }), children: _jsx("text", { fg: props.api.theme.current.warning, children: "\u2708 PILOTO AUTOM\u00C1TICO" }) })] }), _jsxs("box", { flexDirection: "row", gap: 1, children: [_jsx("text", { fg: props.api.theme.current.textMuted, children: _jsx("b", { children: "Estado IA:" }) }), _jsx(Show, { when: lock().status === 'running', fallback: _jsx("text", { fg: props.api.theme.current.success, children: "IDLE / WAITING" }), children: _jsx("text", { fg: props.api.theme.current.warning, children: "RUNNING \u26A1" }) })] }), _jsxs("box", { flexDirection: "column", gap: 0, paddingTop: 1, paddingBottom: 1, children: [_jsx("text", { fg: props.api.theme.current.text, children: _jsx("b", { children: "Hito Completo:" }) }), _jsx("text", { fg: props.api.theme.current.success, children: getProgressBar(lock().active_phase) })] }), _jsx("text", { fg: props.api.theme.current.text, children: _jsx("b", { children: "Fases de la Metodolog\u00EDa:" }) }), _jsx("box", { flexDirection: "column", gap: 0, paddingTop: 1, children: _jsx(For, { each: SDD_PHASES, children: (phase, idx) => {
                                    const isActive = lock().active_phase === idx();
                                    const isCompleted = lock().active_phase > idx();
                                    let icon = '○';
                                    let fgColor = props.api.theme.current.textMuted;
                                    if (isCompleted) {
                                        icon = '✓';
                                        fgColor = props.api.theme.current.success;
                                    }
                                    else if (isActive) {
                                        icon = lock().status === 'running' ? '⚡' : '▶';
                                        fgColor = props.api.theme.current.warning;
                                    }
                                    return (_jsxs("box", { flexDirection: "row", gap: 1, paddingBottom: 0, children: [_jsx("text", { fg: fgColor, children: _jsx("b", { children: icon }) }), _jsx("text", { fg: isActive ? props.api.theme.current.text : props.api.theme.current.textMuted, children: _jsxs(Show, { when: isActive, fallback: phase.name, children: [_jsx("b", { children: phase.name }), _jsxs("span", { style: { fg: props.api.theme.current.textMuted }, children: [" (@", lock().active_subagent, ")"] })] }) })] }));
                                } }) })] }) }), _jsx("text", { fg: props.api.theme.current.border, paddingTop: 1, children: "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500" })] }));
}
const tui = async (api) => {
    api.slots.register({
        order: 10,
        slots: {
            sidebar_content(_ctx, props) {
                return _jsx(SidebarContentView, { api: api });
            },
        },
    });
};
const plugin = {
    id,
    tui,
};
export default plugin;
