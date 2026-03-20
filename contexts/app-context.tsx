"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { useNotifications } from "@/components/notification-system"

interface AimSettings {
  rage: {
    enabled: boolean
    keybind: string
    keybindType: 'hold' | 'toggle'
    keybindEnabled: boolean
  }
  legit: {
    enabled: boolean
    keybind: string
    keybindType: 'hold' | 'toggle'
    keybindEnabled: boolean
  }
  misc: {
    precision: boolean
    headshot: boolean
  }
}

interface VisualsSettings {
  esp: {
    loaded: boolean
    box: boolean
    skeleton: boolean
    name: boolean
    distance: boolean
    health: boolean
    snaplines: boolean
    secondMonitor: boolean
    streamMode: boolean
  }
  chams: {
    loaded: boolean
    controlChams: boolean
    antenaM: boolean
    antenaF: boolean
  }
}

interface SettingsState {
  espStatus: 'loaded' | 'not-loaded'
  bypassLoaded: boolean
}

interface AppState {
  aim: AimSettings
  visuals: VisualsSettings
  settings: SettingsState
  loaded: {
    rage: boolean
    legit: boolean
  }
}

interface AppContextType {
  state: AppState
  updateAim: (category: keyof AimSettings, key: string, value: any) => void
  updateVisuals: (category: keyof VisualsSettings, key: string, value: any) => void
  updateSettings: (key: keyof SettingsState, value: any) => void
  setLoaded: (type: 'rage' | 'legit', loaded: boolean) => void
  resetAllSettings: () => void
  addNotification: (notification: any) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const initialState: AppState = {
  aim: {
    rage: {
      enabled: false,
      keybind: "",
      keybindType: 'hold',
      keybindEnabled: false
    },
    legit: {
      enabled: false,
      keybind: "",
      keybindType: 'hold',
      keybindEnabled: false
    },
    misc: {
      precision: false,
      headshot: false
    }
  },
  visuals: {
    esp: {
      loaded: false,
      box: false,
      skeleton: false,
      name: false,
      distance: false,
      health: false,
      snaplines: false,
      secondMonitor: false,
      streamMode: false
    },
    chams: {
      loaded: false,
      controlChams: false,
      antenaM: false,
      antenaF: false
    }
  },
  settings: {
    espStatus: 'not-loaded',
    bypassLoaded: false
  },
  loaded: {
    rage: false,
    legit: false
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState)
  const [lastEmulatorStatus, setLastEmulatorStatus] = useState<boolean | null>(null)

  const performReset = () => {
    try {
      setState(initialState)
      
      // Also clear any persisted state safely
      if (typeof window !== 'undefined') {
        // Clear specific app-related localStorage items
        const appKeys = [
          'pink_remote_aim_settings',
          'pink_remote_visuals_settings',
          'pink_remote_app_state',
          'pink_remote_user_preferences'
        ]
        
        appKeys.forEach(key => {
          try {
            window.localStorage.removeItem(key)
          } catch (e) {
            console.warn('Could not remove app setting:', key)
          }
        })
      }
    } catch (error) {
      console.error('Error resetting settings:', error)
      // Fallback: just reset state
      setState(initialState)
    }
  }

  // Monitor emulator status and reset if it closes
  useEffect(() => {
    const checkEmulatorStatus = async () => {
      try {
        const serverIP = typeof window !== 'undefined' 
          ? localStorage.getItem('server_ip') || '127.0.0.1'
          : '127.0.0.1'
        
        const response = await fetch(`http://${serverIP}:9999/api/status`, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        const emulatorRunning = data.emulatorRunning === true

        // If status changed from running to not running, reset everything
        if (lastEmulatorStatus === true && emulatorRunning === false) {
          console.warn('[EmulatorDetection] HD-Player detectado como fechado, resetando configurações...')
          performReset()
          
          // Dispatch custom event for notification
          if (typeof window !== 'undefined') {
            const event = new CustomEvent('emulator-closed', {
              detail: { 
                message: 'HD-Player foi fechado',
                description: 'Todas as configurações foram resetadas' 
              }
            })
            window.dispatchEvent(event)
          }
        }

        setLastEmulatorStatus(emulatorRunning)
      } catch (error) {
        console.warn('[EmulatorDetection] Erro ao verificar status do emulador:', error)
        // Don't reset on network errors, only on confirmed closure
      }
    }

    // Check emulator status every 5 seconds
    const interval = setInterval(checkEmulatorStatus, 5000)
    
    // Initial check on mount
    checkEmulatorStatus()

    return () => clearInterval(interval)
  }, [lastEmulatorStatus])

  const updateAim = (category: keyof AimSettings, key: string, value: any) => {
    setState(prev => ({
      ...prev,
      aim: {
        ...prev.aim,
        [category]: {
          ...prev.aim[category],
          [key]: value
        }
      }
    }))
  }

  const updateVisuals = (category: keyof VisualsSettings, key: string, value: any) => {
    setState(prev => ({
      ...prev,
      visuals: {
        ...prev.visuals,
        [category]: {
          ...prev.visuals[category],
          [key]: value
        }
      }
    }))
  }

  const updateSettings = (key: keyof SettingsState, value: any) => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }))
  }

  const setLoaded = (type: 'rage' | 'legit', loaded: boolean) => {
    setState(prev => ({
      ...prev,
      loaded: {
        ...prev.loaded,
        [type]: loaded
      }
    }))
    
    if (loaded) {
      // Auto-enable when loaded
      updateAim(type, 'enabled', true)
    }
  }

  const resetAllSettings = () => {
    performReset()
  }

  const addNotification = (notification: any) => {
    // This will be handled by the component that uses useNotifications
    console.log('Notification:', notification)
  }

  return (
    <AppContext.Provider value={{
      state,
      updateAim,
      updateVisuals,
      updateSettings,
      setLoaded,
      resetAllSettings,
      addNotification
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}