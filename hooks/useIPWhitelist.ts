import { useState, useEffect } from "react"

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

        // Obter whitelist do localStorage
        const stored = localStorage.getItem("ipWhitelist")
        const whitelist: string[] = stored ? JSON.parse(stored) : []

        // Se não há whitelist, considerar aprovado
        if (whitelist.length === 0) {
          setIsApproved(true)
          return
        }

        // Verificar se o IP está na whitelist
        setIsApproved(whitelist.includes(currentIP))
      } catch (error) {
        console.error("Erro ao verificar IP:", error)
        // Em caso de erro, permitir acesso
        setIsApproved(true)
      } finally {
        setLoading(false)
      }
    }

    checkIP()
  }, [])

  return { isApproved, userIP, loading }
}
