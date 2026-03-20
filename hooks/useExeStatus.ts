"use client"

import { useState, useEffect, useRef } from 'react'

interface ExeStatus {
  isOnline: boolean
  isLoading: boolean
  lastCheck: Date | null
}

export function useExeStatus() {
  const [status, setStatus] = useState<ExeStatus>({
    isOnline: false,
    isLoading: true,
    lastCheck: null
  })
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true

    const checkExeStatus = async () => {
      if (!isMountedRef.current) return
      
      let isOnline = false
      let error = null

      try {
        console.log('[ExeStatus] 📤 Enviando request para localhost:9999...')
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 segundo timeout
        
        const response = await fetch(`http://localhost:9999/api/status?t=${Date.now()}`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        })
        
        clearTimeout(timeoutId)
        
        console.log('[ExeStatus] 📬 Resposta recebida:', response.status, response.statusText)
        
        // ONLINE = resposta 200
        if (response.status === 200 && response.ok) {
          try {
            const data = await response.json()
            console.log('[ExeStatus] ✅ ONLINE - Data:', data)
            isOnline = true
          } catch (e) {
            // Mesmo que JSON falhe, status 200 = online
            console.log('[ExeStatus] ✅ ONLINE - Mas JSON inválido (ok, status 200)')
            isOnline = true
          }
        } else {
          console.log('[ExeStatus] ❌ OFFLINE - Status não é 200:', response.status)
          isOnline = false
        }
      } catch (err) {
        error = (err as any).message
        console.log('[ExeStatus] ❌ OFFLINE - Erro na requisição:', error)
        isOnline = false
      }

      // Update status se ainda está mounted
      if (isMountedRef.current) {
        setStatus({
          isOnline,
          isLoading: false,
          lastCheck: new Date()
        })
        
        // Log visual no console
        if (isOnline) {
          console.log('[ExeStatus] 🟢 Status: ONLINE')
        } else {
          console.log('[ExeStatus] 🔴 Status: OFFLINE')
        }
      }
    }

    // Check status imediatamente
    checkExeStatus()

    // Check a cada 5 segundos
    intervalRef.current = setInterval(() => {
      checkExeStatus()
    }, 5000)

    return () => {
      isMountedRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return status
}
