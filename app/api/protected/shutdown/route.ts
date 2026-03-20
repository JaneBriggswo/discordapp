import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const serverIP = 'localhost'
    const serverPort = '9999'
    
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2000)
    
    try {
      // Tenta enviar comando de shutdown para o .exe
      const response = await fetch(`http://${serverIP}:${serverPort}/api/shutdown`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'shutdown' })
      })
      
      clearTimeout(timeout)
      
      return NextResponse.json({ 
        success: true,
        message: 'Comando de shutdown enviado'
      }, { status: 200 })
    } catch (error) {
      clearTimeout(timeout)
      return NextResponse.json({ 
        success: true,
        message: 'Bypass carregado com sucesso'
      }, { status: 200 })
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false,
      message: 'Erro ao enviar comando'
    }, { status: 500 })
  }
}
