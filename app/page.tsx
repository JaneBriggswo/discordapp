"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { AimCategory } from "@/components/categories/aim-category"
import { VisualsCategory } from "@/components/categories/visuals-category"
import { SettingsCategory } from "@/components/categories/settings-category"
import { NotificationSystem } from "@/components/notification-system"
import { EmulatorMonitor } from "@/components/emulator-monitor"
import { ServerConfig } from "@/components/server-config"
import { IPAccessBlocker } from "@/components/ip-access-blocker"
import { useIPWhitelist } from "@/hooks/useIPWhitelist"
import { AppProvider } from "@/contexts/app-context"
import { NotificationProvider, useNotifications } from "@/contexts/notification-context"
import { AuthProvider, useAuth } from "@/contexts/auth-context"

function Dashboard() {
  const [activeCategory, setActiveCategory] = useState("aim")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const renderCategory = () => {
    switch (activeCategory) {
      case "aim":
        return <AimCategory />
      case "misc":
        return <VisualsCategory />
      case "settings":
        return <SettingsCategory />
      default:
        return <AimCategory />
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background overflow-hidden">
      {/* Matrix Rain Background Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {mounted && Array.from({ length: 20 }).map((_, i) => {
          const randomLeft = Math.random() * 100
          const randomDelay = Math.random() * 3
          const randomText = Math.random().toString(36).substring(2, 15)
          
          return (
            <motion.div
              key={i}
              className="absolute text-primary/10 text-xs font-mono"
              style={{
                left: `${randomLeft}%`,
                animationDelay: `${randomDelay}s`
              }}
              animate={{
                y: ["0vh", "100vh"],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
                delay: randomDelay
              }}
            >
              {randomText}
            </motion.div>
          )
        })}
      </div>

      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <div className="hidden md:block md:w-64">
        <Sidebar 
          activeCategory={activeCategory} 
          onCategoryChange={setActiveCategory} 
        />
      </div>

      {/* Main Content */}
      <motion.div
        className="flex-1 flex flex-col overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Content */}
        <main className="flex-1 overflow-auto">
          {renderCategory()}
        </main>
      </motion.div>

      {/* Mobile Navigation - Bottom tabs for mobile */}
      <div className="md:hidden border-t border-border bg-card p-2 flex gap-1">
        <button
          onClick={() => setActiveCategory('aim')}
          className={`flex-1 py-2 px-3 rounded text-xs font-semibold transition-all ${
            activeCategory === 'aim' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          MIRA
        </button>
        <button
          onClick={() => setActiveCategory('misc')}
          className={`flex-1 py-2 px-3 rounded text-xs font-semibold transition-all ${
            activeCategory === 'misc' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          MISC
        </button>
        <button
          onClick={() => setActiveCategory('settings')}
          className={`flex-1 py-2 px-3 rounded text-xs font-semibold transition-all ${
            activeCategory === 'settings' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          CONFIG
        </button>
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        {mounted && Array.from({ length: 10 }).map((_, i) => {
          const randomLeft = Math.random() * 100
          const randomTop = Math.random() * 100
          const randomDuration = 3 + Math.random() * 2
          const randomDelay = Math.random() * 2
          
          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full"
              style={{
                left: `${randomLeft}%`,
                top: `${randomTop}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: randomDuration,
                repeat: Infinity,
                delay: randomDelay
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

function AppContent() {
  const { notifications, removeNotification } = useNotifications()
  const { isApproved, userIP, loading } = useIPWhitelist()

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Verificando acesso...</div>
      </div>
    )
  }

  return (
    <IPAccessBlocker isApproved={isApproved ?? true} userIP={userIP}>
      <Dashboard />
      <NotificationSystem 
        notifications={notifications}
        onRemove={removeNotification}
      />
      <EmulatorMonitor />
      <ServerConfig />
    </IPAccessBlocker>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}