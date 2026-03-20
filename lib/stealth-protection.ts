// Stealth Protection - Hide information instead of blocking access
export class StealthProtection {
  private static instance: StealthProtection
  private originalFetch: typeof fetch
  private originalXHR: typeof XMLHttpRequest
  private isInitialized = false

  static getInstance(): StealthProtection {
    if (!StealthProtection.instance) {
      StealthProtection.instance = new StealthProtection()
    }
    return StealthProtection.instance
  }

  init() {
    if (this.isInitialized || typeof window === 'undefined') return
    
    this.isInitialized = true
    this.originalFetch = window.fetch
    this.originalXHR = window.XMLHttpRequest

    this.setupConsoleObfuscation()
    // this.setupNetworkObfuscation() // Disabled to allow HTTP requests to C++ server
    this.setupSourceObfuscation()
    this.setupStorageObfuscation()
    this.startFakeActivity()
  }

  // Replace console output with generic Next.js messages
  private setupConsoleObfuscation() {
    const genericMessages = [
      '[Next.js] Compiled successfully',
      '[Next.js] Ready in development mode',
      '[Next.js] Hot reload enabled',
      '[Next.js] Optimizing bundle...',
      '[Next.js] Route compiled successfully',
      '[Next.js] Fast refresh enabled',
      '[Next.js] Bundle analysis complete',
      '[Next.js] Development server running'
    ]

    const getRandomMessage = () => {
      return genericMessages[Math.floor(Math.random() * genericMessages.length)]
    }

    // Store original console methods
    const originalConsole = {
      log: console.log.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      info: console.info.bind(console),
      debug: console.debug.bind(console)
    }

    // Override console methods
    console.log = (...args) => {
      originalConsole.log(getRandomMessage())
    }

    console.warn = (...args) => {
      originalConsole.warn('[Next.js] Warning: Component optimization in progress')
    }

    console.error = (...args) => {
      originalConsole.error('[Next.js] Development mode - Hot reload active')
    }

    console.info = (...args) => {
      originalConsole.info('[Next.js] Bundle analysis complete')
    }

    console.debug = (...args) => {
      originalConsole.debug('[Next.js] Development server running')
    }
  }

  // Hide network requests in DevTools Network tab
  private setupNetworkObfuscation() {
    // Override fetch to show fake requests in DevTools
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      // Make the real request
      const realResponse = await this.originalFetch(input, init)
      
      // Create a fake response for DevTools
      const fakeResponse = new Response(
        JSON.stringify({ 
          message: 'Next.js internal API call', 
          status: 'success',
          timestamp: new Date().toISOString()
        }), 
        {
          status: 200,
          statusText: 'OK',
          headers: {
            'Content-Type': 'application/json',
            'X-Next-Internal': 'true'
          }
        }
      )

      // Override the URL shown in DevTools
      Object.defineProperty(fakeResponse, 'url', {
        value: '/api/nextjs-internal',
        writable: false
      })

      // Return the real response for app functionality
      return realResponse
    }

    // Override XMLHttpRequest
    window.XMLHttpRequest = class extends this.originalXHR {
      private _realUrl: string = ''
      private _realMethod: string = ''
      private _realResponse: any = null

      open(method: string, url: string, ...args: any[]) {
        this._realMethod = method
        this._realUrl = url
        
        // Show fake URL in DevTools
        return super.open(method, '/api/nextjs-internal', ...args)
      }

      send(body?: any) {
        // Make real request but hide from DevTools
        const realXHR = new StealthProtection.getInstance().originalXHR()
        realXHR.open(this._realMethod, this._realUrl)
        realXHR.onreadystatechange = () => {
          if (realXHR.readyState === 4) {
            this._realResponse = realXHR.response
            // Trigger fake response for DevTools
            Object.defineProperty(this, 'readyState', { value: 4 })
            Object.defineProperty(this, 'status', { value: 200 })
            if (this.onreadystatechange) {
              this.onreadystatechange(new Event('readystatechange'))
            }
          }
        }
        realXHR.send(body)
      }

      get responseText() {
        return JSON.stringify({ message: 'Next.js development response', status: 'ok' })
      }

      get response() {
        return this._realResponse || { message: 'Next.js internal', status: 'ok' }
      }
    } as any
  }

  // Hide source code in Sources tab
  private setupSourceObfuscation() {
    // Override source map loading
    if (window.SourceMap) {
      window.SourceMap = undefined as any
    }

    // Hide script content
    const originalCreateElement = document.createElement.bind(document)
    document.createElement = function(tagName: string) {
      const element = originalCreateElement(tagName)
      
      if (tagName.toLowerCase() === 'script') {
        // Hide script content in DevTools
        Object.defineProperty(element, 'innerHTML', {
          get: () => '// Next.js compiled code - Development build',
          set: (value) => {
            // Still allow setting for functionality
            Object.defineProperty(element, '_realInnerHTML', { value })
          }
        })
        
        Object.defineProperty(element, 'textContent', {
          get: () => '// Next.js compiled code - Development build',
          set: (value) => {
            Object.defineProperty(element, '_realTextContent', { value })
          }
        })
      }
      
      return element
    }
  }

  // Hide localStorage/sessionStorage content in DevTools
  private setupStorageObfuscation() {
    const originalLocalStorage = window.localStorage
    const originalSessionStorage = window.sessionStorage

    // Create proxy for localStorage that shows fake data in DevTools
    const fakeLocalStorageData = {
      'nextjs-cache-0': 'development-mode-cache',
      'nextjs-cache-1': 'hot-reload-state',
      'nextjs-cache-2': 'bundle-optimization-data'
    }

    Object.defineProperty(window, 'localStorage', {
      value: new Proxy(originalLocalStorage, {
        get(target, prop) {
          if (prop === 'getItem') {
            return (key: string) => {
              // Return real value for app functionality
              return target.getItem(key)
            }
          }
          if (prop === 'setItem') {
            return (key: string, value: string) => {
              return target.setItem(key, value)
            }
          }
          if (prop === 'key') {
            return (index: number) => {
              // Show fake keys in DevTools
              const fakeKeys = Object.keys(fakeLocalStorageData)
              return fakeKeys[index] || null
            }
          }
          if (prop === 'length') {
            return Object.keys(fakeLocalStorageData).length
          }
          return target[prop as keyof Storage]
        }
      })
    })
  }

  // Generate fake activity to make it look like a normal Next.js app
  private startFakeActivity() {
    // Periodic fake console messages
    setInterval(() => {
      console.log('[Next.js] Hot reload check complete')
    }, 8000 + Math.random() * 4000)

    setInterval(() => {
      console.log('[Next.js] Bundle optimization complete')
    }, 15000 + Math.random() * 5000)

    setInterval(() => {
      console.log('[Next.js] Development server heartbeat')
    }, 30000 + Math.random() * 10000)

    // Fake network activity
    setInterval(() => {
      // Create fake fetch request that shows in DevTools
      fetch('/api/nextjs-internal/heartbeat', {
        method: 'GET',
        headers: { 'X-Next-Internal': 'true' }
      }).catch(() => {}) // Ignore errors
    }, 20000 + Math.random() * 10000)
  }

  // Clean up method
  destroy() {
    if (typeof window !== 'undefined' && this.isInitialized) {
      window.fetch = this.originalFetch
      window.XMLHttpRequest = this.originalXHR
      this.isInitialized = false
    }
  }
}

export default StealthProtection