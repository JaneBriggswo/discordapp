"use client"

import { motion } from "framer-motion"

interface ESPPreviewProps {
  settings: {
    box: boolean
    skeleton: boolean
    name: boolean
    distance: boolean
    health: boolean
    snaplines: boolean
    secondMonitor: boolean
  }
}

export function ESPPreview({ settings }: ESPPreviewProps) {
  return (
    <div className="esp-preview">
      {/* Player representation */}
      <div className="esp-player">
        {/* Name ESP - Em cima da box */}
        {settings.name && (
          <motion.div
            className="absolute -top-6 left-0 text-xs text-primary font-mono whitespace-nowrap"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            Player
          </motion.div>
        )}
        
        {/* Box ESP */}
        {settings.box && (
          <motion.div
            className="absolute inset-0 border-2 border-gray-400"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
        
        {/* Skeleton ESP */}
        {settings.skeleton && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {/* Head */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 border border-gray-400 rounded-full" />
            {/* Body */}
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gray-400" />
            {/* Arms */}
            <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gray-400" />
            {/* Legs */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
              <div className="w-0.5 h-6 bg-gray-400 absolute -left-1" />
              <div className="w-0.5 h-6 bg-gray-400 absolute left-1" />
            </div>
          </motion.div>
        )}
        
        {/* Health bar */}
        {settings.health && (
          <motion.div
            className="absolute -left-2 top-0 w-1 h-full bg-gray-600"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="w-full h-3/4 bg-green-500" />
          </motion.div>
        )}
      </div>
      
      {/* Distance ESP */}
      {settings.distance && (
        <motion.div
          className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-primary font-mono"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          25m
        </motion.div>
      )}
      
      {/* Snaplines */}
      {settings.snaplines && (
        <motion.div
          className="absolute top-0 left-1/2 w-0.5 h-2/3 bg-primary/60"
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          style={{ transformOrigin: 'top' }}
        />
      )}
      
      {/* Second Monitor indicator */}
      {settings.secondMonitor && (
        <motion.div
          className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full glow-gray"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        />
      )}
      
      {/* Preview label */}
      <div className="absolute bottom-1 left-1 text-xs text-muted-foreground font-mono">
        Preview
      </div>
    </div>
  )
}