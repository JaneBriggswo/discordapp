"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "hack"
  size?: "default" | "sm" | "lg" | "icon"
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", loading = false, children, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"
    
    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90 glow-gray",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-primary text-primary hover:bg-primary hover:text-primary-foreground neon-border",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "underline-offset-4 hover:underline text-primary",
      hack: "bg-gradient-to-r from-primary/20 to-primary/10 border border-primary text-primary hover:from-primary/30 hover:to-primary/20 btn-hack neon-border"
    }

    const sizes = {
      default: "h-10 py-2 px-4",
      sm: "h-9 px-3 rounded-md",
      lg: "h-11 px-8 rounded-md",
      icon: "h-10 w-10"
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          loading && "cursor-not-allowed",
          className
        )}
        {...props}
      >
        {loading && (
          <div className="w-4 h-4 mr-2 spinner" />
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }