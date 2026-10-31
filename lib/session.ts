import { IronSession, getIronSession } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  userId?: string
  name?: string
  email?: string
  role?: string
  accountStatus?: string
  isLoggedIn?: boolean
}

export const sessionOptions = {
  password: process.env.SESSION_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SESSION_SECRET environment variable must be set in production')
    }
    return 'default-secret-change-in-production'
  })(),
  cookieName: 'sdms-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '28800000'), // 8 hours default
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
  
  if (session.accountStatus !== 'ACTIVE') {
    throw new Error('Account not active')
  }
  
  return session
}
