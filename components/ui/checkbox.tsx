"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="flex items-center gap-2">
        <div className="relative flex-shrink-0">
          <input
            type="checkbox"
            ref={ref}
            id={checkboxId}
            className={cn(
              "checkbox-hack",
              className
            )}
            {...props}
          />
        </div>
        {label && (
          <motion.label
            htmlFor={checkboxId}
            className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-foreground hover:text-primary transition-colors select-none -mt-1"
            whileHover={{ scale: 1.02 }}
          >
            {label}
          </motion.label>
        )}
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }