import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatKey(key: string): string {
  if (!key) return "None"
  
  const keyMap: Record<string, string> = {
    ' ': 'Space',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'Control': 'Ctrl',
    'Alt': 'Alt',
    'Shift': 'Shift',
    'Meta': 'Win',
    'Enter': 'Enter',
    'Escape': 'Esc',
    'Backspace': 'Backspace',
    'Tab': 'Tab',
    'CapsLock': 'Caps',
    'Delete': 'Del',
    'Insert': 'Ins',
    'Home': 'Home',
    'End': 'End',
    'PageUp': 'PgUp',
    'PageDown': 'PgDn'
  }

  return keyMap[key] || key.toUpperCase()
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}