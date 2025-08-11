-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing policies first to ensure clean setup
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view epiphanies" ON epiphanies;
DROP POLICY IF EXISTS "Authenticated users can create epiphanies" ON epiphanies;
DROP POLICY IF EXISTS "Users can update their own epiphanies" ON epiphanies;
DROP POLICY IF EXISTS "Users can delete their own epiphanies" ON epiphanies;
DROP POLICY IF EXISTS "Anyone can view likes" ON likes;
DROP POLICY IF EXISTS "Authenticated users can create likes" ON likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;

-- Drop existing triggers to ensure clean setup
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_epiphanies_updated_at ON epiphanies;

-- Create profiles table for user authentication
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create epiphanies table with updated structure
CREATE TABLE IF NOT EXISTS epiphanies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  likes_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}'
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  epiphany_id UUID REFERENCES epiphanies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(epiphany_id, user_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE epiphanies ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Profiles policies - Fixed to allow profile creation
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can create profiles" ON profiles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Epiphanies policies - Fixed to properly handle authenticated users
CREATE POLICY "Anyone can view epiphanies" ON epiphanies
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create epiphanies" ON epiphanies
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own epiphanies" ON epiphanies
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own epiphanies" ON epiphanies
  FOR DELETE USING (auth.uid() = author_id);

-- Likes policies
CREATE POLICY "Anyone can view likes" ON likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create likes" ON likes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own likes" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_epiphanies_author_id ON epiphanies(author_id);
CREATE INDEX IF NOT EXISTS idx_epiphanies_created_at ON epiphanies(created_at);
CREATE INDEX IF NOT EXISTS idx_likes_epiphany_id ON likes(epiphany_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_epiphanies_updated_at 
  BEFORE UPDATE ON epiphanies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: Sample data will be created automatically when users sign in
-- The UserProfile component will create profile records for authenticated users
-- Users can then create epiphanies through the web interface

-- Enable Google OAuth in Supabase (run this in your Supabase dashboard)
-- 1. Go to Authentication > Providers
-- 2. Enable Google provider
-- 3. Add your Google OAuth credentials (Client ID and Client Secret)
-- 4. Add authorized redirect URLs: https://your-project.supabase.co/auth/v1/callback
