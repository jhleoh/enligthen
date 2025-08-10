# Deployment Guide for Enlighten

This guide will walk you through deploying your Enlighten application to Vercel and setting up Supabase.

## 🚀 Deploy to Vercel

### 1. Prepare Your Repository

1. Push your code to GitHub, GitLab, or Bitbucket
2. Ensure all files are committed and pushed

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your repository
4. Vercel will automatically detect it's a Next.js project

### 3. Configure Environment Variables

In your Vercel project settings, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Deploy

Click "Deploy" and Vercel will build and deploy your app automatically!

## 🗄️ Set Up Supabase

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `enlighten` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users

### 2. Get API Keys

1. Go to Settings > API in your Supabase dashboard
2. Copy the following:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

### 3. Set Up Database

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `supabase-setup.sql`
3. Click "Run" to execute all the SQL commands

### 4. Test Your Setup

1. Go to Table Editor in Supabase
2. You should see two tables: `epiphanies` and `likes`
3. The `epiphanies` table should have 3 sample entries

## 🔧 Environment Configuration

### Local Development

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Production (Vercel)

Add the same environment variables in your Vercel project settings.

## 🧪 Testing Your Deployment

1. **Local Testing**: Run `npm run dev` and visit `http://localhost:3000`
2. **Production Testing**: Visit your Vercel URL
3. **Database Testing**: Try creating a new epiphany and check if it appears in Supabase

## 🚨 Common Issues & Solutions

### Issue: "Supabase client not initialized"
**Solution**: Check that your environment variables are correctly set in Vercel

### Issue: "Database connection failed"
**Solution**: Verify your Supabase URL and anon key are correct

### Issue: "Table doesn't exist"
**Solution**: Run the SQL setup commands in Supabase SQL Editor

### Issue: "CORS errors"
**Solution**: Supabase handles CORS automatically, but ensure your domain is added to allowed origins if needed

## 📱 Custom Domain (Optional)

1. In Vercel, go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Update your DNS records as instructed

## 🔒 Security Considerations

- **Row Level Security**: Already enabled in the SQL setup
- **API Keys**: Never expose your service role key (only use anon key in frontend)
- **CORS**: Supabase handles this automatically
- **Rate Limiting**: Consider implementing rate limiting for production use

## 📊 Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Supabase Dashboard**: Monitor database performance and usage
- **Error Tracking**: Consider adding Sentry or similar for error monitoring

## 🎉 You're Live!

Your Enlighten application is now deployed and ready to inspire the world! 

**Next Steps:**
- Share your app with friends and family
- Monitor usage and performance
- Consider adding user authentication
- Implement additional features from the roadmap

---

**Need Help?**
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
