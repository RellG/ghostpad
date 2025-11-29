# GhostPad v2.3.0 - Stripe Integration Setup Guide

Complete guide to deploying the Railway API backend and configuring Stripe payments for GhostPad Premium.

---

## 📋 Overview

**What's New in v2.3.0:**
- ✅ Stripe payment integration ($1.99/month subscription)
- ✅ Railway backend API for premium verification
- ✅ Email-based premium activation
- ✅ Automatic premium activation via Stripe webhooks
- ✅ Premium status management in Settings page

**Architecture:**
```
User → Stripe Checkout → Payment Success → Stripe Webhook → Railway API → PostgreSQL
                                                                              ↓
User → Extension Settings → Enter Email → Railway API → Verify Premium → Activate
```

---

## 🚀 Part 1: Deploy Railway Backend API

### Step 1: Create Railway Account & Project

1. Go to [Railway.app](https://railway.app/)
2. Sign up or log in with GitHub
3. Click "New Project"
4. Select "Empty Project"

### Step 2: Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically provision the database
4. Copy the `DATABASE_URL` (automatically generated in the Variables tab)

### Step 3: Deploy the API

**Option A: Deploy from GitHub (Recommended)**

1. Push the `ghostpad-api/` folder to your GitHub repository
2. In Railway, click "+ New" → "GitHub Repo"
3. Select your repository
4. Railway will auto-detect Node.js and deploy

**Option B: Railway CLI**

```bash
cd ghostpad-api
npm install
railway login
railway init
railway link  # Link to your project
railway up
```

### Step 4: Set Environment Variables in Railway

1. Go to your Railway service → "Variables" tab
2. Add the following variables:

```env
# Railway automatically provides DATABASE_URL and PORT

# Stripe Secret Key (from Stripe Dashboard > Developers > API Keys)
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE

# Stripe Webhook Secret (you'll add this in Step 6)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Admin API Key (generate a strong random string)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ADMIN_API_KEY=your_random_32_byte_hex_string_here

# Environment
NODE_ENV=production
```

**⚠️ IMPORTANT:** Never commit your secret keys to Git!

### Step 5: Get Your Railway Deployment URL

1. After deployment, Railway will show your public URL
2. It will look like: `https://ghostpad-api-production-xxxx.up.railway.app`
3. **Copy this URL** - you'll need it for the next steps

### Step 6: Test the API

```bash
# Health check
curl https://your-railway-url.up.railway.app/health

# Expected response:
{
  "status": "healthy",
  "service": "GhostPad Premium API",
  "version": "1.0.0"
}
```

---

## 💳 Part 2: Configure Stripe

### Step 7: Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to "Developers" → "API keys"
3. Copy your **Secret key** (sk_live_...)
4. Copy your **Publishable key** (pk_live_...) - you already have this
5. Add the Secret key to Railway environment variables (Step 4)

### Step 8: Configure Stripe Webhook

1. In Stripe Dashboard, go to "Developers" → "Webhooks"
2. Click "Add endpoint"
3. Enter webhook URL: `https://your-railway-url.up.railway.app/webhook/stripe`
4. Select events to listen for:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the **Signing secret** (whsec_...)
7. Add it to Railway environment variables as `STRIPE_WEBHOOK_SECRET`

### Step 9: Update Stripe Payment Link

1. Go to your Stripe payment link: https://buy.stripe.com/00w00i8vLeB21hL8n9eME00
2. Click "Edit payment link" (or create a new one if needed)
3. Under "After payment" → Set success URL to:
   ```
   https://your-success-page.com/thank-you
   ```
   Or create a simple success page with these instructions:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Thank You - GhostPad Premium</title>
</head>
<body style="font-family: Arial; max-width: 600px; margin: 50px auto; text-align: center;">
  <h1>🎉 Thank you for subscribing to GhostPad Premium!</h1>

  <p>Your payment was successful. To activate unlimited notes:</p>

  <ol style="text-align: left; margin: 20px auto; max-width: 400px;">
    <li>Open GhostPad extension</li>
    <li>Click Settings (⚙️)</li>
    <li>Scroll to "Premium" section</li>
    <li>Enter your email: <strong>{CUSTOMER_EMAIL}</strong></li>
    <li>Click "Activate"</li>
  </ol>

  <p>Your premium access will activate instantly!</p>

  <p style="font-size: 12px; color: #666;">
    Questions? Contact: support@ghostpad.com
  </p>
</body>
</html>
```

4. Make sure "Collect customer email" is enabled in the payment link settings

---

## 🔧 Part 3: Update Chrome Extension

### Step 10: Update config.js with Railway URL

1. Open `config.js` in your extension folder
2. Update the `API_URL` with your Railway deployment URL:

```javascript
const GhostPadConfig = {
  // UPDATE THIS with your Railway URL
  API_URL: 'https://your-railway-url.up.railway.app',

  // Stripe Payment Link (already configured)
  STRIPE_PAYMENT_URL: 'https://buy.stripe.com/00w00i8vLeB21hL8n9eME00',

  // Premium Settings
  FREE_NOTE_LIMIT: 3,
  PREMIUM_NOTE_LIMIT: 1000
};
```

3. Save the file

### Step 11: Rebuild Extension

```bash
# Create new production build with updated config
python3 -m zipfile -c GhostPad-v2.3.0-PRODUCTION.zip \
  manifest.json \
  background.js \
  popup.html \
  popup.css \
  popup.js \
  options.html \
  options.css \
  options.js \
  utils.js \
  config.js \
  icons/
```

### Step 12: Test Locally

1. In Chrome, go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select your GhostPad extension folder
5. Test the premium flow:
   - Create 3 notes (should work)
   - Try creating 4th note (should show upgrade modal)
   - Click "Subscribe Now" → Opens Stripe payment link
   - Complete test payment (use Stripe test mode first!)
   - After payment, go to Settings → Premium section
   - Enter your email and click "Activate"
   - Should show "Premium activated!"

---

## 🧪 Part 4: Testing

### Test 1: Railway API Health

```bash
curl https://your-railway-url.up.railway.app/health
```

Expected: `{"status": "healthy", ...}`

### Test 2: Premium Verification (Before Payment)

```bash
curl -X POST https://your-railway-url.up.railway.app/verify-premium \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Expected: `{"success": true, "isPremium": false, ...}`

### Test 3: Manual Premium Activation (Testing Only)

```bash
curl -X POST https://your-railway-url.up.railway.app/activate-premium \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "apiKey":"YOUR_ADMIN_API_KEY"
  }'
```

Expected: `{"success": true, "message": "Premium activated for test@example.com"}`

### Test 4: Verify Activation

```bash
curl -X POST https://your-railway-url.up.railway.app/verify-premium \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Expected: `{"success": true, "isPremium": true, ...}`

### Test 5: Stripe Webhook (Use Stripe CLI)

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to https://your-railway-url.up.railway.app/webhook/stripe

# In another terminal, trigger test event:
stripe trigger checkout.session.completed
```

Check Railway logs for webhook processing.

---

## 📊 Part 5: Monitoring

### View Railway Logs

```bash
railway logs --follow
```

Or in Railway dashboard → Your service → "Logs" tab

### Check Premium User Stats

```bash
curl "https://your-railway-url.up.railway.app/stats?apiKey=YOUR_ADMIN_API_KEY"
```

Expected:
```json
{
  "success": true,
  "stats": {
    "total_users": "10",
    "active_users": "9",
    "cancelled_users": "1"
  }
}
```

### Query Database Directly

```bash
# Via Railway CLI
railway run psql

# Then in psql:
SELECT email, payment_status, created_at FROM premium_users ORDER BY created_at DESC LIMIT 10;
```

---

## 🐛 Troubleshooting

### Issue: Webhook not receiving events

**Solution:**
1. Check Railway logs: `railway logs --follow`
2. Verify webhook URL in Stripe dashboard is correct
3. Confirm webhook secret matches in Railway env vars
4. Test with Stripe CLI: `stripe listen --forward-to ...`

### Issue: Premium verification fails in extension

**Solution:**
1. Check browser console for errors (F12 → Console)
2. Verify `config.js` has correct Railway URL
3. Check Railway logs for API errors
4. Ensure `host_permissions` in manifest.json allows your Railway domain

### Issue: Database connection error

**Solution:**
1. Verify PostgreSQL service is running in Railway
2. Check `DATABASE_URL` environment variable is set
3. Restart the Railway service

### Issue: Email not found after payment

**Solution:**
1. Wait 1-2 minutes for webhook processing
2. Check Railway logs for webhook errors
3. Verify email matches exactly (case-insensitive)
4. Check Stripe dashboard → Payments → find the payment → check customer email

### Issue: CORS errors

**Solution:**
The API is already configured with proper CORS headers for Chrome extensions. If you see CORS errors:
1. Verify you're making requests from the extension (not a regular webpage)
2. Check `host_permissions` in manifest.json includes your Railway domain

---

## 🔒 Security Checklist

- [x] Stripe secret keys stored in Railway environment variables (not in code)
- [x] Webhook signature verification enabled
- [x] Admin API key is strong random string (32+ bytes)
- [x] HTTPS enforced for all API endpoints
- [x] SQL injection protection via parameterized queries
- [x] Email normalization (lowercase, trimmed)
- [x] Helmet.js security headers enabled
- [x] CORS restricted to Chrome extensions only

---

## 📝 Post-Deployment Tasks

1. ✅ Update Stripe payment link success URL
2. ✅ Test end-to-end payment flow
3. ✅ Monitor Railway logs for errors
4. ✅ Set up Stripe email receipts (Settings → Emails)
5. ✅ Create support email (e.g., support@ghostpad.com)
6. ✅ Update Chrome Web Store listing with premium info
7. ✅ Consider adding backup/monitoring for Railway database

---

## 💰 Revenue Tracking

### Stripe Dashboard

- View revenue: Dashboard → Home → Revenue chart
- View subscribers: Customers → Filter by "Active subscriptions"
- Download reports: Reports → Download

### Railway Database Query

```sql
-- Count active subscribers
SELECT COUNT(*) FROM premium_users WHERE payment_status = 'active';

-- Revenue calculation (assumes $1.99/month)
SELECT COUNT(*) * 1.99 as monthly_revenue
FROM premium_users
WHERE payment_status = 'active';

-- New subscribers this month
SELECT COUNT(*) FROM premium_users
WHERE payment_status = 'active'
AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW());
```

---

## 🎯 Success Metrics

Track these KPIs after launch:

- **Conversion Rate**: (Premium Users / Total Users) × 100
- **Churn Rate**: (Cancelled / Total Premium) × 100
- **MRR** (Monthly Recurring Revenue): Active Subscribers × $1.99
- **ARPU** (Average Revenue Per User): MRR / Total Users

---

## 📚 Additional Resources

- **Railway Docs**: https://docs.railway.app/
- **Stripe Webhooks Guide**: https://stripe.com/docs/webhooks
- **Stripe Testing**: https://stripe.com/docs/testing
- **Chrome Extension Host Permissions**: https://developer.chrome.com/docs/extensions/mv3/declare_permissions/

---

## 🆘 Support

If you encounter issues:

1. Check Railway logs: `railway logs --follow`
2. Check browser console: F12 → Console
3. Check Stripe webhook logs: Dashboard → Developers → Webhooks → Events
4. Test manually with curl commands above

---

**Version**: 2.3.0
**Last Updated**: November 29, 2024
**License**: MIT

Happy coding! 🚀
