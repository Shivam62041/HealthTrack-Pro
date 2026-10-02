import { XMarkIcon } from '@heroicons/react/24/outline'
import { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, size = 'md', footer }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    if (open) {
      document.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl', '2xl': 'max-w-3xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal Panel */}
      <div className={`relative w-full ${sizes[size]} bg-dark-800 rounded-2xl border border-dark-700 shadow-2xl shadow-black/50 animate-slide-up flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-dark-700 shrink-0">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            id="modal-close"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-dark-700"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
        {/* Optional Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-dark-700 shrink-0 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
