"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Settings, Wifi, Zap } from "lucide-react"

interface ServerConfigProps {
  onConfiguredIP?: (ip: string) => void
}

const DEFAULT_LOCAL_IP = process.env.NEXT_PUBLIC_LOCAL_PC_IP || '192.168.3.39'

export function ServerConfig({ onConfiguredIP }: ServerConfigProps) {
  const [showConfig, setShowConfig] = useState(false)
  const [manualIP, setManualIP] = useState('')
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')

  useEffect(() => {
    // Carregar IP salvo do localStorage ou usar padrão
    const savedIP = localStorage.getItem('bypass_server_ip')
    setManualIP(savedIP || DEFAULT_LOCAL_IP)
  }, [])

  const handleSaveIP = async () => {
    if (!manualIP.trim()) return

    setTestStatus('testing')
    try {
      // Remove :9999 if already included
      const cleanIP = manualIP.replace(':9999', '').trim()
      
      // Tenta ambos: localhost primeiro (PC) e depois o IP digitado (celular/remoto)
      const urlsToTry = [
        { url: 'http://localhost:9999/api/status', ip: 'localhost' },
        { url: `http://${cleanIP}:9999/api/status`, ip: cleanIP }
      ]
      
      let successIP = null
      for (const { url, ip } of urlsToTry) {
        try {
          const response = await fetch(url, {
            method: 'GET',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(3000)
          })
          
          if (response.type === 'opaque' || response.ok) {
            successIP = ip
            break
          }
        } catch (e) {
          continue
        }
      }
      
      if (successIP) {
        localStorage.setItem('bypass_server_ip', successIP)
        setTestStatus('success')
        onConfiguredIP?.(successIP)
        setTimeout(() => {
          setShowConfig(false)
          setTestStatus('idle')
          setManualIP('')
        }, 1500)
      } else {
        setTestStatus('error')
      }
    } catch (error) {
      console.error('[ServerConfig] Erro ao conectar:', error)
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
            placeholder={DEFAULT_LOCAL_IP}
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
          <p>Para acessar do celular, use o IP local do seu PC (ex: {DEFAULT_LOCAL_IP})</p>
        </div>
      </div>
    </div>
  )
}
