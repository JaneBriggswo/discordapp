"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Zap, Power } from "lucide-react"

export function QuickActions() {
  const [loading, setLoading] = useState(false)
  const [rageOn, setRageOn] = useState(false)
  const [legitOn, setLegitOn] = useState(false)

  const activateFeature = async (endpoint: string, name: string, isToggle: boolean = false, toggleFunction?: (val: boolean) => void) => {
    setLoading(true)
    try {
      const serverIP = typeof window !== 'undefined' ? localStorage.getItem('bypass_server_ip') : null
      if (!serverIP) {
        alert('Configure o servidor primeiro!')
        setLoading(false)
        return
      }

      const response = await fetch(`http://${serverIP}:9999${endpoint}`, {
        method: 'GET',
        mode: 'no-cors'
      })

      if (isToggle && toggleFunction) {
        toggleFunction(true)
      }
      alert(`✓ ${name}!`)
    } catch (error) {
      alert(`✗ Erro ao ativar ${name}`)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed top-4 left-4 glass rounded-xl p-4 w-80 neon-border shadow-xl">
      <h3 className="font-bold text-sm mb-4">ATIVAÇÃO RÁPIDA</h3>
      
      <div className="space-y-2">
        {/* Rage AIM Toggle */}
        <div className="flex gap-2">
          <Button
            onClick={() => activateFeature('/api/rage/on', 'Rage AIM ativado', true, setRageOn)}
            disabled={loading || rageOn}
            className="flex-1 h-9 text-sm bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <>
                <Zap className="w-3 h-3 mr-2 animate-spin" />
                Ativando...
              </>
            ) : rageOn ? (
              '🟢 RAGE ON'
            ) : (
              '🔥 RAGE'
            )}
          </Button>
          <Button
            onClick={() => activateFeature('/api/rage/off', 'Rage AIM desativado', true, () => setRageOn(false))}
            disabled={loading || !rageOn}
            className="flex-1 h-9 text-sm bg-gray-600 hover:bg-gray-700"
          >
            {loading ? (
              <>
                <Power className="w-3 h-3 mr-2 animate-spin" />
              </>
            ) : (
              'OFF'
            )}
          </Button>
        </div>

        {/* Legit AIM Toggle */}
        <div className="flex gap-2">
          <Button
            onClick={() => activateFeature('/api/legit/on', 'Legit AIM ativado', true, setLegitOn)}
            disabled={loading || legitOn}
            className="flex-1 h-9 text-sm bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Zap className="w-3 h-3 mr-2 animate-spin" />
                Ativando...
              </>
            ) : legitOn ? (
              '🟢 LEGIT ON'
            ) : (
              '✨ LEGIT'
            )}
          </Button>
          <Button
            onClick={() => activateFeature('/api/legit/off', 'Legit AIM desativado', true, () => setLegitOn(false))}
            disabled={loading || !legitOn}
            className="flex-1 h-9 text-sm bg-gray-600 hover:bg-gray-700"
          >
            {loading ? (
              <>
                <Power className="w-3 h-3 mr-2 animate-spin" />
              </>
            ) : (
              'OFF'
            )}
          </Button>
        </div>

        {/* Headshot */}
        <Button
          onClick={() => activateFeature('/api/headshot/on', 'Headshot ativado')}
          disabled={loading}
          className="w-full h-9 text-sm bg-orange-600 hover:bg-orange-700"
        >
          {loading ? (
            <>
              <Zap className="w-3 h-3 mr-2 animate-spin" />
              Ativando...
            </>
          ) : (
            '🎯 HEADSHOT'
          )}
        </Button>

        {/* Precision */}
        <Button
          onClick={() => activateFeature('/api/precision/on', 'Precision ativado')}
          disabled={loading}
          className="w-full h-9 text-sm bg-purple-600 hover:bg-purple-700"
        >
          {loading ? (
            <>
              <Zap className="w-3 h-3 mr-2 animate-spin" />
              Ativando...
            </>
          ) : (
            '💜 PRECISION'
          )}
        </Button>
      </div>

      <div className="text-xs text-muted-foreground mt-3 p-2 border border-border/30 rounded bg-background/30">
        Configure o IP primeiro para usar
      </div>
    </div>
  )
}
