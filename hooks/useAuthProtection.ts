import { useCallback } from 'react'

export function useAuthProtection() {
  // Empty implementation - auth protection disabled

  const protectedAction = useCallback(async (action: () => Promise<void>) => {
    // Just execute the action without any auth checks
    return action()
  }, [])

  return { protectedAction }
      } catch (error) {
        console.error('Session validation error:', error)
        await safeLogout()
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [isAuthenticated, validateSession, safeLogout, addNotification])

  // Block function execution if not authenticated
  const protectedAction = (action: () => void) => {
    if (!isAuthenticated) {
      addNotification({
        type: 'error',
        title: 'Ação bloqueada - Login necessário',
        message: ''
      })
      return
    }
    action()
  }

  return { protectedAction, isAuthenticated }
}