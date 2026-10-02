export default function StatCard({ title, value, unit, icon: Icon, color = 'primary', change, subtitle, trend }) {
  const colorMap = {
    primary: { bg: 'bg-primary-500/10', text: 'text-primary-400', border: 'border-primary-500/20', glow: 'shadow-primary-500/10' },
    blue:    { bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'border-blue-500/20',    glow: 'shadow-blue-500/10' },
    purple:  { bg: 'bg-purple-500/10',  text: 'text-purple-400',  border: 'border-purple-500/20',  glow: 'shadow-purple-500/10' },
    orange:  { bg: 'bg-orange-500/10',  text: 'text-orange-400',  border: 'border-orange-500/20',  glow: 'shadow-orange-500/10' },
    red:     { bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'border-red-500/20',     glow: 'shadow-red-500/10' },
    cyan:    { bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    border: 'border-cyan-500/20',    glow: 'shadow-cyan-500/10' },
  }
  const c = colorMap[color] || colorMap.primary

  return (
    <div className={`card-hover animate-slide-up group`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-slate-400 text-sm font-medium truncate">{title}</p>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-3xl font-bold text-white tracking-tight">{value ?? '—'}</span>
            {unit && <span className="text-slate-400 text-sm font-medium">{unit}</span>}
          </div>
          {subtitle && <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`h-12 w-12 shrink-0 ${c.bg} border ${c.border} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg ${c.glow}`}>
            <Icon className={`h-6 w-6 ${c.text}`} />
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className={`mt-4 flex items-center gap-1.5 text-xs font-semibold ${
          change >= 0 ? 'text-primary-400' : 'text-red-400'
        }`}>
          <span className={`inline-flex items-center justify-center h-4 w-4 rounded-full ${
            change >= 0 ? 'bg-primary-500/15' : 'bg-red-500/15'
          }`}>
            {change >= 0 ? '↑' : '↓'}
          </span>
          <span>{Math.abs(change)}%</span>
          <span className="text-slate-500 font-normal">vs last week</span>
        </div>
      )}
    </div>
  )
}
