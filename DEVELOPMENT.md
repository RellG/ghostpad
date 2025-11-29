# GhostPad Pro - Development Guide

## Project Overview

GhostPad Pro is a Manifest V3 Chrome extension built with vanilla JavaScript. It provides a secure, temporary notepad that automatically clears when the browser closes.

## Architecture

### Core Technologies
- **Manifest V3**: Latest Chrome extension API
- **Vanilla JavaScript**: No frameworks for minimal footprint
- **Chrome APIs**: Storage, Notifications, Alarms
- **CSS Custom Properties**: Theme system
- **Session Storage**: Temporary data storage

### File Structure

```
GhostPad-Claude/
│
├── manifest.json          # Extension manifest (V3)
│   ├── Permissions
│   ├── Background service worker
│   ├── Action (popup)
│   ├── Options page
│   └── Keyboard commands
│
├── background.js          # Service Worker
│   ├── Data lifecycle management
│   ├── Message handling
│   ├── Timer management
│   ├── Note CRUD operations
│   └── Auto-cleanup on suspend
│
├── popup.html            # Main UI
│   ├── Header with controls
│   ├── Search bar
│   ├── Tab management
│   ├── Editor/Preview area
│   ├── Toolbar
│   ├── Controls panel
│   └── Stats footer
│
├── popup.js              # Main Application Logic
│   ├── GhostPadApp class
│   ├── Note management
│   ├── UI state management
│   ├── Event handlers
│   ├── Search functionality
│   └── Import/Export
│
├── popup.css             # Main Styling
│   ├── CSS variables (theming)
│   ├── Component styles
│   ├── Responsive design
│   └── Animations
│
├── utils.js              # Utility Functions
│   ├── Markdown parser
│   ├── Date formatting
│   ├── Text statistics
│   ├── File operations
│   └── Helper functions
│
├── options.html          # Settings Page UI
├── options.js            # Settings Logic
├── options.css           # Settings Styling
│
└── icons/                # Extension Icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Data Flow

### Storage Architecture

```
Chrome Storage API
├── Session Storage (cleared on browser close)
│   ├── notes: { noteId: Note, ... }
│   ├── activeNoteId: string
│   └── timers: { noteId: timestamp, ... }
│
└── Local Storage (persists)
    ├── theme: 'dark' | 'light'
    ├── fontSize: number
    ├── fontFamily: string
    ├── confirmDelete: boolean
    ├── autoSave: boolean
    └── [other settings]
```

### Note Object Structure

```javascript
{
  id: string,              // Generated unique ID
  title: string,           // Note title
  content: string,         // Note content
  created: number,         // Timestamp
  lastModified: number,    // Timestamp
  encrypted: boolean       // Encryption flag
}
```

### Message Flow

```
Popup ←→ Background Service Worker

Actions:
- getAllNotes
- getNote
- saveNote
- createNote
- deleteNote
- setActiveNote
- setTimer
- getTimers
- clearAllNotes
- exportNotes
- importNotes
```

## Key Components

### 1. Background Service Worker (background.js)

**Purpose**: Manages data lifecycle and handles extension events

**Key Functions**:
- `handleMessage()` - Routes messages from popup
- `loadSessionData()` - Loads notes from storage
- `createDefaultNote()` - Creates initial note
- `generateNoteId()` - Creates unique IDs
- `clearNoteById()` - Clears specific note content

**Event Listeners**:
- `onInstalled` - First install setup
- `onStartup` - Load session data
- `onMessage` - Handle popup messages
- `onCommand` - Keyboard shortcuts
- `onAlarm` - Timer expiration
- `onSuspend` - Clear all data

### 2. Main Application (popup.js)

**Purpose**: Main UI logic and state management

**GhostPadApp Class**:

```javascript
class GhostPadApp {
  constructor() {
    this.notes = {}
    this.activeNoteId = null
    this.settings = {}
    this.isMarkdownMode = false
    this.isLocked = false
    // ...
  }

  // Core Methods
  init()
  loadSettings()
  loadNotes()
  setupEventListeners()
  renderTabs()
  createNewNote()
  switchNote(noteId)
  deleteNote(noteId)
  loadActiveNote()
  updateNoteContent(content)
  // ...
}
```

### 3. Utilities (utils.js)

**GhostPadUtils Object**:

```javascript
{
  // Markdown
  parseMarkdown(text)

  // Formatting
  formatDate(timestamp)
  calculateReadingTime(text)
  truncate(text, maxLength)

  // File Operations
  downloadText(filename, text, mimeType)
  readFileAsText(file)

  // Text Operations
  searchInText(text, query)
  highlightText(text, query)
  getTextStats(text)
  copyToClipboard(text)

  // Encryption (basic)
  simpleEncrypt(text, password)
  simpleDecrypt(encryptedText, password)

  // Helpers
  debounce(func, wait)
  generateId()
  sanitizeFilename(filename)
}
```

## Feature Implementation

### Adding a New Feature

1. **Plan the Feature**
   - Define requirements
   - Determine storage needs
   - Plan UI changes
   - Consider permissions

2. **Update Manifest** (if needed)
   ```json
   {
     "permissions": ["newPermission"]
   }
   ```

3. **Update Background Worker** (if needed)
   ```javascript
   // Add new message handler
   case 'newAction':
     // Implementation
     sendResponse({ success: true });
     break;
   ```

4. **Update UI**
   - Add HTML elements (popup.html)
   - Add styles (popup.css)
   - Add event listeners (popup.js)

5. **Test Thoroughly**
   - Load unpacked extension
   - Test all scenarios
   - Check error handling
   - Verify cleanup works

### Example: Adding Export Format

1. **utils.js** - Add export function
   ```javascript
   exportAsMarkdown(note) {
     return `# ${note.title}\n\n${note.content}`;
   }
   ```

2. **popup.js** - Add UI handler
   ```javascript
   downloadAsMarkdown() {
     const note = this.notes[this.activeNoteId];
     const content = GhostPadUtils.exportAsMarkdown(note);
     GhostPadUtils.downloadText(
       note.title + '.md',
       content,
       'text/markdown'
     );
   }
   ```

3. **popup.html** - Add button
   ```html
   <button id="exportMdBtn">Export as MD</button>
   ```

4. **Event Listener**
   ```javascript
   document.getElementById('exportMdBtn')
     .addEventListener('click', () => this.downloadAsMarkdown());
   ```

## Styling System

### CSS Architecture

```css
:root {
  /* Color Tokens */
  --bg-primary: #1a1d23;
  --text-primary: #e4e6eb;
  --accent-primary: #7c3aed;

  /* Spacing Scale */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;

  /* Typography */
  --font-family: -apple-system, ...;
  --font-mono: 'SF Mono', ...;

  /* Effects */
  --transition-fast: 150ms ease;
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
}
```

### Theme System

Light theme overrides:
```css
body.light-theme {
  --bg-primary: #ffffff;
  --text-primary: #111827;
  /* ... */
}
```

## Testing Checklist

### Functionality Tests
- [ ] Create new note
- [ ] Switch between notes
- [ ] Delete note
- [ ] Edit note title
- [ ] Edit note content
- [ ] Auto-save works
- [ ] Set timer
- [ ] Timer clears note
- [ ] Timer notification
- [ ] Search notes
- [ ] Export notes (JSON)
- [ ] Export note (TXT)
- [ ] Import notes (JSON)
- [ ] Import note (TXT)
- [ ] Copy to clipboard
- [ ] Toggle markdown preview
- [ ] Toggle lock mode
- [ ] Toggle word wrap
- [ ] Theme switching
- [ ] Font size adjustment
- [ ] Settings persist

### Cleanup Tests
- [ ] Notes clear on browser close
- [ ] Timers clear on browser close
- [ ] Settings persist after close
- [ ] Extension uninstall cleanup

### Error Handling
- [ ] Invalid JSON import
- [ ] Empty note operations
- [ ] Rapid clicking
- [ ] Large text content
- [ ] Special characters

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Chrome (one version back)
- [ ] Edge
- [ ] Brave

## Performance Optimization

### Current Optimizations
1. **Debounced Input**: 300ms debounce on text input
2. **Session Storage**: Faster than local storage
3. **Minimal DOM Updates**: Update only changed elements
4. **CSS Animations**: Hardware-accelerated
5. **Lazy Loading**: Load notes on demand

### Performance Tips
- Keep note content under 1MB for best performance
- Limit total notes to ~50 for optimal experience
- Use markdown preview sparingly with very large notes
- Clear unused notes regularly

## Security Considerations

### Current Security Features
1. **Session Storage**: Auto-cleared by browser
2. **No External Requests**: Zero network calls
3. **CSP**: Content Security Policy in manifest
4. **No eval()**: Safe code execution only
5. **Input Sanitization**: Markdown parser escapes HTML

### Security Best Practices
- Never use `innerHTML` with user content
- Always escape user input in DOM
- Use textContent for plain text
- Validate all message handlers
- Check permissions before API calls

## Publishing to Chrome Web Store

### Pre-Publishing Checklist
1. Update version in manifest.json
2. Test on clean Chrome profile
3. Prepare screenshots (1280x800)
4. Prepare promotional images
5. Write store description
6. Set up privacy policy
7. Create support/homepage URLs

### Build Process
1. Remove development files
2. Test in production mode
3. Create ZIP archive
4. Upload to Chrome Developer Dashboard
5. Fill in store listing
6. Submit for review

### Post-Publishing
1. Monitor reviews
2. Respond to user feedback
3. Track bug reports
4. Plan updates
5. Maintain changelog

## Troubleshooting

### Common Issues

**Notes not saving**
- Check Chrome console for errors
- Verify storage permissions
- Check available storage quota

**Timer not working**
- Ensure alarms permission granted
- Check browser notifications enabled
- Verify alarm was created in background

**Theme not applying**
- Clear extension storage
- Reload extension
- Check CSS variables

**Import failing**
- Validate JSON format
- Check file size
- Verify file encoding (UTF-8)

## Future Enhancements

### Potential Features
- [ ] Advanced encryption (Web Crypto API)
- [ ] Note templates
- [ ] Tags and categories
- [ ] Advanced search with regex
- [ ] Syntax highlighting for code
- [ ] Drawing/sketching support
- [ ] Voice notes
- [ ] Collaboration features
- [ ] Browser sync (optional)
- [ ] Mobile support

### Code Improvements
- [ ] Add TypeScript
- [ ] Add unit tests
- [ ] Add E2E tests
- [ ] Improve markdown parser
- [ ] Add code splitting
- [ ] Optimize bundle size
- [ ] Add source maps

## Contributing

### Code Style
- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Comment complex logic
- Use descriptive variable names
- Follow existing patterns

### Git Workflow
1. Fork repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Commit with clear messages
6. Submit pull request

### Commit Message Format
```
<type>: <description>

[optional body]

[optional footer]
```

Types: feat, fix, docs, style, refactor, test, chore

Example:
```
feat: add markdown export functionality

Add ability to export notes as markdown files with proper formatting.
Includes title as H1 and preserves markdown syntax in content.

Closes #123
```

## Resources

### Documentation
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [Alarms API](https://developer.chrome.com/docs/extensions/reference/alarms/)

### Tools
- Chrome Extensions Reloader
- Chrome DevTools
- Lighthouse for performance
- axe for accessibility

## License

MIT License - See LICENSE file for details

---

**Happy Coding! 👻**
