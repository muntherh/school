import Link from 'next/link'
import {
  ArrowRight,
  BookOpenCheck,
  ClipboardList,
  FileSearch,
  Globe,
  GraduationCap,
  HeartHandshake,
  LockKeyhole,
  MapPin,
  Mail,
  Clock,
  Phone,
  Scale,
  ScrollText,
  ShieldCheck,
  UserCog,
  Users,
  CalendarCheck,
  Gavel,
  BadgeCheck,
} from 'lucide-react'
import { school } from '@/lib/school'

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

// The four colours of the school logo, used to tell the steps and roles apart.
const brandBg = ['bg-brand-teal', 'bg-brand-orange', 'bg-brand-pink', 'bg-brand-green']

function SectionTitle({ eyebrow, title, light = false }: { eyebrow: string; title: string; light?: boolean }) {
  return (
    <div>
      <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${light ? 'text-gold-300' : 'text-gold-600'}`}>{eyebrow}</p>
      <h2 className={`mt-2 font-serif text-3xl font-extrabold tracking-tight sm:text-4xl ${light ? 'text-white' : 'text-navy-900'}`} style={{ textWrap: 'balance' }}>
        {title}
      </h2>
    </div>
  )
}

function Emblem({ className = '', light = false }: { className?: string; light?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={light ? school.logoWhite : school.logo} alt={`${school.nameEn} logo`} width={512} height={512} className={`object-contain ${className}`} />
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-700">
      {/* Utility bar (orange, as on fsisoman.edu.om) */}
      <div className="bg-brand-orange text-[13px] font-bold text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <a href={`mailto:${school.email}`} className="inline-flex items-center gap-1.5 hover:underline"><Mail className="h-4 w-4 text-brand-pink" /> {school.email}</a>
            <span className="hidden items-center gap-1.5 md:inline-flex"><Clock className="h-4 w-4 text-brand-pink" /> {school.hours}</span>
            <span className="hidden items-center gap-1.5 sm:inline-flex"><MapPin className="h-4 w-4 text-brand-pink" /> {school.city}</span>
          </div>
          <a href={school.phoneHref} className="hidden items-center gap-1.5 hover:underline sm:inline-flex"><Phone className="h-4 w-4 text-brand-pink" /> {school.phone}</a>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={school.logoColor} alt={`${school.nameEn} logo`} width={384} height={384} className="h-14 w-14 shrink-0 object-contain sm:h-16 sm:w-16" />
            <div className="min-w-0 text-[15px] font-bold leading-tight text-navy-950 sm:text-lg">
              <p className="truncate">{school.nameShortEn}</p>
              <p className="truncate">International Private School</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 text-[16px] font-bold text-navy-950 lg:flex" aria-label="Main">
            <a href="#top" className="rounded-md bg-brand-pink px-3 py-1.5 text-white">Home</a>
            <a href="#about" className="rounded-md px-3 py-1.5 hover:text-brand-pink">About</a>
            <a href="#process" className="rounded-md px-3 py-1.5 hover:text-brand-pink">How it works</a>
            <a href="#commitments" className="rounded-md px-3 py-1.5 hover:text-brand-pink">Commitments</a>
            <a href="#contact" className="rounded-md px-3 py-1.5 hover:text-brand-pink">Contact</a>
          </nav>
          <Link href="/login" className="inline-flex shrink-0 items-center gap-2 rounded-md bg-brand-pink px-4 py-2 text-[15px] font-bold text-white transition hover:bg-brand-pink-dark">
            Staff Login <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="relative overflow-hidden bg-navy-950 text-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {/* Phones: show the whole entrance sign, then the text below it */}
          <img src={school.entranceImage} alt={`Main entrance of ${school.nameEn}`} width={1981} height={793} className="block h-auto w-full sm:hidden" />
          {/* Larger screens: full-bleed photo; keep the sign clear and darken only behind the text */}
          <img src={school.entranceImage} alt="" aria-hidden className="absolute inset-0 hidden h-full w-full object-cover object-[50%_15%] sm:block" />
          <div aria-hidden className="absolute inset-0 hidden bg-gradient-to-t from-black/85 via-black/45 to-transparent sm:block" />
          <div className="relative mx-auto flex max-w-4xl flex-col items-center justify-end px-4 pb-28 pt-8 text-center sm:min-h-[700px] sm:px-6 sm:pb-32 sm:pt-72 lg:min-h-[760px] lg:pb-36">
            <p lang="ar" dir="rtl" className="font-arabic text-lg font-semibold text-white/90 sm:text-xl">{school.nameAr}</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-[1.1] tracking-tight drop-shadow-lg sm:text-6xl" style={{ textWrap: 'balance' }}>
              Welcome to {school.acronym}
            </h1>
            <p className="mt-4 max-w-2xl text-lg font-semibold leading-relaxed text-white/95 drop-shadow sm:text-xl">
              The {school.portalName} helps our staff report incidents, review them fairly and support every student through counselling and follow-up.
            </p>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-white/80">{school.curriculum}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/login" className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-7 py-3.5 text-base font-extrabold text-white shadow-lg shadow-black/25 transition hover:bg-gold-500">
                Staff Login <ArrowRight className="h-5 w-5" />
              </Link>
              <a href="#process" className="inline-flex items-center gap-2 rounded-full border-2 border-white/80 px-7 py-3.5 text-base font-extrabold text-white transition hover:bg-white/10">
                How it works
              </a>
            </div>
          </div>
        </section>

        {/* Highlights strip */}
        <div className="relative z-10 mx-auto -mt-20 max-w-6xl px-4 sm:px-6 lg:px-8">
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 shadow-xl lg:grid-cols-5 [&>li:last-child]:col-span-2 lg:[&>li:last-child]:col-span-1">
            {highlights.map((h) => (
              <li key={h.title} className="flex items-center gap-3 bg-white p-5">
                <h.icon className="h-8 w-8 shrink-0 text-brand-pink" strokeWidth={1.7} />
                <div>
                  <p className="text-sm font-bold text-navy-900">{h.title}</p>
                  <p className="text-xs text-slate-500">{h.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Welcome */}
        <section id="about" className="mx-auto grid max-w-7xl scroll-mt-24 items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="relative pb-10">
            <div className="overflow-hidden rounded-2xl shadow-xl ring-1 ring-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={school.campusImage} alt={`Outdoor play area at ${school.nameEn}`} width={1989} height={791} className="aspect-[16/10] h-full w-full object-cover object-[60%_50%]" />
            </div>
            <div className="absolute -bottom-2 right-4 flex w-[min(88%,22rem)] items-center gap-3 rounded-xl bg-white p-4 shadow-2xl ring-1 ring-slate-200 sm:right-6">
              <Emblem className="h-12 w-12 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-navy-900">{school.curriculum}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5 shrink-0 text-gold-600" /> {school.city} · {school.licence}</p>
              </div>
            </div>
          </div>
          <div>
            <SectionTitle eyebrow="Welcome to" title={school.portalName} />
            <p className="mt-5 text-base leading-relaxed text-slate-600">
              Every student deserves to be heard and supported. This portal gives our teachers, principal and counsellor one secure place to record incidents, make careful decisions and follow each student&apos;s progress.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Access is limited to approved school staff. Each person sees only what their role allows, and every significant action is recorded.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {['Fair', 'Confidential', 'Supportive', 'Accountable'].map((v) => (
                <span key={v} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-navy-900">
                  <BadgeCheck className="h-4 w-4 text-gold-600" /> {v}
                </span>
              ))}
            </div>
            <Link href="/login" className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-pink px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-brand-pink-dark">
              Sign in to the portal <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Process */}
        <section id="process" className="scroll-mt-24 bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle eyebrow="How it works" title="From report to resolution" />
            <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <li key={s.title} className="relative rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <span className="absolute right-4 top-4 text-sm font-extrabold text-brand-pink">Step {i + 1}</span>
                  <span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-white ${brandBg[i % brandBg.length]}`}>
                    <s.icon className="h-7 w-7" strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-4 font-serif text-lg font-bold text-navy-900">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Roles */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Who uses the portal" title="One system, the right access for each role" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {roles.map((r, i) => (
              <article key={r.title} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg">
                <div className={`relative flex h-32 items-center justify-center ${brandBg[i % brandBg.length]}`}>
                  <r.icon className="relative h-12 w-12 text-white" strokeWidth={1.4} />
                  <span className="absolute -bottom-6 left-5 flex h-12 w-12 items-center justify-center rounded-full bg-white text-navy-950 shadow-md ring-4 ring-white">
                    <r.icon className="h-5 w-5" />
                  </span>
                </div>
                <div className="p-5 pt-9">
                  <h3 className="font-serif text-lg font-bold text-navy-900">{r.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{r.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Commitments */}
        <section id="commitments" className="scroll-mt-24 bg-navy-950 py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle eyebrow="Our commitments" title="Fairness and care in every case" light />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {commitments.map((c) => (
                <div key={c.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
                  <c.icon className="h-8 w-8 text-gold-400" strokeWidth={1.5} />
                  <h3 className="mt-4 font-serif text-lg font-bold">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-6 rounded-2xl bg-gradient-to-r from-navy-900 to-navy-800 p-8 text-white shadow-xl sm:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <BookOpenCheck className="hidden h-14 w-14 shrink-0 text-gold-400 sm:block" strokeWidth={1.3} />
              <div>
                <p className="font-serif text-2xl font-bold text-gold-300 sm:text-3xl">Staff access</p>
                <p className="mt-1 text-sm text-slate-300">Accounts are created and approved by the school principal.</p>
              </div>
            </div>
            <Link href="/login" className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-gold-500">
              Sign in <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="scroll-mt-24 bg-navy-950 text-slate-300">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <Emblem light className="h-12 w-12" />
              <p className="font-serif text-lg font-bold leading-tight text-white">{school.nameShortEn}<br /><span className="text-xs font-sans font-semibold uppercase tracking-[0.14em] text-slate-400">International Private School</span></p>
            </div>
            <p lang="ar" dir="rtl" className="mt-4 inline-block font-arabic text-sm text-gold-300">{school.nameAr}</p>
            <p className="mt-3 text-sm text-slate-400">{school.curriculum}<br />{school.licence}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white">Quick links</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#about" className="hover:text-white">About the portal</a></li>
              <li><a href="#process" className="hover:text-white">How it works</a></li>
              <li><a href="#commitments" className="hover:text-white">Commitments</a></li>
              <li><Link href="/login" className="hover:text-white">Staff login</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white">Contact us</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" /> {school.city}</li>
              <li><a href={school.phoneHref} className="flex items-center gap-2 hover:text-white"><Phone className="h-4 w-4 shrink-0 text-gold-400" /> {school.phone}</a></li>
              <li><a href={`mailto:${school.email}`} className="flex items-center gap-2 break-all hover:text-white"><Mail className="h-4 w-4 shrink-0 text-gold-400" /> {school.email}</a></li>
              <li className="flex items-start gap-2"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" /> {school.hours}</li>
              <li><a href={school.websiteHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white"><Globe className="h-4 w-4 shrink-0 text-gold-400" /> {school.website}</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs text-slate-400 sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} {school.nameEn}. All rights reserved.</p>
            <p className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> For authorized school staff only</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
