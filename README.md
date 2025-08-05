# 🚀 Tiktalkhub - AI-Powered Tools Platform

A comprehensive, self-hosted platform featuring 50+ AI-powered tools across multiple categories, designed to run sustainably on free hosting tiers without recurring costs.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)](https://www.typescriptlang.org/)

## 🌟 Features

### 🎯 Core Platform
- **50+ AI-Powered Tools** across 8 major categories
- **Tiko AI Concierge** - Intelligent chatbot for tool discovery
- **Admin Dashboard** - Complete CMS for platform management
- **User Authentication** - Secure JWT-based auth system
- **Blog System** - SEO-optimized content management
- **File Management** - Upload, process, and manage files
- **Analytics** - Comprehensive usage tracking
- **Responsive Design** - Works perfectly on all devices

### 🏢 SmartBiz Suite
- **Business Name Generator** - AI-powered business naming
- **Slogan Creator** - Catchy taglines and slogans
- **Logo Sketch Wizard** - Logo concept generation
- **Smart Flyer Designer** - Marketing material creation
- **Invoice Maker** - Professional invoice generation

### 💼 Career Toolkit
- **Resume Builder** - AI-enhanced resume creation
- **Cover Letter AI** - Personalized cover letters
- **LinkedIn Summary Generator** - Profile optimization
- **Interview Coach** - AI-powered interview practice

### 📝 Content Creation
- **Blog Idea Generator** - Content inspiration engine
- **Caption Generator** - Social media captions
- **Headline Analyzer** - Optimize your headlines
- **Text-to-Speech** - Voice generation tools

### 🎬 Video Tools
- **Video Trimmer** - Cut and edit videos
- **Thumbnail Selector** - Extract video thumbnails
- **GIF Maker** - Create animated GIFs

### 📱 Social Media
- **Hashtag Generator** - Trending hashtag discovery
- **Twitter Thread Formatter** - Format long-form content
- **Facebook Caption Creator** - Platform-specific content

### 🎵 TikTok Tools
- **Hashtag Heatmap** - Analyze hashtag performance
- **Viral Hook Generator** - Create engaging openings

### 🧠 Emotional Wellness
- **MindMirror** - AI-powered journaling
- **Therapet** - Mood-based virtual pet companion
- **MoodBoard AI** - Visual mood analysis

### 🔧 Utility Tools
- **PDF Compressor** - Reduce file sizes
- **QR Code Generator** - Create custom QR codes
- **Image Optimizer** - Compress and optimize images
- **AI Meme Generator** - Create viral memes

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **ShadCN UI** for components
- **React Query** for data fetching
- **React Router** for navigation

### Backend
- **Node.js** with Express.js
- **SQLite** database (upgradeable to PostgreSQL)
- **JWT** authentication
- **Winston** logging
- **Multer** file uploads
- **Rate limiting** and security middleware

### AI Integration
- **Local AI Models** (GPT4All/Mistral) with intelligent fallbacks
- **NLP Libraries** (node-nlp, sentiment, compromise)
- **Rule-based Generation** for reliability
- **No paid API dependencies** - fully self-contained

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tiktalkhub.git
   cd tiktalkhub
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd backend
   npm install
   cd ..
   ```

3. **Configure environment**
   ```bash
   # Frontend
   cp .env.example .env
   
   # Backend
   cp backend/.env.example backend/.env
   ```

4. **Initialize database**
   ```bash
   cd backend
   npm run migrate
   cd ..
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Admin Dashboard: Login with configured admin credentials

## 🚀 Deployment

Tiktalkhub is designed to run on **Render's free tier** with zero recurring costs.

### Quick Deploy
1. Fork this repository
2. Connect to Render
3. Deploy backend as Web Service
4. Deploy frontend as Static Site
5. Configure environment variables

**📖 [Complete Deployment Guide](DEPLOYMENT.md)**

## 🔧 Configuration

### Environment Variables

**Frontend (.env)**
```bash
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Tiktalkhub
VITE_ENABLE_AUTH=true
VITE_ENABLE_CHAT=true
```

**Backend (.env)**
```bash
PORT=3001
NODE_ENV=development
DATABASE_URL=./database/tiktalkhub.db
JWT_SECRET=your-secret-key
ADMIN_EMAIL=admin@tiktalkhub.com
ADMIN_PASSWORD=admin123
ENABLE_LOCAL_AI=false
```

## 📚 API Documentation

### Authentication
```bash
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/profile
PUT  /api/auth/profile
```

### Tools
```bash
GET  /api/tools
POST /api/tools/{category}/{tool-slug}
GET  /api/tools/categories/stats
```

### AI/Tiko
```bash
POST /api/ai/chat
POST /api/ai/suggest-tools
GET  /api/ai/insights
```

**📖 [Full API Documentation](backend/README.md)**

## 🛠️ Development

### Project Structure
```
tiktalkhub/
├── src/                    # Frontend React app
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── lib/               # Utilities and API client
│   └── contexts/          # React contexts
├── backend/               # Backend API
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── middleware/        # Express middleware
│   └── database/          # Database setup
└── docs/                  # Documentation
```

### Adding New Tools

1. **Create tool route** in `backend/routes/tools/{category}.js`
2. **Add to database** in `backend/database/init.js`
3. **Implement service logic** in `backend/services/`
4. **Update frontend** tool pages
5. **Add API client methods** in `src/lib/api.ts`

### Local AI Setup

1. Download GPT4All model to `backend/models/`
2. Set `ENABLE_LOCAL_AI=true`
3. Configure model path in environment
4. Restart backend server

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Rate Limiting** to prevent abuse
- **Input Validation** on all endpoints
- **CORS Protection** with configurable origins
- **Helmet.js** security headers
- **File Type Validation** for uploads
- **SQL Injection Protection** with prepared statements

## 📊 Analytics & Monitoring

- **Tool Usage Tracking** - Monitor popular tools
- **User Analytics** - Understand user behavior
- **Performance Metrics** - Track response times
- **Error Logging** - Comprehensive error tracking
- **Health Checks** - Monitor service status

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style
- ESLint for JavaScript/TypeScript
- Prettier for code formatting
- Conventional commits for git messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check our comprehensive docs
- **Issues**: [GitHub Issues](https://github.com/yourusername/tiktalkhub/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/tiktalkhub/discussions)

## 🗺️ Roadmap

### Version 1.1
- [ ] Mobile app (React Native)
- [ ] Advanced AI models integration
- [ ] Real-time collaboration features
- [ ] Plugin system for custom tools

### Version 1.2
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] API marketplace
- [ ] White-label solutions

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the need for accessible AI tools
- Community-driven development
- Open source ecosystem

---

**⭐ Star this repository if you find it useful!**

**🔗 [Live Demo](https://tiktalkhub.onrender.com)** | **📖 [Documentation](docs/)** | **🚀 [Deploy Now](DEPLOYMENT.md)**
