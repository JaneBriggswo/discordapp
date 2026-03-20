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
      
      // URLs para tentar: localhost (PC) e IP local (Celular)
      const urls = [
        'http://localhost:9999/api/status',
        `http://${process.env.NEXT_PUBLIC_LOCAL_PC_IP || '192.168.3.39'}:9999/api/status`
      ]

      for (const url of urls) {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 2000)
          
          const response = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json'
            }
          })
          
          clearTimeout(timeoutId)
          
          if (response.status === 200) {
            console.log(`[ExeStatus] ✅ Servidor encontrado em: ${url}`)
            isOnline = true
            break
          }
        } catch (err) {
          console.log(`[ExeStatus] ⚠️ Falhou em ${url}`)
          continue
        }
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
          console.log('[ExeStatus] 🟢 Status ONLINE')
        } else {
          console.log('[ExeStatus] 🔴 Status OFFLINE')
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
