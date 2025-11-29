# 🚀 Installation Guide - GhostPad Pro

## Quick Start (5 minutes)

### Option 1: Load Unpacked Extension (Development/Testing)

This is the easiest way to test the extension locally.

1. **Download or Clone the Repository**
   ```bash
   git clone <repository-url>
   # OR download and extract the ZIP file
   ```

2. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Navigate to `chrome://extensions/`
   - Or click: Menu (⋮) → More Tools → Extensions

3. **Enable Developer Mode**
   - Look for the toggle in the top-right corner
   - Click to enable "Developer mode"

4. **Load the Extension**
   - Click "Load unpacked" button
   - Navigate to the `GhostPad-Claude` folder
   - Select the folder and click "Open"

5. **Verify Installation**
   - You should see the GhostPad Pro card appear
   - Look for the 👻 icon in your Chrome toolbar
   - If you don't see it, click the puzzle piece icon and pin GhostPad Pro

6. **Start Using**
   - Click the GhostPad icon
   - Start taking secure notes!

### Option 2: Install from Chrome Web Store

*Coming soon - Extension pending publication*

1. Visit the Chrome Web Store
2. Search for "GhostPad Pro"
3. Click "Add to Chrome"
4. Confirm by clicking "Add extension"
5. Done! Click the icon to start using it.

## Verification Steps

After installation, verify everything works:

1. **Open the Extension**
   - Click the GhostPad icon in toolbar
   - You should see the welcome note

2. **Test Basic Functionality**
   - Type some text
   - Create a new tab with the + button
   - Switch between tabs
   - Try the theme toggle (🌙/☀️)

3. **Test Settings**
   - Click the settings icon (⚙️)
   - Settings page should open in a new tab
   - Try changing theme or font size

4. **Test Timer**
   - Set a 1-minute timer
   - Verify you see the countdown indicator

5. **Test Export/Import**
   - Click "Export All"
   - You should download a JSON file
   - Try importing it back

## Troubleshooting

### Extension Doesn't Load

**Error: "Manifest file is missing or unreadable"**
- Ensure `manifest.json` exists in the folder
- Check that you selected the correct folder
- Try reloading the extension

**Error: "Could not load icon"**
- Verify the `icons/` folder exists
- Check that icon files (icon16.png, icon48.png, icon128.png) are present
- If missing, you can temporarily comment out icon references in manifest.json

### Extension Loads but Doesn't Work

**Popup doesn't appear when clicking icon**
- Open Chrome DevTools (F12)
- Go to Console tab
- Look for JavaScript errors
- Check that popup.html, popup.js, and popup.css exist

**Settings page doesn't open**
- Verify options.html, options.js, and options.css exist
- Check Chrome console for errors

**Features not working**
- Reload the extension:
  - Go to `chrome://extensions/`
  - Find GhostPad Pro
  - Click the refresh icon (🔄)

### Storage Issues

**Notes not saving**
- Check browser console for storage errors
- Verify Chrome storage quota: `chrome://quota-internals/`
- Try clearing extension data and reloading

**Settings not persisting**
- Open DevTools → Application → Storage
- Check Local Storage and Session Storage
- Clear if corrupted, then reload extension

### Permission Issues

**Notifications don't appear**
- Check Chrome notification settings
- Settings → Privacy and Security → Site Settings → Notifications
- Ensure Chrome has notification permissions

**Timers don't work**
- Verify extension has "alarms" permission in manifest
- Check background service worker is running
- Open `chrome://extensions/` and click "service worker" link

## Updating the Extension

### For Development Version

1. Make changes to the code
2. Go to `chrome://extensions/`
3. Find GhostPad Pro
4. Click the refresh icon (🔄)
5. Test your changes

### For Chrome Web Store Version

Updates are automatic! Chrome will update the extension in the background.

To force an update:
1. Go to `chrome://extensions/`
2. Enable Developer Mode
3. Click "Update" button at top

## Uninstalling

### Remove Extension

1. Go to `chrome://extensions/`
2. Find GhostPad Pro
3. Click "Remove"
4. Confirm removal

### What Gets Deleted

- ✅ All settings (theme, font size, etc.)
- ✅ All notes (already cleared if browser was closed)
- ✅ All timers

### What Doesn't Get Deleted

Nothing! GhostPad Pro doesn't store anything outside of Chrome's extension storage.

## Platform-Specific Notes

### Windows

- Extension folder path: `C:\Users\[YourName]\...\GhostPad-Claude`
- Use File Explorer to navigate to the folder
- Make sure you select the folder, not a file inside it

### macOS

- Extension folder path: `/Users/[YourName]/.../GhostPad-Claude`
- Use Finder to navigate to the folder
- You can drag the folder into the "Load unpacked" dialog

### Linux

- Extension folder path: `/home/[YourName]/.../GhostPad-Claude`
- Use your file manager to navigate
- Ensure you have read permissions on all files

## Browser Compatibility

### Supported Browsers

✅ **Google Chrome** 88+
- Full support
- Recommended browser

✅ **Microsoft Edge** 88+
- Full support
- Use same installation steps

✅ **Brave**
- Full support
- Chromium-based, same steps

✅ **Opera**
- Full support
- Chromium-based, same steps

❌ **Firefox**
- Not supported (requires WebExtension API adaptation)

❌ **Safari**
- Not supported (requires Safari extension conversion)

## Development Setup

For developers who want to modify the code:

### Prerequisites

- Google Chrome 88+
- Text editor (VS Code, Sublime, etc.)
- Basic JavaScript knowledge
- Git (optional)

### Setup Steps

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd GhostPad-Claude
   ```

2. **Install Extension**
   - Follow "Load Unpacked Extension" steps above

3. **Enable Auto-Reload** (optional)
   - Install "Extensions Reloader" extension
   - Makes development faster

4. **Open DevTools**
   - Right-click extension popup → Inspect
   - Or F12 when popup is open

5. **Make Changes**
   - Edit code in your editor
   - Reload extension to see changes
   - Check console for errors

### Recommended Extensions for Development

- **Extensions Reloader** - Auto-reload on file changes
- **Chrome Extension Source Viewer** - View source of other extensions
- **JSON Viewer** - Pretty-print JSON in browser

## Getting Help

### Resources

- 📖 [README.md](README.md) - Full documentation
- 🔧 [DEVELOPMENT.md](DEVELOPMENT.md) - Technical details
- 🏪 [STORE_LISTING.md](STORE_LISTING.md) - Chrome Web Store info

### Support Channels

- **Issues**: [GitHub Issues](your-repo-url/issues)
- **Discussions**: [GitHub Discussions](your-repo-url/discussions)
- **Email**: [your-support-email]

### Common Questions

**Q: How do I backup my notes?**
A: Use the "Export All" button before closing your browser.

**Q: Can I use this on multiple computers?**
A: Yes, install separately on each. Notes don't sync (by design).

**Q: Is there a mobile version?**
A: Not yet. Chrome extensions only work on desktop browsers.

**Q: How do I report a bug?**
A: Open a GitHub issue with steps to reproduce.

**Q: Can I contribute?**
A: Yes! See DEVELOPMENT.md for contribution guidelines.

## Next Steps

After installation:

1. ✅ Read the [README.md](README.md) for feature overview
2. ✅ Explore the settings page
3. ✅ Try keyboard shortcuts
4. ✅ Test the timer feature
5. ✅ Experiment with markdown preview
6. ✅ Set up your preferences

**Enjoy secure, temporary note-taking with GhostPad Pro! 👻**

---

*Last updated: 2024*
