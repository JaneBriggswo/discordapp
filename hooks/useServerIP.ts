import { useState, useEffect } from 'react'

export function useServerIP() {
  const [serverIP, setServerIP] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getServerIP = async () => {
      try {
        setLoading(true)
        setError(null)

        // First try to get from localStorage
        const cachedIP = localStorage.getItem('bypass_server_ip')
        if (cachedIP) {
          // Verify it still works
          try {
            const response = await fetch(`http://${cachedIP}:9999/api/status`, {
              method: 'GET',
              signal: AbortSignal.timeout(2000)
            })
            
            if (response.ok) {
              setServerIP(cachedIP)
              setLoading(false)
              return
            }
          } catch {
            // Cached IP doesn't work, continue to discover new one
            localStorage.removeItem('bypass_server_ip')
          }
        }

        // Try to get IP from localhost first (PC access)
        try {
          const response = await fetch('http://127.0.0.1:9999/api/server-ip', {
            method: 'GET',
            signal: AbortSignal.timeout(2000)
          })

          if (response.ok) {
            const data = await response.json()
            const ip = data.ip || '127.0.0.1'
            localStorage.setItem('bypass_server_ip', ip)
            setServerIP(ip)
            setLoading(false)
            return
          }
        } catch {
          // localhost didn't work
        }

        // Try common local IP patterns
        const ipPatterns = [
          '192.168.1.1', '192.168.0.1',
          '192.168.1.100', '192.168.0.100',
          '192.168.1.101', '192.168.0.101',
          '10.0.0.1', '10.0.0.100',
          '172.16.0.1', '172.16.0.100'
        ]

        for (const ip of ipPatterns) {
          try {
            const response = await fetch(`http://${ip}:9999/api/status`, {
              method: 'GET',
              signal: AbortSignal.timeout(1000)
            })

            if (response.ok) {
              localStorage.setItem('bypass_server_ip', ip)
              setServerIP(ip)
              setLoading(false)
              return
            }
          } catch {
            // Try next IP
          }
        }

        // Default to localhost if nothing else works
        localStorage.setItem('bypass_server_ip', '127.0.0.1')
        setServerIP('127.0.0.1')
        setError('Servidor encontrado em 127.0.0.1. Para celular, configure manualmente.')

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Erro ao descobrir servidor'
        setError(errorMsg)
        setServerIP('127.0.0.1')
        localStorage.setItem('bypass_server_ip', '127.0.0.1')
      } finally {
        setLoading(false)
      }
    }

    getServerIP()
  }, [])

  return { serverIP: serverIP || '127.0.0.1', loading, error }
}
