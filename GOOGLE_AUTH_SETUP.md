# Google Authentication Setup Guide

This guide will walk you through setting up Google OAuth authentication for your Enlighten app using Supabase.

## Prerequisites

- A Supabase project (already created)
- A Google Cloud Console project
- Your Next.js app running locally

## Step 1: Set Up Google OAuth

### 1.1 Create Google Cloud Console Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)

### 1.2 Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type
3. Fill in the required information:
   - App name: `Enlighten`
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
5. Add test users (your email for testing)

### 1.3 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Add authorized redirect URIs:
   - `https://your-project-id.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for local development)
5. Copy the **Client ID** and **Client Secret**

## Step 2: Configure Supabase

### 2.1 Enable Google Provider

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Find **Google** and click **Enable**
4. Enter your Google OAuth credentials:
   - **Client ID**: Your Google OAuth client ID
   - **Client Secret**: Your Google OAuth client secret
5. Click **Save**

### 2.2 Update Redirect URLs

1. In **Authentication** > **URL Configuration**
2. Add your redirect URLs:
   - `http://localhost:3000/auth/callback` (local development)
   - `https://your-domain.com/auth/callback` (production)

## Step 3: Update Database Schema

### 3.1 Run the Updated SQL

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `supabase-setup-with-auth.sql`
3. Click **Run** to execute the SQL

This will create:
- `profiles` table for user data
- Updated `epiphanies` table with author information
- `likes` table for tracking user likes
- Proper Row Level Security (RLS) policies

## Step 4: Environment Variables

### 4.1 Update .env.local

Make sure your `.env.local` file has the correct Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4.2 Verify Supabase Settings

1. Go to **Settings** > **API** in your Supabase dashboard
2. Copy the **Project URL** and **anon/public key**
3. Ensure they match your environment variables

## Step 5: Test Authentication

### 5.1 Start Your App

```bash
npm run dev
```

### 5.2 Test Sign In

1. Open your app in the browser
2. Click **Sign in with Google**
3. Complete the Google OAuth flow
4. Verify you're redirected back to your app
5. Check that your profile is created in the `profiles` table

## Step 6: Production Deployment

### 6.1 Update Redirect URLs

When deploying to production:

1. Update Google OAuth redirect URLs to include your production domain
2. Update Supabase redirect URLs to include your production domain
3. Ensure your environment variables are set in your hosting platform

### 6.2 Vercel Deployment

If using Vercel:

1. Add environment variables in your Vercel project settings
2. Deploy your app
3. Test authentication flow in production

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**
   - Check that your redirect URLs match exactly in both Google and Supabase
   - Ensure no trailing slashes or extra characters

2. **"OAuth consent screen not configured"**
   - Complete the OAuth consent screen setup in Google Cloud Console
   - Add your email as a test user

3. **"Client ID not found"**
   - Verify your Google OAuth credentials are correct
   - Check that the Google+ API is enabled

4. **Authentication callback not working**
   - Ensure your auth callback route is properly configured
   - Check that the route file is in the correct location (`app/auth/callback/route.ts`)

### Debug Steps

1. Check browser console for errors
2. Verify Supabase logs in the dashboard
3. Check that your database tables are created correctly
4. Ensure RLS policies are working as expected

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **OAuth Credentials**: Keep your Google OAuth client secret secure
3. **Redirect URLs**: Only use trusted domains in production
4. **RLS Policies**: Verify that your Row Level Security policies are working correctly

## Next Steps

After setting up authentication:

1. Test creating epiphanies while authenticated
2. Test the like/unlike functionality
3. Verify user profiles are created automatically
4. Test sign out functionality
5. Consider adding additional authentication providers (GitHub, Twitter, etc.)

## Support

If you encounter issues:

1. Check the [Supabase documentation](https://supabase.com/docs)
2. Review [Google OAuth documentation](https://developers.google.com/identity/protocols/oauth2)
3. Check the [Next.js documentation](https://nextjs.org/docs)
4. Review your browser's network tab for failed requests
