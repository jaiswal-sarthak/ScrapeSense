# 🤖 AI Monitor - Intelligent Web Scraping Dashboard

> Autonomous web scraping with AI-powered schema generation, real-time monitoring, and instant notifications.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)
![AI Powered](https://img.shields.io/badge/AI-Powered-purple?style=flat-square)

## 🚀 Live Demo

**👉 [Try it now: https://scrape-sense-one.vercel.app](https://scrape-sense-one.vercel.app)**

---

## 📖 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎯 Core Functionality
- **AI-Powered Schema Generation** - No manual CSS selectors needed
- **Autonomous Scraping** - Scheduled runs with configurable intervals
- **Multi-Provider AI Fallback** - OpenAI → Groq → Gemini
- **Change Detection** - Track and log all data changes over time
- **Smart Caching** - 7-day TTL cache for AI responses

### 📊 Analytics & Insights
- **Real-time Dashboard** - Monitor all scraping activities
- **7-Day Trend Analysis** - Visualize results and changes
- **Success Rate Tracking** - Performance metrics
- **Top Sites Analytics** - Most active monitoring targets
- **Peak Activity Times** - Optimize scheduling based on patterns

### 📤 Export & Sharing
- **Multi-format Export** - CSV, JSON, PDF
- **Telegram Integration** - Send exports directly to Telegram
- **Download or Send** - Flexible sharing options
- **Batch Operations** - Export all or filter by task

### 🔔 Notifications
- **Telegram Alerts** - Instant notifications with rich formatting
- **Email Reports** - Detailed HTML email reports via Resend
- **Customizable Thresholds** - Set minimum changes to trigger alerts
- **Test Functionality** - Verify notifications before going live

### 🚀 User Experience
- **Quick Start Presets** - One-click task creation for popular sites
- **Run Now Button** - Instant manual scraping
- **Mobile Responsive** - Works perfectly on all devices
- **Dark Mode** - Beautiful UI with theme switching
- **Real-time Updates** - Live status and progress tracking

### 🔒 Security
- **Supabase Auth** - Secure authentication with NextAuth.js
- **Row Level Security** - Data isolation per user
- **Rate Limiting** - Protect against abuse
- **CSRF Protection** - Secure API routes
- **Encrypted Storage** - API keys stored securely

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

### Backend
- **Runtime**: Node.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js
- **Scraping**: Playwright
- **HTML Parsing**: node-html-parser
- **Sanitization**: sanitize-html

### AI & ML
- **Primary**: Groq (llama-3.1-8b-instant)
- **Fallback**: OpenAI (GPT-4)
- **Fallback**: Google Gemini
- **Caching**: LRU Cache with 7-day TTL

### Integrations
- **Notifications**: Telegram Bot API, Resend Email
- **Export**: Papa Parse (CSV), jsPDF (PDF)
- **Scheduling**: Vercel Cron or custom intervals

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.x or higher
- **npm** or **yarn** or **pnpm**
- **Supabase Account** (free tier works)
- **At least one AI API key** (Groq/OpenAI/Gemini)
- **Optional**: Telegram Bot Token & Resend API Key for notifications

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ai-monitor.git
cd ai-monitor
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp env.example .env.local
```

Edit `.env.local` with your credentials (see [Configuration](#-configuration)).

### 4. Set Up Database

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema (provided in `docs/DATABASE_SCHEMA.sql` if available)
3. Get your Supabase URL and keys from project settings

### 5. Install Playwright Browsers

```bash
npx playwright install
```

On Windows, you may also need:
```bash
npx playwright install winldd
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Configuration

### Required Environment Variables

```env
# Database (Required)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication (Required)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Google OAuth (Optional, for Google Sign-in)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AI Providers (At least one required)
OPENAI_API_KEY=sk-your-openai-key        # Recommended
GROQ_API_KEY=your-groq-key               # Fast & Free
GEMINI_API_KEY=your-gemini-key           # Google AI

# Notifications (Optional)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
RESEND_API_KEY=re_your-resend-key
EMAIL_FROM=AI Monitor <notifications@yourdomain.com>

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SIGNATURE_TOKEN=your-cron-secret
```

### Getting API Keys

#### 1. Supabase
- Sign up at [supabase.com](https://supabase.com)
- Create a new project
- Go to Settings → API
- Copy URL, anon key, and service role key

#### 2. AI Providers

**Groq (Recommended - Fast & Free)**
- Sign up at [console.groq.com](https://console.groq.com)
- Create API key
- Free tier: 30 requests/minute

**OpenAI (Best Quality)**
- Sign up at [platform.openai.com](https://platform.openai.com)
- Create API key
- Pay-as-you-go pricing

**Google Gemini (Alternative)**
- Get key at [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
- Free tier available

#### 3. Telegram Bot
- Message [@BotFather](https://t.me/BotFather) on Telegram
- Send `/newbot` and follow instructions
- Copy the bot token
- See [Telegram Setup Guide](docs/TELEGRAM_SETUP.md)

#### 4. Resend (Email)
- Sign up at [resend.com](https://resend.com)
- Create API key
- Free tier: 3,000 emails/month
- See [Email Setup Guide](docs/EMAIL_SETUP.md)

---

## 📱 Usage

### Creating Your First Scraping Task

#### Method 1: Quick Start (Easiest)

1. Go to **Dashboard → New Task**
2. Click one of the **Quick Start** buttons:
   - **HackerNews** - Top stories
   - **Reddit** - Trending posts
   - **TechCrunch** - Latest tech news
3. Click **Run Now**
4. View results in **Dashboard → Results**

#### Method 2: Custom Task

1. Go to **Dashboard → New Task**
2. Fill in the form:
   - **Target URL**: Website to scrape
   - **Short Label**: Friendly name
   - **Instruction**: What to extract (e.g., "Fetch product names and prices")
   - **Refresh Cadence**: How often to scrape (in hours)
3. Click **Create Task**
4. AI automatically generates the schema
5. Click **Run** to test it

### Managing Tasks

- **View All Tasks**: Dashboard → Overview
- **Run Manually**: Click "Run" button on any task
- **Fix Failed Scrapes**: Click "Regenerate Schema" on failed tasks
- **View Results**: Dashboard → Results
- **Export Data**: Click "Export" → Choose format (CSV/JSON/PDF)
- **Send to Telegram**: Click "Export" → "Send to Telegram"

### Monitoring Changes

- **Change Feed**: Dashboard → Changes
- **Analytics**: Dashboard → Analytics
- **Real-time Updates**: Overview page updates automatically

### Setting Up Notifications

1. **Telegram**:
   - Follow [Telegram Setup Guide](docs/TELEGRAM_SETUP.md)
   - Or: Dashboard → Settings → Telegram Guide
   - Add bot token to `.env.local`
   - Configure Chat ID in Settings

2. **Email**:
   - Follow [Email Setup Guide](docs/EMAIL_SETUP.md)
   - Or: Dashboard → Settings → Email Guide
   - Add Resend API key to `.env.local`
   - Configure email in Settings

3. **Test Notifications**:
   - Dashboard → Settings
   - Click "Test" next to Telegram or Email
   - Verify you receive the test message

---

## 📁 Project Structure

```
ai-monitor/
├── app/
│   ├── (auth)/
│   │   └── signin/          # Authentication pages
│   ├── api/
│   │   ├── analytics/       # Analytics data API
│   │   ├── export/          # Export functionality
│   │   │   └── telegram/    # Send exports to Telegram
│   │   ├── notifications/   # Notification APIs
│   │   ├── regenerate-schema/ # Schema regeneration
│   │   └── scrape/          # Scraping endpoint
│   ├── dashboard/
│   │   ├── analytics/       # Analytics page
│   │   ├── changes/         # Change logs page
│   │   ├── results/         # Results page
│   │   ├── settings/        # Settings & guides
│   │   ├── tasks/
│   │   │   └── new/         # Task creation
│   │   └── page.tsx         # Dashboard overview
│   └── layout.tsx           # Root layout
├── components/
│   ├── dashboard/           # Dashboard components
│   │   ├── analytics-charts.tsx
│   │   ├── export-buttons.tsx
│   │   ├── task-form.tsx
│   │   ├── task-list.tsx
│   │   └── ...
│   └── ui/                  # Reusable UI components
├── lib/
│   ├── ai/
│   │   ├── cache.ts         # AI response caching
│   │   ├── providers.ts     # AI provider implementations
│   │   └── service.ts       # Unified AI service
│   ├── auth/                # Authentication logic
│   ├── notifications/       # Telegram & Email services
│   ├── scraper/             # Scraping logic
│   │   ├── runner.ts        # Playwright scraper
│   │   └── simple-sources.ts # API-based sources
│   ├── supabase/            # Database queries
│   └── validators/          # Zod schemas
├── docs/                    # Documentation
│   ├── TELEGRAM_SETUP.md
│   └── EMAIL_SETUP.md
├── public/                  # Static assets
├── .env.local              # Environment variables (create this)
├── env.example             # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔌 API Documentation

### Authentication

All API routes require authentication via NextAuth.js session or cron token.

### Endpoints

#### `POST /api/scrape`

Run scraping jobs.

**Body:**
```json
{
  "taskId": "optional-task-id" // If provided, runs only this task
}
```

**Response:**
```json
{
  "jobs": [
    { "id": "task-id", "status": "success" }
  ]
}
```

#### `POST /api/regenerate-schema`

Regenerate AI schema for a failed task.

**Body:**
```json
{
  "instructionId": "task-id"
}
```

**Response:**
```json
{
  "message": "Schema regenerated successfully",
  "patterns": { ... }
}
```

#### `GET /api/export`

Export scraped data.

**Query Parameters:**
- `format`: `csv` | `json` | `pdf`
- `instructionId`: Optional task ID to filter results

**Response:** File download

#### `POST /api/export/telegram`

Send exported data to Telegram.

**Body:**
```json
{
  "format": "csv" | "json" | "pdf",
  "instructionId": "optional-task-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully sent CSV file to Telegram!",
  "fileName": "scraped-data-1234567890.csv",
  "resultCount": 125
}
```

#### `GET /api/analytics`

Get analytics data.

**Response:**
```json
{
  "overview": {
    "totalTasks": 5,
    "totalResults": 125,
    "totalChanges": 23,
    "activeSites": 3
  },
  "successRate": {
    "total": 10,
    "successful": 8,
    "failed": 2,
    "rate": 80
  },
  "trendData": [ ... ],
  "topSites": [ ... ],
  "timeDistribution": { ... }
}
```

---

## 🌐 Deployment

### Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository
   - Add environment variables
   - Deploy!

3. **Set Environment Variables**:
   - In Vercel project settings
   - Add all variables from `.env.local`
   - Update `NEXTAUTH_URL` to your Vercel domain (e.g., `https://scrape-sense-one.vercel.app`)

**Live Deployment**: [https://scrape-sense-one.vercel.app](https://scrape-sense-one.vercel.app)

4. **Set Up Cron Jobs** (Optional):
   - Add to `vercel.json`:
   ```json
   {
     "crons": [{
       "path": "/api/scrape",
       "schedule": "0 */6 * * *"
     }]
   }
   ```

### Other Platforms

Works on any platform that supports Next.js:
- **Netlify**: Use `next-netlify` adapter
- **Railway**: Auto-detects Next.js
- **DigitalOcean App Platform**: Deploy from GitHub
- **AWS Amplify**: Full Next.js support

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **Playwright Installation Failed**

```bash
# Install browsers manually
npx playwright install chromium

# On Windows, also install dependencies
npx playwright install winldd
```

#### 2. **"No AI providers configured"**

Make sure at least one AI API key is set:
- `OPENAI_API_KEY`
- `GROQ_API_KEY`
- `GEMINI_API_KEY`

#### 3. **Scraping Returns No Results**

- Check if the website changed structure
- Click "Regenerate Schema" on the task
- Try a different AI provider
- Check browser console for errors

#### 4. **Telegram Notifications Not Working**

- Verify `TELEGRAM_BOT_TOKEN` is set
- Start a conversation with your bot first
- Send at least one message to the bot
- Check Chat ID is correct (use @userinfobot)

#### 5. **Database Connection Errors**

- Verify Supabase URL and keys
- Check if project is paused (free tier)
- Ensure RLS policies are set up correctly

#### 6. **Build Errors on Deployment**

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building locally first
npm run build
```

### Debug Mode

Enable debug logging:

```env
# .env.local
DEBUG=true
LOG_LEVEL=verbose
```

### Getting Help

1. Check [Troubleshooting docs](docs/TROUBLESHOOTING.md)
2. Search [GitHub Issues](https://github.com/yourusername/ai-monitor/issues)
3. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment info (OS, Node version)
   - Relevant logs

---

## 🤝 Contributing

We welcome contributions! Here's how:

### Development Setup

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Make your changes
4. Run tests (if available):
   ```bash
   npm test
   ```
5. Commit with clear message:
   ```bash
   git commit -m "Add amazing feature"
   ```
6. Push to your fork:
   ```bash
   git push origin feature/amazing-feature
   ```
7. Open a Pull Request

### Code Style

- Use TypeScript
- Follow ESLint rules
- Use Prettier for formatting
- Write clear commit messages
- Add comments for complex logic

### Areas to Contribute

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- 🧪 Tests
- 🌍 Internationalization

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js** - React framework
- **Supabase** - Database & Auth
- **Groq** - Fast AI inference
- **OpenAI** - GPT models
- **Playwright** - Browser automation
- **Radix UI** - UI components
- **Vercel** - Hosting platform

---

## 📮 Contact

- **Live App**: [https://scrape-sense-one.vercel.app](https://scrape-sense-one.vercel.app)
- **GitHub**: [@yourusername](https://github.com/yourusername)
- **Email**: your.email@example.com
- **Twitter**: [@yourhandle](https://twitter.com/yourhandle)

---

## 🗺️ Roadmap

### Coming Soon
- [ ] Webhook integrations (Slack, Discord, Zapier)
- [ ] Visual diff viewer for changes
- [ ] Browser extension for quick task creation
- [ ] Public API with rate limiting
- [ ] Team collaboration features
- [ ] Advanced scheduling (cron expressions)
- [ ] Data deduplication
- [ ] Multi-language support

### In Progress
- [x] Export functionality (CSV, JSON, PDF)
- [x] Telegram integration
- [x] Analytics dashboard
- [x] Email notifications

---

<div align="center">

**⭐ Star this repo if you find it useful!**

Made with ❤️ using Next.js, AI, and Playwright

[Report Bug](https://github.com/yourusername/ai-monitor/issues) · [Request Feature](https://github.com/yourusername/ai-monitor/issues) · [Documentation](https://github.com/yourusername/ai-monitor/wiki)

</div>
