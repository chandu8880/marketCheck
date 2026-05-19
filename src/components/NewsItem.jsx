import { ExternalLink, Clock } from 'lucide-react'

function timeAgo(dateString) {
  if (!dateString) return ''
  const diff = Date.now() - new Date(dateString).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function NewsItem({ article }) {
  if (!article?.title) return null

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 hover:border-white/10"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-300 group-hover:text-white transition-colors line-clamp-2 leading-snug">
          {article.title}
        </p>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
          {article.source && (
            <span className="font-medium text-gray-400">{article.source}</span>
          )}
          {article.source && article.published_at && (
            <span className="text-gray-600">·</span>
          )}
          {article.published_at && (
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {timeAgo(article.published_at)}
            </span>
          )}
        </div>
      </div>
      <ExternalLink
        size={14}
        className="mt-0.5 shrink-0 text-gray-600 group-hover:text-gray-400 transition-colors"
      />
    </a>
  )
}
