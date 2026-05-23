export function formatCurrency(amount: number): string {
  if (amount === 0) return '$0.00'
  if (amount < 0.0001) {
    return `$${amount.toFixed(6)}`
  }
  return `$${amount.toFixed(4)}`
}

export function formatTokens(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}k`
  }
  return num.toString()
}
