// GhostPad Premium API - Railway Backend
// Handles Stripe webhooks and premium verification

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS premium_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        stripe_customer_id VARCHAR(255),
        stripe_subscription_id VARCHAR(255),
        payment_status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_email ON premium_users(email);
    `);
    console.log('✅ Database initialized');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  } finally {
    client.release();
  }
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['chrome-extension://*', 'https://*'],
  methods: ['GET', 'POST'],
  credentials: true
}));

// Stripe webhook - RAW body needed for signature verification
app.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerEmail = session.customer_email || session.customer_details?.email;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        if (customerEmail) {
          await addPremiumUser(customerEmail, customerId, subscriptionId);
          console.log(`✅ Premium activated for: ${customerEmail}`);
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Update subscription status
        const status = subscription.status === 'active' ? 'active' : 'cancelled';
        await updateSubscriptionStatus(customerId, status, subscription.id);
        console.log(`🔄 Subscription ${status} for customer: ${customerId}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        await updateSubscriptionStatus(customerId, 'payment_failed');
        console.log(`⚠️ Payment failed for customer: ${customerId}`);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Regular JSON parsing for other routes
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'GhostPad Premium API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Verify premium status endpoint
app.post('/verify-premium', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Valid email required'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const client = await pool.connect();

    try {
      const result = await client.query(
        'SELECT email, payment_status, created_at FROM premium_users WHERE LOWER(email) = $1',
        [normalizedEmail]
      );

      if (result.rows.length > 0) {
        const user = result.rows[0];
        const isPremium = user.payment_status === 'active';

        return res.json({
          success: true,
          isPremium: isPremium,
          email: user.email,
          status: user.payment_status,
          activatedAt: user.created_at
        });
      } else {
        return res.json({
          success: true,
          isPremium: false,
          message: 'Email not found in premium users'
        });
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Premium verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Verification failed'
    });
  }
});

// Manual activation endpoint (for testing or manual grants)
app.post('/activate-premium', async (req, res) => {
  try {
    const { email, apiKey } = req.body;

    // Protect this endpoint with API key
    if (apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    await addPremiumUser(normalizedEmail, null, null);

    res.json({
      success: true,
      message: `Premium activated for ${normalizedEmail}`
    });
  } catch (error) {
    console.error('❌ Manual activation error:', error);
    res.status(500).json({
      success: false,
      error: 'Activation failed'
    });
  }
});

// Get premium users count (admin only)
app.get('/stats', async (req, res) => {
  try {
    const { apiKey } = req.query;

    if (apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT
          COUNT(*) as total_users,
          COUNT(*) FILTER (WHERE payment_status = 'active') as active_users,
          COUNT(*) FILTER (WHERE payment_status = 'cancelled') as cancelled_users
        FROM premium_users
      `);

      res.json({
        success: true,
        stats: result.rows[0]
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Database helper functions
async function addPremiumUser(email, customerId, subscriptionId) {
  const client = await pool.connect();
  try {
    const normalizedEmail = email.toLowerCase().trim();

    await client.query(`
      INSERT INTO premium_users (email, stripe_customer_id, stripe_subscription_id, payment_status, updated_at)
      VALUES ($1, $2, $3, 'active', NOW())
      ON CONFLICT (email)
      DO UPDATE SET
        stripe_customer_id = COALESCE($2, premium_users.stripe_customer_id),
        stripe_subscription_id = COALESCE($3, premium_users.stripe_subscription_id),
        payment_status = 'active',
        updated_at = NOW()
    `, [normalizedEmail, customerId, subscriptionId]);

    return true;
  } catch (error) {
    console.error('❌ Database error adding premium user:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function updateSubscriptionStatus(customerId, status, subscriptionId = null) {
  const client = await pool.connect();
  try {
    await client.query(`
      UPDATE premium_users
      SET payment_status = $1,
          stripe_subscription_id = COALESCE($2, stripe_subscription_id),
          updated_at = NOW()
      WHERE stripe_customer_id = $3
    `, [status, subscriptionId, customerId]);

    return true;
  } catch (error) {
    console.error('❌ Database error updating subscription:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Start server
async function startServer() {
  try {
    // Initialize database first
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 GhostPad Premium API running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});
