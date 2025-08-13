# Tiktalkhub Backend

A comprehensive Node.js backend for the Tiktalkhub AI-powered tools platform, featuring 50+ tools across multiple categories, admin dashboard, AI concierge, and blog system.

## 🚀 Features

### Core Platform
- **Authentication & Authorization**: JWT-based auth with admin roles
- **Database**: SQLite with comprehensive schema for users, tools, blog, analytics
- **File Management**: Upload, storage, and processing for images, videos, PDFs
- **AI Integration**: Local AI models with intelligent fallbacks
- **Admin Dashboard**: Full CMS for managing all platform content
- **Blog System**: SEO-optimized blog with auto-generation capabilities

### Tool Categories (50+ Tools)

#### 🏢 SmartBiz Suite
- Business Name Generator
- Slogan & Tagline Creator  
- Logo Sketch Wizard
- Smart Flyer Designer
- Invoice Maker

#### 💼 Career Toolkit
- Resume Builder with AI Suggestions
- Cover Letter AI Builder
- LinkedIn Summary Generator
- Interview Practice Coach

#### 📝 Content Tools
- Blog Idea Generator
- Text-to-Speech
- Caption Generator
- Headline Analyzer

#### 🎬 Video Tools
- Video Trimmer
- Thumbnail Selector
- GIF Maker

#### 📱 Social Toolkit
- Hashtag Generator
- Twitter Thread Formatter
- Facebook Caption Creator

#### 🎵 TikTok Tools
- Hashtag Heatmap
- Viral Hook Generator

#### 🧠 Emotional Utility
- MindMirror (AI Journaling)
- Therapet (Mood-based Virtual Pet)
- MoodBoard AI

#### 🔧 Utility Tools
- PDF Compressor & Merger
- QR Code Generator
- Image Optimizer
- AI Meme Generator

### 🤖 Tiko AI Concierge
- Context-aware chatbot
- Tool recommendations
- Sentiment analysis
- Conversation history
- Intent analysis

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

1. **Clone and install dependencies**
```bash
cd backend
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Initialize Database**
```bash
npm run migrate
```

4. **Start Development Server**
```bash
npm run dev
```

The server will start on `http://localhost:3001`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |
| `DATABASE_URL` | SQLite database path | ./database/tiktalkhub.db |
| `JWT_SECRET` | JWT signing secret | (change in production) |
| `ADMIN_EMAIL` | Default admin email | admin@tiktalkhub.com |
| `ADMIN_PASSWORD` | Default admin password | admin123 |
| `ENABLE_LOCAL_AI` | Enable local AI models | false |
| `MAX_FILE_SIZE` | Max upload size | 10485760 (10MB) |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |

### Optional: Postgres + ClamAV

To run with Postgres, set:

```
DATABASE_URL=postgres://user:password@host:5432/dbname
```

Run migrations to create the schema in Postgres (mirror of SQLite tables). Update `initializeDatabase` to connect via `pg` when `DATABASE_URL` starts with `postgres://`.

To enable ClamAV scanning on uploads, install clamav-daemon and set:

```
ENABLE_AV_SCAN=true
CLAMDSCAN_BIN=/usr/bin/clamdscan
```

### TCF v2 CMP

Set `cmp_mode` to `tcfv2` in Admin → Settings. Include your CMP’s TCF v2 script (e.g., Sourcepoint/Didomi) in Admin “Ad Header Code”. Our `AdSlot` will wait for `__tcfapi('getTCData')` and only render ads with Purpose 1 consent.

### Database Schema

The backend uses SQLite with the following main tables:
- `users` - User accounts and profiles
- `tools` - Tool definitions and metadata
- `tool_usage` - Usage tracking and analytics
- `blog_posts` - Blog content and SEO data
- `admin_settings` - Site configuration
- `ai_conversations` - Tiko chat history
- `user_files` - File upload tracking
- `notifications` - Admin notifications
- `analytics` - Platform analytics

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "username",
  "first_name": "John",
  "last_name": "Doe"
}
```

#### POST `/api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com", 
  "password": "password123"
}
```

### Tool Endpoints

#### GET `/api/tools`
Get all available tools.

**Query Parameters:**
- `category` - Filter by tool category
- `featured` - Show only featured tools

#### POST `/api/tools/{category}/{tool-slug}`
Execute a specific tool.

**Examples:**
- `/api/tools/smartbiz/business-name-generator`
- `/api/tools/career/resume-builder`
- `/api/tools/content/blog-idea-generator`

### Admin Endpoints (Requires Admin Role)

#### GET `/api/admin/dashboard`
Get admin dashboard statistics.

#### GET `/api/admin/settings`
Get all site settings.

#### PUT `/api/admin/settings`
Update site settings.

#### GET `/api/admin/users`
Get user list with pagination.

#### GET `/api/admin/tools`
Get all tools with usage statistics.

### AI/Tiko Endpoints

#### POST `/api/ai/chat`
Chat with Tiko AI concierge.

**Request Body:**
```json
{
  "message": "Help me find tools for my business",
  "sessionId": "uuid-v4",
  "context": {}
}
```

#### POST `/api/ai/suggest-tools`
Get tool suggestions based on query.

#### GET `/api/ai/insights`
Get personalized AI insights and recommendations.

### Blog Endpoints

#### GET `/api/blog`
Get published blog posts.

#### GET `/api/blog/{slug}`
Get specific blog post by slug.

#### POST `/api/blog/generate`
Generate AI-powered blog content.

### File Management

#### POST `/api/files/upload`
Upload files for tool processing.

#### GET `/api/files/{filename}`
Retrieve uploaded file.

#### DELETE `/api/files/{filename}`
Delete uploaded file.

## 🔐 Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API rate limiting
- **Input Validation**: Request validation with express-validator
- **JWT Authentication**: Secure token-based auth
- **File Type Validation**: Secure file upload filtering

## 📊 Monitoring & Logging

- **Winston**: Structured logging to files and console
- **Morgan**: HTTP request logging
- **Health Check**: `/health` endpoint for monitoring
- **Error Handling**: Global error handler with logging

## 🚀 Deployment

### Render Deployment

1. **Connect Repository**: Link your GitHub repo to Render
2. **Environment**: Use the provided `render.yaml` configuration
3. **Environment Variables**: Set production values for sensitive data
4. **Deploy**: Render will automatically build and deploy

### Environment Variables for Production

```bash
NODE_ENV=production
JWT_SECRET=your-secure-jwt-secret-here
ADMIN_PASSWORD=secure-admin-password
ENABLE_LOCAL_AI=false  # Disabled for Render free tier
FRONTEND_URL=https://your-frontend.onrender.com
```

## 🤖 AI Integration

The backend is designed to work with local AI models (GPT4All, Mistral) but includes intelligent fallbacks:

- **Local AI**: When `ENABLE_LOCAL_AI=true` and models are available
- **NLP Libraries**: node-nlp, sentiment, compromise for text analysis
- **Rule-based Fallbacks**: Template-based generation when AI is unavailable

### Adding Local AI Models

1. Download GPT4All model to `./models/` directory
2. Set `ENABLE_LOCAL_AI=true` in environment
3. Configure `GPT4ALL_MODEL` path
4. Restart server

## 📈 Analytics & Tracking

- **Tool Usage**: Comprehensive usage tracking
- **User Analytics**: Activity monitoring
- **Performance Metrics**: Processing time tracking
- **Admin Insights**: Dashboard analytics

## 🛠️ Development

### Project Structure
```
backend/
├── database/           # Database initialization and models
├── middleware/         # Express middleware
├── routes/            # API route handlers
│   ├── tools/         # Tool category implementations
│   ├── auth.js        # Authentication routes
│   ├── admin.js       # Admin dashboard routes
│   ├── blog.js        # Blog system routes
│   └── ...
├── services/          # Business logic services
├── utils/            # Utility functions
├── uploads/          # File upload directory
├── logs/             # Application logs
└── server.js         # Main application entry point
```

### Adding New Tools

1. Create tool route in appropriate category file
2. Add tool to database via `database/init.js`
3. Implement tool logic in service files
4. Add usage tracking
5. Update frontend integration

### Testing

```bash
# Run tests (when implemented)
npm test

# Check health endpoint
curl http://localhost:3001/health
```

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the logs in `./logs/` directory
2. Verify environment configuration
3. Ensure database is properly initialized
4. Check file permissions for uploads directory

## 🔄 Updates

The platform is designed for easy updates:
- Tools can be enabled/disabled via admin dashboard
- Settings are configurable without code changes
- Database migrations handle schema updates
- AI models can be swapped without affecting fallbacks