import { useState } from 'react'
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import NewsItem from './NewsItem'

function Badge({ children, className }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold tracking-wide ${className}`}>
      {children}
    </span>
  )
}

function PriceChange({ value }) {
  const positive = value >= 0
  return (
    <span className={`text-sm font-medium ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
      {positive ? '+' : ''}{value?.toFixed(2)}%
    </span>
  )
}

function MetricPill({ label, value, highlight }) {
  return (
    <div className={`flex flex-col items-center px-3 py-2 rounded-lg ${highlight ? 'bg-white/10' : 'bg-white/5'}`}>
      <span className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-semibold text-gray-200 mt-0.5">{value}</span>
    </div>
  )
}

export default function StockCard({ stock, type, index }) {
  const [expanded, setExpanded] = useState(false)
  const isBuy = type === 'buy'
  const accentColor = isBuy ? 'emerald' : 'red'

  const borderClass = isBuy
    ? 'border-emerald-500/20 hover:border-emerald-500/40'
    : 'border-red-500/20 hover:border-red-500/40'

  const badgeClass = isBuy
    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
    : 'bg-red-500/20 text-red-300 border border-red-500/30'

  const glowClass = isBuy ? 'card-glow-green' : 'card-glow-red'
  const Icon = isBuy ? TrendingUp : TrendingDown

  return (
    <div
      className={`rounded-xl border bg-gray-900/80 backdrop-blur-sm transition-all duration-300 animate-slide-up ${borderClass} ${glowClass}`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isBuy ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}>
              <Icon size={18} className={isBuy ? 'text-emerald-400' : 'text-red-400'} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white text-sm">{stock.name}</span>
                <Badge className={badgeClass}>{stock.signal}</Badge>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{stock.ticker}</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="font-bold text-white text-base">₹{stock.current_price?.toLocaleString('en-IN')}</p>
            <PriceChange value={stock.change_1d} />
          </div>
        </div>

        {/* Metrics row */}
        <div className="flex gap-2 mt-3 flex-wrap">
          <MetricPill label="RSI" value={stock.rsi?.toFixed(1)} highlight={stock.rsi < 35 || stock.rsi > 65} />
          <MetricPill label="5D" value={`${stock.change_5d >= 0 ? '+' : ''}${stock.change_5d?.toFixed(1)}%`} />
          <MetricPill label="1M" value={`${stock.change_1m >= 0 ? '+' : ''}${stock.change_1m?.toFixed(1)}%`} />
          <div className="flex items-center gap-1 ml-auto">
            <Zap size={12} className={stock.confidence === 'High' ? 'text-yellow-400' : 'text-gray-500'} />
            <span className={`text-xs font-medium ${stock.confidence === 'High' ? 'text-yellow-400' : 'text-gray-500'}`}>
              {stock.confidence}
            </span>
          </div>
        </div>

        {/* Key factors */}
        {stock.key_factors?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {stock.key_factors.map((f, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/5">
                {f}
              </span>
            ))}
          </div>
        )}

        {/* Reasoning */}
        {stock.reasoning && (
          <p className="mt-3 text-sm text-gray-400 leading-relaxed border-l-2 pl-3"
            style={{ borderColor: isBuy ? 'rgba(52,211,153,0.4)' : 'rgba(239,68,68,0.4)' }}>
            {stock.reasoning}
          </p>
        )}
      </div>

      {/* News section */}
      {stock.news?.length > 0 && (
        <div className="border-t border-white/5">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <span className="font-medium">
              {stock.news.length} related news article{stock.news.length !== 1 ? 's' : ''}
            </span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {expanded && (
            <div className="px-4 pb-4 space-y-2 animate-fade-in">
              {stock.news.map((article, i) => (
                <NewsItem key={i} article={article} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
