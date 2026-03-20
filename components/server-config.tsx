"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Settings, Wifi, Zap } from "lucide-react"

interface ServerConfigProps {
  onConfiguredIP?: (ip: string) => void
}

export function ServerConfig({ onConfiguredIP }: ServerConfigProps) {
  const [showConfig, setShowConfig] = useState(false)
  const [manualIP, setManualIP] = useState('')
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')

  const handleSaveIP = async () => {
    if (!manualIP.trim()) return

    setTestStatus('testing')
    try {
      const response = await fetch(`http://${manualIP}:9999/api/status`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      })

      if (response.ok) {
        localStorage.setItem('bypass_server_ip', manualIP)
        setTestStatus('success')
        onConfiguredIP?.(manualIP)
        setTimeout(() => {
          setShowConfig(false)
          setTestStatus('idle')
          setManualIP('')
        }, 1500)
      } else {
        setTestStatus('error')
      }
    } catch {
      setTestStatus('error')
    }
  }

  if (!showConfig) {
    return (
      <button
        onClick={() => setShowConfig(true)}
        className="fixed bottom-4 right-4 p-2 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors"
        title="Configurar servidor"
      >
        <Wifi className="w-5 h-5 text-primary" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 glass rounded-xl p-4 w-80 neon-border shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-sm">CONFIGURAR SERVIDOR</h3>
        </div>
        <button
          onClick={() => setShowConfig(false)}
          className="text-muted-foreground hover:text-foreground text-lg"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">
            IP do Servidor
          </label>
          <input
            type="text"
            placeholder="192.168.1.100"
            value={manualIP}
            onChange={(e) => setManualIP(e.target.value)}
            className="w-full bg-background/50 border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div>
          <Button
            onClick={handleSaveIP}
            disabled={!manualIP.trim() || testStatus === 'testing'}
            className="w-full h-9 text-sm"
            variant={
              testStatus === 'success'
                ? 'default'
                : testStatus === 'error'
                  ? 'destructive'
                  : 'hack'
            }
          >
            {testStatus === 'testing' && (
              <>
                <Zap className="w-3 h-3 mr-2 animate-spin" />
                Testando...
              </>
            )}
            {testStatus === 'success' && '✓ Conectado!'}
            {testStatus === 'error' && '✕ Erro ao conectar'}
            {testStatus === 'idle' && 'Testar e Salvar'}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground bg-background/30 p-2 rounded border border-border/30">
          <p className="mb-1 font-semibold">💡 Dica:</p>
          <p>Para acessar do celular, use o IP local do seu PC (ex: 192.168.1.100)</p>
        </div>
      </div>
    </div>
  )
}
