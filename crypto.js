// GhostPad - Encryption Module
// AES-256-GCM encryption using Web Crypto API

class GhostPadCrypto {
  constructor() {
    this.encryptionKey = null;
    this.algorithm = {
      name: 'AES-GCM',
      length: 256
    };
  }

  // Generate a new encryption key for this session (memory-only)
  async generateSessionKey() {
    try {
      this.encryptionKey = await self.crypto.subtle.generateKey(
        this.algorithm,
        false, // NOT extractable - cannot be exported (more secure)
        ['encrypt', 'decrypt']
      );

      return true;
    } catch (error) {
      console.error('Failed to generate encryption key:', error);
      return false;
    }
  }

  // Encrypt text data
  async encrypt(plaintext) {
    if (!this.encryptionKey) {
      await this.generateSessionKey();
    }

    if (!plaintext) {
      return null;
    }

    try {
      // Generate a random IV (Initialization Vector)
      const iv = self.crypto.getRandomValues(new Uint8Array(12));

      // Convert plaintext to bytes
      const encoder = new TextEncoder();
      const data = encoder.encode(plaintext);

      // Encrypt the data
      const encrypted = await self.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        this.encryptionKey,
        data
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      // Convert to base64 for storage
      return this.arrayBufferToBase64(combined);
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  }

  // Decrypt encrypted data
  async decrypt(encryptedData) {
    if (!this.encryptionKey) {
      console.error('No encryption key available');
      return null;
    }

    if (!encryptedData) {
      return '';
    }

    try {
      // Convert from base64
      const combined = this.base64ToArrayBuffer(encryptedData);

      // Extract IV and encrypted data
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      // Decrypt the data
      const decrypted = await self.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        this.encryptionKey,
        encrypted
      );

      // Convert back to text
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  // Helper: Convert ArrayBuffer to Base64
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Helper: Convert Base64 to ArrayBuffer
  base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  // Check if encryption is available
  isAvailable() {
    return typeof self.crypto !== 'undefined' &&
           typeof self.crypto.subtle !== 'undefined' &&
           this.encryptionKey !== null;
  }
}

// Export for use in other modules
if (typeof self !== 'undefined') {
  self.GhostPadCrypto = GhostPadCrypto;
}
