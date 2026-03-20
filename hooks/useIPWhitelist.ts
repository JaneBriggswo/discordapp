import { useState, useEffect } from "react"
import { ALLOWED_IPS } from "@/config/ip-whitelist"

export function useIPWhitelist() {
  const [isApproved, setIsApproved] = useState<boolean | null>(null)
  const [userIP, setUserIP] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkIP = async () => {
      try {
        // Obter IP do usuário
        const response = await fetch("https://api.ipify.org?format=json")
        const data = await response.json()
        const currentIP = data.ip

        setUserIP(currentIP)

        // Verificar se o IP está na whitelist
        const isAllowed = ALLOWED_IPS.includes(currentIP)
        setIsApproved(isAllowed)

        // Log para debug
        console.log(`🔍 IP do usuário: ${currentIP}`)
        console.log(`✅ Permitido: ${isAllowed}`)
      } catch (error) {
        console.error("❌ Erro ao verificar IP:", error)
        // Em caso de erro, bloquear acesso por segurança
        setIsApproved(false)
      } finally {
        setLoading(false)
      }
    }

    checkIP()
  }, [])

  return { isApproved, userIP, loading }
}
