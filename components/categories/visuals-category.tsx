"use client"

import { motion } from "framer-motion"
import { Checkbox } from "@/components/ui/checkbox"
import { Crosshair } from "lucide-react"
import { useAppContext } from "@/contexts/app-context"
import { useNotifications } from "@/contexts/notification-context"
import { useServerIP } from "@/hooks/useServerIP"

export function VisualsCategory() {
  const { state, updateVisuals } = useAppContext()
  const { addNotification } = useNotifications()
  const { serverIP } = useServerIP()

  const handleAntenasChange = async (key: 'antenaM' | 'antenaF', value: boolean) => {
    updateVisuals('chams', key, value)
      
    // Mapa de features para o backend
    const featureMap: { [key: string]: string } = {
      'antenaM': 'antena_m',
      'antenaF': 'antena_f'
    }

    const featureName = featureMap[key as string]
    
    // Se é uma feature HTTP, enviar requisição
    if (featureName) {
      try {
        const response = await fetch(`http://${serverIP}:9999/api/toggle`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            feature: featureName,
            enabled: value
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.success) {
          const labelMap: { [key: string]: string } = {
            'antenaM': 'Antena Masculina',
            'antenaF': 'Antena Feminina'
          }
          
          const label = labelMap[key as string] || key
          
          if (value) {
            addNotification({
              type: 'success',
              title: `${label} ativado`,
              message: 'Ativado com sucesso'
            })
          } else {
            addNotification({
              type: 'info',
              title: `${label} desativado`,
              message: ''
            })
          }
        } else {
          throw new Error(data.error || 'Erro ao atualizar feature')
        }
      } catch (error) {
        // Se houver erro, reverter o estado
        updateVisuals('chams', key, !value)
        addNotification({
          type: 'error',
          title: `Erro ao atualizar`,
          message: error instanceof Error ? error.message : 'Erro desconhecido'
        })
      }
    }
  }

  return (
    <motion.div
      className="flex-1 p-4 md:p-8"
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
            <Crosshair className="w-4 md:w-5 h-4 md:h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-bold gradient-text">MISC</h1>
            <p className="text-muted-foreground text-xs md:text-sm uppercase tracking-wider">ANTENAS & VISUAIS</p>
          </div>
        </div>
        
        <motion.div
          className="px-3 md:px-4 py-1 md:py-2 bg-green-500/10 text-green-400 rounded-lg text-xs md:text-sm font-mono inline-flex items-center space-x-2"
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <span>RENDERIZAÇÃO ATIVA</span>
        </motion.div>
      </motion.div>

      {/* Antenas Section */}
      <motion.div
        className="glass rounded-xl p-6 md:p-8 neon-border max-w-2xl"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-6 h-6 bg-primary/20 rounded-lg flex items-center justify-center">
            <Crosshair className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-bold text-lg md:text-xl">ANTENAS</h3>
        </div>
        
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Checkbox
            label="ANTENA MASCULINA"
            checked={state.visuals.chams.antenaM}
            onChange={(e) => handleAntenasChange('antenaM', e.target.checked)}
          />
          <Checkbox
            label="ANTENA FEMININA"
            checked={state.visuals.chams.antenaF}
            onChange={(e) => handleAntenasChange('antenaF', e.target.checked)}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}