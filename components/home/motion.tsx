'use client'
import { useEffect, useRef, useState } from 'react'

function useInView<T extends Element>(options: IntersectionObserverInit = { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') { setInView(true); return }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); io.disconnect() }
    }, options)
    io.observe(el)
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return [ref, inView] as const
}

/**
 * Reveals its children when scrolled into view. Content is only hidden once
 * JavaScript has marked the page as motion-capable (html.motion-ok), so the
 * page stays readable without scripts and for reduced-motion users.
 */
export function Reveal({
  children,
  delay = 0,
  variant = 'up',
  className = '',
  as: Tag = 'div',
}: {
  children: React.ReactNode
  delay?: number
  variant?: 'up' | 'left' | 'right' | 'zoom' | 'fade'
  className?: string
  as?: 'div' | 'li' | 'section' | 'article'
}) {
  const [ref, inView] = useInView<HTMLDivElement>()
  return (
    <Tag
      ref={ref as any}
      data-reveal={variant}
      className={`${inView ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}

/** Counts from 0 to `to` with an ease-out curve when it scrolls into view. */
export function CountUp({ to, duration = 1600, suffix = '' }: { to: number; duration?: number; suffix?: string }) {
  const [ref, inView] = useInView<HTMLSpanElement>({ threshold: 0.4 })
  const [value, setValue] = useState(to)
  useEffect(() => {
    if (!inView) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setValue(to); return }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 4)
      setValue(Math.round(eased * to))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    setValue(0)
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration])
  return <span ref={ref} className="tabular-nums">{value}{suffix}</span>
}

/** Hand-drawn squiggle that draws itself under a heading. */
export function Squiggle({ className = '' }: { className?: string }) {
  const [ref, inView] = useInView<SVGSVGElement>({ threshold: 0.6 })
  return (
    <svg ref={ref} viewBox="0 0 160 18" fill="none" aria-hidden className={`squiggle ${inView ? 'is-drawn' : ''} ${className}`}>
      <path
        d="M2 10 C 12 2, 22 2, 32 10 S 52 18, 62 10 S 82 2, 92 10 S 112 18, 122 10 S 142 2, 152 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        pathLength={1}
      />
    </svg>
  )
}
