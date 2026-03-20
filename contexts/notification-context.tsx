"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface Notification {
  id: string
  type: 'success' | 'error' | 'info'
  title: string
  message: string
  duration?: number
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    console.log('Adding notification:', { ...notification, id }) // Debug
    setNotifications(prev => [...prev, { ...notification, id }])
  }

  const removeNotification = (id: string) => {
    console.log('Removing notification:', id) // Debug
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}