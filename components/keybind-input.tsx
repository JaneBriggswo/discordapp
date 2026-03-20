"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { formatKey } from "@/lib/utils"

interface KeybindInputProps {
  value: string
  onChange: (key: string) => void
  disabled?: boolean
}

export function KeybindInput({ value, onChange, disabled = false }: KeybindInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [displayValue, setDisplayValue] = useState(formatKey(value))

  useEffect(() => {
    setDisplayValue(formatKey(value))
  }, [value])

  useEffect(() => {
    if (!isListening) return

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault()
      event.stopPropagation()
      
      const key = event.key
      onChange(key)
      setDisplayValue(formatKey(key))
      setIsListening(false)
    }

    const handleClickOutside = () => {
      setIsListening(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isListening, onChange])

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (!disabled) {
      setIsListening(true)
    }
  }

  return (
    <motion.button
      className={`keybind-input ${isListening ? 'glow-gray-strong' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={handleClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      {isListening ? (
        <motion.span
          className="text-primary"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          Press key...
        </motion.span>
      ) : (
        displayValue
      )}
    </motion.button>
  )
}