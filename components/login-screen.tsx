"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Shield, Lock } from "lucide-react"
import { useNotifications } from "@/contexts/notification-context"

interface LoginScreenProps {
  onLogin: (discordId: string) => Promise<{ success: boolean; error?: string }>
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [discordId, setDiscordId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { addNotification } = useNotifications()

  const VALID_DISCORD_ID = "1247285760558633145" // Removed since validation is now server-side

  const handleLogin = async () => {
    if (!discordId.trim()) {
      addNotification({
        type: 'error',
        title: 'Digite seu Discord ID',
        message: ''
      })
      return
    }

    setIsLoading(true)
    const result = await onLogin(discordId.trim())
    setIsLoading(false)
    
    if (!result.success) {
      addNotification({
        type: 'error',
        title: result.error || 'Erro no login',
        message: ''
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Matrix Rain Background Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-primary/10 text-xs font-mono"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
            animate={{
              y: ["0vh", "100vh"],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 3
            }}
          >
            {Math.random().toString(36).substring(2, 15)}
          </motion.div>
        ))}
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Login Card */}
      <motion.div
        className="relative z-10 w-full max-w-md mx-4"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
      >
        <div className="glass rounded-2xl p-4 md:p-8 neon-border backdrop-blur-xl">
          {/* Header */}
          <motion.div
            className="text-center mb-6 md:mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1 className="text-2xl md:text-4xl font-bold gradient-text mb-2">Remote</h1>
            <p className="text-muted-foreground text-xs md:text-sm uppercase tracking-wider">
              Sistema de Autenticação
            </p>
          </motion.div>

          {/* Login Form */}
          <motion.div
            className="space-y-4 md:space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div>
              <label className="block text-xs md:text-sm font-semibold text-foreground mb-2 md:mb-3 uppercase tracking-wider">
                Discord ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={discordId}
                  onChange={(e) => setDiscordId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Entre com seu Discord ID"
                  disabled={isLoading}
                  className="
                    w-full px-4 py-4 bg-muted/50 border border-border rounded-xl
                    text-foreground placeholder-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                    transition-all duration-200 font-mono text-center
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <Button
              onClick={handleLogin}
              disabled={isLoading}
              loading={isLoading}
              className="w-full h-12 md:h-14 text-sm md:text-base font-semibold rounded-xl"
              variant="hack"
            >
              {isLoading ? "AUTENTICANDO..." : "ENTRAR"}
            </Button>
          </motion.div>

          {/* Security Badge */}
          <motion.div
            className="mt-6 md:mt-8 flex items-center justify-center space-x-2 text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Shield className="w-3 md:w-4 h-3 md:h-4" />
            <span className="uppercase tracking-wider font-semibold text-xs">
              Conexão Segura
            </span>
          </motion.div>

          {/* Status Indicator */}
          <motion.div
            className="mt-3 md:mt-4 flex items-center justify-center space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <motion.div
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs text-green-400 font-semibold uppercase tracking-wider">
              Sistema Online
            </span>
          </motion.div>
        </div>

        {/* Glow Effect */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur-xl" />
      </motion.div>

      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 -z-20" />
    </div>
  )
}