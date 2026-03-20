"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { KeybindInput } from "@/components/keybind-input"
import { KeybindTypeSelector } from "@/components/keybind-type-selector"
import { Settings, Zap, Target } from "lucide-react"
import { useAppContext } from "@/contexts/app-context"
import { useNotifications } from "@/contexts/notification-context"
import { useServerIP } from "@/hooks/useServerIP"

export function AimCategory() {
  const [activeTab, setActiveTab] = useState("rage")
  const { state, updateAim, setLoaded } = useAppContext()
  const { addNotification } = useNotifications()
  const { serverIP } = useServerIP()

  const handleLoad = async (type: 'rage' | 'legit') => {
    try {
        // Enviar requisição para ativar a feature no servidor C++
        const featureName = type === 'rage' ? 'rage_aim' : 'legit_aim'
        const response = await fetch(`http://${serverIP}:9999/api/activate`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ feature: featureName })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.success) {
          // Set loaded state and auto-enable
          setLoaded(type, true)
          updateAim(type, 'enabled', true)
          
          addNotification({
            type: 'success',
            title: `${type.toUpperCase()} carregado`,
            message: `Ativado com sucesso no bypass`
          })
        } else {
          throw new Error(data.error || 'Erro ao ativar feature')
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: `Erro ao carregar ${type.toUpperCase()}`,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  }

  const handleSettingChange = async (category: keyof typeof state.aim, key: string, value: any) => {
    // Special handling for Enabled checkbox on RAGE/LEGIT
      if (key === 'enabled' && (category === 'rage' || category === 'legit')) {
        try {
          // Send toggle request to server
          const featureName = category === 'rage' ? 'rage_enable' : 'legit_enable'
          const response = await fetch(`http://${serverIP}:9999/api/toggle`, {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ feature: featureName, enabled: value })
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const data = await response.json()
          
          if (!data.success) {
            throw new Error(data.error || 'Erro ao atualizar feature')
          }

          // Only update state if server call succeeds
          updateAim(category, key, value)
          
          if (value) {
            addNotification({
              type: 'success',
              title: `${category.toUpperCase()} ativado`,
              message: ``
            })
          } else {
            addNotification({
              type: 'info',
              title: `${category.toUpperCase()} desativado`,
              message: ``
            })
            // Reset keybind when disabled
            updateAim(category, 'keybind', '')
            updateAim(category, 'keybindEnabled', false)
          }
        } catch (error) {
          addNotification({
            type: 'error',
            title: `Erro ao atualizar ${category.toUpperCase()}`,
            message: error instanceof Error ? error.message : 'Erro desconhecido'
          })
        }
      } else if ((key === 'keybind' || key === 'keybindType') && (category === 'rage' || category === 'legit')) {
        // Handle keybind updates - send to server
        updateAim(category, key, value)
        
        try {
          // Get the current state
          const currentState = category === 'rage' ? state.aim.rage : state.aim.legit
          const keybindValue = key === 'keybind' ? value : currentState.keybind
          const keybindType = key === 'keybindType' ? value : currentState.keybindType
          
          if (keybindValue && currentState.keybindEnabled) {
            // Send keybind configuration to server
            const response = await fetch(`http://${serverIP}:9999/api/configure-keybind`, {
              method: 'POST',
              mode: 'cors',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                aimType: category,
                key: keybindValue,
                mode: keybindType,
                enabled: currentState.keybindEnabled
              })
            })

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            
            if (!data.success) {
              throw new Error(data.error || 'Erro ao configurar keybind')
            }

            if (key === 'keybind') {
              addNotification({
                type: 'info',
                title: `Keybind configurado: ${value}`,
                message: ``
              })
            } else if (key === 'keybindType') {
              addNotification({
                type: 'info',
                title: `Modo ${value.toUpperCase()} selecionado`,
                message: ``
              })
            }
          }
        } catch (error) {
          // Still update state but show error
          addNotification({
            type: 'error',
            title: `Erro ao configurar keybind`,
            message: error instanceof Error ? error.message : 'Erro desconhecido'
          })
        }
      } else {
        // Original behavior for other settings
        updateAim(category, key, value)
        
        // Notificações específicas
        if (key === 'enabled') {
          if (value) {
            addNotification({
              type: 'success',
              title: `${category.toUpperCase()} ativado`,
              message: ``
            })
          } else {
            addNotification({
              type: 'info',
              title: `${category.toUpperCase()} desativado`,
              message: ``
            })
            // Reset keybind when disabled
            updateAim(category, 'keybind', '')
            updateAim(category, 'keybindEnabled', false)
          }
        }
      }
  }

  const handleMiscChange = async (key: string, value: boolean) => {
    updateAim('misc', key, value)
      
      const functionNames = {
        'precision': 'PRECISION',
        'headshot': 'HS PESCOÇO'
      }

      // Mapa de features para o backend
      const featureMap: { [key: string]: string } = {
        'precision': 'precision',
        'headshot': 'headshot'
      }

      const featureName = featureMap[key]

      try {
        const response = await fetch(`http://${serverIP}:9999/api/toggle`, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ feature: featureName, enabled: value })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.success) {
          if (value) {
            addNotification({
              type: 'success',
              title: `${functionNames[key as keyof typeof functionNames]} ativado`,
              message: ``
            })
          } else {
            addNotification({
              type: 'info',
              title: `${functionNames[key as keyof typeof functionNames]} desativado`,
              message: ``
            })
          }
        } else {
          throw new Error(data.error || 'Erro ao atualizar feature')
        }
    } catch (error) {
      // Se houver erro, reverter o estado
      updateAim('misc', key, !value)
      addNotification({
        type: 'error',
        title: `Erro ao atualizar ${functionNames[key as keyof typeof functionNames]}`,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  }

  const handleEnableKeybind = async (category: keyof typeof state.aim, enabled: boolean) => {
    updateAim(category, 'keybindEnabled', enabled)
      
      if (enabled) {
        // Set a default keybind when enabled
        updateAim(category, 'keybind', 'F')
        
        // Send keybind configuration to server
        try {
          const response = await fetch(`http://${serverIP}:9999/api/configure-keybind`, {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              aimType: category,
              key: 'F',
              mode: 'hold',
              enabled: true
            })
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const data = await response.json()
          
          if (!data.success) {
            throw new Error(data.error || 'Erro ao configurar keybind')
          }

          addNotification({
            type: 'success',
            title: 'Keybind habilitado',
            message: `${category.toUpperCase()} keybind configurado como F (HOLD)`
          })
        } catch (error) {
          addNotification({
            type: 'error',
            title: 'Erro ao habilitar keybind',
            message: error instanceof Error ? error.message : 'Erro desconhecido'
          })
        }
      } else {
        // Clear keybind when disabled
        updateAim(category, 'keybind', '')
        
        // Send disable command to server
        try {
          const response = await fetch(`http://${serverIP}:9999/api/configure-keybind`, {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              aimType: category,
              key: '',
              mode: 'hold',
              enabled: false
            })
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          addNotification({
            type: 'info',
            title: 'Keybind desabilitado',
            message: ``
          })
        } catch (error) {
          addNotification({
            type: 'error',
            title: 'Erro ao desabilitar keybind',
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
            <Target className="w-4 md:w-5 h-4 md:h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-bold gradient-text">MIRA</h1>
            <p className="text-muted-foreground text-xs md:text-sm font-medium uppercase tracking-wider">SISTEMA DE MIRA AVANÇADO</p>
          </div>
        </div>
        
        <motion.div
          className="px-3 md:px-4 py-1 md:py-2 bg-green-500/10 text-green-400 rounded-lg text-xs md:text-sm font-semibold inline-flex items-center space-x-2"
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <span>SISTEMA PRONTO</span>
        </motion.div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="bg-card/50 border border-border rounded-lg px-1 md:px-2 py-1 mb-4 md:mb-8 backdrop-blur-sm w-fit">
          <TabsList className="justify-start">
            <TabsTrigger value="rage" className="font-semibold">Aim Full</TabsTrigger>
            <TabsTrigger value="legit" className="font-semibold">Aim Legit</TabsTrigger>
            <TabsTrigger value="misc" className="font-semibold">Outros</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="rage" className="space-y-6 tab-content-fade">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {/* General Section */}
            <motion.div
              className="glass rounded-xl p-6 neon-border"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">GERAL</h3>
              </div>
              
              <Button
                variant="hack"
                onClick={() => handleLoad('rage')}
                className="w-full mb-6 h-12 text-base font-semibold"
                loading={false}
              >
                LOAD
              </Button>
              
              <Checkbox
                label="ENABLED"
                checked={state.aim.rage.enabled}
                onChange={(e) => handleSettingChange('rage', 'enabled', e.target.checked)}
                disabled={!state.loaded.rage}
              />
            </motion.div>

            {/* Settings Section */}
            <motion.div
              className="glass rounded-xl p-6 neon-border"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <Settings className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">CONFIGURAÇÕES</h3>
              </div>
              
              <div className="space-y-6">
                <Checkbox
                  label="ENABLE KEYBIND"
                  checked={state.aim.rage.keybindEnabled}
                  onChange={(e) => handleEnableKeybind('rage', e.target.checked)}
                  disabled={!state.loaded.rage || !state.aim.rage.enabled}
                />
                
                {state.aim.rage.enabled && state.loaded.rage && state.aim.rage.keybindEnabled && (
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">TYPE:</span>
                      <KeybindTypeSelector
                        value={state.aim.rage.keybindType}
                        onChange={(type) => handleSettingChange('rage', 'keybindType', type)}
                        disabled={!state.aim.rage.enabled}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">KEY:</span>
                      <KeybindInput
                        value={state.aim.rage.keybind}
                        onChange={(key) => handleSettingChange('rage', 'keybind', key)}
                        disabled={!state.aim.rage.enabled}
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="legit" className="space-y-6 tab-content-fade">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {/* General Section */}
            <motion.div
              className="glass rounded-xl p-6 neon-border"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">GERAL</h3>
              </div>
              
              <Button
                variant="hack"
                onClick={() => handleLoad('legit')}
                className="w-full mb-6 h-12 text-base font-semibold"
              >
                LOAD
              </Button>
              
              <Checkbox
                label="ENABLED"
                checked={state.aim.legit.enabled}
                onChange={(e) => handleSettingChange('legit', 'enabled', e.target.checked)}
                disabled={!state.loaded.legit}
              />
            </motion.div>

            {/* Settings Section */}
            <motion.div
              className="glass rounded-xl p-6 neon-border"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <Settings className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">CONFIGURAÇÕES</h3>
              </div>
              
              <div className="space-y-6">
                <Checkbox
                  label="ENABLE KEYBIND"
                  checked={state.aim.legit.keybindEnabled}
                  onChange={(e) => handleEnableKeybind('legit', e.target.checked)}
                  disabled={!state.loaded.legit || !state.aim.legit.enabled}
                />
                
                {state.aim.legit.enabled && state.loaded.legit && state.aim.legit.keybindEnabled && (
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">TYPE:</span>
                      <KeybindTypeSelector
                        value={state.aim.legit.keybindType}
                        onChange={(type) => handleSettingChange('legit', 'keybindType', type)}
                        disabled={!state.aim.legit.enabled}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">KEY:</span>
                      <KeybindInput
                        value={state.aim.legit.keybind}
                        onChange={(key) => handleSettingChange('legit', 'keybind', key)}
                        disabled={!state.aim.legit.enabled}
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="misc" className="space-y-6 tab-content-fade">
          <motion.div
            className="glass rounded-xl p-6 neon-border max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <Settings className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">MIRA</h3>
            </div>
            
            <div className="space-y-4">
              <Checkbox
                label="PRECISION"
                checked={state.aim.misc.precision}
                onChange={(e) => handleMiscChange('precision', e.target.checked)}
              />
              <Checkbox
                label="HS PESCOÇO"
                checked={state.aim.misc.headshot}
                onChange={(e) => handleMiscChange('headshot', e.target.checked)}
              />
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}