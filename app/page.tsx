'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  getVolatilityLevel, 
  getVolatilityColor,
  getDayType,
  getInsightText,
  getPossibleReasons,
  getSectorWinners,
  getSectorLosers,
  getMetricCategory,
  calculateMonthlyAverages,
  convertToCSV,
  downloadCSV
} from '@/lib/utils'

export default function Home() {
 const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 2)) // March 2026
const [selectedDay, setSelectedDay] = useState<any>(null)
const [marketData, setMarketData] = useState<any[]>([])
const [monthlyAverages, setMonthlyAverages] = useState<any>(null)
const [loading, setLoading] = useState<boolean>(true)

  // Fetch data on mount
  useEffect(() => {
    fetchMarketData()
  }, [currentMonth])

  // Calculate monthly averages whenever data changes
  useEffect(() => {
    if (marketData.length > 0) {
      const avgs = calculateMonthlyAverages(marketData)
      setMonthlyAverages(avgs)
    }
  }, [marketData])

  async function fetchMarketData(): Promise<void> {
  setLoading(true)
  try {
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    const startStr = startDate.toISOString().split('T')[0]
    const endStr = endDate.toISOString().split('T')[0]

    console.log(`Fetching from ${startStr} to ${endStr}`)

    const response = await fetch(`/api/market-data?start=${startStr}&end=${endStr}`)
    
    console.log('Response status:', response.status)
    
    const result = await response.json()
    
    console.log('Response data:', result)
    console.log('Data array length:', result.data?.length)
console.log('First record:', result.data?.[0])

    if (result.error) throw new Error(result.error)

    setMarketData(result.data || [])
  } catch (error: any) {
    console.error('Error fetching data:', error?.message || error)
    setMarketData(getSampleData())
  } finally {
    setLoading(false)
  }
}

  function goToPreviousMonth(): void  {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
    setSelectedDay(null)
  }

  function goToNextMonth(): void {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
    setSelectedDay(null)
  }

  function getCalendarDays(): any[]  {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days = []
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  function getDayData(day: any) { 
    if (!day) return null
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return marketData.find((d: any) => d.date === dateStr)
  }

  const calendarDays = getCalendarDays()
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Month Header */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-700">
          <h1 className="text-4xl font-bold text-slate-100 flex items-center gap-3">
            📅 {monthName}
          </h1>
          <div className="flex gap-3">
            <button
              onClick={goToPreviousMonth}
              className="w-10 h-10 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-cyan-500 text-slate-200 hover:text-cyan-400 rounded-lg transition-all flex items-center justify-center font-semibold"
            >
              ←
            </button>
            <button
              onClick={goToNextMonth}
              className="w-10 h-10 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-cyan-500 text-slate-200 hover:text-cyan-400 rounded-lg transition-all flex items-center justify-center font-semibold"
            >
              →
            </button>
          </div>
        </div>

        {/* Tracked Metrics Panel */}
        <TrackedMetricsPanel 
          monthData={marketData}
          selectedDay={selectedDay}
          monthlyAverages={monthlyAverages}
        />

        {/* Calendar Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading market data...</p>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 shadow-2xl">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-3 mb-4">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                <div key={day} className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest py-3">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-3">
              {calendarDays.map((day, idx) => (
                <div key={idx}>
                  {day ? (
                    <DayCard
                      day={day}
                      data={getDayData(day)}
                      isSelected={selectedDay && selectedDay.date === `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`}
                      onClick={() => setSelectedDay(getDayData(day))}
                    />
                  ) : (
                    <div className="p-4"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detail Panel Modal */}
        {selectedDay && (
          <DetailModal
            dayData={selectedDay}
            onClose={() => setSelectedDay(null)}
          />
        )}
      </div>
    </div>
  )
}

// Tracked Metrics Panel Component
function TrackedMetricsPanel({ monthData, selectedDay, monthlyAverages }: any) {
  const metrics = [
    { key: 'nifty', name: 'NIFTY 50' },
    { key: 'gift_nifty', name: 'GIFT NIFTY' },
    { key: 'banknifty', name: 'BANKNIFTY' },
    { key: 'gold', name: 'GOLD' },
    { key: 'silver', name: 'SILVER' },
    { key: 'crude', name: 'CRUDE' }
  ]

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 mb-6 shadow-lg">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
        Tracked Metrics
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map(metric => {
          let value, color, period

          if (selectedDay) {
            // Show daily data
            const changeKey = `${metric.key}_change`
            value = selectedDay[changeKey] || 0
            period = 'Daily'
          } else {
            // Show monthly averages
            value = monthlyAverages?.[metric.key] || 0
            period = 'Monthly'
          }

          color = value >= 0 ? '#6fa876' : '#a54242'
          const arrow = value >= 0 ? '↑' : '↓'

          return (
            <div
              key={metric.key}
              className="bg-slate-700/30 border border-slate-600 hover:border-cyan-500/50 rounded-lg p-3 text-center transition-all hover:bg-slate-700/50"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-300 mb-1">
                {metric.name}
              </div>
              <div style={{ color }} className="text-lg font-bold mb-1">
                {arrow} {Math.abs(value).toFixed(2)}%
              </div>
              <div className="text-xs text-slate-500 uppercase">
                {period}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Day Card Component
function DayCard({ day, data, isSelected, onClick }: any) {
  if (!data) {
    return (
      <button
        className="p-4 bg-slate-700/20 rounded-lg border border-slate-600/30 text-slate-600 font-semibold text-lg h-32 cursor-default"
      >
        {day}
      </button>
    )
  }

  const maxVolatility = Math.max(
    data.nifty_volatility || 0,
    data.gift_nifty_volatility || 0,
    data.banknifty_volatility || 0,
    data.gold_volatility || 0,
    data.silver_volatility || 0,
    data.crude_volatility || 0
  )

  const volatilityLevel = getVolatilityLevel(maxVolatility)
  const bgColor = getVolatilityColor(volatilityLevel)

  // Determine equity vs commodity status
  const equityAvg = (
    (data.nifty_volatility || 0) +
    (data.banknifty_volatility || 0) +
    (data.gift_nifty_volatility || 0)
  ) / 3

  const commodityAvg = (
    (data.crude_volatility || 0) +
    (data.gold_volatility || 0) +
    (data.silver_volatility || 0)
  ) / 3

  const equityStatus = equityAvg < 1.5 ? 'CALM' : equityAvg < 2.0 ? 'VOLATILE' : 'EXTREME'
  const commodityStatus = commodityAvg < 1.5 ? 'CALM' : commodityAvg < 2.0 ? 'VOLATILE' : 'EXTREME'

  const equityColor = equityStatus === 'CALM' ? 'text-green-400' : equityStatus === 'VOLATILE' ? 'text-yellow-400' : 'text-red-400'
  const commodityColor = commodityStatus === 'CALM' ? 'text-green-400' : commodityStatus === 'VOLATILE' ? 'text-yellow-400' : 'text-red-400'

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg border-2 transition-all h-32 w-full text-left ${
        isSelected
          ? 'border-cyan-500 bg-slate-700 shadow-lg shadow-cyan-500/20'
          : 'border-slate-600 hover:border-slate-500 bg-slate-700/50 hover:bg-slate-700'
      }`}
    >
      <div className="font-bold text-xl text-slate-100 mb-0">{day}</div>

      <div className="space-y-2 text-sm">
  <div>
    <div className="text-slate-400 text-xs">📈 Equities</div>
    <div className={`font-semibold ${equityColor}`}>
      {equityStatus === 'CALM' ? '💚' : equityStatus === 'VOLATILE' ? '🟡' : '🔴'} {equityStatus}
    </div>
  </div>

  <div>
    <div className="text-slate-400 text-xs">⛽ Commodities</div>
    <div className={`font-semibold ${commodityColor}`}>
      {commodityStatus === 'CALM' ? '💚' : commodityStatus === 'VOLATILE' ? '🟡' : '🔴'} {commodityStatus}
    </div>
  </div>
</div>
    </button>
  )
}

// Detail Modal Component
function DetailModal({ dayData, onClose }: any) {
  const dayType = getDayType(dayData)
  const insightText = getInsightText(dayData)
  const reasons = getPossibleReasons(dayData)
  const winners = getSectorWinners(dayData)
  const losers = getSectorLosers(dayData)

  const csvData = convertToCSV([dayData])

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-slate-800/95 border-b border-slate-700 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-100">
            {dayData.date}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Volatility Summary */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">
              Volatility Summary
            </h3>
            <div className="space-y-4">
              {/* Equities */}
              <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                <div className="font-semibold text-slate-200 mb-3">📈 Equities: 💚 CALM</div>
                <div className="space-y-2 text-sm">
                  <MetricRow label="NIFTY" value={dayData.nifty_change} category={getMetricCategory(dayData.nifty_volatility)} />
                  <MetricRow label="BANKNIFTY" value={dayData.banknifty_change} category={getMetricCategory(dayData.banknifty_volatility)} />
                  <MetricRow label="GIFT NIFTY" value={dayData.gift_nifty_change} category={getMetricCategory(dayData.gift_nifty_volatility)} />
                </div>
              </div>

              {/* Commodities */}
              <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                <div className="font-semibold text-slate-200 mb-3">⛽ Commodities: 🔴 VOLATILE</div>
                <div className="space-y-2 text-sm">
                  <MetricRow label="CRUDE" value={dayData.crude_change} category={getMetricCategory(dayData.crude_volatility)} />
                  <MetricRow label="GOLD" value={dayData.gold_change} category={getMetricCategory(dayData.gold_volatility)} />
                  <MetricRow label="SILVER" value={dayData.silver_change} category={getMetricCategory(dayData.silver_volatility)} />
                </div>
              </div>
            </div>
          </section>

          {/* Key Insight */}
          <section>
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">
              Key Insight
            </h3>
            <div className="bg-green-500/10 border border-green-600/30 rounded-lg p-4 space-y-3">
              <div className="font-semibold text-slate-200 text-lg">
                {dayType}
              </div>
              <div className="text-slate-300 leading-relaxed">
                {insightText}
              </div>

              <div className="mt-4">
                <h4 className="font-semibold text-slate-300 mb-2">Possible Reasons:</h4>
                <ul className="space-y-1">
                  {reasons.map((reason, idx) => (
                    <li key={idx} className="text-slate-400 text-sm">• {reason}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold text-slate-300 mb-2">Sector Impact:</h4>
                <div className="space-y-2">
                  {winners.length > 0 && (
                    <div className="space-y-1">
                      {winners.map((sector, idx) => (
                        <div key={idx} className="text-green-400 text-sm">↑ {sector}</div>
                      ))}
                    </div>
                  )}
                  {losers.length > 0 && (
                    <div className="space-y-1">
                      {losers.map((sector, idx) => (
                        <div key={idx} className="text-red-400 text-sm">↓ {sector}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <button
              onClick={() => downloadCSV(convertToCSV([dayData]), `market-data-${dayData.date}`)}
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-4 rounded-lg transition-all"
            >
              📥 Export
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 px-4 rounded-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper Component
function MetricRow({ label, value, category }: any) {
  const color = value >= 0 ? 'text-green-400' : 'text-red-400'
  const arrow = value >= 0 ? '↑' : '↓'

  return (
    <div className="flex justify-between items-center py-1 border-b border-slate-600/30">
      <span className="text-slate-400">{label}</span>
      <div className="flex gap-4">
        <span className={color}>{arrow} {Math.abs(value).toFixed(2)}%</span>
        <span className="text-slate-500 text-xs uppercase w-16 text-right">{category}</span>
      </div>
    </div>
  )
}

// Sample Data Function
function getSampleData(): any[]  {
  // Returns sample data if Supabase fails
  return [
    {
      date: '2024-11-06',
      session: 'cash',
      nifty_open: 24100,
      nifty_high: 24280.5,
      nifty_low: 24050,
      nifty_close: 24205,
      nifty_volatility: 0.96,
      nifty_change: 2.1,
      gift_nifty_volatility: 1.04,
      gift_nifty_change: 2.5,
      banknifty_volatility: 1.11,
      banknifty_change: 2.9,
      gold_volatility: 0.61,
      gold_change: 1.5,
      silver_volatility: 0.85,
      silver_change: 2.1,
      crude_volatility: 1.52,
      crude_change: 3.2,
      overall_max_volatility: 1.52
    }
  ]
}