import { NextRequest, NextResponse } from 'next/server'
import { SecurityManager } from './lib/crypto'

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/api/dashboard', '/api/protected']
const authRoutes = ['/api/auth']
const publicRoutes = ['/', '/login', '/_next', '/favicon.ico']

// Rate limiting storage (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxRequests = 200 // Increased limit to be less aggressive
  
  const record = rateLimitMap.get(ip)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return false
  }
  
  if (record.count >= maxRequests) {
    return true
  }
  
  record.count++
  return false
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  
  // Rate limiting (less aggressive)
  if (isRateLimited(ip)) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }
  
  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    const response = NextResponse.next()
    
    // Add basic security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('Referrer-Policy', 'no-referrer')
    
    return response
  }
  
  // Allow auth routes
  if (authRoutes.some(route => pathname.startsWith(route))) {
    const response = NextResponse.next()
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('Referrer-Policy', 'no-referrer')
    
    return response
  }
  
  // Check if route needs protection
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route)) || 
                          pathname.startsWith('/api/') // Protect all API routes by default
  
  if (isProtectedRoute) {
    const sessionToken = request.cookies.get('pink_remote_session')?.value
    
    if (!sessionToken) {
      // No session token, return 401 for API routes, redirect for pages
      if (pathname.startsWith('/api/')) {
        return new NextResponse('Unauthorized', { status: 401 })
      }
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // Validate session token
    const validation = SecurityManager.validateSessionToken(sessionToken)
    
    if (!validation.valid) {
      // Invalid session, clear cookies and return error/redirect
      const response = pathname.startsWith('/api/') 
        ? new NextResponse('Unauthorized', { status: 401 })
        : NextResponse.redirect(new URL('/', request.url))
      
      response.cookies.set('pink_remote_session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/'
      })
      
      response.cookies.set('pink_remote_csrf', '', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/'
      })
      
      return response
    }
    
    // Session is valid, add security headers
    const response = NextResponse.next()
    
    // Basic security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('Referrer-Policy', 'no-referrer')
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    }
    
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}