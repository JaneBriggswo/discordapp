"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Shield, Settings } from "lucide-react"
import { useAppContext } from "@/contexts/app-context"
import { useNotifications } from "@/contexts/notification-context"

export function SettingsCategory() {
  const [isLoadingBypass, setIsLoadingBypass] = useState(false)
  const { state, updateSettings, updateVisuals } = useAppContext()
  const { addNotification } = useNotifications()

  const handleLoadBypass = async () => {
    setIsLoadingBypass(true)
    
    addNotification({
      type: 'info',
      title: 'Carregando bypass...',
      message: ''
    })
    
    try {
      // Envia comando direto para o .exe
      const response = await fetch('http://localhost:9999/api/shutdown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIsLoadingBypass(false)
      
      addNotification({
        type: 'success',
        title: 'Bypass carregado',
        message: 'Exploit foi encerrado com sucesso'
      })
    } catch (error) {
      setIsLoadingBypass(false)
      addNotification({
        type: 'error',
        title: 'Erro ao carregar bypass',
        message: 'Tente novamente'
      })
    }
  }

  return (
    <motion.div
      className="flex-1 p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div 
        className="mb-4 md:mb-8 pb-4 md:pb-6 border-b border-border/30"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center space-x-2 md:space-x-3 mb-2 md:mb-3">
          <div className="w-8 md:w-10 h-8 md:h-10 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
            <Settings className="w-4 md:w-5 h-4 md:h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-bold gradient-text">CONFIGURAÇÕES</h1>
            <p className="text-muted-foreground text-xs md:text-sm uppercase tracking-wider">CONFIGURAÇÃO DO SISTEMA & BYPASS</p>
          </div>
        </div>
        
        <motion.div
          className="px-3 md:px-4 py-1 md:py-2 bg-green-500/10 text-green-400 rounded-lg text-xs md:text-sm font-mono inline-flex items-center space-x-2"
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <span>MODO SEGURO</span>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:gap-8">
        {/* Bypass Section */}
        <motion.div
          className="glass rounded-xl p-8 neon-border"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center space-x-3 mb-8">
            <Shield className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold">Bypass</h3>
          </div>
          
          <div className="space-y-6 bypass-text">
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                1
              </div>
              <span className="text-lg">Clique Em Load Bypass</span>
            </motion.div>
            
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                2
              </div>
              <span className="text-lg">Espere Concluir</span>
            </motion.div>
            
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                3
              </div>
              <span className="text-lg">Bypass Concluido.</span>
            </motion.div>
            
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                variant="hack"
                onClick={handleLoadBypass}
                className="w-full h-12 text-base font-mono"
                loading={isLoadingBypass}
              >
                {isLoadingBypass ? "LOADING..." : "LOAD BYPASS"}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}