"use client"

import { motion } from "framer-motion"
import { Target, Eye, Settings, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { useNotifications } from "@/contexts/notification-context"
import { useAppContext } from "@/contexts/app-context"
import { useExeStatus } from "@/hooks/useExeStatus"

interface SidebarProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
}

const categories = [
  {
    id: "aim",
    label: "Mira",
    icon: Target,
    description: "Aimbot & Misc"
  },
  {
    id: "misc",
    label: "Visuais", 
    icon: Eye,
    description: "Antenas"
  },
  {
    id: "settings",
    label: "Configurações",
    icon: Settings,
    description: "Configs & Bypass"
  }
]

export function Sidebar({ activeCategory, onCategoryChange }: SidebarProps) {
  const { isOnline, isLoading } = useExeStatus()

  return (
    <motion.div
      className="w-64 h-screen bg-card border-r border-border glass"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border">
        <motion.div
          className="flex items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div>
            <h1 className="text-lg md:text-xl font-bold gradient-text">Remote</h1>
            <h1 className="text-xs text-muted-foreground">Painel Via Site</h1>
          </div>
        </motion.div>
      </div>

      {/* Categories */}
      <div className="p-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Dashboard
          </p>
          
          {categories.map((category, index) => {
            const Icon = category.icon
            const isActive = activeCategory === category.id
            
            return (
              <motion.button
                key={category.id}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200 group",
                  isActive 
                    ? "sidebar-active text-primary" 
                    : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                )}
                onClick={() => onCategoryChange(category.id)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                  isActive 
                    ? "bg-primary/20 text-primary glow-gray" 
                    : "bg-muted group-hover:bg-primary/10 group-hover:text-primary"
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium",
                    isActive ? "text-primary" : ""
                  )}>
                    {category.label}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {category.description}
                  </p>
                </div>
                
                {isActive && (
                  <motion.div
                    className="w-2 h-2 bg-primary rounded-full glow-gray"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border space-y-3">
        {/* EXE Status */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg p-3 border border-border/50 backdrop-blur-sm">
            <div className="flex items-center justify-center space-x-3">
              <motion.div
                className={cn(
                  "w-3 h-3 rounded-full flex-shrink-0",
                  isOnline ? "bg-green-500" : "bg-red-500"
                )}
                animate={isOnline ? { scale: [1, 1.1, 1] } : { opacity: 1 }}
                transition={isOnline ? { duration: 2, repeat: Infinity } : { duration: 0 }}
              />
              <span className="text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}