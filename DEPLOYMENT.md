# Tiktalkhub Deployment Guide

This guide walks you through deploying Tiktalkhub to Render's free tier, including both the backend API and frontend application.

## 🚀 Prerequisites

- GitHub account with your Tiktalkhub repository
- Render account (free tier available)
- Node.js 18+ for local development

## 📋 Deployment Overview

Tiktalkhub consists of two main components:
1. **Backend API** - Node.js/Express server with SQLite database
2. **Frontend** - React/Vite static site

Both will be deployed separately on Render's free tier.

## 🔧 Backend Deployment

### Step 1: Prepare Backend for Production

1. **Update Environment Variables**
   
   Create production environment variables in your Render dashboard:

   ```bash
   # Required Production Variables
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters-long
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=secure-admin-password-123
   
   # Database
   DATABASE_URL=./database/tiktalkhub.db
   
   # AI Configuration (disabled for free tier)
   ENABLE_LOCAL_AI=false
   AI_MODEL_PATH=./models
   
   # CORS and Security
   FRONTEND_URL=https://your-frontend-app.onrender.com
   ALLOWED_ORIGINS=https://your-frontend-app.onrender.com
   
   # File Upload
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./uploads
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   
   # Blog Configuration
   POSTS_PER_PAGE=10
   AUTO_GENERATE_POSTS=true
   
   # Optional External APIs (leave empty for basic functionality)
   GOOGLE_TRENDS_API_KEY=
   YOUTUBE_API_KEY=
   TWITTER_BEARER_TOKEN=
   SMTP_HOST=
   SMTP_PORT=587
   SMTP_USER=
   SMTP_PASS=
   GOOGLE_ANALYTICS_ID=
   PLAUSIBLE_DOMAIN=
   ```

2. **Create render.yaml** (already included in backend directory)

### Step 2: Deploy Backend on Render

1. **Create New Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service Settings**
   ```
   Name: tiktalkhub-backend
   Environment: Node
   Build Command: cd backend && npm install
   Start Command: cd backend && npm start
   ```

3. **Set Environment Variables**
   - Go to "Environment" tab
   - Add all the production variables listed above
   - Make sure to use secure values for JWT_SECRET and ADMIN_PASSWORD

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete (5-10 minutes)
   - Note your backend URL: `https://tiktalkhub-backend.onrender.com`

### Step 3: Verify Backend Deployment

Test your backend endpoints:

```bash
# Health check
curl https://tiktalkhub-backend.onrender.com/health

# API status
curl https://tiktalkhub-backend.onrender.com/api/tools

# Admin login (use your configured credentials)
curl -X POST https://tiktalkhub-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourdomain.com","password":"your-admin-password"}'
```

## 🎨 Frontend Deployment

### Step 1: Configure Frontend Environment

1. **Create `.env.production`**
   ```bash
   VITE_API_URL=https://tiktalkhub-backend.onrender.com/api
   VITE_APP_NAME=Tiktalkhub
   VITE_APP_VERSION=1.0.0
   VITE_APP_DESCRIPTION=AI-powered tools platform
   VITE_ENABLE_AUTH=true
   VITE_ENABLE_ANALYTICS=false
   VITE_ENABLE_CHAT=true
   VITE_DEBUG=false
   ```

2. **Update package.json build script** (if needed)
   ```json
   {
     "scripts": {
       "build": "vite build",
       "build:prod": "vite build --mode production"
     }
   }
   ```

### Step 2: Deploy Frontend on Render

1. **Create New Static Site**
   - Go to Render Dashboard
   - Click "New +" → "Static Site"
   - Connect your GitHub repository

2. **Configure Static Site Settings**
   ```
   Name: tiktalkhub-frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

3. **Set Environment Variables**
   - Add your production environment variables
   - Especially important: `VITE_API_URL=https://tiktalkhub-backend.onrender.com/api`

4. **Deploy**
   - Click "Create Static Site"
   - Wait for deployment to complete
   - Note your frontend URL: `https://tiktalkhub-frontend.onrender.com`

### Step 3: Update Backend CORS Settings

After frontend deployment, update your backend environment variables:

```bash
FRONTEND_URL=https://tiktalkhub-frontend.onrender.com
ALLOWED_ORIGINS=https://tiktalkhub-frontend.onrender.com
```

Redeploy the backend service for changes to take effect.

## 🔒 Security Configuration

### SSL/HTTPS
Both services automatically get SSL certificates from Render.

### Environment Variables Security
- Never commit `.env` files to your repository
- Use strong, unique passwords for admin accounts
- Generate a secure JWT secret (minimum 32 characters)
- Regularly rotate sensitive credentials

### Rate Limiting
The backend includes rate limiting configured for:
- 100 requests per 15 minutes per IP
- Adjustable via `RATE_LIMIT_MAX_REQUESTS` and `RATE_LIMIT_WINDOW_MS`

## 📊 Monitoring & Maintenance

### Health Checks
- Backend: `https://your-backend.onrender.com/health`
- Monitor uptime and response times

### Logs
- Access logs via Render dashboard
- Backend logs are structured with Winston
- Check logs for errors and performance issues

### Database Backups
For production use, consider:
- Regular SQLite database backups
- Upgrading to PostgreSQL for better reliability
- Implementing automated backup scripts

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `FRONTEND_URL` and `ALLOWED_ORIGINS` are set correctly
   - Check that URLs match exactly (no trailing slashes)

2. **API Connection Issues**
   - Verify `VITE_API_URL` in frontend environment
   - Check backend health endpoint
   - Ensure both services are deployed and running

3. **Authentication Issues**
   - Verify JWT_SECRET is set and consistent
   - Check admin credentials are correct
   - Ensure database is properly initialized

4. **File Upload Issues**
   - Check `MAX_FILE_SIZE` setting
   - Ensure upload directory permissions
   - Verify disk space availability

5. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are included
   - Review build logs for specific errors

### Performance Optimization

1. **Free Tier Limitations**
   - Services sleep after 15 minutes of inactivity
   - Cold start times can be 30+ seconds
   - 512MB RAM limit per service

2. **Optimization Strategies**
   - Implement service warming (ping endpoints)
   - Optimize bundle sizes
   - Use compression middleware
   - Cache static assets

## 🔄 Updates & Maintenance

### Automatic Deployments
- Connect to GitHub for automatic deployments
- Configure branch-based deployments
- Use staging environments for testing

### Manual Deployments
- Use Render dashboard to trigger manual deployments
- Monitor deployment logs for issues
- Test functionality after each deployment

### Database Migrations
- Run migrations via Render shell or startup commands
- Backup database before major updates
- Test migrations in staging environment

## 📈 Scaling Considerations

### When to Upgrade
- Consistent traffic requiring always-on services
- Need for faster response times
- Database performance requirements
- Advanced monitoring needs

### Upgrade Path
- Render Professional plans for better performance
- PostgreSQL for production database
- CDN for static asset delivery
- Dedicated monitoring solutions

## 🆘 Support Resources

- [Render Documentation](https://render.com/docs)
- [Node.js Deployment Guide](https://render.com/docs/deploy-node-express-app)
- [Static Site Deployment](https://render.com/docs/deploy-create-react-app)
- Tiktalkhub GitHub Issues for application-specific problems

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Repository is pushed to GitHub
- [ ] Environment variables are configured
- [ ] Build commands are tested locally
- [ ] Database initialization is working

### Backend Deployment
- [ ] Web service created on Render
- [ ] Environment variables set
- [ ] Service deployed successfully
- [ ] Health check endpoint responding
- [ ] Admin login working

### Frontend Deployment
- [ ] Static site created on Render
- [ ] Build environment configured
- [ ] Site deployed successfully
- [ ] API connection working
- [ ] Authentication flow working

### Post-Deployment
- [ ] CORS configuration updated
- [ ] All tools tested and functional
- [ ] Admin dashboard accessible
- [ ] Performance monitoring setup
- [ ] Backup strategy implemented

---

🎉 **Congratulations!** Your Tiktalkhub platform is now live and ready for users!

Remember to monitor your services regularly and keep your dependencies updated for optimal security and performance.