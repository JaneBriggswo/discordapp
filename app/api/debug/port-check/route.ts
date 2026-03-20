import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const portsToTry = [
    '9090',
    '8080',
    '8000', 
    '5000',
    '3001',
    '9000',
    '8888',
    '7000',
    '3000',
    '4000',
    '6000'
  ]
  
  const serverIP = 'localhost'
  const results = []
  
  // Testa cada porta com timeout curto
  for (const port of portsToTry) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 500)
      
      const startTime = Date.now()
      const response = await fetch(`http://${serverIP}:${port}/`, {
        method: 'GET',
        signal: controller.signal,
      }).catch(() => null)
      const responseTime = Date.now() - startTime
      
      clearTimeout(timeout)
      
      results.push({
        port,
        online: response?.ok || false,
        status: response?.status,
        responseTime,
        tried: true
      })
    } catch (error) {
      results.push({
        port,
        online: false,
        error: 'timeout',
        tried: true
      })
    }
  }
  
  const onlinePort = results.find(r => r.online)
  
  return NextResponse.json({
    onlinePort: onlinePort?.port || null,
    allResults: results,
    message: onlinePort 
      ? `Encontrado na porta: ${onlinePort.port}`
      : 'Nenhuma porta respondeu'
  })
}
