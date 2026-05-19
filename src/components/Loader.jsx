import { useEffect, useState } from 'react'

const STEPS = [
  { icon: '📊', text: 'Fetching live NSE stock data...' },
  { icon: '📈', text: 'Computing technical indicators (RSI, MACD)...' },
  { icon: '📰', text: 'Gathering latest market news...' },
  { icon: '🤖', text: 'Running GPT-4o AI analysis...' },
  { icon: '✨', text: 'Finalizing recommendations...' },
]

export default function Loader() {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % STEPS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const step = STEPS[stepIndex]

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-8 animate-fade-in">
      {/* Spinner rings */}
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-blue-500/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        <div className="absolute inset-0 flex items-center justify-center text-3xl">
          {step.icon}
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-white">{step.text}</p>
        <p className="text-sm text-gray-500">This may take 30–60 seconds</p>
      </div>

      {/* Step indicators */}
      <div className="flex gap-2">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === stepIndex
                ? 'w-8 bg-blue-500'
                : i < stepIndex
                ? 'w-4 bg-blue-800'
                : 'w-4 bg-gray-700'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
