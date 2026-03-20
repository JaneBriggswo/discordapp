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

  // Auto-detect server URL on mount
  useEffect(() => {
    const detectServer = async () => {
      // Try localhost first
      try {
        const response = await fetch('http://localhost:9999/api/status', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        if (response.ok) {
          setServerUrl('http://localhost:9999')
          return
        }
      } catch (e) {
        // localhost not available, will try to auto-discover
      }

      // If not local, try to auto-discover from environment
      const envUrl = typeof window !== 'undefined' 
        ? process.env.NEXT_PUBLIC_BYPASS_SERVER_URL
        : undefined
      
      if (envUrl && envUrl !== 'http://localhost:9999') {
        try {
          const response = await fetch(`${envUrl}/api/status`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          })
          if (response.ok) {
            setServerUrl(envUrl)
            return
          }
        } catch (e) {
          // env URL not available
        }
      }

      // No server found - will show error when user tries to use feature
      setServerUrl('http://localhost:9999')
    }

    detectServer()
  }, [])

  const bypassServerUrl = serverUrl

  /**
   * Checa se Pink Bypass.exe está rodando
   */
  const checkConnection = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${bypassServerUrl}/api/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        setIsConnected(true)
        return true
      }
    } catch (error) {
      console.error('Bypass connection error:', error)
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
        const connected = await checkConnection()
        if (!connected) {
          throw new Error('Pink Bypass não está conectado. Abra o .exe primeiro.')
        }
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
  }, [isConnected, checkConnection, addNotification])

  /**
   * Desativa uma função
   */
  const deactivateFeature = useCallback(async (featureName: string) => {
    try {
      setIsLoading(true)

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
  }, [addNotification])

  /**
   * Atualiza configuração de uma função
   */
  const updateConfig = useCallback(async (featureName: string, config: any) => {
    try {
      setIsLoading(true)

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
  }, [addNotification])

  /**
   * Obtém status de uma função
   */
  const getFeatureStatus = useCallback(async (featureName: string) => {
    try {
      setIsLoading(true)

      const response = await fetch(`/api/bypass?action=featurestatus&name=${featureName}`)
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
  }, [])

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
