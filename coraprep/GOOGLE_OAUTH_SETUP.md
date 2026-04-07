# Google OAuth Setup Instructions for Cora Prep

## Overview
This guide will help you set up Google OAuth so users can sign in with their Google accounts.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Sign in with your Google account
3. Click the project dropdown at the top
4. Click "NEW PROJECT"
5. Enter project name: `Cora Prep` (or your preferred name)
6. Click "CREATE"
7. Wait for the project to be created

## Step 2: Enable OAuth 2.0 Consent Screen

1. In the Google Cloud Console, go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type
3. Click **CREATE**
4. Fill in the form:
   - **App name**: Cora Prep
   - **User support email**: Your email address
   - **Developer contact**: Your email address
5. Click **SAVE AND CONTINUE**
6. On "Scopes" page, click **SAVE AND CONTINUE**
7. On "Test users" page, click **ADD USERS** and add your email
8. Click **SAVE AND CONTINUE**
9. Click **BACK TO DASHBOARD**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Choose **Web application**
4. Name it: `Cora Prep Web Client`
5. Under **Authorized JavaScript origins**, click **ADD URI** and add:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production, replace with your domain)
6. Under **Authorized redirect URIs**, click **ADD URI** and add:
   - `http://localhost:3000/api/auth/google/callback`
   - `https://yourdomain.com/api/auth/google/callback` (for production)
7. Click **CREATE**
8. Copy the **Client ID** and **Client Secret**

## Step 4: Add Credentials to Your Environment

1. Open `.env.local` in your Cora Prep project
2. Uncomment these lines:
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```
3. Replace `your_client_id` with the Client ID from Step 3
4. Replace `your_client_secret` with the Client Secret from Step 3

**Important**: Keep the `GOOGLE_CLIENT_SECRET` secret! Never commit it to version control.

## Step 5: Install Google OAuth Library (Next.js)

Run this command:
```bash
npm install next-auth
npm install --save-dev @types/next-auth
```

## Example: Implementing Google OAuth

Here's an updated version of the login API that includes Google OAuth:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

// Exchange Google authorization code for user info
async function exchangeCodeForToken(code: string) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: 'http://localhost:3000/api/auth/google/callback',
    }),
  })
  return response.json()
}

// Get user info from Google
async function getGoogleUserInfo(accessToken: string) {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  return response.json()
}
```

## Testing Google OAuth

1. When you're ready, add the Google OAuth implementation to `/api/auth/google/route.ts`
2. Test by clicking "Sign in with Google" on the login page
3. You should be redirected to Google's login page
4. After confirming, you'll be logged into Cora Prep

## Troubleshooting

**"Invalid client id"**: Make sure the Client ID in `.env.local` matches exactly
**"Redirect URI mismatch"**: Check that the redirect URI matches what you set in Google Cloud Console
**"localhost:3000 refused to connect"**: Make sure the dev server is running (`npm run dev`)

## Production Deployment

Before deploying to production:
1. Update the redirect URIs to your production domain
2. Move from "External" to "Internal" user type in OAuth consent screen
3. Use a strong `JWT_SECRET` in your environment variables
4. Never expose `GOOGLE_CLIENT_SECRET` in client-side code

## Current Status

- ✅ Login/Signup UI created
- ✅ Email/password authentication working
- ⏳ Google OAuth: Requires credentials from Google Cloud Console
- ✅ Session persistence: Data saved to localStorage with JWT tokens
- ✅ Protected routes: /learn requires authentication

For questions or issues, refer to the [Google OAuth documentation](https://developers.google.com/identity/protocols/oauth2).
