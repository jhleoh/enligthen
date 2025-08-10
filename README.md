# Enlighten - Share Your Epiphanies

A modern, elegant social platform for sharing moments of enlightenment and epiphany with the world. Built with Next.js, Supabase, and Tailwind CSS.

## ✨ Features

- **Beautiful Dashboard**: Clean, modern interface focused on ideas and insights
- **Share Epiphanies**: Easy-to-use form for sharing your enlightenments
- **Like System**: Show appreciation for inspiring insights
- **Tagging System**: Organize and categorize your epiphanies
- **Responsive Design**: Works perfectly on all devices
- **Real-time Updates**: Instant feedback when sharing and liking

## 🚀 Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom enlightenment theme
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (ready for implementation)
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **TypeScript**: Full type safety

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd enlighten
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Database Tables

Run these SQL commands in your Supabase SQL editor:

```sql
-- Create epiphanies table
CREATE TABLE epiphanies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
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

-- Enable Row Level Security (optional but recommended)
ALTER TABLE epiphanies ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your needs)
CREATE POLICY "Allow public read access" ON epiphanies FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON epiphanies FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON epiphanies FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON likes FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON likes FOR INSERT WITH CHECK (true);
```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 Customization

### Colors
The app uses a custom enlightenment color palette defined in `tailwind.config.js`:

- **Primary**: Blue tones for trust and wisdom
- **Enlightenment**: Golden yellow tones for inspiration and insight

### Typography
- **Inter**: Clean, modern sans-serif for UI elements
- **Merriweather**: Elegant serif for content and headings

### Animations
Custom CSS animations for a polished feel:
- `fade-in`: Smooth appearance of content
- `slide-up`: Elegant form transitions
- `glow`: Subtle pulsing effect on the logo

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔮 Future Enhancements

- **User Authentication**: Full user accounts and profiles
- **Comments System**: Discuss and expand on epiphanies
- **Search & Filtering**: Find specific insights by tags or content
- **Bookmarks**: Save your favorite epiphanies
- **Social Sharing**: Share insights on social media
- **Mobile App**: React Native companion app
- **AI Insights**: AI-powered content recommendations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with love for the community of thinkers and seekers
- Inspired by the countless moments of insight that shape our world
- Special thanks to the open source community

---

**Share your enlightenment. Inspire the world.** ✨
