import { IronSession, getIronSession } from 'iron-session'
import { prisma } from './prisma'
import { cookies } from 'next/headers'

export interface SessionData {
  userId?: string
  name?: string
  email?: string
  role?: string
  accountStatus?: string
  isLoggedIn?: boolean
}

// `next build` imports route modules to collect page data, but no request (and so no session)
// is ever handled during the build. Only enforce the secret when the server actually runs, so a
// deployment can be built before its runtime secrets are attached; the server still refuses to
// start handling sessions without a strong SESSION_SECRET.
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'

if (process.env.NODE_ENV === 'production' && !isBuildPhase && (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32 || /^(replace-|default-secret)/i.test(process.env.SESSION_SECRET))) throw new Error('Set a random production SESSION_SECRET of at least 32 characters')

const sessionTTL = Number(process.env.SESSION_MAX_AGE || '28800')
if (!Number.isInteger(sessionTTL) || sessionTTL < 60 || sessionTTL > 86400) throw new Error('SESSION_MAX_AGE must be between 60 and 86400 seconds')
export const sessionOptions = {
  password: process.env.SESSION_SECRET || (() => {
    if (isBuildPhase) return 'build-phase-placeholder-never-used-for-requests'
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SESSION_SECRET environment variable must be set in production')
    }
    return 'default-secret-change-in-production'
  })(),
  cookieName: 'sdms-session',
  ttl: sessionTTL,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: sessionTTL, // 8 hours default
  },
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}

export async function createSession(user: {
  id: string
  name: string
  email: string
  role: string
  accountStatus: string
}) {
  const session = await getSession()
  session.userId = user.id
  session.name = user.name
  session.email = user.email
  session.role = user.role
  session.accountStatus = user.accountStatus
  session.isLoggedIn = true
  await session.save()
}

export async function destroySession() {
  const session = await getSession()
  session.destroy()
}

export async function requireSession() {
  const session = await getSession()
  
  if (!session.isLoggedIn || !session.userId) {
    throw new Error('Unauthorized')
  }
  
  return session
}

export async function requireActiveSession() {
  const session = await requireSession()
  
  const user = await prisma.user.findUnique({ where: { id: session.userId! } })
  if (!user || user.accountStatus !== 'ACTIVE') {
    throw new Error('Account not active')
  }
  
  session.role = user.role
  session.accountStatus = user.accountStatus
  session.name = user.name
  session.email = user.email
  return session
}
