import { NextRequest, NextResponse } from 'next/server'
import { betterFetch } from '@better-fetch/fetch'
import type { Session } from '@/lib/auth'

const protectedRoutes = ['/account', '/checkout', '/orders', '/volunteer/profile']
const authRoutes = ['/login', '/signup']

const ROLE_DASHBOARDS: Record<string, string> = {
  'super-admin': '/dashboard',
  web_admin: '/dashboard',
  volunteer_director: '/dashboard/volunteers',
  compilation_director: '/dashboard/compilation',
  booking_director: '/dashboard/booking',
  sponsorship_director: '/dashboard/sponsorship',
  social_director: '/dashboard/social',
  radio_director: '/dashboard/radio',
  listening_director: '/dashboard/listening',
  orders_director: '/dashboard/orders',
  support_director: '/dashboard/support',
}

const DIRECTOR_ROLES = Object.keys(ROLE_DASHBOARDS)

export async function proxy(req: NextRequest): Promise<NextResponse> {
  const path = req.nextUrl.pathname

  if (path.startsWith('/api') || path.startsWith('/_next') || path.startsWith('/favicon')) {
    return NextResponse.next()
  }

  const { data: session } = await betterFetch<Session>('/api/auth/get-session', {
    baseURL: req.nextUrl.origin,
    headers: {
      cookie: req.headers.get('cookie') ?? '',
    },
  })

  const isAuthenticated = !!session?.user

  // ─── Dashboard protection ────────────────────────────────────────
  if (path.startsWith('/dashboard') && !path.startsWith('/dashboard-login')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/dashboard-login', req.url)
      loginUrl.searchParams.set('redirect', path)
      return NextResponse.redirect(loginUrl)
    }

    const role = session?.user?.role as string | undefined

    if (!role || !DIRECTOR_ROLES.includes(role)) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    if (role === 'super-admin' || role === 'web_admin') {
      return NextResponse.next()
    }

    const home = ROLE_DASHBOARDS[role]
    if (home && !path.startsWith(home)) {
      return NextResponse.redirect(new URL(home, req.url))
    }

    return NextResponse.next()
  }

  // ─── Existing auth routes ────────────────────────────────────────
  if (authRoutes.some((route) => path.startsWith(route)) && isAuthenticated) {
    const role = session?.user?.role as string | undefined
    if (role === 'volunteer') {
      return NextResponse.redirect(new URL('/volunteer/profile', req.url))
    }
    return NextResponse.redirect(new URL('/account', req.url))
  }

  if (protectedRoutes.some((route) => path.startsWith(route)) && !isAuthenticated) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(loginUrl)
  }
  if (path.startsWith('/volunteer/profile') && isAuthenticated) {
    const role = session?.user?.role as string | undefined
    if (role !== 'volunteer' && role !== 'super-admin' && role !== 'web_admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
