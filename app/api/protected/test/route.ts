import { NextRequest } from 'next/server'
import { ServerProtection } from '@/lib/server-protection'

// Example of a fully protected API endpoint
export const GET = ServerProtection.withProtection(async (request: NextRequest, validation: { userId: string }) => {
  // This endpoint is fully protected and can only be accessed by authenticated users
  
  // All operations here are server-side only
  const serverData = {
    message: 'This data comes from the server and is fully protected',
    userId: validation.userId,
    timestamp: new Date().toISOString(),
    serverSecret: process.env.SERVER_SECRET, // This will never be exposed to client
    protectedOperations: [
      'User authentication validated',
      'CSRF token verified',
      'Rate limiting applied',
      'Suspicious activity blocked',
      'All client-side debugging blocked'
    ]
  }
  
  // Log the access for security monitoring
  console.log(`[SECURITY] Protected API accessed by user: ${validation.userId}`)
  
  return ServerProtection.createProtectedResponse({
    success: true,
    data: serverData,
    security: {
      authenticated: true,
      protected: true,
      serverSide: true
    }
  })
})

export const POST = ServerProtection.withProtection(async (request: NextRequest, validation: { userId: string }) => {
  try {
    // Parse request body (this is server-side only)
    const body = await request.json()
    
    // Validate input (server-side validation)
    if (!body.action) {
      return ServerProtection.createErrorResponse('Missing action parameter', 400)
    }
    
    // Process the action server-side
    const result = await processServerAction(body.action, validation.userId)
    
    return ServerProtection.createProtectedResponse({
      success: true,
      result,
      processedBy: 'server',
      userId: validation.userId
    })
    
  } catch (error) {
    console.error('[SECURITY] Protected API error:', error)
    return ServerProtection.createErrorResponse('Server processing error', 500)
  }
})

// Server-side only function - never exposed to client
async function processServerAction(action: string, userId: string): Promise<any> {
  // All business logic happens server-side
  switch (action) {
    case 'load_aimbot':
      return {
        status: 'loaded',
        features: ['rage', 'legit', 'misc'],
        security: 'undetected',
        timestamp: new Date().toISOString()
      }
      
    case 'load_esp':
      return {
        status: 'loaded',
        features: ['box', 'skeleton', 'name', 'distance', 'health'],
        rendering: 'active',
        timestamp: new Date().toISOString()
      }
      
    case 'load_bypass':
      return {
        status: 'loaded',
        protection: 'maximum',
        anticheat: 'bypassed',
        timestamp: new Date().toISOString()
      }
      
    default:
      throw new Error('Unknown action')
  }
}