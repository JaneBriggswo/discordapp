// Crypto utilities for secure authentication
import CryptoJS from 'crypto-js'

// Get secrets from environment variables - NEVER hardcode
const getSecret = (key: string): string => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export class SecurityManager {
  private static getAuthSecret(): string {
    return getSecret('AUTH_SECRET')
  }

  private static getEncryptionKey(): string {
    return getSecret('ENCRYPTION_KEY')
  }

  // Generate secure session token
  static generateSessionToken(discordId: string): string {
    const timestamp = Date.now()
    const randomBytes = CryptoJS.lib.WordArray.random(32).toString()
    const payload = {
      discordId,
      timestamp,
      nonce: randomBytes,
      fingerprint: this.generateFingerprint(),
      sessionId: CryptoJS.lib.WordArray.random(16).toString()
    }
    
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(payload), this.getEncryptionKey()).toString()
    const signature = CryptoJS.HmacSHA256(encrypted, this.getAuthSecret()).toString()
    
    return `${encrypted}.${signature}`
  }

  // Validate session token
  static validateSessionToken(token: string): { valid: boolean; discordId?: string; sessionId?: string } {
    try {
      if (!token || typeof token !== 'string') {
        return { valid: false }
      }

      const parts = token.split('.')
      if (parts.length !== 2) {
        return { valid: false }
      }

      const [encrypted, signature] = parts
      
      // Verify signature
      const expectedSignature = CryptoJS.HmacSHA256(encrypted, this.getAuthSecret()).toString()
      if (signature !== expectedSignature) {
        return { valid: false }
      }

      // Decrypt payload
      const decrypted = CryptoJS.AES.decrypt(encrypted, this.getEncryptionKey()).toString(CryptoJS.enc.Utf8)
      if (!decrypted) {
        return { valid: false }
      }

      const payload = JSON.parse(decrypted)

      // Validate payload structure
      if (!payload.discordId || !payload.timestamp || !payload.fingerprint || !payload.sessionId) {
        return { valid: false }
      }

      // Check expiration
      const now = Date.now()
      const tokenAge = now - payload.timestamp
      const maxAge = parseInt(process.env.SESSION_TIMEOUT || '86400000') // 24 hours default

      if (tokenAge > maxAge) {
        return { valid: false }
      }

      // Verify fingerprint (if in browser)
      if (typeof window !== 'undefined' && payload.fingerprint !== this.generateFingerprint()) {
        return { valid: false }
      }

      return { 
        valid: true, 
        discordId: payload.discordId,
        sessionId: payload.sessionId
      }
    } catch (error) {
      console.error('Token validation error:', error)
      return { valid: false }
    }
  }

  // Generate browser fingerprint
  static generateFingerprint(): string {
    if (typeof window === 'undefined') return 'server'
    
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.textBaseline = 'top'
        ctx.font = '14px Arial'
        ctx.fillText('Pink Remote Fingerprint', 2, 2)
      }
      
      const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height + 'x' + screen.colorDepth,
        new Date().getTimezoneOffset(),
        canvas.toDataURL(),
        navigator.hardwareConcurrency || 0,
        navigator.deviceMemory || 0
      ].join('|')
      
      return CryptoJS.SHA256(fingerprint).toString()
    } catch (error) {
      // Fallback fingerprint
      return CryptoJS.SHA256(navigator.userAgent + screen.width + screen.height).toString()
    }
  }

  // Rate limiting with secure storage
  static checkRateLimit(identifier: string): boolean {
    try {
      const key = `rate_limit_${CryptoJS.SHA256(identifier).toString()}`
      const stored = localStorage.getItem(key)
      const attempts = stored ? JSON.parse(stored) : []
      const now = Date.now()
      
      const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW || '900000') // 15 minutes default
      const maxAttempts = parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS || '5')
      
      // Remove attempts older than window
      const recentAttempts = attempts.filter((time: number) => now - time < windowMs)
      
      // Check if limit exceeded
      if (recentAttempts.length >= maxAttempts) {
        return false
      }
      
      // Add current attempt
      recentAttempts.push(now)
      localStorage.setItem(key, JSON.stringify(recentAttempts))
      return true
    } catch (error) {
      console.error('Rate limit check error:', error)
      return false
    }
  }

  // Generate CSRF token
  static generateCSRFToken(): string {
    return CryptoJS.lib.WordArray.random(32).toString()
  }

  // Validate CSRF token
  static validateCSRFToken(token: string, expected: string): boolean {
    if (!token || !expected || typeof token !== 'string' || typeof expected !== 'string') {
      return false
    }
    return token === expected
  }

  // Secure random string generation
  static generateSecureRandom(length: number = 32): string {
    return CryptoJS.lib.WordArray.random(length).toString()
  }

  // Hash sensitive data
  static hashSensitiveData(data: string): string {
    return CryptoJS.SHA256(data + this.getAuthSecret()).toString()
  }
}