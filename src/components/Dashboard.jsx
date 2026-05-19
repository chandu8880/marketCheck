import { useState } from 'react'
import { TrendingUp, TrendingDown, RefreshCw, BarChart3, AlertCircle, Clock } from 'lucide-react'
import StockCard from './StockCard'
import Loader from './Loader'
import { runAnalysis } from '../services/api'

function SectionHeader({ icon: Icon, title, count, color }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={16} className="text-white" />
      </div>
      <div>
        <h2 className="text-base font-bold text-white">{title}</h2>
        {count !== undefined && (
          <p className="text-xs text-gray-500">{count} stocks</p>
        )}
      </div>
    </div>
  )
}

function formatTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleAnalyze() {
    setLoading(true)
    setError(null)
    try {
      const result = await runAnalysis()
      setData(result)
    } catch (err) {
      const msg = err?.response?.data?.detail || err.message || 'Analysis failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-white/5 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <BarChart3 size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">NSE Market Screener</h1>
              <p className="text-xs text-gray-500 hidden sm:block">AI-powered buy & sell signals</p>
            </div>
          </div>

          {data?.analysis_timestamp && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock size={12} />
              <span>Last run: {formatTime(data.analysis_timestamp)}</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero / CTA */}
        {!data && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
              <BarChart3 size={36} className="text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
              NSE Stock Screener
            </h2>
            <p className="text-gray-400 max-w-md mb-2 text-sm sm:text-base leading-relaxed">
              Analyzes <span className="text-white font-medium">40+ Nifty stocks</span> using real-time prices,
              RSI, MACD, and the latest news — then GPT-4o picks the top 5 strong buys and strong sells.
            </p>
            <p className="text-xs text-gray-600 mb-8">
              ⚠️ For informational purposes only. Not financial advice.
            </p>
            <button
              onClick={handleAnalyze}
              className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <span className="flex items-center gap-2">
                <BarChart3 size={20} />
                Run Analysis
              </span>
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && <Loader />}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in">
            <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 max-w-lg text-sm">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={handleAnalyze}
              className="px-6 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {data && !loading && (
          <div className="animate-fade-in space-y-8">
            {/* Market summary bar */}
            {data.market_summary && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <BarChart3 size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-200">{data.market_summary}</p>
                <button
                  onClick={handleAnalyze}
                  className="ml-auto shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-medium transition-colors"
                >
                  <RefreshCw size={12} />
                  Refresh
                </button>
              </div>
            )}

            {/* Two-column grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Strong Buy */}
              <section>
                <SectionHeader
                  icon={TrendingUp}
                  title="Strong Buy"
                  count={data.strong_buy?.length}
                  color="bg-emerald-500"
                />
                <div className="space-y-3">
                  {data.strong_buy?.map((stock, i) => (
                    <StockCard key={stock.ticker} stock={stock} type="buy" index={i} />
                  ))}
                  {(!data.strong_buy || data.strong_buy.length === 0) && (
                    <p className="text-sm text-gray-600 text-center py-8">No strong buy signals found</p>
                  )}
                </div>
              </section>

              {/* Strong Sell */}
              <section>
                <SectionHeader
                  icon={TrendingDown}
                  title="Strong Sell"
                  count={data.strong_sell?.length}
                  color="bg-red-500"
                />
                <div className="space-y-3">
                  {data.strong_sell?.map((stock, i) => (
                    <StockCard key={stock.ticker} stock={stock} type="sell" index={i} />
                  ))}
                  {(!data.strong_sell || data.strong_sell.length === 0) && (
                    <p className="text-sm text-gray-600 text-center py-8">No strong sell signals found</p>
                  )}
                </div>
              </section>
            </div>

            {/* Disclaimer */}
            <p className="text-center text-xs text-gray-600 pb-4">
              ⚠️ AI-generated analysis for informational purposes only. Always do your own research before investing.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
