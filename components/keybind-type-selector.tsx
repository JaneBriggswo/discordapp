"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface KeybindTypeSelectorProps {
  value: 'hold' | 'toggle'
  onChange: (value: 'hold' | 'toggle') => void
  disabled?: boolean
}

export function KeybindTypeSelector({ value, onChange, disabled }: KeybindTypeSelectorProps) {
  return (
    <div className="flex bg-muted rounded-lg p-1 w-fit">
      <motion.button
        type="button"
        className={cn(
          "px-3 py-1 text-xs font-semibold rounded transition-all",
          value === 'hold' 
            ? "bg-primary text-primary-foreground shadow-sm" 
            : "text-muted-foreground hover:text-foreground",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !disabled && onChange('hold')}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        disabled={disabled}
      >
        HOLD
      </motion.button>
      
      <motion.button
        type="button"
        className={cn(
          "px-3 py-1 text-xs font-semibold rounded transition-all",
          value === 'toggle' 
            ? "bg-primary text-primary-foreground shadow-sm" 
            : "text-muted-foreground hover:text-foreground",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !disabled && onChange('toggle')}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        disabled={disabled}
      >
        TOGGLE
      </motion.button>
    </div>
  )
}