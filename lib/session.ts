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

const sessionTTL = Number(process.env.SESSION_MAX_AGE || '28800')
if (!Number.isInteger(sessionTTL) || sessionTTL < 60 || sessionTTL > 86400) throw new Error('SESSION_MAX_AGE must be between 60 and 86400 seconds')
export const sessionOptions = {
  password: process.env.SESSION_SECRET || (() => {
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
