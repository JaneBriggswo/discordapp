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
      
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 1500)
        
        // Chama direto a API do .exe na porta 9999
        const response = await fetch(`http://localhost:9999/api/status?t=${Date.now()}`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        })
        
        clearTimeout(timeoutId)
        
        if (isMountedRef.current) {
          const isOnline = response.ok && response.status === 200
          console.log('[ExeStatus] Check result:', isOnline ? '✅ ONLINE' : '❌ OFFLINE', 'Status:', response.status)
          setStatus({
            isOnline,
            isLoading: false,
            lastCheck: new Date()
          })
        }
      } catch (error) {
        console.log('[ExeStatus] Connection error:', (error as any).message, '- Staying OFFLINE')
        if (isMountedRef.current) {
          setStatus(prev => ({
            isOnline: false,
            isLoading: false,
            lastCheck: new Date()
          }))
        }
      }
    }

    // Check status imediatamente
    checkExeStatus()

    // Check a cada 2 segundos
    intervalRef.current = setInterval(() => {
      checkExeStatus()
    }, 2000)

    return () => {
      isMountedRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return status
}
