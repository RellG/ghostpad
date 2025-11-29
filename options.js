// GhostPad Pro - Options Page Script
// Handles settings management and user preferences

class SettingsManager {
  constructor() {
    this.defaultSettings = {
      theme: 'dark',
      fontSize: 14,
      fontFamily: 'monospace',
      confirmDelete: true,
      defaultTimer: 0,
      autoSave: true,
      spellCheck: true,
      lineNumbers: false,
      enableNotifications: true,
      notificationSound: false
    };

    this.settings = {};
    this.init();
  }

  async init() {
    await this.loadSettings();
    await this.migratePremiumToSync();
    await this.loadPremiumStatus();
    await this.autoDetectPremium();
    this.setupEventListeners();
    this.setupPremiumListeners();
    this.applyTheme();
  }

  async loadSettings() {
    const result = await chrome.storage.local.get(Object.keys(this.defaultSettings));

    // Merge with defaults
    this.settings = { ...this.defaultSettings, ...result };

    // Apply to UI
    this.applySettingsToUI();
  }

  applySettingsToUI() {
    // Theme
    document.getElementById('theme').value = this.settings.theme;

    // Font Size
    document.getElementById('fontSize').value = this.settings.fontSize;
    document.getElementById('fontSizeValue').textContent = this.settings.fontSize + 'px';

    // Font Family
    document.getElementById('fontFamily').value = this.settings.fontFamily;

    // Checkboxes
    document.getElementById('confirmDelete').checked = this.settings.confirmDelete;
    document.getElementById('autoSave').checked = this.settings.autoSave;
    document.getElementById('spellCheck').checked = this.settings.spellCheck;
    document.getElementById('lineNumbers').checked = this.settings.lineNumbers;
    document.getElementById('enableNotifications').checked = this.settings.enableNotifications;
    document.getElementById('notificationSound').checked = this.settings.notificationSound;

    // Default Timer
    document.getElementById('defaultTimer').value = this.settings.defaultTimer;
  }

  setupEventListeners() {
    // Theme
    document.getElementById('theme').addEventListener('change', (e) => {
      this.updateSetting('theme', e.target.value);
      this.applyTheme();
    });

    // Font Size
    document.getElementById('fontSize').addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      document.getElementById('fontSizeValue').textContent = value + 'px';
      this.updateSetting('fontSize', value);
    });

    // Font Family
    document.getElementById('fontFamily').addEventListener('change', (e) => {
      this.updateSetting('fontFamily', e.target.value);
    });

    // Checkboxes
    const checkboxes = [
      'confirmDelete',
      'autoSave',
      'spellCheck',
      'lineNumbers',
      'enableNotifications',
      'notificationSound'
    ];

    checkboxes.forEach((id) => {
      document.getElementById(id).addEventListener('change', (e) => {
        this.updateSetting(id, e.target.checked);
      });
    });

    // Default Timer
    document.getElementById('defaultTimer').addEventListener('change', (e) => {
      this.updateSetting('defaultTimer', parseInt(e.target.value));
    });

    // Reset button
    document.getElementById('resetBtn').addEventListener('click', () => {
      this.resetToDefaults();
    });

    // Export settings
    document.getElementById('exportSettingsBtn').addEventListener('click', () => {
      this.exportSettings();
    });
  }

  setupPremiumListeners() {
    // Upgrade button - Opens Stripe payment link
    document.getElementById('upgradeButton').addEventListener('click', () => {
      chrome.tabs.create({ url: GhostPadConfig.STRIPE_PAYMENT_URL });
    });

    // Activate button - Verifies premium with email
    document.getElementById('activateButton').addEventListener('click', () => {
      this.activatePremium();
    });

    // Enter key in email input
    document.getElementById('activationEmail').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.activatePremium();
      }
    });
  }

  async migratePremiumToSync() {
    try {
      // Check both local and sync storage
      const local = await chrome.storage.local.get(['isPremium', 'premiumEmail']);
      const sync = await chrome.storage.sync.get(['isPremium', 'premiumEmail']);

      // Migrate from local to sync if exists locally but not in sync
      if (local.isPremium && !sync.isPremium) {
        await chrome.storage.sync.set({
          isPremium: local.isPremium,
          premiumEmail: local.premiumEmail
        });
        console.log('✅ Migrated premium status to sync storage');
      }
    } catch (error) {
      console.error('Error migrating premium status:', error);
    }
  }

  async loadPremiumStatus() {
    try {
      // Check sync storage first (cross-device), then fallback to local
      const sync = await chrome.storage.sync.get(['isPremium', 'premiumEmail']);
      const local = await chrome.storage.local.get(['isPremium', 'premiumEmail']);

      const isPremium = sync.isPremium || local.isPremium || false;
      const premiumEmail = sync.premiumEmail || local.premiumEmail || '';

      this.updatePremiumUI(isPremium, premiumEmail);
    } catch (error) {
      console.error('Error loading premium status:', error);
    }
  }

  async autoDetectPremium() {
    try {
      // Skip if already premium
      const sync = await chrome.storage.sync.get(['isPremium']);
      if (sync.isPremium) {
        return; // Already premium, no need to auto-detect
      }

      // Try to get user's Google account email
      chrome.identity.getProfileUserInfo({ accountStatus: 'ANY' }, async (userInfo) => {
        if (chrome.runtime.lastError) {
          console.log('Identity API not available:', chrome.runtime.lastError);
          return;
        }

        if (userInfo && userInfo.email) {
          console.log('🔍 Auto-detecting premium status for:', userInfo.email);

          // Check if this email is premium
          try {
            const response = await fetch(`${GhostPadConfig.API_URL}/verify-premium`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: userInfo.email })
            });

            const data = await response.json();

            if (data.success && data.isPremium) {
              // Auto-activate premium!
              await chrome.storage.sync.set({
                isPremium: true,
                premiumEmail: userInfo.email
              });
              await chrome.storage.local.set({
                isPremium: true,
                premiumEmail: userInfo.email
              });

              // Notify background script
              await chrome.runtime.sendMessage({
                action: 'setPremium',
                isPremium: true
              });

              // Update UI
              this.updatePremiumUI(true, userInfo.email);
              this.showActivationStatus('success', '🎉 Premium auto-activated! You now have unlimited notes.');

              console.log('✅ Premium auto-activated for:', userInfo.email);
            } else {
              console.log('ℹ️ Email not found in premium users:', userInfo.email);
            }
          } catch (error) {
            console.log('Error auto-detecting premium:', error);
          }
        }
      });
    } catch (error) {
      console.error('Error in auto-detection:', error);
    }
  }

  updatePremiumUI(isPremium, email = '') {
    const statusBadge = document.getElementById('statusBadge');
    const statusDescription = document.getElementById('statusDescription');
    const activationSection = document.getElementById('activationSection');

    if (isPremium) {
      statusBadge.textContent = '⭐ Premium';
      statusBadge.classList.add('premium');
      statusDescription.textContent = `Unlimited notes • ${email}`;
      activationSection.classList.add('hidden');
    } else {
      statusBadge.textContent = 'Free Tier';
      statusBadge.classList.remove('premium');
      statusDescription.textContent = '3 notes maximum';
      activationSection.classList.remove('hidden');
    }
  }

  async activatePremium() {
    const emailInput = document.getElementById('activationEmail');
    const activateButton = document.getElementById('activateButton');
    const statusDiv = document.getElementById('activationStatus');
    const email = emailInput.value.trim();

    // Validate email
    if (!email || !email.includes('@')) {
      this.showActivationStatus('error', 'Please enter a valid email address');
      return;
    }

    // Disable button during verification
    activateButton.disabled = true;
    activateButton.textContent = 'Verifying...';
    this.showActivationStatus('info', 'Verifying your premium status...');

    try {
      // Call Railway API to verify premium
      const response = await fetch(`${GhostPadConfig.API_URL}/verify-premium`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success && data.isPremium) {
        // Premium verified! Save to both local and sync storage
        await chrome.storage.local.set({
          isPremium: true,
          premiumEmail: email
        });
        await chrome.storage.sync.set({
          isPremium: true,
          premiumEmail: email
        });

        // Notify background script
        await chrome.runtime.sendMessage({
          action: 'setPremium',
          isPremium: true
        });

        this.showActivationStatus('success', '🎉 Premium activated! You now have unlimited notes.');
        this.updatePremiumUI(true, email);
        emailInput.value = '';

        // Refresh after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        this.showActivationStatus(
          'error',
          `Email not found in premium users. Please ensure you've completed payment and used the same email.`
        );
      }
    } catch (error) {
      console.error('Premium activation error:', error);
      this.showActivationStatus(
        'error',
        `Verification failed. Please check your internet connection and try again. If you just paid, please wait a few minutes for the payment to process.`
      );
    } finally {
      activateButton.disabled = false;
      activateButton.textContent = 'Activate';
    }
  }

  showActivationStatus(type, message) {
    const statusDiv = document.getElementById('activationStatus');
    statusDiv.className = `activation-status ${type}`;
    statusDiv.textContent = message;

    if (type !== 'info') {
      setTimeout(() => {
        if (!statusDiv.classList.contains('success')) {
          statusDiv.className = 'activation-status';
        }
      }, 5000);
    }
  }

  async updateSetting(key, value) {
    this.settings[key] = value;
    await chrome.storage.local.set({ [key]: value });
    this.showSaveIndicator();
  }

  applyTheme() {
    if (this.settings.theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }

  showSaveIndicator() {
    const indicator = document.getElementById('saveIndicator');
    indicator.classList.add('show');

    setTimeout(() => {
      indicator.classList.remove('show');
    }, 2000);
  }

  async resetToDefaults() {
    if (confirm('Reset all settings to defaults? This action cannot be undone.')) {
      this.settings = { ...this.defaultSettings };
      await chrome.storage.local.set(this.settings);
      this.applySettingsToUI();
      this.applyTheme();
      this.showSaveIndicator();
    }
  }

  exportSettings() {
    const dataStr = JSON.stringify(this.settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `ghostpad_settings_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.settingsManager = new SettingsManager();
});
