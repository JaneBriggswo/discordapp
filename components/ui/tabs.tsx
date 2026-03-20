"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

const useTabsContext = () => {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs provider")
  }
  return context
}

interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

const Tabs = ({ value, onValueChange, children, className }: TabsProps) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn("w-full", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

const TabsList = ({ children, className }: TabsListProps) => {
  return (
    <div className={cn(
      "inline-flex items-center justify-center gap-3 p-1",
      className
    )}>
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
}

const TabsTrigger = ({ value, children, className }: TabsTriggerProps) => {
  const { value: selectedValue, onValueChange } = useTabsContext()
  const isSelected = selectedValue === value

  return (
    <motion.button
      className={cn(
        "flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 min-w-[100px] border",
        isSelected 
          ? "bg-primary text-white border-primary/50 shadow-lg glow-gray" 
          : "bg-card/50 text-muted-foreground border-border/30 hover:bg-primary/10 hover:text-primary hover:border-primary/30",
        className
      )}
      onClick={() => onValueChange(value)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.button>
  )
}

interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

const TabsContent = ({ value, children, className }: TabsContentProps) => {
  const { value: selectedValue } = useTabsContext()
  
  if (selectedValue !== value) return null

  return (
    <motion.div
      className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }