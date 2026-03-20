import { NextRequest, NextResponse } from 'next/server'

/**
 * API Proxy para comunicar com Pink Bypass.exe
 * Pink Bypass.exe deve estar rodando e exponha um servidor na porta 9999
 */

const BYPASS_SERVER_URL = 'http://localhost:9999'
const REQUEST_TIMEOUT = 5000

async function proxyRequest(path: string, method: string, body?: any) {
  try {
    const url = `${BYPASS_SERVER_URL}${path}`
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Client': 'pink-remote'
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT)
    })

    if (!response.ok) {
      throw new Error(`Bypass responded with ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Proxy error calling ${path}:`, error)
    throw error
  }
}

/**
 * GET /api/bypass/status
 * Obtém o status atual do Bypass
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')

    if (!action) {
      return NextResponse.json(
        { error: 'Action parameter required' },
        { status: 400 }
      )
    }

    const data = await proxyRequest(`/api/${action}`, 'GET')
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to communicate with Pink Bypass', details: String(error) },
      { status: 503 }
    )
  }
}

/**
 * POST /api/bypass
 * Envia comandos para o Bypass
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, params } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action parameter required' },
        { status: 400 }
      )
    }

    const data = await proxyRequest(`/api/${action}`, 'POST', params)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to communicate with Pink Bypass', details: String(error) },
      { status: 503 }
    )
  }
}

/**
 * PUT /api/bypass
 * Atualiza configurações no Bypass
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, params } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action parameter required' },
        { status: 400 }
      )
    }

    const data = await proxyRequest(`/api/${action}`, 'PUT', params)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to communicate with Pink Bypass', details: String(error) },
      { status: 503 }
    )
  }
}
