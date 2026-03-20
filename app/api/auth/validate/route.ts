import { NextRequest, NextResponse } from 'next/server'
import { SecurityManager } from '@/lib/crypto'

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('pink_remote_session')?.value
    const csrfToken = request.cookies.get('pink_remote_csrf')?.value
    
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request format',
          code: 'INVALID_REQUEST'
        },
        { status: 400 }
      )
    }

    const { fingerprint, csrf } = body
    
    // Check if session exists
    if (!sessionToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No session found',
          code: 'NO_SESSION'
        },
        { status: 401 }
      )
    }
    
    // Validate CSRF token
    if (!csrfToken || !SecurityManager.validateCSRFToken(csrf, csrfToken)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid CSRF token',
          code: 'CSRF_MISMATCH'
        },
        { status: 403 }
      )
    }
    
    // Validate session token
    const validation = SecurityManager.validateSessionToken(sessionToken)
    
    if (!validation.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid or expired session',
          code: 'INVALID_SESSION'
        },
        { status: 401 }
      )
    }
    
    // Additional fingerprint check
    if (fingerprint && typeof window !== 'undefined') {
      const currentFingerprint = SecurityManager.generateFingerprint()
      if (fingerprint !== currentFingerprint) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Device fingerprint mismatch',
            code: 'FINGERPRINT_MISMATCH'
          },
          { status: 401 }
        )
      }
    }
    
    // Session is valid
    return NextResponse.json({
      success: true,
      user: {
        id: validation.discordId,
        authenticated: true,
        sessionId: validation.sessionId
      }
    })
    
  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}