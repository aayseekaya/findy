import { NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'
import { Role } from '@prisma/client'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Giriş yapılmamışsa ve korumalı rotaya erişmeye çalışıyorsa
    if (!token && (path.startsWith("/business") || path.startsWith("/admin"))) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // Admin sayfalarına erişim kontrolü
    if (path.startsWith("/admin") && token?.role !== Role.ADMIN) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // İşletme sayfalarına erişim kontrolü
    if (path.startsWith("/business") && token?.role !== Role.BUSINESS) {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: [
    '/business/:path*',
    '/admin/:path*',
    '/api/business/:path*'
  ]
} 