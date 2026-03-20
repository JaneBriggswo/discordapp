import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { discordId } = body
    
    // LOGIN DIRETO - SEM VALIDAÇÕES
    const response = NextResponse.json({
      success: true,
      user: { id: discordId }
    })
    
    // Cookie simples
    response.cookies.set('session', discordId, {
      maxAge: 86400,
      path: '/'
    })
    
    return response
    
  } catch (error) {
    return NextResponse.json({ success: true, user: { id: 'default' } })
  }
}