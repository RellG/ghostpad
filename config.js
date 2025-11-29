// GhostPad Configuration
// Update API_URL after deploying to Railway

const GhostPadConfig = {
  // Railway API URL - UPDATE THIS after deployment
  API_URL: 'https://your-railway-url.up.railway.app',

  // Stripe Payment Link
  STRIPE_PAYMENT_URL: 'https://buy.stripe.com/00w00i8vLeB21hL8n9eME00',

  // Premium Settings
  FREE_NOTE_LIMIT: 3,
  PREMIUM_NOTE_LIMIT: 1000
};

// Export for use in other scripts
if (typeof self !== 'undefined') {
  self.GhostPadConfig = GhostPadConfig;
}
