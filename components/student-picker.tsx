'use client'
import { useEffect, useRef, useState } from 'react'
import { Search, X, GraduationCap } from 'lucide-react'

export type PickedStudent = { id: string; studentId: string; name: string; classGrade: string }

/**
 * Search for a student by approved identifier or name (FR-STU-01) and pick one record,
 * so every incident is linked to a valid student (FR-STU-02).
 */
export function StudentPicker({ value, onChange }: { value: PickedStudent | null; onChange: (s: PickedStudent | null) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PickedStudent[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(0)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value || query.trim().length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    const t = setTimeout(() => {
      fetch(`/api/students?activeStatus=true&query=${encodeURIComponent(query.trim())}`)
        .then((r) => r.json())
        .then((r) => {
          setResults(r.success && Array.isArray(r.data) ? r.data.slice(0, 8) : [])
          setActive(0)
          setOpen(true)
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 200)
    return () => clearTimeout(t)
  }, [query, value])

  useEffect(() => {
    const close = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const pick = (s: PickedStudent) => {
    onChange(s)
    setOpen(false)
    setQuery('')
  }

  if (value) {
    return (
      <div>
        <p className="mb-1.5 block text-sm font-medium text-slate-700">Student *</p>
        <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50/60 px-4 py-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-blue-600 ring-1 ring-blue-200">
            <GraduationCap className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{value.name}</p>
            <p className="text-xs text-slate-500">{value.studentId} · Class {value.classGrade}</p>
          </div>
          <button type="button" onClick={() => onChange(null)} className="rounded-lg p-1.5 text-slate-500 hover:bg-white hover:text-slate-800" aria-label="Change student">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div ref={box} className="relative">
      <label htmlFor="student-search" className="mb-1.5 block text-sm font-medium text-slate-700">Student *</label>
      <div className="relative">
        <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id="student-search"
          role="combobox"
          aria-expanded={open}
          aria-controls="student-results"
          aria-autocomplete="list"
          autoComplete="off"
          placeholder="Search by student ID or name (e.g. STU001)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          onKeyDown={(e) => {
            if (!open || !results.length) return
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)) }
            if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
            if (e.key === 'Enter') { e.preventDefault(); pick(results[active]) }
            if (e.key === 'Escape') setOpen(false)
          }}
          className="flex h-11 w-full rounded-xl border border-input bg-white pl-10 pr-4 text-sm text-slate-900 shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
        />
      </div>
      {open && (
        <ul id="student-results" role="listbox" className="absolute z-20 mt-1.5 max-h-72 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-[var(--shadow-lift)]">
          {results.map((s, i) => (
            <li
              key={s.id}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => { e.preventDefault(); pick(s) }}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm ${i === active ? 'bg-blue-50 text-blue-900' : 'text-slate-700'}`}
            >
              <span className="font-medium">{s.name}</span>
              <span className="text-xs text-slate-500">{s.studentId} · {s.classGrade}</span>
            </li>
          ))}
          {!results.length && !loading && <li className="px-3 py-2 text-sm text-slate-500">No active student matches “{query}”.</li>}
        </ul>
      )}
      <p className="mt-1.5 text-xs text-slate-500">Type at least 2 characters, then choose the student from the list.</p>
    </div>
  )
}
