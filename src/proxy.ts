import { NextRequest, NextResponse } from 'next/server'
import { betterFetch } from '@better-fetch/fetch'
import type { Session } from '@/lib/auth'

const protectedRoutes = ['/account', '/checkout', '/orders']
const authRoutes = ['/login', '/signup']

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

  if (authRoutes.some((route) => path.startsWith(route)) && isAuthenticated) {
    return NextResponse.redirect(new URL('/account', req.url))
  }

  if (protectedRoutes.some((route) => path.startsWith(route)) && !isAuthenticated) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
