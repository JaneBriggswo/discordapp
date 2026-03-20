import { useCallback } from 'react'

export function useAuthProtection() {
  const protectedAction = useCallback(async (action: () => Promise<void>) => {
    return action()
  }, [])

  return { protectedAction }
}