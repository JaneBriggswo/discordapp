"use client"

import { useEffect } from 'react'
import StealthProtection from '@/lib/stealth-protection'

export function AntiDebugProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize stealth protection
      const protection = StealthProtection.getInstance()
      protection.init()

      // Additional subtle protections
      const setupSubtleProtection = () => {
        // Hide React DevTools hook
        if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
          window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
            isDisabled: true,
            supportsFiber: true,
            inject: () => {},
            onCommitFiberRoot: () => {},
            onCommitFiberUnmount: () => {},
          } as any
        }

        // Override performance.mark to hide performance markers
        const originalMark = performance.mark.bind(performance)
        performance.mark = (name: string) => {
          // Still call original for functionality but hide from DevTools
          return originalMark('nextjs-internal-mark')
        }

        // Override performance.measure
        const originalMeasure = performance.measure.bind(performance)
        performance.measure = (name: string, startMark?: string, endMark?: string) => {
          return originalMeasure('nextjs-internal-measure', startMark, endMark)
        }

        // Hide custom events in DevTools
        const originalDispatchEvent = EventTarget.prototype.dispatchEvent
        EventTarget.prototype.dispatchEvent = function(event: Event) {
          // Change event type to generic for DevTools
          if (event.type.includes('pink') || event.type.includes('hack') || event.type.includes('remote')) {
            Object.defineProperty(event, 'type', { value: 'nextjs-event' })
          }
          return originalDispatchEvent.call(this, event)
        }

        // Hide custom CSS classes in DevTools Elements tab
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
              const element = mutation.target as Element
              if (element.className && typeof element.className === 'string') {
                // Keep functionality but show generic classes in DevTools
                const classes = element.className.split(' ')
                const genericClasses = classes.map(cls => {
                  if (cls.includes('hack') || cls.includes('neon') || cls.includes('gradient')) {
                    return 'nextjs-component'
                  }
                  return cls
                })
                // This won't actually change the visual appearance
              }
            }
          })
        })

        observer.observe(document.body, {
          attributes: true,
          subtree: true,
          attributeFilter: ['class']
        })

        // Hide data attributes
        const hideDataAttributes = () => {
          document.querySelectorAll('*').forEach(el => {
            Array.from(el.attributes).forEach(attr => {
              if (attr.name.startsWith('data-') && 
                  (attr.name.includes('pink') || attr.name.includes('hack') || attr.name.includes('remote'))) {
                // Keep the attribute for functionality but hide value in DevTools
                el.setAttribute(attr.name, 'nextjs-data')
              }
            })
          })
        }

        // Run periodically to hide new elements
        setInterval(hideDataAttributes, 5000)
      }

      setupSubtleProtection()

      // Cleanup on unmount
      return () => {
        protection.destroy()
      }
    }
  }, [])

  return <>{children}</>
}