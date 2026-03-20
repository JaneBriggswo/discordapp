import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const serverIP = 'localhost'
    const serverPort = '9999' // Porta do remoteweb.exe
    
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 1500)
    
    try {
      const response = await fetch(`http://${serverIP}:${serverPort}/api/status?t=${Date.now()}`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      })
      
      clearTimeout(timeout)
      
      if (response.ok) {
        try {
          const data = await response.json()
          return NextResponse.json({ 
            status: 'online',
            message: 'Exploit conectado',
            data
          }, { status: 200 })
        } catch {
          return NextResponse.json({ 
            status: 'online',
            message: 'Exploit conectado'
          }, { status: 200 })
        }
      } else {
        clearTimeout(timeout)
        return NextResponse.json({ 
          status: 'offline',
          message: 'Servidor não respondeu'
        }, { status: 503 })
      }
    } catch (error) {
      clearTimeout(timeout)
      return NextResponse.json({ 
        status: 'offline',
        message: 'Não foi possível conectar'
      }, { status: 503 })
    }
  } catch (error) {
    return NextResponse.json({ 
      status: 'offline',
      message: 'Erro ao verificar status'
    }, { status: 500 })
  }
}
