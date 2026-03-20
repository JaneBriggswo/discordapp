"use client"

import { useEffect } from "react"
import { useNotifications } from "@/contexts/notification-context"

export function EmulatorMonitor() {
  const { addNotification } = useNotifications()

  useEffect(() => {
    const handleEmulatorClosed = (event: any) => {
      addNotification({
        type: 'warning',
        title: '⚠️ HD-Player Fechado',
        message: 'Todas as configurações foram resetadas para o estado inicial'
      })
    }

    window.addEventListener('emulator-closed', handleEmulatorClosed)
    return () => window.removeEventListener('emulator-closed', handleEmulatorClosed)
  }, [addNotification])

  return null
}
