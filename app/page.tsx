import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  ClipboardList,
  Clock,
  FileSearch,
  Gavel,
  Globe,
  GraduationCap,
  HeartHandshake,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Scale,
  ScrollText,
  ShieldCheck,
  UserCog,
} from 'lucide-react'
import { school } from '@/lib/school'
import { CountUp, Reveal, Squiggle } from '@/components/home/motion'

export const metadata = {
  title: `${school.nameEn} | ${school.portalName}`,
  description: `${school.portalName} of ${school.nameEn}, ${school.city}.`,
}

const highlights = [
  { icon: ClipboardList, title: 'Incident Reporting', text: 'Clear, structured reports' },
  { icon: FileSearch, title: 'Principal Review', text: 'Fair, documented decisions' },
  { icon: HeartHandshake, title: 'Counselling', text: 'Support for every student' },
  { icon: CalendarCheck, title: 'Follow-ups', text: 'Progress tracked to closure' },
  { icon: LockKeyhole, title: 'Secure Records', text: 'Role-based, audited access' },
]

const steps = [
  { icon: ClipboardList, title: 'Report', text: 'A teacher records what was observed, linked to the student, with date, time and location.' },
  { icon: Scale, title: 'Review', text: 'The principal reviews the report, asks for clarification if needed and records a decision with its rationale.' },
  { icon: HeartHandshake, title: 'Support', text: 'The counsellor documents sessions and interventions, with confidential notes kept separate.' },
  { icon: BadgeCheck, title: 'Follow up & close', text: 'Follow-ups are scheduled and completed before the principal closes the case.' },
]

const roles = [
  { icon: GraduationCap, title: 'Teachers', text: 'Submit incident reports, track their status and respond to clarification requests.' },
  { icon: ShieldCheck, title: 'Principal', text: 'Reviews every case, approves staff accounts, records decisions and exports reports.' },
  { icon: HeartHandshake, title: 'Counsellor', text: 'Sees assigned cases, records interventions and manages follow-ups.' },
  { icon: UserCog, title: 'Administration', text: 'Manages staff access and settings without access to case content.' },
]

const commitments = [
  { icon: Scale, title: 'A report is not a finding', text: 'Reported facts, review findings and decisions are kept distinct.' },
  { icon: Gavel, title: 'People decide, not software', text: 'The system never assigns punishment automatically.' },
  { icon: LockKeyhole, title: 'Confidential counselling', text: 'Counselling notes are visible only to authorized staff.' },
  { icon: ScrollText, title: 'Every action is recorded', text: 'Decisions and changes keep their author and time in an audit trail.' },
]

// The four colours of the school logo, used to tell items apart.
const brandBg = ['bg-brand-teal', 'bg-brand-orange', 'bg-brand-pink', 'bg-brand-green']

/** Sets html.motion-ok before first paint so reveal animations never hide content without JS. */
const motionScript = `try{if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion-ok')}catch(e){}`

function SectionTitle({ eyebrow, title, light = false, center = false }: { eyebrow: string; title: string; light?: boolean; center?: boolean }) {
  return (
    <div className={center ? 'flex flex-col items-center text-center' : ''}>
      <p className={`text-xs font-extrabold uppercase tracking-[0.2em] ${light ? 'text-white/85' : 'text-brand-orange'}`}>{eyebrow}</p>
      <h2 className={`mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl ${light ? 'text-white' : 'text-navy-950'}`} style={{ textWrap: 'balance' }}>
        {title}
      </h2>
      <Squiggle className={`mt-3 h-4 w-32 ${light ? 'text-white/80' : 'text-brand-pink'}`} />
    </div>
  )
}

/** Seamless, slowly drifting two-layer wave divider. */
function Wave({ fill, back, flip = false, className = '' }: { fill: string; back?: string; flip?: boolean; className?: string }) {
  const path = 'M0 40 C 150 80 300 0 450 30 C 600 60 750 10 900 35 C 1050 60 1200 15 1200 15 L1200 100 L0 100 Z'
  const layer = (color: string, speed: string, opacity = 1) => (
    <div className={`wave-track absolute inset-x-0 bottom-0 h-full ${speed}`} style={{ opacity }}>
      {[0, 1].map((k) => (
        <svg key={k} viewBox="0 0 1200 100" preserveAspectRatio="none" className="h-full w-1/2 shrink-0" aria-hidden>
          <path d={path} fill={color} />
        </svg>
      ))}
    </div>
  )
  return (
    <div aria-hidden className={`pointer-events-none relative h-16 w-full overflow-hidden sm:h-24 ${flip ? 'rotate-180' : ''} ${className}`}>
      {back && layer(back, 'wave-fast', 0.55)}
      {layer(fill, 'wave-slow')}
    </div>
  )
}

function Logo({ className = '', light = false }: { className?: string; light?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={light ? school.logoWhite : school.logoColor} alt={`${school.nameEn} logo`} width={384} height={384} className={`object-contain ${className}`} />
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-700">
      <script dangerouslySetInnerHTML={{ __html: motionScript }} />

      {/* Utility bar */}
      <div className="bg-brand-orange text-[13px] font-bold text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <a href={`mailto:${school.email}`} className="inline-flex items-center gap-1.5 hover:underline"><Mail className="h-4 w-4" /> {school.email}</a>
            <span className="hidden items-center gap-1.5 md:inline-flex"><Clock className="h-4 w-4" /> {school.hours}</span>
            <span className="hidden items-center gap-1.5 lg:inline-flex"><MapPin className="h-4 w-4" /> {school.city}</span>
          </div>
          <a href={school.phoneHref} className="hidden items-center gap-1.5 hover:underline sm:inline-flex"><Phone className="h-4 w-4" /> {school.phone}</a>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="group flex min-w-0 items-center gap-3">
            <Logo className="h-14 w-14 shrink-0 transition-transform duration-700 group-hover:rotate-[30deg] sm:h-16 sm:w-16" />
            <div className="min-w-0 text-[15px] font-extrabold leading-tight text-navy-950 sm:text-lg">
              <p className="truncate">{school.nameShortEn}</p>
              <p className="truncate">International Private School</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 text-[16px] font-bold text-navy-950 lg:flex" aria-label="Main">
            <a href="#top" className="rounded-md bg-brand-pink px-3 py-1.5 text-white">Home</a>
            {[
              ['#about', 'About'],
              ['#process', 'How it works'],
              ['#accreditation', 'Accreditation'],
              ['#contact', 'Contact'],
            ].map(([href, label]) => (
              <a key={href} href={href} className="relative rounded-md px-3 py-1.5 transition-colors after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-brand-pink after:transition-transform after:duration-300 hover:text-brand-pink hover:after:scale-x-100">
                {label}
              </a>
            ))}
          </nav>
          <Link href="/login" className="group inline-flex shrink-0 items-center gap-2 rounded-md bg-brand-pink px-4 py-2 text-[15px] font-bold text-white shadow-md shadow-brand-pink/30 transition hover:-translate-y-0.5 hover:bg-brand-pink-dark">
            Staff Login <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="relative overflow-hidden bg-navy-950 text-white">
          {/* Phones: the full entrance sign first, then the text */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={school.entranceImage} alt={`Main entrance of ${school.nameEn}`} width={1981} height={793} className="block h-auto w-full sm:hidden" />
          {/* Larger screens: full-bleed photo with a slow zoom; the sign stays clear */}
          <div className="absolute inset-0 hidden overflow-hidden sm:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={school.entranceImage} alt="" aria-hidden className="ken-burns h-full w-full object-cover object-[50%_15%]" />
          </div>
          <div aria-hidden className="absolute inset-0 hidden bg-gradient-to-t from-black/85 via-black/40 to-transparent sm:block" />

          <div className="relative mx-auto flex max-w-4xl flex-col items-center justify-end px-4 pb-36 pt-8 text-center sm:min-h-[720px] sm:px-6 sm:pb-40 sm:pt-72 lg:min-h-[780px] lg:pb-44">
            <p lang="ar" dir="rtl" className="hero-rise font-arabic text-lg font-semibold text-white/90 sm:text-xl" style={{ animationDelay: '150ms' }}>{school.nameAr}</p>
            <h1 className="hero-rise mt-3 text-4xl font-extrabold leading-[1.1] tracking-tight drop-shadow-lg sm:text-6xl" style={{ animationDelay: '300ms', textWrap: 'balance' }}>
              Welcome to <span className="text-brand-orange">{school.acronym}</span>
            </h1>
            <p className="hero-rise mt-4 max-w-2xl text-lg font-semibold leading-relaxed text-white/95 drop-shadow sm:text-xl" style={{ animationDelay: '450ms' }}>
              The {school.portalName} helps our staff report incidents, review them fairly and support every student through counselling and follow-up.
            </p>
            <p className="hero-rise mt-4 text-xs font-bold uppercase tracking-[0.18em] text-white/80" style={{ animationDelay: '600ms' }}>{school.curriculum}</p>
            <div className="hero-rise mt-8 flex flex-wrap justify-center gap-3" style={{ animationDelay: '750ms' }}>
              <Link href="/login" className="group inline-flex items-center gap-2 rounded-full bg-brand-orange px-7 py-3.5 text-base font-extrabold text-white shadow-xl shadow-black/30 transition hover:-translate-y-0.5 hover:bg-gold-500">
                Staff Login <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <a href="#process" className="inline-flex items-center gap-2 rounded-full border-2 border-white/80 px-7 py-3.5 text-base font-extrabold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/10">
                How it works
              </a>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0">
            <Wave fill="#ffffff" back="#fde4ea" />
          </div>
        </section>

        {/* Highlights strip */}
        <div className="relative z-10 mx-auto -mt-14 max-w-6xl px-4 sm:px-6 lg:px-8">
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 shadow-2xl shadow-slate-300/50 lg:grid-cols-5 [&>li:last-child]:col-span-2 lg:[&>li:last-child]:col-span-1">
            {highlights.map((h, i) => (
              <Reveal as="li" key={h.title} delay={i * 90} className="group flex items-center gap-3 bg-white p-5 transition-colors hover:bg-rose-50/60">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${brandBg[i % brandBg.length]}`}>
                  <h.icon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <div>
                  <p className="text-sm font-extrabold text-navy-950">{h.title}</p>
                  <p className="text-xs text-slate-500">{h.text}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>

        {/* Welcome */}
        <section id="about" className="relative mx-auto grid max-w-7xl scroll-mt-24 items-center gap-14 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Reveal variant="left">
            <SectionTitle eyebrow="Welcome to" title={`${school.acronym} ${school.portalName}`} />
            <p className="mt-6 text-lg font-bold text-navy-950">“{school.motto}”</p>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              Since {school.established}, {school.nameEn} has combined strong academics with cultural values. This portal gives our teachers, principal and counsellor one secure place to record incidents, make careful decisions and follow each student&apos;s progress.
            </p>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              Access is limited to approved school staff. Each person sees only what their role allows, and every significant action is recorded.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {['Fair', 'Confidential', 'Supportive', 'Accountable'].map((v, i) => (
                <Reveal key={v} delay={200 + i * 80} variant="zoom">
                  <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 font-bold text-navy-950 shadow-sm">
                    <BadgeCheck className="h-4 w-4 text-brand-pink" /> {v}
                  </span>
                </Reveal>
              ))}
            </div>
            <Link href="/login" className="group mt-8 inline-flex items-center gap-2 rounded-full bg-brand-pink px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg shadow-brand-pink/30 transition hover:-translate-y-0.5 hover:bg-brand-pink-dark">
              Sign in to the portal <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>

          <Reveal variant="right" className="relative">
            <div aria-hidden className="float-a absolute -right-6 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-rose-200 to-brand-pink/40 blur-[1px]" />
            <div aria-hidden className="float-b absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-gradient-to-br from-orange-200 to-brand-orange/50" />
            <div aria-hidden className="float-a absolute -left-4 top-6 h-14 w-14 rounded-full border-4 border-brand-teal/60" style={{ animationDelay: '-3s' }} />
            <div className="relative overflow-hidden rounded-[2rem] shadow-2xl ring-8 ring-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={school.campusImage} alt={`Outdoor play area at ${school.nameEn}`} width={1989} height={791} className="aspect-[4/3] w-full object-cover object-[60%_50%] transition-transform duration-700 hover:scale-105" />
            </div>
            <div className="float-b absolute -bottom-6 right-6 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-slate-100">
              <Logo className="h-11 w-11 shrink-0" />
              <div>
                <p className="text-sm font-extrabold text-navy-950">{school.curriculum}</p>
                <p className="text-xs text-slate-500">{school.licence} · Est. {school.established}</p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Stats band */}
        <section className="relative overflow-hidden">
          <Wave fill="#0b1022" back="#20b0c0" />
          <div className="relative bg-navy-950 py-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={school.campusImage} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-25" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-brand-teal/40 via-navy-950/70 to-navy-950" />
            <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <SectionTitle eyebrow="Our community" title="A diverse, caring school family" light center />
              <div className="mt-12 grid gap-5 sm:grid-cols-3">
                {school.stats.map((st, i) => (
                  <Reveal key={st.label} delay={i * 150} variant="zoom">
                    <div className="group rounded-2xl bg-brand-teal/90 p-8 text-center text-white shadow-xl shadow-black/30 ring-1 ring-white/20 backdrop-blur transition duration-300 hover:-translate-y-1.5 hover:bg-brand-teal">
                      <p className="text-6xl font-extrabold tracking-tight drop-shadow"><CountUp to={st.value} /></p>
                      <p className="mt-2 text-lg font-bold text-white/95">{st.label}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
          <Wave fill="#0b1022" back="#20b0c0" flip />
        </section>

        {/* Process */}
        <section id="process" className="scroll-mt-24 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal><SectionTitle eyebrow="How it works" title="From report to resolution" center /></Reveal>
            <ol className="relative mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <span aria-hidden className="absolute left-[12%] right-[12%] top-8 hidden border-t-2 border-dashed border-slate-300 lg:block" />
              {steps.map((s, i) => (
                <Reveal as="li" key={s.title} delay={i * 140} className="relative">
                  <div className="group h-full rounded-2xl border border-slate-200 bg-white p-6 pt-12 text-center shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                    <span className={`absolute left-1/2 top-0 flex h-16 w-16 -translate-x-1/2 -translate-y-1/3 items-center justify-center rounded-full text-white shadow-lg ring-8 ring-white transition-transform duration-500 group-hover:rotate-[360deg] ${brandBg[i % brandBg.length]}`}>
                      <s.icon className="h-7 w-7" strokeWidth={1.8} />
                    </span>
                    <p className="text-xs font-extrabold uppercase tracking-widest text-brand-pink">Step {i + 1}</p>
                    <h3 className="mt-1 text-lg font-extrabold text-navy-950">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.text}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* Roles */}
        <section className="bg-slate-50 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal><SectionTitle eyebrow="Who uses the portal" title="One system, the right access for each role" /></Reveal>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {roles.map((r, i) => (
                <Reveal as="article" key={r.title} delay={i * 120} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                  <div className={`relative flex h-32 items-center justify-center overflow-hidden ${brandBg[i % brandBg.length]}`}>
                    <span aria-hidden className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/15 transition-transform duration-700 group-hover:scale-150" />
                    <span aria-hidden className="absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-black/5" />
                    <r.icon className="relative h-12 w-12 text-white transition-transform duration-500 group-hover:scale-110" strokeWidth={1.4} />
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-extrabold text-navy-950">{r.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{r.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Commitments on a pink band with waves, like the school site's highlights */}
        <section id="commitments" className="relative scroll-mt-24">
          <Wave fill="#dc2f5a" back="#f88923" className="bg-slate-50" />
          <div className="relative overflow-hidden bg-brand-pink py-16 text-white">
            <div aria-hidden className="float-a absolute -left-16 top-10 h-56 w-56 rounded-full bg-white/10" />
            <div aria-hidden className="float-b absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-brand-orange/25" />
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Reveal><SectionTitle eyebrow="Our commitments" title="Fairness and care in every case" light center /></Reveal>
              <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {commitments.map((c, i) => (
                  <Reveal key={c.title} delay={i * 120} variant="up">
                    <div className="h-full rounded-2xl bg-white/12 p-6 ring-1 ring-white/25 backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white/20">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand-pink shadow-md">
                        <c.icon className="h-6 w-6" strokeWidth={1.8} />
                      </span>
                      <h3 className="mt-4 text-lg font-extrabold">{c.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/90">{c.text}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
          <Wave fill="#dc2f5a" back="#f88923" flip />
        </section>

        {/* Accreditation */}
        <section id="accreditation" className="scroll-mt-24 py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Reveal><SectionTitle eyebrow="Accreditation" title="Recognised and accredited" center /></Reveal>
            <Reveal delay={100}>
              <p className="mx-auto mt-5 max-w-2xl text-center text-base leading-relaxed text-slate-600">
                Proud partners of Cambridge International, the Ministry of Education in Oman and a member of ECIS.
              </p>
            </Reveal>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {school.accreditation.map((a, i) => (
                <Reveal key={a.name} delay={i * 140} variant="zoom">
                  <div className="logo-card flex h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.logo} alt={a.name} className="max-h-20 w-auto max-w-full object-contain" />
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{a.name}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <Reveal variant="zoom">
            <div className="relative flex flex-col items-start gap-6 overflow-hidden rounded-3xl bg-gradient-to-r from-brand-orange via-[#ee5e3e] to-brand-pink p-8 text-white shadow-2xl shadow-brand-pink/25 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
              <div aria-hidden className="float-a absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/15" />
              <div aria-hidden className="float-b absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-white/10" />
              <div className="relative">
                <p className="text-3xl font-extrabold sm:text-4xl">Staff access</p>
                <p className="mt-2 text-base font-semibold text-white/90">Accounts are created and approved by the school principal.</p>
              </div>
              <Link href="/login" className="group relative inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-extrabold uppercase tracking-wide text-brand-pink shadow-xl transition hover:-translate-y-0.5">
                Sign in <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="scroll-mt-24 border-t border-slate-200 bg-white text-slate-600">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1.3fr] lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <Logo className="h-14 w-14" />
              <p className="text-lg font-extrabold leading-tight text-navy-950">{school.nameShortEn}<br />International Private School</p>
            </div>
            <ul className="mt-6 space-y-3 text-sm">
              <li><a href={school.phoneHref} className="flex items-center gap-3 hover:text-brand-pink"><Phone className="h-4 w-4 shrink-0 text-brand-pink" /> {school.phone}</a></li>
              <li><a href={school.landlineHref} className="flex items-center gap-3 hover:text-brand-pink"><Phone className="h-4 w-4 shrink-0 text-brand-pink" /> {school.landline}</a></li>
              <li><a href={`mailto:${school.email}`} className="flex items-center gap-3 break-all hover:text-brand-pink"><Mail className="h-4 w-4 shrink-0 text-brand-pink" /> {school.email}</a></li>
              <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-pink" /> {school.address}</li>
              <li className="flex items-start gap-3"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-pink" /> {school.hours}</li>
              <li><a href={school.websiteHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-brand-pink"><Globe className="h-4 w-4 shrink-0 text-brand-pink" /> {school.website}</a></li>
            </ul>
          </div>
          <div>
            <p className="text-base font-extrabold text-navy-950">About Us</p>
            <p className="mt-4 text-sm leading-relaxed">{school.about}</p>
            <p lang="ar" dir="rtl" className="mt-4 inline-block font-arabic text-sm font-semibold text-brand-pink">{school.nameAr}</p>
            <p className="mt-2 text-sm">{school.curriculum} · {school.licence}</p>
            <ul className="mt-5 space-y-2 text-sm font-semibold">
              <li><a href="#about" className="hover:text-brand-pink">About the portal</a></li>
              <li><a href="#process" className="hover:text-brand-pink">How it works</a></li>
              <li><Link href="/login" className="hover:text-brand-pink">Staff login</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-base font-extrabold text-navy-950">Accreditation</p>
            <div className="mt-4 grid grid-cols-2 items-center gap-6">
              {school.accreditation.map((a) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={a.name} src={a.logo} alt={a.name} className="max-h-16 w-auto object-contain transition-transform duration-300 hover:scale-105" />
              ))}
            </div>
          </div>
        </div>
        <div className="bg-brand-pink text-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-sm sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} {school.nameEn}. All rights reserved.</p>
            <p className="flex items-center gap-1.5 font-semibold">For authorized school staff only</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
