import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
}) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* max-h-[90vh] + flex-col lets the header stay fixed while the body scrolls */}
      <div
        className={`card-glass w-full ${maxWidth} modal-enter max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 flex-shrink-0 border-b border-white/[0.06]">
          {title && (
            <h3 className="font-heading text-lg font-normal text-[#F5F0E8] leading-snug">
              {title}
            </h3>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex-shrink-0 text-[#6B7280] hover:text-[#F5F0E8] transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}
