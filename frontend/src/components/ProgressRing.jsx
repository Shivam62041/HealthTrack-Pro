export default function ProgressRing({ percentage = 0, size = 80, strokeWidth = 8, color = '#22c55e', label }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (Math.min(Math.max(percentage, 0), 100) / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90" aria-label={`${Math.round(percentage)}% progress`}>
        {/* Background track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="transparent"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-white font-bold leading-none" style={{ fontSize: size * 0.18 }}>
          {Math.round(percentage)}%
        </span>
        {label && (
          <span className="text-slate-500 leading-none mt-0.5" style={{ fontSize: size * 0.12 }}>
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
