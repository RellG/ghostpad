// GhostPad - Background Service Worker
// Manages data lifecycle, encryption, and automatic cleanup

// ============================================================================
// GhostPad - Encryption Module (Inlined for MV3 Compatibility)
// AES-256-GCM encryption using Web Crypto API
// ============================================================================

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

// ============================================================================
// End Encryption Module
// ============================================================================

// Store for active session data
let sessionData = {
  notes: {},
  activeNoteId: null,
  settings: {},
  isPremium: false,
  isPasswordUnlocked: false // Use flag instead of storing password
};

// Encryption instance
let cryptoInstance = null;

// Premium features
const FREE_NOTE_LIMIT = 3;
const MAX_NOTE_LIMIT = 1000; // Absolute maximum
const RATE_LIMIT_WINDOW = 1000; // 1 second
const RATE_LIMIT_MAX = 5; // Max 5 notes per second

// Rate limiting tracker
let noteCreationTimestamps = [];

// Initialize encryption on demand (only used for encrypted exports)
async function initializeCrypto() {
  if (!cryptoInstance) {
    cryptoInstance = new GhostPadCrypto();
    await cryptoInstance.generateSessionKey();
  }
}

// Initialize extension
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // First time installation
    await initializeDefaultSettings();
    await createWelcomeNote();
  }
});

// Load data when extension starts
chrome.runtime.onStartup.addListener(async () => {
  await loadSessionData();
});

// Handle messages from popup and other components
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle async messages properly to avoid memory leaks
  handleMessage(request, sender, sendResponse)
    .catch(error => {
      console.error('Message handler error:', error);
      sendResponse({ success: false, error: error.message });
    });
  return true; // Keep channel open for async response
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === 'new_note') {
    chrome.runtime.sendMessage({ action: 'createNewNote' });
  } else if (command === 'clear_current') {
    chrome.runtime.sendMessage({ action: 'clearCurrentNote' });
  }
});

// Clear all data when browser closes
chrome.runtime.onSuspend.addListener(() => {
  chrome.storage.session.clear();
});

// Message handler
async function handleMessage(request, sender, sendResponse) {
  try {
    switch (request.action) {
      case 'getAllNotes':
        await loadSessionData();
        // Notes are stored in plaintext now, no decryption needed
        sendResponse({ notes: sessionData.notes, activeNoteId: sessionData.activeNoteId });
        break;

      case 'getNote':
        await loadSessionData();
        const note = sessionData.notes[request.noteId];
        sendResponse({ note: note });
        break;

      case 'saveNote':
        // Store notes in plaintext in session storage
        // They are still secure due to session storage isolation and auto-delete

        // Check if note exists
        if (!sessionData.notes[request.noteId]) {
          sendResponse({
            success: false,
            error: 'Note no longer exists'
          });
          break;
        }

        sessionData.notes[request.noteId] = {
          ...sessionData.notes[request.noteId],
          ...request.note,
          encrypted: false, // No longer encrypting for storage
          lastModified: Date.now()
        };

        try {
          await chrome.storage.session.set({ notes: sessionData.notes });
          sendResponse({ success: true });
        } catch (error) {
          sendResponse({ success: false, error: 'Failed to save note' });
        }
        break;

      case 'createNote': {
        // Rate limiting check
        const now = Date.now();
        noteCreationTimestamps = noteCreationTimestamps
          .filter(t => now - t < RATE_LIMIT_WINDOW)
          .slice(-100); // Keep only last 100 entries max to prevent memory leak

        if (noteCreationTimestamps.length >= RATE_LIMIT_MAX) {
          sendResponse({
            success: false,
            error: 'rate_limit',
            message: 'Too many notes created too quickly. Please wait a moment.'
          });
          break;
        }

        // Check note limit for free tier
        const noteCount = Object.keys(sessionData.notes).length;
        const settings = await chrome.storage.local.get(['isPremium']);
        const userIsPremium = settings.isPremium || false;

        // Absolute maximum check (even for premium)
        if (noteCount >= MAX_NOTE_LIMIT) {
          sendResponse({
            success: false,
            error: 'max_limit',
            message: `Maximum of ${MAX_NOTE_LIMIT} notes reached. Please delete some notes.`
          });
          break;
        }

        if (!userIsPremium && noteCount >= FREE_NOTE_LIMIT) {
          sendResponse({
            success: false,
            error: 'note_limit',
            message: `Free tier limited to ${FREE_NOTE_LIMIT} notes. Upgrade to Premium for unlimited notes!`
          });
          break;
        }

        // Track this creation for rate limiting
        noteCreationTimestamps.push(now);

        // Sanitize and validate title
        const sanitizeTitle = (title) => {
          if (!title || typeof title !== 'string') return 'Untitled';
          // Remove control characters and HTML brackets
          return title
            .replace(/[\x00-\x1F\x7F]/g, '') // Remove control chars
            .replace(/[<>]/g, '') // Remove HTML brackets for safety
            .trim()
            .substring(0, 100); // Max 100 chars
        };

        const newNoteId = generateNoteId();
        const newNote = {
          id: newNoteId,
          title: sanitizeTitle(request.title),
          content: '',
          created: Date.now(),
          lastModified: Date.now(),
          encrypted: false
        };
        sessionData.notes[newNoteId] = newNote;
        sessionData.activeNoteId = newNoteId;

        try {
          await chrome.storage.session.set({
            notes: sessionData.notes,
            activeNoteId: newNoteId
          });
          sendResponse({ success: true, noteId: newNoteId, note: newNote });
        } catch (error) {
          sendResponse({ success: false, error: 'Failed to create note' });
        }
        break;
      }

      case 'deleteNote':
        delete sessionData.notes[request.noteId];

        // If this was the active note, select another one
        if (sessionData.activeNoteId === request.noteId) {
          const noteIds = Object.keys(sessionData.notes);
          sessionData.activeNoteId = noteIds.length > 0 ? noteIds[0] : null;
        }

        try {
          await chrome.storage.session.set({
            notes: sessionData.notes,
            activeNoteId: sessionData.activeNoteId
          });
          sendResponse({ success: true, activeNoteId: sessionData.activeNoteId });
        } catch (error) {
          sendResponse({ success: false, error: 'Failed to delete note' });
        }
        break;

      case 'setActiveNote':
        sessionData.activeNoteId = request.noteId;
        await chrome.storage.session.set({ activeNoteId: request.noteId });
        sendResponse({ success: true });
        break;

      case 'clearAllNotes':
        sessionData.notes = {};
        sessionData.activeNoteId = null;
        await chrome.storage.session.clear();
        sendResponse({ success: true });
        break;

      case 'exportNotes':
        await loadSessionData();
        const manifest = chrome.runtime.getManifest();
        const exportData = {
          version: manifest.version,
          exportFormat: '1.0',
          exported: new Date().toISOString(),
          notes: Object.values(sessionData.notes)
        };
        sendResponse({ success: true, data: exportData });
        break;

      case 'getPremiumStatus': {
        // Check sync storage first (cross-device), then fallback to local
        const syncSettings = await chrome.storage.sync.get(['isPremium']);
        const localSettings = await chrome.storage.local.get(['isPremium']);
        const premiumStatus = syncSettings.isPremium || localSettings.isPremium || false;
        sendResponse({ isPremium: premiumStatus });
        break;
      }

      case 'setPremiumStatus':
      case 'setPremium':
        // Save to both local and sync storage for cross-device sync
        await chrome.storage.local.set({ isPremium: request.isPremium });
        await chrome.storage.sync.set({ isPremium: request.isPremium });
        sessionData.isPremium = request.isPremium;
        sendResponse({ success: true });
        break;

      case 'setMasterPassword':
        // Hash password and store with salt
        if (request.password) {
          const { hash, salt } = await hashPassword(request.password);
          await chrome.storage.local.set({
            masterPasswordEnabled: true,
            masterPasswordHash: hash,
            masterPasswordSalt: salt
          });
          sessionData.isPasswordUnlocked = true;
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false, error: 'No password provided' });
        }
        break;

      case 'verifyMasterPassword':
        const storedData = await chrome.storage.local.get(['masterPasswordHash', 'masterPasswordSalt']);
        if (storedData.masterPasswordHash && storedData.masterPasswordSalt) {
          const isValid = await verifyPassword(request.password, storedData.masterPasswordHash, storedData.masterPasswordSalt);
          if (isValid) {
            sessionData.isPasswordUnlocked = true;
          }
          sendResponse({ success: isValid });
        } else {
          sendResponse({ success: false, error: 'No password set' });
        }
        break;

      case 'removeMasterPassword':
        await chrome.storage.local.set({
          masterPasswordEnabled: false,
          masterPasswordHash: null,
          masterPasswordSalt: null
        });
        sessionData.isPasswordUnlocked = false;
        sendResponse({ success: true });
        break;

      case 'getMasterPasswordStatus':
        const passwordStatus = await chrome.storage.local.get(['masterPasswordEnabled']);
        sendResponse({
          enabled: passwordStatus.masterPasswordEnabled || false,
          unlocked: sessionData.isPasswordUnlocked
        });
        break;

      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Error handling message:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Helper functions
async function decryptNote(note) {
  if (!note) return null;

  // If note is encrypted and we have crypto available
  if (note.encrypted && cryptoInstance && note.content) {
    try {
      const decryptedContent = await cryptoInstance.decrypt(note.content);
      return {
        ...note,
        content: decryptedContent || note.content
      };
    } catch (error) {
      console.error('Failed to decrypt note:', error);
      // Return note with error message for user
      return {
        ...note,
        content: '⚠️ DECRYPTION FAILED\n\nThis note cannot be decrypted. This may happen if:\n- The browser was restarted (encryption keys are memory-only)\n- The note was created in a different session\n\nYour encrypted data is safe but cannot be recovered in this session.\n\n---\nEncrypted content (backup):\n' + note.content,
        decryptionFailed: true
      };
    }
  }

  return note;
}

async function loadSessionData() {
  const data = await chrome.storage.session.get(['notes', 'activeNoteId']);
  sessionData.notes = data.notes || {};
  sessionData.activeNoteId = data.activeNoteId || null;

  // If no notes exist, create a default one
  if (Object.keys(sessionData.notes).length === 0) {
    await createDefaultNote();
  }
}

async function createDefaultNote() {
  const noteId = generateNoteId();
  const note = {
    id: noteId,
    title: 'Quick Notes',
    content: '',
    created: Date.now(),
    lastModified: Date.now(),
    encrypted: false
  };
  sessionData.notes[noteId] = note;
  sessionData.activeNoteId = noteId;
  await chrome.storage.session.set({
    notes: sessionData.notes,
    activeNoteId: noteId
  });
}

async function initializeDefaultSettings() {
  await chrome.storage.local.set({
    theme: 'dark',
    fontSize: 14,
    fontFamily: 'monospace',
    autoSave: true,
    confirmDelete: true,
    enableNotifications: true,
    isPremium: false,
    masterPasswordEnabled: false
  });
}

// Create welcome note for new users
async function createWelcomeNote() {
  const welcomeContent = `👻 Welcome to GhostPad!

Your notes are stored in session-only memory and automatically deleted when you close your browser. Perfect for sensitive information and temporary work!

🔒 PRIVACY-FIRST
• Session-only storage (auto-clears on browser close)
• No cloud sync, no tracking, completely private
• All data stays local on your device

✨ KEY FEATURES
• Multiple note tabs for organization
• Privacy blur & lock mode
• Markdown preview support
• Full-text search across all notes
• Export/Import functionality
• Dark and light themes

⌨️ KEYBOARD SHORTCUTS
• Ctrl+Shift+G - Open GhostPad
• Ctrl+Shift+N - New note
• Ctrl+Shift+Delete - Clear current note
• Ctrl+F - Search

💰 PREMIUM ($1.99/month)
• Free tier: 3 notes maximum
• Premium: Unlimited notes
• All other features included in free tier!

🚀 GET STARTED
1. Start typing - your notes save automatically
2. Create new tabs to organize thoughts
3. Double-click any tab title to rename it ✏️
4. Export important notes before closing browser
5. Close browser - everything disappears!

💡 TIP: Hover over any tab to see the edit icon (✏️), then double-click to rename!

Click the ⚙️ icon above to customize your experience.

---
This welcome note will remain until you delete it. Feel free to use this space for your first note!`;

  const welcomeNote = {
    id: generateNoteId(),
    title: 'Welcome to GhostPad',
    content: welcomeContent,
    created: Date.now(),
    lastModified: Date.now(),
    encrypted: false
  };

  sessionData.notes[welcomeNote.id] = welcomeNote;
  sessionData.activeNoteId = welcomeNote.id;

  // Save to session storage
  await chrome.storage.session.set({
    notes: sessionData.notes,
    activeNoteId: sessionData.activeNoteId
  });
}

function generateNoteId() {
  return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Password hashing using PBKDF2 with salt (secure)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const salt = self.crypto.getRandomValues(new Uint8Array(16));

  const passwordKey = await self.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await self.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    256
  );

  return {
    hash: Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join(''),
    salt: Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('')
  };
}

async function verifyPassword(password, storedHash, storedSalt) {
  const encoder = new TextEncoder();
  const salt = new Uint8Array(storedSalt.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

  const passwordKey = await self.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await self.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    256
  );

  const hash = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');

  // Constant-time comparison to prevent timing attacks
  return constantTimeCompare(hash, storedHash);
}

// Constant-time string comparison to prevent timing attacks
function constantTimeCompare(a, b) {
  // Always compare same length to prevent timing leaks
  let diff = a.length ^ b.length;
  const maxLen = Math.max(a.length, b.length);

  for (let i = 0; i < maxLen; i++) {
    const aChar = i < a.length ? a.charCodeAt(i) : 0;
    const bChar = i < b.length ? b.charCodeAt(i) : 0;
    diff |= aChar ^ bChar;
  }
  return diff === 0;
}

// Encrypt data with password (PBKDF2 + AES-256-GCM)
async function encryptWithPassword(data, password) {
  const encoder = new TextEncoder();
  const salt = self.crypto.getRandomValues(new Uint8Array(16));

  // Derive key from password
  const passwordKey = await self.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const derivedKey = await self.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  // Encrypt data
  const iv = self.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await self.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    derivedKey,
    encoder.encode(data)
  );

  // Combine salt + IV + encrypted data
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);

  // Return as base64
  return btoa(String.fromCharCode(...combined));
}

async function clearNoteById(noteId) {
  if (sessionData.notes[noteId]) {
    sessionData.notes[noteId].content = '';
    sessionData.notes[noteId].lastModified = Date.now();
    await chrome.storage.session.set({ notes: sessionData.notes });

    // Notify the popup if it's open
    chrome.runtime.sendMessage({
      action: 'noteCleared',
      noteId: noteId
    }).catch(() => {
      // Popup might not be open, ignore error
    });
  }
}
