import { useEffect, useRef } from 'react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (open) {
      window.addEventListener('keydown', handleKeyDown)
      contentRef.current?.focus()
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  return (
    <div
      className={`${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'} fixed inset-0 z-50 flex flex-col justify-end bg-black/80 transition-opacity duration-300`}
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        aria-label="Close store"
        className="absolute inset-0"
        tabIndex={open ? 0 : -1}
      />

      <div
        className={`${open ? 'translate-y-0' : 'translate-y-full'} relative max-h-[85vh] overflow-y-auto border-t-2 border-black bg-white p-6 pt-14 shadow-2xl transition-transform duration-300`}
        ref={contentRef}
        tabIndex={-1}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 border border-black bg-white px-3 py-1 font-mono text-xs hover:bg-black hover:text-white"
          aria-label="Close store"
        >
          CLOSE
        </button>
        <div className="pr-1 sm:pr-2 md:pr-4">
          {children}
        </div>
      </div>
    </div>
  )
}

