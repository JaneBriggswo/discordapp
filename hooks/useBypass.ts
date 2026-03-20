import { useState, useCallback, useEffect } from 'react'
import { useNotifications } from '@/contexts/notification-context'

interface BypassResponse {
  success: boolean
  data?: any
  error?: string
}

export function useBypass() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serverUrl, setServerUrl] = useState('http://localhost:9999')
  const { addNotification } = useNotifications()

  // Auto-detect server URL on mount and check regularly
  useEffect(() => {
    const detectServer = async () => {
      // Try localhost first
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 second timeout
        
        const response = await fetch('http://localhost:9999/api/status', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        
        if (response.ok) {
          console.log('[Bypass] ✅ Connected to localhost:9999')
          setServerUrl('http://localhost:9999')
          setIsConnected(true)
          return true
        }
      } catch (e) {
        console.log('[Bypass] ❌ localhost:9999 not available:', (e as any).message)
        // localhost not available, will try to auto-discover
      }

      // If not local, try to auto-discover from environment
      const envUrl = typeof window !== 'undefined' 
        ? process.env.NEXT_PUBLIC_BYPASS_SERVER_URL
        : undefined
      
      if (envUrl && envUrl !== 'http://localhost:9999') {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 2000)
          
          const response = await fetch(`${envUrl}/api/status`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal
          })
          clearTimeout(timeoutId)
          
          if (response.ok) {
            console.log('[Bypass] ✅ Connected to', envUrl)
            setServerUrl(envUrl)
            setIsConnected(true)
            return true
          }
        } catch (e) {
          console.log('[Bypass] ❌ env URL not available:', (e as any).message)
        }
      }

      // No server found - will show error when user tries to use feature
      console.log('[Bypass] ⚠️ No server detected, staying offline')
      setServerUrl('http://localhost:9999')
      setIsConnected(false)
      return false
    }

    detectServer()
    
    // Check connection every 3 seconds
    const interval = setInterval(detectServer, 3000)
    return () => clearInterval(interval)
  }, [])

  const bypassServerUrl = serverUrl

  /**
   * Checa se Pink Bypass.exe está rodando
   */
  const checkConnection = useCallback(async () => {
    try {
      setIsLoading(true)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)
      
      const response = await fetch(`${bypassServerUrl}/api/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      
      if (response.ok) {
        console.log('[Bypass] ✅ Connection check passed')
        setIsConnected(true)
        return true
      }
    } catch (error) {
      console.error('[Bypass] ❌ Connection check failed:', error)
      setIsConnected(false)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [bypassServerUrl])

  /**
   * Envia comando para ativar função (RAGE AIM, ESP, etc)
   */
  const activateFeature = useCallback(async (featureName: string, config?: any) => {
    try {
      setIsLoading(true)
      
      if (!isConnected) {
        throw new Error('Servidor OFFLINE! Abra o LoaderBaseDX11.exe no seu PC')
      }

      const response = await fetch(`${bypassServerUrl}/api/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: featureName,
          config
        })
      })

      const data: BypassResponse = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Falha ao ativar função')
      }

      addNotification({
        type: 'success',
        title: `${featureName} ativado`,
        message: ''
      })

      return data
    } catch (error) {
      const message = String(error)
      addNotification({
        type: 'error',
        title: 'Erro ao ativar',
        message: message
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, bypassServerUrl, addNotification])

  /**
   * Desativa uma função
   */
  const deactivateFeature = useCallback(async (featureName: string) => {
    try {
      setIsLoading(true)
      
      if (!isConnected) {
        throw new Error('Servidor OFFLINE! Abra o LoaderBaseDX11.exe no seu PC')
      }

      const response = await fetch(`${bypassServerUrl}/api/deactivate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: featureName
        })
      })

      const data: BypassResponse = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Falha ao desativar função')
      }

      addNotification({
        type: 'info',
        title: `${featureName} desativado`,
        message: ''
      })

      return data
    } catch (error) {
      const message = String(error)
      addNotification({
        type: 'error',
        title: 'Erro ao desativar',
        message: message
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, bypassServerUrl, addNotification])

  /**
   * Atualiza configuração de uma função
   */
  const updateConfig = useCallback(async (featureName: string, config: any) => {
    try {
      setIsLoading(true)
      
      if (!isConnected) {
        throw new Error('Servidor OFFLINE! Abra o LoaderBaseDX11.exe no seu PC')
      }

      const response = await fetch(`${bypassServerUrl}/api/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: featureName,
          config
        })
      })

      const data: BypassResponse = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Falha ao atualizar configuração')
      }

      return data
    } catch (error) {
      const message = String(error)
      addNotification({
        type: 'error',
        title: 'Erro ao configurar',
        message: message
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, bypassServerUrl, addNotification])

  /**
   * Obtém status de uma função
   */
  const getFeatureStatus = useCallback(async (featureName: string) => {
    try {
      setIsLoading(true)
      
      if (!isConnected) {
        throw new Error('Servidor OFFLINE! Abra o LoaderBaseDX11.exe no seu PC')
      }

      const response = await fetch(`${bypassServerUrl}/api/features/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      const data: BypassResponse = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Falha ao obter status')
      }

      return data.data
    } catch (error) {
      console.error('Error getting feature status:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [isConnected, bypassServerUrl])

  return {
    isConnected,
    isLoading,
    checkConnection,
    activateFeature,
    deactivateFeature,
    updateConfig,
    getFeatureStatus
  }
}
