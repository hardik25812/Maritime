import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    // Check for Supabase auth session cookie (set by the login page)
    const cookies = request.cookies.getAll() ?? []
    const hasSession = cookies.some(
      (c) => c?.name?.startsWith('sb-') && c.name.endsWith('-auth-token')
    )

    if (!hasSession && pathname !== '/login') {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    if (hasSession && pathname === '/login') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  } catch {
    // Never let middleware 500 the site. Fail open to the requested page.
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/calls/:path*',
    '/leads/:path*',
    '/urgent/:path*',
    '/analytics/:path*',
    '/weekly/:path*',
    '/knowledge/:path*',
    '/settings/:path*',
  ],
}
