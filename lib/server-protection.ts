import { NextRequest, NextResponse } from 'next/server'
import { SecurityManager } from './crypto'

// Server-side protection for all API operations
export class ServerProtection {
  
  // Validate that request comes from authenticated user
  static validateRequest(request: NextRequest): { valid: boolean; userId?: string; error?: string } {
    try {
      // Check session token
      const sessionToken = request.cookies.get('pink_remote_session')?.value
      
      if (!sessionToken) {
        return { valid: false, error: 'No session token' }
      }
      
      // Validate session
      const validation = SecurityManager.validateSessionToken(sessionToken)
      
      if (!validation.valid) {
        return { valid: false, error: 'Invalid session' }
      }
      
      // Check CSRF token for state-changing operations
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
        const csrfToken = request.headers.get('x-csrf-token')
        
        if (!csrfToken) {
          return { valid: false, error: 'Missing CSRF token' }
        }
        
        const csrfValidation = SecurityManager.validateCSRFToken(csrfToken, validation.sessionId || validation.discordId || '')
        
        if (!csrfValidation) {
          return { valid: false, error: 'Invalid CSRF token' }
        }
      }
      
      // Additional security checks
      const userAgent = request.headers.get('user-agent') || ''
      const origin = request.headers.get('origin') || ''
      
      // Block suspicious user agents
      const suspiciousAgents = ['curl', 'wget', 'postman', 'insomnia', 'python', 'node']
      if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
        return { valid: false, error: 'Suspicious user agent' }
      }
      
      // Validate origin in production
      if (process.env.NODE_ENV === 'production' && origin) {
        const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL, 'https://localhost:3000', 'https://discordapps.up.railway.app']
        if (!allowedOrigins.includes(origin)) {
          return { valid: false, error: 'Invalid origin' }
        }
      }
      
      return { valid: true, userId: validation.discordId }
      
    } catch (error) {
      return { valid: false, error: 'Validation error' }
    }
  }
  
  // Create protected API response
  static createProtectedResponse(data: any, status: number = 200): NextResponse {
    const response = NextResponse.json(data, { status })
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  }
  
  // Create error response
  static createErrorResponse(error: string, status: number = 403): NextResponse {
    return this.createProtectedResponse({ error }, status)
  }
  
  // Wrapper for protected API handlers
  static withProtection(handler: (request: NextRequest, validation: { userId: string }) => Promise<NextResponse>) {
    return async (request: NextRequest) => {
      try {
        // Validate request
        const validation = this.validateRequest(request)
        
        if (!validation.valid) {
          return this.createErrorResponse(validation.error || 'Unauthorized', 401)
        }
        
        // Call the actual handler
        return await handler(request, { userId: validation.userId! })
        
      } catch (error) {
        console.error('Protected API error:', error)
        return this.createErrorResponse('Internal server error', 500)
      }
    }
  }
  
  // Log suspicious activity
  static logSuspiciousActivity(request: NextRequest, reason: string) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const timestamp = new Date().toISOString()
    
    console.warn(`[SECURITY] Suspicious activity detected:`, {
      timestamp,
      ip,
      userAgent,
      reason,
      url: request.url,
      method: request.method
    })
    
    // In production, you might want to send this to a security monitoring service
  }
}

// Decorator for protected API routes
export function protectedAPI(handler: (request: NextRequest, validation: { userId: string }) => Promise<NextResponse>) {
  return ServerProtection.withProtection(handler)
}

// Middleware for additional runtime protection
export function runtimeProtection() {
  if (typeof window !== 'undefined') {
    // Block any attempts to access sensitive data
    Object.defineProperty(window, 'localStorage', {
      get: () => {
        throw new Error('Access denied')
      }
    })
    
    Object.defineProperty(window, 'sessionStorage', {
      get: () => {
        throw new Error('Access denied')
      }
    })
    
    // Override fetch to add authentication
    const originalFetch = window.fetch
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      // Add CSRF token to requests
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('pink_remote_csrf='))
        ?.split('=')[1]
      
      if (csrfToken && init) {
        init.headers = {
          ...init.headers,
          'x-csrf-token': csrfToken
        }
      }
      
      return originalFetch(input, init)
    }
  }
}