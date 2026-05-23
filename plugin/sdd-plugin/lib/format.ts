const PROGRESS_BAR_WIDTH = 16

export function getProgressBar(phaseNum: number): string {
  const percentage = Math.min(100, Math.round((phaseNum / 8) * 100))
  const filledLength = Math.round((percentage / 100) * PROGRESS_BAR_WIDTH)
  const filled = "█".repeat(filledLength)
  const empty = "░".repeat(PROGRESS_BAR_WIDTH - filledLength)
  return `[${filled}${empty}] ${percentage}%`
}

export function getHitoLabel(phaseNum: number): string {
  if (phaseNum <= 2) return "Hito A: Planificación"
  if (phaseNum <= 5) return "Hito B: Construcción"
  return "Hito C: Calidad y Cierre"
}

export function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('es-CL', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

export function getPhaseIcon(phaseNum: number, activePhase: number, status: string): string {
  if (activePhase > phaseNum) return '✓'
  if (activePhase === phaseNum) return status === 'running' ? '⚡' : '▶'
  return '○'
}
