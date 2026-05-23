export interface ThemeColors {
  text: string
  textMuted: string
  success: string
  warning: string
  error: string
  border: string
}

function resolveTheme(theme: unknown): Partial<ThemeColors> {
  if (theme && typeof theme === 'object' && 'current' in theme) {
    const current = (theme as { current: Record<string, string> }).current
    return current as Partial<ThemeColors>
  }
  return {}
}

export function getPhaseColor(
  phaseNum: number,
  activePhase: number,
  status: string,
  theme: unknown,
): string {
  const colors = resolveTheme(theme)
  if (activePhase > phaseNum) return colors.success || '#00ff00'
  if (activePhase === phaseNum) return status === 'running' ? (colors.warning || '#ffff00') : (colors.text || '#ffffff')
  return colors.textMuted || '#888888'
}

export function getStatusColor(status: string, theme: unknown): string {
  const colors = resolveTheme(theme)
  if (status === 'running') return colors.warning || '#ffff00'
  if (status === 'corrective_loop') return colors.error || '#ff0000'
  if (status === 'in_progress') return colors.success || '#00ff00'
  return colors.textMuted || '#888888'
}
