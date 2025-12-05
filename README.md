# 👻 GhostPad

**Privacy-focused browser notes that disappear when you close your browser.**

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Available-brightgreen)](https://chromewebstore.google.com/detail/ghostpad/jplmolndheolikileppjjoclnchbfafb)
[![Version](https://img.shields.io/badge/version-2.3.4-blue.svg)](https://github.com/RellG/ghostpad/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Security](https://img.shields.io/badge/security-hardened-brightgreen.svg)](PRIVACY_POLICY.md)

---

## 🚀 Quick Start

**Install from Chrome Web Store:**

[👉 Add GhostPad to Chrome](https://chromewebstore.google.com/detail/ghostpad/jplmolndheolikileppjjoclnchbfafb)

---

## 🎯 What is GhostPad?

GhostPad is a Chrome extension for taking temporary notes that you don't want saved permanently. Perfect for sensitive information, quick drafts, or temporary thoughts that should disappear automatically.

### ✨ Key Features

- **🔒 Session-Only Storage** - Notes exist only while your browser is open
- **👻 Auto-Delete** - Everything vanishes when you close your browser
- **🔐 100% Private** - No servers, no accounts, no data collection
- **📑 Multi-Tab Organization** - Organize notes with multiple tabs
- **✏️ Easy Renaming** - Double-click any tab title to rename it
- **📤 Export When Needed** - Save important notes before closing
- **🎨 Clean Dark Interface** - Modern, distraction-free design
- **⚡ Instant Sync** - Auto-saves as you type

---

## 🔐 Privacy & Security

GhostPad is built with privacy and security as top priorities:

### Security Hardening (v2.3.4)
- ✅ **XSS Protection** - All HTML injection prevented with programmatic DOM creation
- ✅ **ReDoS Prevention** - Regex escaping to prevent denial of service attacks
- ✅ **Secure API Calls** - HTTPS validation, timeouts, and response validation
- ✅ **Cryptographic Security** - Using `crypto.randomUUID()` for secure random IDs
- ✅ **Memory Safety** - Passwords immediately cleared from memory
- ✅ **Message Validation** - Sender validation on all message handlers
- ✅ **CSP Compliance** - No inline styles, full Content Security Policy compliance

### Privacy Guarantees
- 🔒 **No Data Collection** - We don't collect any user data
- 🔒 **No Analytics** - No tracking, no telemetry, no cookies
- 🔒 **No Cloud Sync** - Everything stays on your device
- 🔒 **Session-Only** - Data stored in browser session storage only
- 🔒 **Open Source** - Full code transparency on GitHub

**Read our full [Privacy Policy](PRIVACY_POLICY.md) and [Terms of Service](TERMS_OF_SERVICE.md)**

---

## 💡 Use Cases

Perfect for:
- 📝 Temporarily storing passwords or API keys
- 📋 Copying sensitive data between applications
- ✍️ Drafting content you don't want saved
- 🔑 Pasting temporary credentials
- 📊 Working with confidential information
- 🗒️ Quick notes that don't need persistence

---

## 🎨 Screenshots

### Main Interface
Clean, distraction-free note-taking with multi-tab support.

### Features
- Multi-tab organization
- Double-click to rename tabs
- Export to download notes
- Auto-save as you type
- Dark theme interface

---

## 🛠️ Installation

### From Chrome Web Store (Recommended)

1. Visit the [Chrome Web Store listing](https://chromewebstore.google.com/detail/ghostpad/jplmolndheolikileppjjoclnchbfafb)
2. Click "Add to Chrome"
3. Click the GhostPad icon in your toolbar
4. Start taking notes!

### From Source (For Developers)

1. Clone this repository:
   ```bash
   git clone https://github.com/RellG/ghostpad.git
   cd ghostpad
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" (toggle in top right)

4. Click "Load unpacked"

5. Select the cloned `ghostpad` folder

6. GhostPad is now installed!

---

## 📖 How to Use

1. **Create Notes** - Click the GhostPad icon to open the extension
2. **Organize with Tabs** - Click the "+" button to create new tabs
3. **Rename Tabs** - Double-click any tab title to rename it (look for the ✏️ icon)
4. **Auto-Save** - Your notes save automatically as you type
5. **Export** - Click "Export" to download notes before closing
6. **Close & Delete** - Close your browser and everything disappears!

### Pro Tips
- Active notes automatically move to the leftmost position
- Use Ctrl+F (Cmd+F on Mac) to search within notes
- Export important notes before closing your browser
- No need to manually save - it's automatic!

---

## 🏗️ Technical Details

### Built With
- **Manifest V3** - Latest Chrome Extension standard
- **Vanilla JavaScript** - No frameworks, lightweight and fast
- **Session Storage API** - Browser-native temporary storage
- **Chrome Extension APIs** - Storage, notifications, identity

### Architecture
- **Frontend**: popup.html, popup.js, popup.css
- **Background**: background.js (service worker)
- **Settings**: options.html, options.js
- **Security**: crypto.js, utils.js
- **Premium**: Stripe integration for premium features

### Browser Compatibility
- ✅ Google Chrome (v88+)
- ✅ Microsoft Edge (Chromium-based)
- ✅ Brave Browser
- ✅ Any Chromium-based browser

---

## 🚀 Premium Features (Optional)

Unlock additional capabilities:
- 📝 Unlimited notes (free tier: 5 notes)
- 🔐 Password protection for notes
- 🎨 Custom themes and styling
- ⚡ Priority support

[Upgrade to Premium](https://chromewebstore.google.com/detail/ghostpad/jplmolndheolikileppjjoclnchbfafb)

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Reporting Bugs
1. Check if the bug is already reported in [Issues](https://github.com/RellG/ghostpad/issues)
2. If not, create a new issue with:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Chrome version and OS

### Suggesting Features
1. Check [Issues](https://github.com/RellG/ghostpad/issues) for existing feature requests
2. Create a new issue with the "enhancement" label
3. Describe the feature and use case clearly

### Pull Requests
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Setup
```bash
# Clone the repo
git clone https://github.com/RellG/ghostpad.git
cd ghostpad

# Load in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the ghostpad folder

# Make changes and test
# Click the reload icon in chrome://extensions/ to test changes
```

---

## 📝 Changelog

### v2.3.4 (2024-12-04)
**🔒 Security Hardening**
- Fixed XSS vulnerabilities in modal HTML injection
- Prevented ReDoS attacks with regex escaping
- Secured API calls with HTTPS validation
- Implemented RFC 5321 compliant email validation
- Fixed race conditions with promise-based queueing
- Added message handler sender validation
- Immediate password clearing from memory
- Replaced Math.random() with crypto.randomUUID()
- Removed inline styles for CSP compliance
- Enhanced error handling

**✨ UX Improvements**
- Added visual edit icon (✏️) for tab renaming
- Active note automatically moves to leftmost position
- Updated placeholder text
- Improved welcome note with instructions

### v2.3.0 (2024-11-29)
- Initial public release
- Stripe premium integration
- Multi-tab note organization
- Session-only storage
- Export functionality

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Chrome Web Store**: https://chromewebstore.google.com/detail/ghostpad/jplmolndheolikileppjjoclnchbfafb
- **GitHub Repository**: https://github.com/RellG/ghostpad
- **Issue Tracker**: https://github.com/RellG/ghostpad/issues
- **Privacy Policy**: [PRIVACY_POLICY.md](PRIVACY_POLICY.md)
- **Terms of Service**: [TERMS_OF_SERVICE.md](TERMS_OF_SERVICE.md)

---

## 👤 Author

**RellG**
- GitHub: [@RellG](https://github.com/RellG)
- Email: TaReynolds725@gmail.com

---

## 🙏 Acknowledgments

- Security audited and hardened by [Claude Code](https://claude.com/claude-code)
- Built with privacy and security as top priorities
- Thanks to all users who provided feedback and suggestions

---

## ⭐ Support

If you find GhostPad useful, please:
- ⭐ Star this repository
- ✍️ Leave a review on the [Chrome Web Store](https://chromewebstore.google.com/detail/ghostpad/jplmolndheolikileppjjoclnchbfafb)
- 🐦 Share on social media
- 🤝 Contribute to the project

---

## 📮 Contact & Support

- **Bug Reports**: [GitHub Issues](https://github.com/RellG/ghostpad/issues)
- **Feature Requests**: [GitHub Issues](https://github.com/RellG/ghostpad/issues)
- **Email**: TaReynolds725@gmail.com

---

<div align="center">

**Built with ❤️ for Privacy**

[Install Now](https://chromewebstore.google.com/detail/ghostpad/jplmolndheolikileppjjoclnchbfafb) • [View Source](https://github.com/RellG/ghostpad) • [Report Bug](https://github.com/RellG/ghostpad/issues)

</div>
