# GhostPad Premium API

Railway backend for GhostPad Chrome extension premium verification with Stripe integration.

## Features

- ✅ Stripe webhook handling for automatic premium activation
- ✅ Premium status verification API
- ✅ PostgreSQL database for user management
- ✅ Manual activation endpoint (admin only)
- ✅ Subscription status tracking
- ✅ Secure with Helmet.js and CORS

## Quick Start - Railway Deployment

### 1. Create New Railway Project

1. Go to [Railway](https://railway.app/)
2. Click "New Project"
3. Select "Deploy from GitHub repo" (or "Empty Project")
4. Add PostgreSQL database:
   - Click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway will auto-generate `DATABASE_URL`

### 2. Deploy the API

**Option A: From GitHub**
1. Push this `ghostpad-api` folder to your GitHub repo
2. In Railway, connect your GitHub repo
3. Railway will auto-detect Node.js and deploy

**Option B: Railway CLI**
```bash
cd ghostpad-api
npm install
railway login
railway init
railway up
```

### 3. Set Environment Variables in Railway

In Railway dashboard, go to your service → Variables tab, add:

```env
STRIPE_SECRET_KEY=sk_live_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
ADMIN_API_KEY=generate_random_string_here
NODE_ENV=production
```

**Note:** `DATABASE_URL` and `PORT` are automatically provided by Railway.

### 4. Configure Stripe Webhook

1. Get your Railway deployment URL (e.g., `https://ghostpad-api.up.railway.app`)
2. Go to Stripe Dashboard → Developers → Webhooks
3. Click "Add endpoint"
4. Enter webhook URL: `https://your-railway-url.up.railway.app/webhook/stripe`
5. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
6. Copy the "Signing secret" (whsec_...) and add to Railway environment variables

### 5. Update Stripe Payment Link

1. Go to your Stripe payment link settings
2. After payment completion, redirect to a success page that shows:
   ```
   Thank you for subscribing to GhostPad Premium!

   To activate unlimited notes:
   1. Open GhostPad extension
   2. Click Settings (⚙️)
   3. Enter your email: {CUSTOMER_EMAIL}
   4. Click "Activate Premium"

   Your premium access is now active!
   ```

## API Endpoints

### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "GhostPad Premium API",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### `POST /verify-premium`
Verify if an email has premium access.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (Premium User):**
```json
{
  "success": true,
  "isPremium": true,
  "email": "user@example.com",
  "status": "active",
  "activatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Response (Non-Premium):**
```json
{
  "success": true,
  "isPremium": false,
  "message": "Email not found in premium users"
}
```

### `POST /webhook/stripe`
Stripe webhook endpoint (called automatically by Stripe).

Handles:
- `checkout.session.completed` - Activates premium on successful payment
- `customer.subscription.updated` - Updates subscription status
- `customer.subscription.deleted` - Marks subscription as cancelled
- `invoice.payment_failed` - Marks payment as failed

### `POST /activate-premium` (Admin Only)
Manually activate premium for an email.

**Request:**
```json
{
  "email": "user@example.com",
  "apiKey": "your_admin_api_key"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Premium activated for user@example.com"
}
```

### `GET /stats?apiKey=your_admin_api_key` (Admin Only)
Get premium user statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_users": "100",
    "active_users": "95",
    "cancelled_users": "5"
  }
}
```

## Database Schema

```sql
CREATE TABLE premium_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  payment_status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Local Development

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your values

# Run development server
npm run dev
```

## Testing

### Test Health Endpoint
```bash
curl https://your-railway-url.up.railway.app/health
```

### Test Premium Verification
```bash
curl -X POST https://your-railway-url.up.railway.app/verify-premium \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Test Manual Activation
```bash
curl -X POST https://your-railway-url.up.railway.app/activate-premium \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","apiKey":"your_admin_api_key"}'
```

## Security

- ✅ Helmet.js for security headers
- ✅ CORS configured for Chrome extensions
- ✅ Stripe webhook signature verification
- ✅ Admin endpoints protected with API key
- ✅ Email normalization (lowercase, trimmed)
- ✅ SQL injection protection via parameterized queries

## Troubleshooting

**Issue:** Webhook not receiving events
- Check Railway logs: `railway logs`
- Verify webhook URL in Stripe dashboard
- Confirm webhook secret matches in Railway env vars

**Issue:** Database connection error
- Verify PostgreSQL service is running in Railway
- Check `DATABASE_URL` is set correctly

**Issue:** Premium verification fails
- Check email is exactly as entered in Stripe checkout
- Verify webhook successfully processed the payment
- Check database manually: `railway run psql -c "SELECT * FROM premium_users;"`

## Support

For issues, check Railway logs:
```bash
railway logs --follow
```

## License

MIT
