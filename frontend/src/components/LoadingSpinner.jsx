export default function LoadingSpinner({ size = 'lg', text = 'Loading...' }) {
  const sizes = { sm: 'h-6 w-6', md: 'h-10 w-10', lg: 'h-16 w-16' }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark-900">
      <div className="relative">
        <div className={`${sizes[size]} animate-spin rounded-full border-4 border-dark-600 border-t-primary-500`} />
        <div className={`absolute inset-0 ${sizes[size]} animate-ping rounded-full border-2 border-primary-500/20`} />
      </div>
      {text && <p className="mt-4 text-slate-400 text-sm animate-pulse">{text}</p>}
    </div>
  )
}
