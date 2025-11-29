# Privacy Policy for GhostPad

**Last Updated: November 29, 2024**

## Introduction

GhostPad ("we," "our," or "the extension") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our Chrome extension.

## Information We Collect

### 1. Data You Provide
- **Notes Content**: All notes you create are stored locally in your browser
- **Email Address**: When activating premium features, you provide your email address for verification
- **Password-Protected Notes**: Encrypted passwords for notes you choose to protect

### 2. Automatically Collected Data
- **Chrome Identity Information**: With your permission, we may access your Google account email to automatically verify premium status
- **Premium Status**: Whether you have an active premium subscription
- **Usage Statistics**: Basic usage data (number of notes) stored locally

### 3. Payment Information
- **Payment Processing**: All payment transactions are processed securely by Stripe, Inc.
- **We Do NOT Collect**: Credit card numbers, billing addresses, or any payment credentials
- **Stripe Privacy**: Please review [Stripe's Privacy Policy](https://stripe.com/privacy) for how they handle payment data

## How We Use Your Information

We use the collected information for the following purposes:

1. **Provide Core Functionality**: Store and retrieve your notes locally in your browser
2. **Premium Verification**: Verify your premium subscription status using your email
3. **Security**: Encrypt password-protected notes using AES-256-GCM encryption
4. **Sync Across Devices**: Use Chrome Sync Storage to sync premium status across your devices
5. **Auto-Detection**: Optionally use Chrome Identity API to automatically activate premium features

## Data Storage and Security

### Local Storage
- **All notes are stored locally** in your browser using Chrome's Storage API
- **No cloud storage**: We do not store your notes on any external servers
- **Encryption**: Password-protected notes are encrypted using industry-standard AES-256-GCM encryption
- **Your Control**: You can delete all data at any time by uninstalling the extension

### Premium Verification Database
- **What We Store**: Email addresses and premium subscription status
- **Where**: Secure PostgreSQL database hosted on Railway.app
- **Encryption**: All data transmitted over HTTPS
- **Retention**: Premium status stored for the duration of your subscription

### Security Measures
- HTTPS-only API communication
- PBKDF2 password hashing (100,000 iterations)
- AES-256-GCM encryption for protected notes
- Stripe webhook signature verification
- No third-party analytics or tracking

## Data Sharing and Disclosure

**We do NOT sell, trade, or share your personal information with third parties.**

We only share data with:

1. **Stripe, Inc.**: For payment processing (governed by their privacy policy)
2. **Chrome Sync**: To sync premium status across your devices (governed by Google's privacy policy)

We may disclose information if required by law or to:
- Comply with legal obligations
- Protect our rights and safety
- Prevent fraud or abuse

## Your Rights and Choices

You have the following rights:

1. **Access Your Data**: View all notes in the extension at any time
2. **Delete Your Data**: Uninstall the extension to delete all local data
3. **Export Your Data**: Copy and export notes manually
4. **Cancel Subscription**: Cancel your premium subscription at any time through Stripe
5. **Opt-Out of Auto-Detection**: Deny Chrome Identity permission; use manual email activation instead

## Permissions Explained

GhostPad requests the following Chrome permissions:

- **storage**: To save your notes locally and sync premium status
- **notifications**: To show reminders for your notes
- **alarms**: To schedule note reminders
- **identity** (optional): To auto-detect your Google account email for premium verification
- **identity.email** (optional): To access your email for auto-activation
- **host_permissions** (Railway API): To verify premium subscription status

## Children's Privacy

GhostPad is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with information, please contact us.

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by:
- Updating the "Last Updated" date
- Displaying a notice in the extension (for material changes)

Your continued use of GhostPad after changes constitutes acceptance of the updated policy.

## Data Retention

- **Notes**: Stored locally until you delete them or uninstall the extension
- **Premium Status**: Stored for the duration of your active subscription
- **Canceled Subscriptions**: Premium status removed within 24 hours of cancellation

## International Users

GhostPad is operated from the United States. If you are located outside the U.S., your information will be transferred to and processed in the United States.

## Contact Us

If you have questions or concerns about this Privacy Policy or your data, please contact us:

- **Email**: TaReynolds725@gmail.com
- **GitHub**: https://github.com/RellG/ghostpad

## Third-Party Services

GhostPad uses the following third-party services:

1. **Stripe** (Payment Processing)
   - Privacy Policy: https://stripe.com/privacy
   - Purpose: Secure payment processing for premium subscriptions

2. **Railway.app** (API Hosting)
   - Privacy Policy: https://railway.app/legal/privacy
   - Purpose: Host premium verification API

3. **Chrome Sync** (Google)
   - Privacy Policy: https://policies.google.com/privacy
   - Purpose: Sync premium status across devices

## Your Consent

By using GhostPad, you consent to this Privacy Policy and agree to its terms.

---

**GhostPad - Secure, Private Note-Taking**

This privacy policy is compliant with:
- Chrome Web Store Developer Program Policies
- General Data Protection Regulation (GDPR)
- California Consumer Privacy Act (CCPA)
- Stripe's Terms of Service
