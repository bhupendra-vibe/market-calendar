/**
 * Calculate volatility level based on max movement
 */
export function getVolatilityLevel(maxVolatility: number): 'extreme' | 'high' | 'medium' | 'low' {
  if (maxVolatility > 2.5) return 'extreme'
  if (maxVolatility > 2) return 'high'
  if (maxVolatility > 1) return 'medium'
  return 'low'
}

/**
 * Get color for volatility level
 */
export function getVolatilityColor(level: 'extreme' | 'high' | 'medium' | 'low') {
  const colors = {
    extreme: { bg: 'bg-red-900/20', border: 'border-red-500', label: 'EXTREME', text: 'text-red-400' },
    high: { bg: 'bg-orange-900/20', border: 'border-orange-500', label: 'HIGH', text: 'text-orange-400' },
    medium: { bg: 'bg-green-900/20', border: 'border-green-500', label: 'MEDIUM', text: 'text-green-400' },
    low: { bg: 'bg-slate-900/20', border: 'border-slate-600', label: 'LOW', text: 'text-slate-400' },
  }
  return colors[level]
}

/**
 * Format date for display
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Get number of days in month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * Get first day of month (0 = Sunday, 6 = Saturday)
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

/**
 * Format number with 2 decimal places
 */
export function formatDecimal(num: number | null): string {
  return num !== null ? num.toFixed(2) : 'N/A'
}

/**
 * Determine if value is positive or negative
 */
export function isPositive(value: number | null): boolean {
  return value !== null && value > 0
}

/**
 * Get arrow symbol for up/down
 */
export function getArrow(value: number | null): string {
  if (value === null) return '→'
  if (value > 0) return '↑'
  if (value < 0) return '↓'
  return '→'
}

/**
 * Convert market data to CSV
 */
export function convertToCSV(data: any[]): string {
  const headers = [
    'Date',
    'Session',
    'NIFTY Open',
    'NIFTY High',
    'NIFTY Low',
    'NIFTY Close',
    'NIFTY Volatility %',
    'NIFTY Change %',
    'GIFT NIFTY Open',
    'GIFT NIFTY High',
    'GIFT NIFTY Low',
    'GIFT NIFTY Close',
    'GIFT NIFTY Volatility %',
    'GIFT NIFTY Change %',
    'BANKNIFTY Open',
    'BANKNIFTY High',
    'BANKNIFTY Low',
    'BANKNIFTY Close',
    'BANKNIFTY Volatility %',
    'BANKNIFTY Change %',
    'GOLD Open',
    'GOLD High',
    'GOLD Low',
    'GOLD Close',
    'GOLD Volatility %',
    'GOLD Change %',
    'SILVER Open',
    'SILVER High',
    'SILVER Low',
    'SILVER Close',
    'SILVER Volatility %',
    'SILVER Change %',
    'CRUDE Open',
    'CRUDE High',
    'CRUDE Low',
    'CRUDE Close',
    'CRUDE Volatility %',
    'CRUDE Change %',
    'Max Volatility %',
  ]

  const rows = data.map(row => [
    row.date,
    row.session,
    formatDecimal(row.nifty_open),
    formatDecimal(row.nifty_high),
    formatDecimal(row.nifty_low),
    formatDecimal(row.nifty_close),
    formatDecimal(row.nifty_volatility_percent),
    formatDecimal(row.nifty_change_percent),
    formatDecimal(row.gift_nifty_open),
    formatDecimal(row.gift_nifty_high),
    formatDecimal(row.gift_nifty_low),
    formatDecimal(row.gift_nifty_close),
    formatDecimal(row.gift_nifty_volatility_percent),
    formatDecimal(row.gift_nifty_change_percent),
    formatDecimal(row.banknifty_open),
    formatDecimal(row.banknifty_high),
    formatDecimal(row.banknifty_low),
    formatDecimal(row.banknifty_close),
    formatDecimal(row.banknifty_volatility_percent),
    formatDecimal(row.banknifty_change_percent),
    formatDecimal(row.gold_open),
    formatDecimal(row.gold_high),
    formatDecimal(row.gold_low),
    formatDecimal(row.gold_close),
    formatDecimal(row.gold_volatility_percent),
    formatDecimal(row.gold_change_percent),
    formatDecimal(row.silver_open),
    formatDecimal(row.silver_high),
    formatDecimal(row.silver_low),
    formatDecimal(row.silver_close),
    formatDecimal(row.silver_volatility_percent),
    formatDecimal(row.silver_change_percent),
    formatDecimal(row.crude_open),
    formatDecimal(row.crude_high),
    formatDecimal(row.crude_low),
    formatDecimal(row.crude_close),
    formatDecimal(row.crude_volatility_percent),
    formatDecimal(row.crude_change_percent),
    formatDecimal(row.overall_max_volatility),
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n')

  return csvContent
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string = 'market-data.csv'): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
// Add these new functions to your existing utils

export function calculateMonthlyAverages(marketData: any) {
  if (marketData.length === 0) return null

  const metrics = ['nifty', 'gift_nifty', 'banknifty', 'gold', 'silver', 'crude']
  const averages = {}

  for (const metric of metrics) {
    const changeKey = `${metric}_change`
    const values = marketData
      .map((d:any) => d[changeKey])
      .filter( (v :any) => v !== null && v !== undefined)

    averages[metric] = values.length > 0
      ? values.reduce((a, b) => a + b, 0) / values.length
      : 0
  }

  return averages
}

export function getMetricCategory(volatility: number) {
  if (volatility < 1.0) return 'Low'
  if (volatility < 2.0) return 'Medium'
  if (volatility < 2.5) return 'High'
  return 'Extreme'
}

export function getDayType(dayData: any) {
  const equityAvg = (
    (dayData.nifty_volatility || 0) +
    (dayData.banknifty_volatility || 0) +
    (dayData.gift_nifty_volatility || 0)
  ) / 3

  const commodityAvg = (
    (dayData.crude_volatility || 0) +
    (dayData.gold_volatility || 0) +
    (dayData.silver_volatility || 0)
  ) / 3

  if (commodityAvg > equityAvg + 0.5) {
    return 'Commodity-Driven Day'
  } else if (equityAvg > commodityAvg + 0.5) {
    return 'Equity-Driven Day'
  } else {
    return 'Broad-Based Volatility'
  }
}

export function getInsightText(dayData: any) {
  const dayType = getDayType(dayData)
  
  const commodityMax = Math.max(
    dayData.crude_volatility || 0,
    dayData.gold_volatility || 0,
    dayData.silver_volatility || 0
  )

  if (dayType === 'Commodity-Driven Day') {
    return `While equities remained stable, commodities experienced significant volatility. Crude oil led the movement with a ${Math.abs(dayData.crude_change).toFixed(1)}% move.`
  } else if (dayType === 'Equity-Driven Day') {
    return `Equities led the market movement today, with strong performance across indices. Commodities remained relatively stable.`
  } else {
    return `Both equities and commodities experienced significant volatility today, suggesting broad-based market uncertainty and mixed sentiment.`
  }
}

export function getPossibleReasons(dayData: any)  {
  const reasons = []

  if ((dayData.crude_volatility || 0) > 2.5) {
    reasons.push('Oil supply disruptions')
    reasons.push('Geopolitical tensions')
  }

  if ((dayData.gold_volatility || 0) > 1.5 && (dayData.nifty_change || 0) < 1) {
    reasons.push('Flight to safe havens (Gold/Silver)')
  }

  if ((dayData.nifty_volatility || 0) > 2) {
    reasons.push('Domestic economic data release')
  }

  if (Math.abs(dayData.nifty_change || 0) > 2.5) {
    reasons.push('Major policy announcement or corporate earnings')
  }

  return reasons.length > 0 ? reasons : ['General market volatility']
}

export function getSectorWinners(dayData: any) {
  const winners = []

  if ((dayData.crude_change || 0) > 2) {
    winners.push('Oil & Energy stocks')
  }

  if ((dayData.gold_volatility || 0) > 1.5) {
    winners.push('Precious metals exporters')
  }

  if ((dayData.nifty_change || 0) > 1.5) {
    winners.push('Large-cap financials')
  }

  return winners
}

export function getSectorLosers(dayData: any) {
  const losers = []

  if ((dayData.crude_change || 0) > 2) {
    losers.push('Logistics & Transport')
  }

  if ((dayData.crude_volatility || 0) > 2) {
    losers.push('Airlines & Travel')
  }

  if ((dayData.nifty_change || 0) < -1) {
    losers.push('Mid-cap growth stocks')
  }

  return losers
}
