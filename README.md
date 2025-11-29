# 👻 GhostPad Pro

**Professional secure notepad Chrome extension with auto-wipe, encryption, and advanced features.**

> Your notes vanish when the browser closes - perfect for sensitive information, temporary work, and privacy-focused note-taking.

## ✨ Features

### 🔐 Privacy & Security
- **Auto-Wipe on Close**: Notes are stored in session memory and automatically cleared when you close your browser
- **No Cloud Storage**: Everything stays local - nothing is sent to external servers
- **Session-Based**: Uses Chrome's session storage API for automatic cleanup
- **Optional Encryption**: Built-in encryption support for sensitive content

### 📝 Advanced Editor
- **Multiple Note Tabs**: Organize your thoughts with tabbed interface
- **Markdown Support**: Write in Markdown and preview formatted text
- **Rich Text Statistics**: Track characters, words, lines, and reading time
- **Word Wrap Toggle**: Switch between wrapped and non-wrapped text
- **Lock Mode**: Prevent accidental edits with read-only mode
- **Customizable Fonts**: Choose size (10-24px) and family (monospace, sans-serif, serif)

### ⏱️ Self-Destruct Timers
- Set timers to automatically clear notes (1 min to 1 hour)
- Visual timer status indicators
- Browser notifications when notes are cleared
- Persistent timers across popup sessions

### 🎨 Beautiful UI
- **Modern Design**: Sleek, professional interface with gradient accents
- **Dark & Light Themes**: Switch between themes based on preference
- **Smooth Animations**: Polished transitions and interactions
- **Responsive Layout**: Optimized for various screen sizes
- **Accessible**: Keyboard shortcuts and ARIA labels

### 🔍 Search & Organization
- Full-text search across all notes
- Quick switching between notes
- Recently modified sorting
- Visual tab management

### 💾 Import & Export
- **Export All Notes**: Save as JSON for backup
- **Import Notes**: Restore from JSON or import TXT files
- **Download Individual Notes**: Save specific notes as text files
- **Settings Export**: Backup your preferences

### ⌨️ Keyboard Shortcuts
- `Ctrl+Shift+G` (Mac: `Cmd+Shift+G`) - Open GhostPad
- `Ctrl+Shift+N` (Mac: `Cmd+Shift+N`) - Create new note
- `Ctrl+Shift+Delete` (Mac: `Cmd+Shift+Delete`) - Clear current note
- `Ctrl+F` (Mac: `Cmd+F`) - Search notes
- `Escape` - Close search or modals

## 🚀 Installation

### From Chrome Web Store
1. Visit the [GhostPad Pro on Chrome Web Store](https://chrome.google.com/webstore)
2. Click "Add to Chrome"
3. Click the GhostPad icon in your extensions toolbar
4. Start taking secure notes!

### Manual Installation (Development)
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the `GhostPad-Claude` directory
6. The extension is now installed!

## 📖 How to Use

### Basic Usage
1. Click the GhostPad icon in your browser toolbar
2. Start typing in the notepad
3. Your notes are automatically saved as you type
4. Close your browser and all notes are automatically cleared

### Creating Multiple Notes
- Click the `+` button in the tabs bar to create a new note
- Click any tab to switch between notes
- Click the `×` button on a tab to delete a note

### Setting Self-Destruct Timer
1. Select a time from the "Self-Destruct" dropdown
2. The timer starts immediately
3. You'll see a countdown indicator next to the timer
4. The note will be automatically cleared when the timer expires

### Markdown Preview
1. Write your content using Markdown syntax
2. Click the 📝 button to toggle preview mode
3. View your formatted content
4. Click again (✏️) to return to edit mode

### Exporting Notes
- **Export All**: Click "Export All" to download all notes as JSON
- **Download Note**: Click the 💾 button to save the current note as TXT

### Importing Notes
1. Click "Import" button
2. Select a JSON file (from previous export) or TXT file
3. Your notes will be imported and available immediately

## ⚙️ Settings

Access settings by clicking the ⚙️ icon in the header.

### Available Settings
- **Theme**: Dark or Light mode
- **Font Size**: 10px to 24px
- **Font Family**: Monospace, Sans Serif, or Serif
- **Confirm Deletions**: Ask before deleting notes
- **Default Timer**: Auto-set timer for new notes
- **Auto-Save**: Automatically save as you type (recommended)
- **Spell Check**: Enable browser spell checking
- **Line Numbers**: Show line numbers in editor
- **Notifications**: Enable alerts for timers and actions
- **Notification Sound**: Play sound with notifications

## 🔒 Privacy & Data

### What Gets Stored
- **Session Storage**: Notes and timers (cleared on browser close)
- **Local Storage**: Settings and preferences only (persists between sessions)

### What Doesn't Get Stored
- No cloud backup
- No analytics or tracking
- No personal information collection
- No external server communication

### When Data is Cleared
- **Automatically**: When you close your browser (all notes)
- **By Timer**: When self-destruct timer expires (specific note)
- **Manually**: When you click clear/delete buttons

## 🛠️ Technical Details

### Architecture
- **Manifest V3**: Uses latest Chrome extension architecture
- **Service Worker**: Background script for data management
- **Session Storage API**: For temporary note storage
- **Local Storage API**: For persistent settings
- **Chrome Alarms API**: For timer functionality
- **Chrome Notifications API**: For timer alerts

### Browser Compatibility
- Chrome 88+
- Edge 88+
- Brave (Chromium-based)
- Opera (Chromium-based)

### Permissions Required
- `storage` - To save notes and settings
- `notifications` - To alert when timers expire
- `alarms` - To schedule timed deletions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

### Development Setup
1. Clone the repository
2. Make your changes
3. Test by loading the extension in developer mode
4. Submit a pull request

### Code Structure
```
GhostPad-Claude/
├── manifest.json        # Extension configuration
├── background.js        # Service worker (data management)
├── popup.html          # Main popup interface
├── popup.js            # Popup logic and UI interactions
├── popup.css           # Main styling
├── utils.js            # Utility functions (markdown, helpers)
├── options.html        # Settings page
├── options.js          # Settings logic
├── options.css         # Settings styling
├── icons/              # Extension icons
└── README.md           # This file
```

## 📝 Changelog

### Version 2.0.0 (Current)
- ✨ Complete rewrite with professional design
- 🎨 Modern UI with dark/light themes
- 📁 Multiple note tabs with organization
- 🔍 Full-text search functionality
- 📝 Markdown preview support
- ⏱️ Enhanced timer system with notifications
- 💾 Import/Export functionality
- ⌨️ Comprehensive keyboard shortcuts
- 📊 Advanced text statistics
- 🎯 Improved performance and reliability

### Version 1.0.0 (Original)
- Basic notepad functionality
- Auto-wipe on browser close
- Simple theming
- Basic timer support

## 📄 License

MIT License - Feel free to use, modify, and distribute as needed.

## 🙏 Acknowledgments

Built with ❤️ for privacy-conscious users who need a secure, temporary notepad.

Special thanks to the Chrome Extensions documentation and the open-source community.

## 📧 Support

For bug reports, feature requests, or questions:
- Create an issue on GitHub
- Review on Chrome Web Store
- Share with friends who value privacy

---

**Remember**: GhostPad Pro is designed for temporary notes. For long-term storage, always export your notes before closing your browser!

👻 Happy Ghost Writing! 👻
