# GhostPad Screenshot Guide

Quick guide for creating Chrome Web Store screenshots (1280x800 resolution).

---

## Requirements

- **Resolution:** 1280x800 pixels
- **Format:** PNG or JPG
- **Number:** 5 screenshots minimum
- **Quality:** High quality, clear text

---

## Tools Needed

### Option 1: Browser + Screenshot Tool (Recommended)

1. **Set Browser Window:**
   - Open Chrome
   - Press F12 to open DevTools
   - Press Ctrl+Shift+M for device toolbar
   - Select "Responsive" mode
   - Set dimensions: **1280 x 800**

2. **Screenshot Tool:**
   - Windows: Snipping Tool / Snip & Sketch
   - Mac: Cmd+Shift+4
   - Linux: Screenshot tool / Flameshot
   - Extension: Awesome Screenshot

### Option 2: Chrome Extension Screenshot Tools

- **Awesome Screenshot** - Full page captures
- **Fireshot** - Professional screenshots
- **Nimbus Screenshot** - Annotations

---

## Screenshot 1: Main Interface

**What to Show:**
- GhostPad popup with 2-3 notes visible
- Clean, professional interface
- Light theme (better for screenshots)
- Note titles and content preview

**Steps:**
1. Open GhostPad extension (click icon)
2. Create 2-3 sample notes:
   - "Meeting Notes - Q4 Planning"
   - "Code Snippets"
   - "Personal Reminder"
3. Ensure notes have some content
4. Capture at 1280x800

**Caption:**
```
Clean, intuitive interface for secure note-taking
```

---

## Screenshot 2: Password Protection Feature

**What to Show:**
- Password protection dialog
- Lock/unlock functionality
- Encryption indicator

**Steps:**
1. Create or edit a note
2. Click "Set Password" button
3. Show password dialog open
4. Alternatively: Show a locked note with unlock prompt
5. Capture at 1280x800

**Caption:**
```
Military-grade AES-256 encryption for sensitive notes
```

---

## Screenshot 3: Reminders Feature

**What to Show:**
- Reminder setup dialog
- Date/time picker
- Sample reminder notification (can composite)

**Steps:**
1. Open a note
2. Click "Set Reminder" button
3. Show reminder dialog with date/time picker
4. Optional: Create composite with notification mockup
5. Capture at 1280x800

**Caption:**
```
Never forget with built-in reminders and notifications
```

---

## Screenshot 4: Settings Page

**What to Show:**
- Full settings/options page
- Customization options
- Premium section
- Professional layout

**Steps:**
1. Right-click GhostPad icon > Options
2. Or click Settings gear icon
3. Show full options.html page
4. Ensure Premium section is visible
5. Capture at 1280x800

**Caption:**
```
Customize every aspect to match your workflow
```

---

## Screenshot 5: Premium Upgrade

**What to Show:**
- Upgrade modal with pricing
- Benefits of Premium
- Call to action

**Steps:**
1. When on Free tier, try to create 4th note
2. Upgrade modal appears automatically
3. Show modal with:
   - "Premium - $1.99/month"
   - Benefits list
   - Subscribe button
4. Capture at 1280x800

**Caption:**
```
Upgrade to Premium for unlimited notes
```

---

## Bonus Screenshot Ideas

### Screenshot 6: Dark Theme (Optional)
- Same as Screenshot 1 but in dark mode
- Shows theme flexibility

### Screenshot 7: Search Functionality (Optional)
- Search bar with results
- Multiple notes filtered

### Screenshot 8: Privacy Blur (Optional)
- Show privacy blur feature activated
- Demonstrates security consciousness

---

## Tips for Great Screenshots

### Visual Quality
- ✅ Use light theme (better contrast for store)
- ✅ Clear, readable text in notes
- ✅ Professional sample content (no "test test test")
- ✅ No spelling errors in visible text
- ✅ Consistent styling throughout

### Content Ideas for Sample Notes

**Note 1: "Project Ideas"**
```
✨ New Feature Ideas
- Dark mode support ✓
- Cloud sync option
- Markdown support
- Code syntax highlighting

Next: Research user feedback
```

**Note 2: "Meeting Notes - Q4 Planning"**
```
📅 Q4 Strategy Meeting

Key Points:
• Launch new product line
• Expand to 3 new markets
• Hire 5 engineers
• Revenue target: $500K

Action Items:
- Review budget (Due: Nov 30)
- Finalize hiring plan
```

**Note 3: "Code Snippet"**
```
// Quick JavaScript helper
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() =>
      func.apply(this, args), wait);
  };
}
```

### Things to Avoid
- ❌ No personal information
- ❌ No "Lorem ipsum" filler text
- ❌ No cluttered/messy interface
- ❌ No error messages or bugs
- ❌ No development/debug tools visible
- ❌ No inappropriate content

---

## After Capturing Screenshots

### 1. Verify Dimensions
```bash
# Check image dimensions (Linux)
file screenshot.png
identify screenshot.png

# Windows PowerShell
[System.Drawing.Image]::FromFile("C:\path\to\screenshot.png").Size
```

### 2. Optimize File Size
- Keep under 5MB per screenshot
- Use PNG for UI (crisp text)
- Compress if needed: https://tinypng.com

### 3. Naming Convention
```
ghostpad-screenshot-1-main-interface.png
ghostpad-screenshot-2-password-protection.png
ghostpad-screenshot-3-reminders.png
ghostpad-screenshot-4-settings.png
ghostpad-screenshot-5-premium-upgrade.png
```

### 4. Review Checklist
- [ ] All screenshots 1280x800
- [ ] Clear, professional appearance
- [ ] No personal/sensitive data visible
- [ ] Text is readable
- [ ] Consistent branding (light theme)
- [ ] No errors or bugs shown
- [ ] Professional sample content

---

## Alternative: Auto-Screenshot Script

For developers who want automation:

```javascript
// Run in browser console after opening extension
async function captureScreenshot(name) {
  const canvas = await html2canvas(document.body, {
    width: 1280,
    height: 800,
    scale: 2
  });

  const link = document.createElement('a');
  link.download = `ghostpad-${name}.png`;
  link.href = canvas.toDataURL();
  link.click();
}

// Usage:
captureScreenshot('main-interface');
```

*(Requires html2canvas library)*

---

## Promotional Tiles

### Small Tile (440x280)

**Design Elements:**
- GhostPad logo (128x128)
- Text: "GhostPad"
- Subtitle: "Secure Encrypted Notepad"
- Badge: "3 notes free"
- Background: Dark gradient or brand colors

**Tools:**
- Canva (free): https://canva.com
- Figma (free): https://figma.com
- Photoshop
- GIMP (free)

**Template Idea:**
```
┌─────────────────────────────┐
│                             │
│    [GHOST ICON]             │
│                             │
│    GhostPad                 │
│    Secure Encrypted Notes   │
│                             │
│    [3 notes free badge]     │
│                             │
└─────────────────────────────┘
```

---

## Need Help?

If you need assistance with screenshots:

1. **Hire a designer** (Fiverr, Upwork) - $20-50
2. **Use Canva templates** - Free/Pro
3. **Ask ChatGPT for mockup ideas**
4. **Use browser DevTools** for perfect dimensions

---

## Quick Start Checklist

- [ ] Open GhostPad extension
- [ ] Create 3 sample notes with professional content
- [ ] Set browser/window to 1280x800
- [ ] Capture Screenshot 1 (Main Interface)
- [ ] Capture Screenshot 2 (Password Protection)
- [ ] Capture Screenshot 3 (Reminders)
- [ ] Capture Screenshot 4 (Settings)
- [ ] Capture Screenshot 5 (Premium Upgrade)
- [ ] Verify all are 1280x800 PNG/JPG
- [ ] Review for quality and professionalism
- [ ] Upload to Chrome Web Store Developer Console

---

**Ready to create amazing screenshots for your Chrome Web Store listing! 📸**

Remember: First impressions matter. High-quality screenshots can significantly increase your conversion rate!
