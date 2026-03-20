"use client"

import { motion } from "framer-motion"
import { AlertTriangle, Copy, Check } from "lucide-react"
import { useState } from "react"

interface IPAccessBlockerProps {
  userIP: string | null
  isApproved: boolean
  children: React.ReactNode
}

export function IPAccessBlocker({ userIP, isApproved, children }: IPAccessBlockerProps) {
  const [copied, setCopied] = useState(false)

  if (isApproved) {
    return <>{children}</>
  }

  const copyIP = () => {
    if (userIP) {
      navigator.clipboard.writeText(userIP)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-background">
      <motion.div
        className="max-w-md w-full mx-4 p-8 bg-card border border-border rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground text-center mb-2">
          Acesso Negado
        </h1>

        <p className="text-muted-foreground text-center mb-6">
          Seu IP não está autorizado para acessar este site.
        </p>

        {/* IP Info */}
        <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Seu IP
          </p>
          <div className="flex items-center justify-between">
            <p className="font-mono text-sm font-bold text-foreground">
              {userIP || "Carregando..."}
            </p>
            {userIP && (
              <button
                onClick={copyIP}
                className="p-2 hover:bg-primary/20 rounded-lg transition-colors text-primary"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Message */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-sm text-blue-500">
            Contate o administrador e compartilhe seu IP para obter acesso.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
