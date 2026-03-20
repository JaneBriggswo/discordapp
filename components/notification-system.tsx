"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface Notification {
  id: string
  type: 'success' | 'error' | 'info'
  title: string
  message: string
  duration?: number
}

interface NotificationSystemProps {
  notifications: Notification[]
  onRemove: (id: string) => void
}

export function NotificationSystem({ notifications, onRemove }: NotificationSystemProps) {
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration !== 0) {
        const timer = setTimeout(() => {
          onRemove(notification.id)
        }, notification.duration || 4000)
        
        return () => clearTimeout(timer)
      }
    })
  }, [notifications, onRemove])

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.95 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 30,
              duration: 0.3
            }}
            className="
              bg-black/90 backdrop-blur-md rounded-xl border border-white/10
              shadow-2xl shadow-black/40
              min-w-[280px] max-w-sm
            "
          >
            {/* Content */}
            <div className="p-4 flex items-center space-x-3">
              {/* Check icon */}
              <div className="flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center">
                  <svg 
                    className="w-3.5 h-3.5 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2.5} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                </div>
              </div>
              
              {/* Text content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white leading-tight">
                  {notification.title}
                </p>
              </div>
              
              {/* Close button */}
              <button
                onClick={() => onRemove(notification.id)}
                className="flex-shrink-0 p-1 rounded text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Hook para usar o sistema de notificações
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setNotifications(prev => [...prev, { ...notification, id }])
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return {
    notifications,
    addNotification,
    removeNotification
  }
}