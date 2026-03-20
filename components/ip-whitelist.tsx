"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Check, AlertCircle } from "lucide-react"
import { useNotifications } from "@/contexts/notification-context"

interface IPWhitelistProps {
  onClose?: () => void
}

const validateIP = (ip: string): boolean => {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  if (!ipv4Regex.test(ip)) return false
  
  const parts = ip.split(".")
  return parts.every(part => {
    const num = parseInt(part, 10)
    return num >= 0 && num <= 255
  })
}

export function IPWhitelist({ onClose }: IPWhitelistProps) {
  const [whitelist, setWhitelist] = useState<string[]>([])
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(true)
  const { addNotification } = useNotifications()

  // Carregar whitelist do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ipWhitelist")
      if (stored) {
        setWhitelist(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Erro ao carregar whitelist:", error)
    }
    setLoading(false)
  }, [])

  // Salvar whitelist no localStorage
  const saveWhitelist = (newList: string[]) => {
    try {
      localStorage.setItem("ipWhitelist", JSON.stringify(newList))
      setWhitelist(newList)
    } catch (error) {
      addNotification({
        title: "Erro",
        message: "Falha ao salvar whitelist",
        type: "error"
      })
    }
  }

  const addIP = () => {
    const ip = inputValue.trim()
    
    if (!ip) {
      addNotification({
        title: "Campo vazio",
        message: "Digite um IP antes de adicionar",
        type: "error"
      })
      return
    }

    if (!validateIP(ip)) {
      addNotification({
        title: "IP inválido",
        message: `${ip} não é um IP válido (ex: 192.168.1.1)`,
        type: "error"
      })
      return
    }

    if (whitelist.includes(ip)) {
      addNotification({
        title: "IP duplicado",
        message: `${ip} já está na whitelist`,
        type: "error"
      })
      return
    }

    const newList = [...whitelist, ip]
    saveWhitelist(newList)
    setInputValue("")
    addNotification({
      title: "IP adicionado",
      message: `${ip} foi adicionado à whitelist`,
      type: "success"
    })
  }

  const removeIP = (ip: string) => {
    const newList = whitelist.filter(item => item !== ip)
    saveWhitelist(newList)
    addNotification({
      title: "IP removido",
      message: `${ip} foi removido da whitelist`,
      type: "success"
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addIP()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <motion.div
      className="bg-card border border-border rounded-xl p-6 max-w-2xl mx-auto"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Whitelist de IPs</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Apenas IPs nesta lista podem acessar o site
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Input Section */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ex: 192.168.1.1"
          className="flex-1 px-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
        />
        <button
          onClick={addIP}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar
        </button>
      </div>

      {/* Info Alert */}
      {whitelist.length === 0 && (
        <motion.div
          className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="w-5 h-5 text-blue-500" />
          <p className="text-sm text-blue-500">
            Nenhum IP na whitelist. Todos os IPs poderão acessar.
          </p>
        </motion.div>
      )}

      {/* IP List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {whitelist.length > 0 ? (
            whitelist.map((ip, index) => (
              <motion.div
                key={ip}
                className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-lg group hover:bg-muted transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-mono text-sm text-foreground">{ip}</span>
                </div>
                <button
                  onClick={() => removeIP(ip)}
                  className="p-2 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 text-destructive rounded-lg transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum IP adicionado ainda
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats */}
      {whitelist.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Total de IPs permitidos: <span className="font-bold text-foreground">{whitelist.length}</span>
          </p>
        </div>
      )}
    </motion.div>
  )
}
