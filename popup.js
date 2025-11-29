// GhostPad Pro - Main Popup Script
// Handles UI interactions, note management, and data synchronization

class GhostPadApp {
  constructor() {
    this.notes = {};
    this.activeNoteId = null;
    this.settings = {};
    this.isLocked = false;
    this.isPrivacyMode = false;
    this.searchResults = [];
    this.timers = {};
    this.isPremium = false;
    this.isSwitching = false;
    this.timerIntervalId = null;
    this.autoSaveIntervalId = null;

    this.init();
  }

  async init() {
    await this.loadSettings();
    await this.checkPremiumStatus();
    await this.checkMasterPassword();
    await this.loadNotes();
    this.setupEventListeners();
    this.applyTheme();
    this.startAutoSave();
    this.setupKeyboardShortcuts();
    this.checkTimers();
  }

  async loadSettings() {
    const result = await chrome.storage.local.get([
      'theme',
      'fontSize',
      'fontFamily',
      'confirmDelete',
      'enableNotifications',
      'isPremium'
    ]);

    this.settings = {
      theme: result.theme || 'dark',
      fontSize: result.fontSize || 14,
      fontFamily: result.fontFamily || 'monospace',
      confirmDelete: result.confirmDelete !== false,
      enableNotifications: result.enableNotifications !== false
    };

    this.isPremium = result.isPremium || false;
  }

  async checkPremiumStatus() {
    const response = await chrome.runtime.sendMessage({ action: 'getPremiumStatus' });
    this.isPremium = response?.isPremium || false;
  }

  async checkMasterPassword() {
    const response = await chrome.runtime.sendMessage({ action: 'getMasterPasswordStatus' });

    if (response?.enabled && !response?.unlocked) {
      // Show password unlock modal
      this.showPasswordUnlockModal();
    }
  }

  async loadNotes() {
    // Always get fresh data from background on load
    const response = await chrome.runtime.sendMessage({ action: 'getAllNotes' });

    if (response && response.notes) {
      // Create a deep copy to avoid reference issues
      this.notes = {};
      for (const [id, note] of Object.entries(response.notes)) {
        this.notes[id] = {
          id: note.id,
          title: note.title,
          content: note.content,
          created: note.created,
          lastModified: note.lastModified,
          encrypted: note.encrypted
        };
      }
      this.activeNoteId = response.activeNoteId;
    }

    if (!this.activeNoteId && Object.keys(this.notes).length > 0) {
      this.activeNoteId = Object.keys(this.notes)[0];
    }

    this.renderTabs();
    this.loadActiveNote();
  }

  setupEventListeners() {
    // Header controls
    document.getElementById('searchToggle').addEventListener('click', () => this.toggleSearch());
    document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
    document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());

    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e.target.value));
    document.getElementById('searchClose').addEventListener('click', () => this.toggleSearch());

    // New tab button
    document.getElementById('newTabBtn').addEventListener('click', () => this.createNewNote());

    // Note title removed - now inline in tabs (double-click to rename)

    // Toolbar
    document.getElementById('privacyToggle').addEventListener('click', () => this.togglePrivacy());
    document.getElementById('lockToggle').addEventListener('click', () => this.toggleLock());
    document.getElementById('copyButton').addEventListener('click', () => this.copyToClipboard());
    document.getElementById('downloadBtn').addEventListener('click', () => this.downloadNote());
    document.getElementById('clearButton').addEventListener('click', () => this.clearCurrentNote());

    // Editor
    const notepad = document.getElementById('notepad');
    notepad.addEventListener('input', GhostPadUtils.debounce(() => {
      this.updateNoteContent(notepad.value);
      this.updateStats();
    }, 300));

    // Timer
    document.getElementById('timerSelect').addEventListener('change', (e) => {
      this.setTimer(parseInt(e.target.value));
    });

    // Controls
    document.getElementById('exportBtn').addEventListener('click', () => this.exportNotes());
    document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAllNotes());

    // Modal
    document.getElementById('confirmCancel').addEventListener('click', () => this.hideModal());
    document.getElementById('confirmOk').addEventListener('click', () => this.confirmAction());

    // Background message listener
    chrome.runtime.onMessage.addListener((request) => {
      if (request.action === 'noteCleared') {
        // Update the note in local state
        if (this.notes[request.noteId]) {
          this.notes[request.noteId].content = '';
          this.notes[request.noteId].lastModified = Date.now();
        }

        // If it's the active note, reload it
        if (request.noteId === this.activeNoteId) {
          this.loadActiveNote();
        }
      }
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + F - Search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        this.toggleSearch();
      }

      // Escape - Close search or modal
      if (e.key === 'Escape') {
        if (!document.getElementById('searchBar').classList.contains('hidden')) {
          this.toggleSearch();
        }
        if (!document.getElementById('confirmModal').classList.contains('hidden')) {
          this.hideModal();
        }
      }
    });
  }

  renderTabs() {
    const tabsList = document.getElementById('tabsList');

    // Remove old event listeners by replacing the element (prevents memory leak)
    const newTabsList = tabsList.cloneNode(false);
    tabsList.parentNode.replaceChild(newTabsList, tabsList);

    const sortedNotes = Object.values(this.notes).sort((a, b) => b.lastModified - a.lastModified);

    sortedNotes.forEach((note) => {
      const tab = document.createElement('div');
      tab.className = 'tab' + (note.id === this.activeNoteId ? ' active' : '');
      tab.dataset.noteId = note.id;

      const tabTitle = document.createElement('span');
      tabTitle.className = 'tab-title';
      tabTitle.textContent = GhostPadUtils.truncate(note.title || 'Untitled', 20);
      tabTitle.title = 'Double-click to rename';

      const closeBtn = document.createElement('button');
      closeBtn.className = 'tab-close';
      closeBtn.innerHTML = '×';
      closeBtn.title = 'Delete note';
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteNote(note.id);
      });

      tab.appendChild(tabTitle);
      tab.appendChild(closeBtn);

      // Single click to switch
      tab.addEventListener('click', () => this.switchNote(note.id));

      // Double-click to rename
      tab.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this.startRenamingTab(tab, note.id);
      });

      newTabsList.appendChild(tab);
    });
  }

  startRenamingTab(tab, noteId) {
    if (tab.classList.contains('editing')) return;

    const note = this.notes[noteId];

    // Check if note still exists (may have been deleted by timer)
    if (!note) {
      console.warn('Cannot rename: note no longer exists');
      this.renderTabs(); // Re-render to remove stale tabs
      return;
    }

    const tabTitle = tab.querySelector('.tab-title');

    // Create input element
    const input = document.createElement('input');
    input.type = 'text';
    input.value = note.title || 'Untitled';
    input.maxLength = 100;

    // Insert input before title
    tab.insertBefore(input, tabTitle);
    tab.classList.add('editing');
    input.focus();
    input.select();

    const finishRename = async (save) => {
      if (!tab.classList.contains('editing')) return;

      // Check if note still exists before saving rename
      if (!this.notes[noteId]) {
        console.warn('Cannot finish rename: note no longer exists');
        tab.classList.remove('editing');
        input.remove();
        this.renderTabs(); // Re-render to remove stale tabs
        return;
      }

      if (save && input.value.trim()) {
        const newTitle = input.value.trim();
        this.notes[noteId].title = newTitle;
        tabTitle.textContent = GhostPadUtils.truncate(newTitle, 20);

        // Save to background
        this.updateSaveStatus('saving');
        const response = await chrome.runtime.sendMessage({
          action: 'saveNote',
          noteId: noteId,
          note: {
            title: newTitle,
            content: this.notes[noteId].content,
            lastModified: Date.now()
          }
        });

        if (response && response.success) {
          this.updateSaveStatus('saved');
        } else {
          this.updateSaveStatus('error');
        }
      }

      tab.classList.remove('editing');
      input.remove();
    };

    // Enter to save
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        finishRename(true);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        finishRename(false);
      }
    });

    // Click outside to save
    input.addEventListener('blur', () => {
      setTimeout(() => {
        // Only finish rename if this tab is still the same note (prevent race condition)
        if (tab.dataset.noteId === noteId) {
          finishRename(true);
        }
      }, 100);
    });
  }

  async createNewNote() {
    const response = await chrome.runtime.sendMessage({
      action: 'createNote',
      title: 'Untitled'
    });

    if (response && response.success) {
      this.notes[response.noteId] = response.note;
      this.activeNoteId = response.noteId;
      this.renderTabs();
      this.loadActiveNote();
    } else if (response && response.error === 'note_limit') {
      // Show upgrade modal
      this.showUpgradeModal(response.message);
    }
  }

  async switchNote(noteId) {
    if (noteId === this.activeNoteId) return;

    // Check if target note exists (may have been deleted by timer)
    if (!this.notes[noteId]) {
      console.warn('Cannot switch: note no longer exists');
      this.renderTabs(); // Re-render to remove stale tabs
      return;
    }

    // Prevent rapid switching
    if (this.isSwitching) return;
    this.isSwitching = true;

    try {
      // Save current note before switching (like Notepad++)
      if (this.activeNoteId && this.notes[this.activeNoteId]) {
        const currentContent = document.getElementById('notepad').value;

        // Update local state (title is already updated via double-click rename)
        this.notes[this.activeNoteId].content = currentContent;
        this.notes[this.activeNoteId].lastModified = Date.now();

        // Save to background and wait for confirmation
        const saveResponse = await chrome.runtime.sendMessage({
          action: 'saveNote',
          noteId: this.activeNoteId,
          note: {
            title: this.notes[this.activeNoteId].title,
            content: currentContent,
            lastModified: this.notes[this.activeNoteId].lastModified
          }
        });

        if (!saveResponse || !saveResponse.success) {
          console.error('Failed to save current note before switching');
          // Continue anyway - don't block user
        }
      }

      // Switch to new note
      this.activeNoteId = noteId;
      await chrome.runtime.sendMessage({
        action: 'setActiveNote',
        noteId: noteId
      });

      // Load the new note
      this.loadActiveNote();
      this.renderTabs();
    } finally {
      this.isSwitching = false;
    }
  }

  async deleteNote(noteId) {
    if (this.settings.confirmDelete) {
      this.showModal(
        'Delete Note',
        'Are you sure you want to delete this note? This action cannot be undone.',
        async () => {
          await this.performDeleteNote(noteId);
        }
      );
    } else {
      await this.performDeleteNote(noteId);
    }
  }

  async performDeleteNote(noteId) {
    // Check if note still exists (may have been deleted already)
    if (!this.notes[noteId]) {
      console.warn('Note already deleted');
      this.renderTabs();
      return;
    }

    const response = await chrome.runtime.sendMessage({
      action: 'deleteNote',
      noteId: noteId
    });

    if (response && response.success) {
      delete this.notes[noteId];
      this.activeNoteId = response.activeNoteId;

      // If no notes left, create a new one
      if (!this.activeNoteId) {
        await this.createNewNote();
      } else {
        this.renderTabs();
        this.loadActiveNote();
      }
    }
  }

  loadActiveNote() {
    const note = this.notes[this.activeNoteId];

    if (!note) {
      // Note doesn't exist - clear UI and reload from storage
      console.warn('Active note not found, reloading from storage');
      document.getElementById('notepad').value = '';
      this.updateStats();
      this.updateSaveStatus('saved');
      this.renderTabs();
      return;
    }

    // Title is now in the tab (no separate input)
    document.getElementById('notepad').value = note.content || '';

    this.updateStats();
    this.updateLastModified(note.lastModified);
    this.updateSaveStatus('saved'); // Mark as saved when loading

    // Update timer display
    this.updateTimerDisplay();
  }

  async updateNoteContent(content) {
    if (!this.activeNoteId || this.isLocked) return;

    // Check if note still exists (may have been deleted by timer)
    if (!this.notes[this.activeNoteId]) {
      console.warn('Cannot update content: note no longer exists');
      this.updateSaveStatus('error');
      this.renderTabs(); // Re-render to sync UI
      await this.loadNotes(); // Reload from storage
      return;
    }

    this.updateSaveStatus('saving');
    this.notes[this.activeNoteId].content = content;
    this.notes[this.activeNoteId].lastModified = Date.now();

    // Save full note to prevent corruption
    const response = await chrome.runtime.sendMessage({
      action: 'saveNote',
      noteId: this.activeNoteId,
      note: {
        title: this.notes[this.activeNoteId].title,
        content: content,
        lastModified: this.notes[this.activeNoteId].lastModified
      }
    });

    if (!response || !response.success) {
      console.error('Failed to save note content');
      this.updateSaveStatus('error');
    } else {
      this.updateSaveStatus('saved');
    }

    // Check again in case note was deleted during save
    if (this.notes[this.activeNoteId]) {
      this.updateLastModified(this.notes[this.activeNoteId].lastModified);
    }
  }

  updateStats() {
    const content = document.getElementById('notepad').value;
    const stats = GhostPadUtils.getTextStats(content);

    let statsText = `${stats.chars} chars • ${stats.words} words • ${stats.lines} lines`;

    if (stats.readingTime > 0) {
      statsText += ` • ${stats.readingTime} min read`;
    }

    document.getElementById('stats').textContent = statsText;
  }

  updateLastModified(timestamp) {
    const formatted = GhostPadUtils.formatDate(timestamp);
    document.getElementById('lastModified').textContent = formatted ? `Modified ${formatted}` : '';
  }

  updateSaveStatus(status) {
    const statusElement = document.getElementById('saveStatus');
    if (!statusElement) return;

    // Remove all status classes
    statusElement.classList.remove('saving', 'saved', 'unsaved', 'error');

    switch (status) {
      case 'saving':
        statusElement.textContent = '💾 Saving...';
        statusElement.classList.add('saving');
        break;
      case 'saved':
        statusElement.textContent = '✓ Saved';
        statusElement.classList.add('saved');
        break;
      case 'unsaved':
        statusElement.textContent = '⚠️ Unsaved';
        statusElement.classList.add('unsaved');
        break;
      case 'error':
        statusElement.textContent = '✗ Error saving';
        statusElement.classList.add('error');
        break;
      default:
        statusElement.textContent = '';
    }
  }

  togglePrivacy() {
    this.isPrivacyMode = !this.isPrivacyMode;

    const notepad = document.getElementById('notepad');
    const btn = document.getElementById('privacyToggle');

    if (this.isPrivacyMode) {
      notepad.classList.add('blurred');
      btn.textContent = '👁️‍🗨️';
      btn.title = 'Privacy mode ON (hover to see text)';
    } else {
      notepad.classList.remove('blurred');
      btn.textContent = '👁️';
      btn.title = 'Privacy mode OFF';
    }
  }

  toggleLock() {
    this.isLocked = !this.isLocked;

    const notepad = document.getElementById('notepad');
    const btn = document.getElementById('lockToggle');

    notepad.readOnly = this.isLocked;

    if (this.isLocked) {
      btn.textContent = '🔒';
      btn.title = 'Unlock editing';
      notepad.classList.add('locked');
    } else {
      btn.textContent = '🔓';
      btn.title = 'Lock editing';
      notepad.classList.remove('locked');
    }
  }

  async copyToClipboard() {
    const content = document.getElementById('notepad').value;

    if (!content) return;

    const success = await GhostPadUtils.copyToClipboard(content);

    const btn = document.getElementById('copyButton');
    if (success) {
      const original = btn.textContent;
      btn.textContent = '✓';
      setTimeout(() => {
        btn.textContent = original;
      }, 2000);
    }
  }

  downloadNote() {
    const note = this.notes[this.activeNoteId];
    if (!note) return;

    const filename = GhostPadUtils.sanitizeFilename(note.title || 'note') + '.txt';
    GhostPadUtils.downloadText(filename, note.content);
  }

  async clearCurrentNote() {
    if (this.settings.confirmDelete) {
      this.showModal(
        'Clear Note',
        'Are you sure you want to clear this note?',
        async () => {
          await this.performClearNote();
        }
      );
    } else {
      await this.performClearNote();
    }
  }

  async performClearNote() {
    if (!this.activeNoteId) return;

    document.getElementById('notepad').value = '';
    await this.updateNoteContent('');
    this.updateStats();
  }

  async setTimer(milliseconds) {
    if (!this.activeNoteId) return;

    await chrome.runtime.sendMessage({
      action: 'setTimer',
      noteId: this.activeNoteId,
      milliseconds: milliseconds
    });

    if (milliseconds > 0) {
      this.timers[this.activeNoteId] = Date.now() + milliseconds;

      if (this.settings.enableNotifications) {
        const minutes = Math.round(milliseconds / 60000);
        this.showNotification(`Timer set for ${minutes} minute${minutes > 1 ? 's' : ''}`);
      }
    } else {
      delete this.timers[this.activeNoteId];
    }

    this.updateTimerDisplay();
  }

  updateTimerDisplay() {
    const status = document.getElementById('timerStatus');
    const timerSelect = document.getElementById('timerSelect');

    if (this.timers[this.activeNoteId]) {
      const remaining = this.timers[this.activeNoteId] - Date.now();

      if (remaining > 0) {
        const minutes = Math.ceil(remaining / 60000);
        status.textContent = `⏱️ ${minutes}m`;
        status.classList.add('active');

        // Update select to show current timer (prevent jumping)
        // Don't change if it would cause a re-trigger
        const currentValue = parseInt(timerSelect.value);
        if (currentValue === 0) {
          // Only update if it's currently set to "Off"
          timerSelect.value = this.getClosestTimerValue(remaining);
        }
      } else {
        status.textContent = '';
        status.classList.remove('active');
        delete this.timers[this.activeNoteId];
        timerSelect.value = '0';
      }
    } else {
      status.textContent = '';
      status.classList.remove('active');
      timerSelect.value = '0';
    }
  }

  getClosestTimerValue(milliseconds) {
    const timerValues = [60000, 300000, 600000, 1800000, 3600000];
    let closest = '0';
    let minDiff = Infinity;

    for (const value of timerValues) {
      const diff = Math.abs(milliseconds - value);
      if (diff < minDiff) {
        minDiff = diff;
        closest = value.toString();
      }
    }

    return closest;
  }

  async checkTimers() {
    const response = await chrome.runtime.sendMessage({ action: 'getTimers' });

    if (response && response.timers) {
      this.timers = response.timers;
      this.updateTimerDisplay();
    }

    // Update every 30 seconds
    this.timerIntervalId = setInterval(() => {
      this.updateTimerDisplay();
    }, 30000);
  }

  async exportNotes() {
    const response = await chrome.runtime.sendMessage({ action: 'exportNotes' });

    if (response && response.success) {
      const filename = `ghostpad_export_${new Date().toISOString().split('T')[0]}.json`;
      const content = JSON.stringify(response.data, null, 2);
      GhostPadUtils.downloadText(filename, content, 'application/json');
    }
  }


  async clearAllNotes() {
    this.showModal(
      'Clear All Notes',
      'Are you sure you want to delete ALL notes? This action cannot be undone.',
      async () => {
        await chrome.runtime.sendMessage({ action: 'clearAllNotes' });
        await this.loadNotes();
        this.showNotification('All notes cleared');
      }
    );
  }

  toggleSearch() {
    const searchBar = document.getElementById('searchBar');
    const searchInput = document.getElementById('searchInput');

    if (searchBar.classList.contains('hidden')) {
      searchBar.classList.remove('hidden');
      searchInput.focus();
    } else {
      searchBar.classList.add('hidden');
      searchInput.value = '';
      this.searchResults = [];
    }
  }

  handleSearch(query) {
    if (!query || query.trim() === '') {
      this.searchResults = [];
      this.renderTabs(); // Show all tabs
      return;
    }

    const searchLower = query.toLowerCase();
    this.searchResults = Object.values(this.notes).filter((note) => {
      return (
        (note.title && note.title.toLowerCase().includes(searchLower)) ||
        (note.content && note.content.toLowerCase().includes(searchLower))
      );
    });

    // Temporarily filter tabs to show only search results
    this.renderSearchResults();
  }

  renderSearchResults() {
    const tabsList = document.getElementById('tabsList');
    tabsList.innerHTML = '';

    if (this.searchResults.length === 0) {
      const noResults = document.createElement('div');
      noResults.style.padding = '10px';
      noResults.style.textAlign = 'center';
      noResults.style.opacity = '0.6';
      noResults.textContent = 'No notes found';
      tabsList.appendChild(noResults);
      return;
    }

    this.searchResults.forEach((note) => {
      const tab = document.createElement('div');
      tab.className = 'tab' + (note.id === this.activeNoteId ? ' active' : '');
      tab.dataset.noteId = note.id;

      const tabTitle = document.createElement('span');
      tabTitle.className = 'tab-title';
      tabTitle.textContent = GhostPadUtils.truncate(note.title || 'Untitled', 20);
      tabTitle.title = note.title || 'Untitled';

      const closeBtn = document.createElement('button');
      closeBtn.className = 'tab-close';
      closeBtn.innerHTML = '×';
      closeBtn.title = 'Delete note';
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteNote(note.id);
      });

      tab.appendChild(tabTitle);
      tab.appendChild(closeBtn);

      tab.addEventListener('click', () => {
        this.switchNote(note.id);
        // Close search after selecting
        document.getElementById('searchInput').value = '';
        this.toggleSearch();
      });

      tabsList.appendChild(tab);
    });
  }

  toggleTheme() {
    this.settings.theme = this.settings.theme === 'dark' ? 'light' : 'dark';
    chrome.storage.local.set({ theme: this.settings.theme });
    this.applyTheme();
  }

  applyTheme() {
    const btn = document.getElementById('themeToggle');

    if (this.settings.theme === 'light') {
      document.body.classList.add('light-theme');
      btn.textContent = '☀️';
    } else {
      document.body.classList.remove('light-theme');
      btn.textContent = '🌙';
    }

    // Apply font settings
    const notepad = document.getElementById('notepad');
    notepad.style.fontSize = this.settings.fontSize + 'px';
    notepad.style.fontFamily = this.settings.fontFamily;
  }

  openSettings() {
    chrome.runtime.openOptionsPage();
  }

  startAutoSave() {
    // Auto-save is handled by debounced input handlers
    // This just ensures stats are updated periodically
    this.autoSaveIntervalId = setInterval(() => {
      if (this.activeNoteId && this.notes[this.activeNoteId]) {
        this.updateLastModified(this.notes[this.activeNoteId].lastModified);
      }
    }, 60000); // Update every minute

    // Clean up intervals and flush pending saves when window closes
    window.addEventListener('beforeunload', async () => {
      // Flush any pending debounced saves before closing
      if (this.activeNoteId && this.notes[this.activeNoteId]) {
        const currentContent = document.getElementById('notepad').value;

        // Immediate save before close (no debounce)
        await chrome.runtime.sendMessage({
          action: 'saveNote',
          noteId: this.activeNoteId,
          note: {
            title: this.notes[this.activeNoteId].title,
            content: currentContent,
            lastModified: Date.now()
          }
        });
      }

      // Clear intervals
      if (this.timerIntervalId) clearInterval(this.timerIntervalId);
      if (this.autoSaveIntervalId) clearInterval(this.autoSaveIntervalId);
    });
  }

  showModal(title, message, onConfirm) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('confirmModal').classList.remove('hidden');

    this.pendingConfirmAction = onConfirm;
  }

  hideModal() {
    document.getElementById('confirmModal').classList.add('hidden');
    this.pendingConfirmAction = null;
  }

  async confirmAction() {
    if (this.pendingConfirmAction) {
      const result = await this.pendingConfirmAction();
      // Don't close modal if validation failed (returns false)
      if (result === false) {
        return;
      }
      this.pendingConfirmAction = null;
    }
    this.hideModal();
  }

  showNotification(message) {
    // Could be enhanced with a toast notification UI
    // Silently handle notifications for now
  }

  showUpgradeModal(message) {
    const modal = document.getElementById('confirmModal');
    document.getElementById('confirmTitle').textContent = '⭐ Upgrade to Premium';
    document.getElementById('confirmMessage').innerHTML = `
      <p>${message || 'You\'ve reached the free tier limit.'}</p>
      <br>
      <p><strong>Premium - $1.99/month:</strong></p>
      <ul style="text-align: left; margin-left: 20px; margin-top: 10px;">
        <li>✨ Unlimited notes (up to 1,000)</li>
        <li>🚀 All features included</li>
        <li>💚 Support continued development</li>
        <li>🔄 Cancel anytime</li>
      </ul>
      <br>
      <p style="font-size: 12px; color: var(--text-secondary);">
        After payment, enter your email in Settings to activate premium features.
      </p>
    `;

    modal.classList.remove('hidden');

    // Change button text
    const okBtn = document.getElementById('confirmOk');
    okBtn.textContent = 'Subscribe Now';

    this.pendingConfirmAction = async () => {
      // Open Stripe payment link in new tab
      chrome.tabs.create({
        url: 'https://buy.stripe.com/00w00i8vLeB21hL8n9eME00'
      });
      // Close the modal
      modal.classList.add('hidden');
    };
  }

  showPasswordUnlockModal() {
    const modal = document.getElementById('confirmModal');
    document.getElementById('confirmTitle').textContent = '🔒 Enter Master Password';
    document.getElementById('confirmMessage').innerHTML = `
      <p>Your notes are protected with a master password.</p>
      <br>
      <input type="password" id="masterPasswordInput" placeholder="Enter password"
             style="width: 100%; padding: 10px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-primary); font-family: var(--font-family);">
      <p id="passwordError" style="color: var(--danger); margin-top: 10px; display: none;">Incorrect password</p>
    `;

    modal.classList.remove('hidden');

    // Change button text
    const okBtn = document.getElementById('confirmOk');
    okBtn.textContent = 'Unlock';

    // Hide cancel button
    const cancelBtn = document.getElementById('confirmCancel');
    cancelBtn.style.display = 'none';

    this.pendingConfirmAction = async () => {
      const passwordInput = document.getElementById('masterPasswordInput');
      const password = passwordInput.value;

      const response = await chrome.runtime.sendMessage({
        action: 'verifyMasterPassword',
        password: password
      });

      if (response && response.success) {
        // Password correct, close modal and continue
        cancelBtn.style.display = 'block';
        return true;
      } else {
        // Show error
        document.getElementById('passwordError').style.display = 'block';
        return false;
      }
    };
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new GhostPadApp();
});
