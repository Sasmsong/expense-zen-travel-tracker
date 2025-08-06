// Security utilities for client-side data protection and validation

// Encryption/Decryption utilities using Web Crypto API
export class SecureStorage {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12;

  // Generate a key from user's device fingerprint or default
  private static async generateKey(): Promise<CryptoKey> {
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode('expense-tracker-key-2024'), // In production, use device-specific data
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('expense-salt'),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt data before storing in localStorage
  static async encrypt(data: string): Promise<string> {
    try {
      const key = await this.generateKey();
      const iv = window.crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
      const encodedData = new TextEncoder().encode(data);

      const encrypted = await window.crypto.subtle.encrypt(
        { name: this.ALGORITHM, iv },
        key,
        encodedData
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      // Fallback to unencrypted storage if encryption fails
      return data;
    }
  }

  // Decrypt data from localStorage
  static async decrypt(encryptedData: string): Promise<string> {
    try {
      const key = await this.generateKey();
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      );

      const iv = combined.slice(0, this.IV_LENGTH);
      const encrypted = combined.slice(this.IV_LENGTH);

      const decrypted = await window.crypto.subtle.decrypt(
        { name: this.ALGORITHM, iv },
        key,
        encrypted
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      // Return original data if decryption fails (backwards compatibility)
      return encryptedData;
    }
  }

  // Secure localStorage wrapper
  static async setItem(key: string, value: string): Promise<void> {
    const encrypted = await this.encrypt(value);
    localStorage.setItem(key, encrypted);
  }

  static async getItem(key: string): Promise<string | null> {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    // Try to decrypt, fall back to original if it fails
    return await this.decrypt(item);
  }

  static removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}

// Input validation and sanitization
export class InputValidator {
  // Sanitize text input to prevent XSS
  static sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim()
      .slice(0, 500); // Limit length
  }

  // Validate and sanitize expense amount
  static validateAmount(amount: string | number): number {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(num) || !isFinite(num)) return 0;
    if (num < 0) return 0;
    if (num > 1000000) return 1000000; // Max $1M per expense
    
    return Math.round(num * 100) / 100; // Round to 2 decimal places
  }

  // Validate currency code
  static validateCurrency(currency: string): string {
    const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'HKD', 'SGD', 'CNY'];
    return validCurrencies.includes(currency) ? currency : 'USD';
  }

  // Validate date input
  static validateDate(date: string): string {
    try {
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) return new Date().toISOString().split('T')[0];
      
      // Don't allow dates too far in the future or past
      const now = new Date();
      const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
      const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      
      if (parsed < twoYearsAgo || parsed > oneYearFromNow) {
        return new Date().toISOString().split('T')[0];
      }
      
      return date;
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }

  // Validate and sanitize tags
  static validateTags(tags: string[]): string[] {
    if (!Array.isArray(tags)) return [];
    
    return tags
      .map(tag => this.sanitizeText(tag))
      .filter(tag => tag.length > 0 && tag.length <= 50)
      .slice(0, 10); // Max 10 tags
  }

  // Validate merchant name
  static validateMerchant(merchant: string): string {
    const sanitized = this.sanitizeText(merchant);
    return sanitized.length > 0 ? sanitized : 'Unknown Merchant';
  }

  // Validate category
  static validateCategory(category: string): string {
    const sanitized = this.sanitizeText(category);
    return sanitized.length > 0 ? sanitized : 'Other';
  }
}

// File validation for image uploads
export class FileValidator {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  static validateImageFile(file: File): { isValid: boolean; error?: string } {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return { isValid: false, error: 'File size must be less than 10MB' };
    }

    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return { isValid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
    }

    // Check file name for suspicious patterns
    const suspiciousPatterns = /[<>:"\\|?*]/;
    if (suspiciousPatterns.test(file.name)) {
      return { isValid: false, error: 'Invalid file name' };
    }

    return { isValid: true };
  }

  // Validate base64 image data
  static validateBase64Image(base64: string): boolean {
    if (!base64 || typeof base64 !== 'string') return false;
    
    // Check if it's a valid base64 image format
    const validPrefixes = [
      'data:image/jpeg;base64,',
      'data:image/jpg;base64,',
      'data:image/png;base64,',
      'data:image/webp;base64,'
    ];

    return validPrefixes.some(prefix => base64.startsWith(prefix));
  }
}

// Security monitoring
export class SecurityMonitor {
  private static eventCount: { [key: string]: number } = {};
  private static readonly MAX_EVENTS_PER_MINUTE = 10;

  // Rate limiting for sensitive operations
  static checkRateLimit(operation: string): boolean {
    const now = Date.now();
    const key = `${operation}_${Math.floor(now / 60000)}`; // Per minute
    
    this.eventCount[key] = (this.eventCount[key] || 0) + 1;
    
    if (this.eventCount[key] > this.MAX_EVENTS_PER_MINUTE) {
      console.warn(`Rate limit exceeded for operation: ${operation}`);
      return false;
    }
    
    return true;
  }

  // Log security events (client-side only)
  static logSecurityEvent(event: string, details?: any): void {
    console.warn(`Security Event: ${event}`, details);
    
    // In a real app, you might send this to a logging service
    // For now, we'll just log to console and localStorage
    try {
      const logs = JSON.parse(localStorage.getItem('security-logs') || '[]');
      logs.push({
        timestamp: new Date().toISOString(),
        event,
        details,
        userAgent: navigator.userAgent
      });
      
      // Keep only last 100 logs
      const recentLogs = logs.slice(-100);
      localStorage.setItem('security-logs', JSON.stringify(recentLogs));
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
}
