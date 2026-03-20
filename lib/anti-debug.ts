// Anti-Debug Protection System - Multiple Layers
class AntiDebugProtection {
  private static instance: AntiDebugProtection
  private intervals: NodeJS.Timeout[] = []
  private isProtectionActive = false
  private debugDetected = false
  private originalConsole: any = {}

  static getInstance(): AntiDebugProtection {
    if (!AntiDebugProtection.instance) {
      AntiDebugProtection.instance = new AntiDebugProtection()
    }
    return AntiDebugProtection.instance
  }

  // Initialize all protection layers
  init() {
    if (typeof window === 'undefined') return
    
    this.isProtectionActive = true
    this.disableConsole()
    this.blockDevTools()
    this.blockRightClick()
    this.blockKeyboardShortcuts()
    this.detectDevTools()
    this.obfuscateDOM()
    this.blockInspection()
    this.antiTamper()
    this.blockSourceView()
    this.detectDebugger()
  }

  // Completely disable console
  private disableConsole() {
    if (typeof window === 'undefined') return

    // Save original console methods
    this.originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug,
      trace: console.trace,
      table: console.table,
      group: console.group,
      groupEnd: console.groupEnd,
      clear: console.clear
    }

    // Override all console methods
    const noop = () => {}
    console.log = noop
    console.warn = noop
    console.error = noop
    console.info = noop
    console.debug = noop
    console.trace = noop
    console.table = noop
    console.group = noop
    console.groupEnd = noop
    console.clear = noop

    // Block console object access
    Object.defineProperty(window, 'console', {
      get: () => ({}),
      set: () => {}
    })
  }

  // Block DevTools opening
  private blockDevTools() {
    if (typeof window === 'undefined') return

    // Method 1: Detect window resize (DevTools opening)
    let devtools = { open: false, orientation: null as string | null }
    const threshold = 160

    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true
          this.triggerProtection()
        }
      } else {
        devtools.open = false
      }
    }, 500)

    // Method 2: Detect DevTools by timing
    let start = performance.now()
    const interval = setInterval(() => {
      const now = performance.now()
      if (now - start > 100) {
        this.triggerProtection()
      }
      start = now
    }, 50)
    this.intervals.push(interval)
  }

  // Block right-click context menu
  private blockRightClick() {
    if (typeof window === 'undefined') return

    document.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      e.stopPropagation()
      return false
    }, true)

    document.addEventListener('selectstart', (e) => {
      e.preventDefault()
      return false
    }, true)

    document.addEventListener('dragstart', (e) => {
      e.preventDefault()
      return false
    }, true)
  }

  // Block keyboard shortcuts
  private blockKeyboardShortcuts() {
    if (typeof window === 'undefined') return

    const blockedKeys = [
      'F12', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11',
      'I', 'J', 'U', 'S', 'A', 'C', 'V', 'P'
    ]

    document.addEventListener('keydown', (e) => {
      // Block F12 and other function keys
      if (blockedKeys.includes(e.key)) {
        e.preventDefault()
        e.stopPropagation()
        this.triggerProtection()
        return false
      }

      // Block Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault()
        this.triggerProtection()
        return false
      }

      // Block Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault()
        this.triggerProtection()
        return false
      }

      // Block Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'U') {
        e.preventDefault()
        this.triggerProtection()
        return false
      }

      // Block Ctrl+S (Save)
      if (e.ctrlKey && e.key === 'S') {
        e.preventDefault()
        return false
      }

      // Block Ctrl+A (Select All)
      if (e.ctrlKey && e.key === 'A') {
        e.preventDefault()
        return false
      }

      // Block Ctrl+C (Copy)
      if (e.ctrlKey && e.key === 'C') {
        e.preventDefault()
        return false
      }

      // Block Ctrl+V (Paste)
      if (e.ctrlKey && e.key === 'V') {
        e.preventDefault()
        return false
      }

      // Block Ctrl+P (Print)
      if (e.ctrlKey && e.key === 'P') {
        e.preventDefault()
        return false
      }
    }, true)

    // Block key combinations
    document.addEventListener('keyup', (e) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey)) {
        this.triggerProtection()
      }
    }, true)
  }

  // Advanced DevTools detection
  private detectDevTools() {
    if (typeof window === 'undefined') return

    // Method 1: Console detection
    let devtools = false
    const interval1 = setInterval(() => {
      const before = new Date().getTime()
      // This will be slow if DevTools is open
      debugger
      const after = new Date().getTime()
      if (after - before > 100) {
        devtools = true
        this.triggerProtection()
      }
    }, 1000)
    this.intervals.push(interval1)

    // Method 2: Element detection
    const interval2 = setInterval(() => {
      const element = new Image()
      Object.defineProperty(element, 'id', {
        get: () => {
          devtools = true
          this.triggerProtection()
        }
      })
      console.log(element)
    }, 1000)
    this.intervals.push(interval2)

    // Method 3: Function toString detection
    const interval3 = setInterval(() => {
      if (console.log.toString().indexOf('native code') === -1) {
        this.triggerProtection()
      }
    }, 1000)
    this.intervals.push(interval3)
  }

  // Obfuscate DOM elements
  private obfuscateDOM() {
    if (typeof window === 'undefined') return

    // Hide all data attributes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element
              // Remove data attributes
              Array.from(element.attributes).forEach(attr => {
                if (attr.name.startsWith('data-')) {
                  element.removeAttribute(attr.name)
                }
              })
            }
          })
        }
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    // Randomize class names periodically
    setInterval(() => {
      document.querySelectorAll('*').forEach(el => {
        if (el.className && typeof el.className === 'string') {
          const classes = el.className.split(' ')
          const randomizedClasses = classes.map(cls => 
            cls + '_' + Math.random().toString(36).substr(2, 5)
          )
          el.className = randomizedClasses.join(' ')
        }
      })
    }, 5000)
  }

  // Block element inspection
  private blockInspection() {
    if (typeof window === 'undefined') return

    // Override element methods
    const originalGetElementById = document.getElementById
    document.getElementById = function() { return null }

    const originalQuerySelector = document.querySelector
    document.querySelector = function() { return null }

    const originalQuerySelectorAll = document.querySelectorAll
    document.querySelectorAll = function() { return [] as any }

    // Block element access
    Object.defineProperty(Element.prototype, 'innerHTML', {
      get: () => '',
      set: () => {}
    })

    Object.defineProperty(Element.prototype, 'outerHTML', {
      get: () => '',
      set: () => {}
    })
  }

  // Anti-tamper protection
  private antiTamper() {
    if (typeof window === 'undefined') return

    // Protect window object
    const originalWindow = { ...window }
    
    setInterval(() => {
      // Check if window has been modified
      const currentKeys = Object.keys(window)
      const originalKeys = Object.keys(originalWindow)
      
      if (currentKeys.length !== originalKeys.length) {
        this.triggerProtection()
      }
    }, 1000)

    // Protect against script injection
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'SCRIPT') {
            node.remove()
            this.triggerProtection()
          }
        })
      })
    })

    observer.observe(document.head, { childList: true })
    observer.observe(document.body, { childList: true })
  }

  // Block view source
  private blockSourceView() {
    if (typeof window === 'undefined') return

    // Override document properties
    Object.defineProperty(document, 'documentElement', {
      get: () => null
    })

    Object.defineProperty(document, 'body', {
      get: () => null
    })

    Object.defineProperty(document, 'head', {
      get: () => null
    })
  }

  // Continuous debugger detection
  private detectDebugger() {
    if (typeof window === 'undefined') return

    const interval = setInterval(() => {
      const start = performance.now()
      debugger
      const end = performance.now()
      
      if (end - start > 100) {
        this.triggerProtection()
      }
    }, 100)
    this.intervals.push(interval)
  }

  // Trigger protection when debug is detected
  private triggerProtection() {
    if (this.debugDetected) return
    this.debugDetected = true

    // Clear page content
    if (document.body) {
      document.body.innerHTML = ''
      document.body.style.background = '#000'
    }

    // Redirect to blank page
    window.location.href = 'about:blank'
    
    // Close window
    setTimeout(() => {
      window.close()
    }, 100)

    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval))
  }

  // Cleanup method
  destroy() {
    this.intervals.forEach(interval => clearInterval(interval))
    this.intervals = []
    this.isProtectionActive = false
  }
}

export default AntiDebugProtection