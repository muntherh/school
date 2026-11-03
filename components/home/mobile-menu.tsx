'use client'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

/** Compact section menu for phones and tablets (the full nav shows from lg up). */
export function MobileMenu({ links }: { links: [string, string][] }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])
  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-sections"
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-navy-950 transition hover:bg-slate-50"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      <div
        id="mobile-sections"
        className={`absolute inset-x-0 top-full origin-top border-b border-slate-200 bg-white shadow-xl transition-all duration-300 ${open ? 'visible scale-y-100 opacity-100' : 'invisible scale-y-95 opacity-0'}`}
      >
        <nav className="mx-auto grid max-w-7xl grid-cols-2 gap-2 px-4 py-4 sm:px-6" aria-label="Sections">
          {links.map(([href, label]) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="rounded-xl bg-slate-50 px-4 py-3 text-[15px] font-bold text-navy-950 transition active:scale-[0.98] hover:bg-rose-50 hover:text-brand-pink"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
}
