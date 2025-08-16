-- Enlighten Database Setup for Supabase
-- Run this in your Supabase SQL Editor

-- Create epiphanies table
CREATE TABLE epiphanies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  content TEXT NOT NULL,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  likes_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}'
);

-- Create likes table
CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  epiphany_id UUID REFERENCES epiphanies(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(epiphany_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE epiphanies ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access" ON epiphanies FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON epiphanies FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON epiphanies FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON likes FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON likes FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_epiphanies_created_at ON epiphanies(created_at DESC);
CREATE INDEX idx_epiphanies_author_id ON epiphanies(author_id);
CREATE INDEX idx_epiphanies_tags ON epiphanies USING GIN(tags);
CREATE INDEX idx_likes_epiphany_id ON likes(epiphany_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);

-- Insert some sample data (optional)
INSERT INTO epiphanies (title, content, author_id, author_name, tags) VALUES
(
  'The Power of Small Steps',
  'Every great journey begins with a single step. What I realized is that consistency in small actions compounds into extraordinary results over time. The key is not the size of the step, but the frequency of taking it.',
  'sample_user_1',
  'Wisdom Seeker',
  ARRAY['motivation', 'productivity', 'life-lessons']
),
(
  'Embracing Uncertainty',
  'Life is not about having all the answers, but about being comfortable with the questions. The most profound insights often come from sitting with uncertainty rather than rushing to conclusions.',
  'sample_user_2',
  'Philosophy Explorer',
  ARRAY['philosophy', 'mindfulness', 'growth']
),
(
  'The Beauty of Constraints',
  'Limitations are not obstacles but catalysts for creativity. When resources are scarce, the mind becomes more inventive. What we perceive as constraints often lead to our most innovative solutions.',
  'sample_user_3',
  'Creative Thinker',
  ARRAY['creativity', 'innovation', 'problem-solving']
);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_epiphanies_updated_at 
    BEFORE UPDATE ON epiphanies 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
