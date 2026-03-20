"use client"

import { motion } from "framer-motion"
import { AlertTriangle } from "lucide-react"

interface IPAccessBlockerProps {
  userIP: string | null
  isApproved: boolean
  children: React.ReactNode
}

export function IPAccessBlocker({ userIP, isApproved, children }: IPAccessBlockerProps) {
  if (isApproved) {
    return <>{children}</>
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
        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Seu IP
          </p>
          <p className="font-mono text-lg font-bold text-destructive text-center">
            {userIP || "Carregando..."}
          </p>
        </div>
      </motion.div>
    </div>
  )
}
