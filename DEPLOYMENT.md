# Deployment Guide

This guide covers how to build and deploy InterviewAce to production.

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB database (MongoDB Atlas recommended for production)
- Environment variables configured
- Git repository pushed to GitHub

## 🏗️ Building the Project

### Local Build

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Build frontend:**
   ```bash
   npm run build
   # or
   cd frontend && npm run build
   ```

3. **Test production build locally:**
   ```bash
   npm run preview
   # or
   cd frontend && npm run preview
   ```

The frontend build will be created in `frontend/dist/` directory.

## 🚀 Deployment Options

### Option 1: Vercel (Frontend) + Render/Railway (Backend) - Recommended

#### Frontend Deployment (Vercel)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   cd frontend
   vercel
   ```

3. **Or connect via GitHub:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set root directory to `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`

4. **Environment Variables (if needed):**
   - `VITE_API_URL`: Your backend API URL (e.g., `https://your-backend.onrender.com`)

#### Backend Deployment (Render)

1. **Go to [render.com](https://render.com)**
2. **Create a new Web Service**
3. **Connect your GitHub repository**
4. **Configure:**
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
   - **Node Version:** 18 or higher

5. **Set Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_jwt_secret
   FRONTEND_URL=https://your-frontend.vercel.app
   OPENAI_API_KEY=your_openai_key (optional)
   ANTHROPIC_API_KEY=your_anthropic_key (optional)
   HUGGINGFACE_API_KEY=your_huggingface_key (optional)
   GROQ_API_KEY=your_groq_key (optional)
   ```

6. **Update Frontend API URL:**
   - Update `frontend/src/utils/api.js` or use environment variable
   - Redeploy frontend with new backend URL

### Option 2: Railway (Full Stack)

1. **Go to [railway.app](https://railway.app)**
2. **Create new project from GitHub**
3. **Add two services:**
   - **Frontend Service:**
     - Root: `frontend`
     - Build: `npm install && npm run build`
     - Start: `npm run preview` (or serve static files)
   - **Backend Service:**
     - Root: `backend`
     - Build: `npm install`
     - Start: `npm start`

4. **Configure environment variables** (same as Render above)

### Option 3: Docker Deployment

See `docker-compose.yml` for containerized deployment.

### Option 4: Traditional VPS (DigitalOcean, AWS EC2, etc.)

1. **SSH into your server**
2. **Clone repository:**
   ```bash
   git clone https://github.com/maheshkonar02/interviewAce.git
   cd interviewAce
   ```

3. **Install dependencies:**
   ```bash
   npm run install:all
   ```

4. **Build frontend:**
   ```bash
   npm run build
   ```

5. **Set up environment variables** in `backend/.env`

6. **Use PM2 to run backend:**
   ```bash
   npm install -g pm2
   cd backend
   pm2 start src/server.js --name interviewace-backend
   pm2 save
   pm2 startup
   ```

7. **Serve frontend with Nginx:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       root /path/to/interviewAce/frontend/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location /api {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /socket.io {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
       }
   }
   ```

## 🔐 Environment Variables

### Backend (.env)

Create `backend/.env` with:

```env
# Server
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/interviewace

# Security
JWT_SECRET=your_very_secure_random_secret_key_here

# File Upload
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=info

# AI Services (Optional - at least one recommended)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
HUGGINGFACE_API_KEY=hf_...
GROQ_API_KEY=gsk_...
```

### Frontend (if using Vite env vars)

Create `frontend/.env.production`:

```env
VITE_API_URL=https://your-backend-domain.com/api
```

## 📝 Post-Deployment Checklist

- [ ] Backend is running and accessible
- [ ] Frontend is built and deployed
- [ ] MongoDB connection is working
- [ ] Environment variables are set correctly
- [ ] CORS is configured for frontend URL
- [ ] Socket.io connection works
- [ ] File uploads work (check uploads directory permissions)
- [ ] SSL/HTTPS is enabled (Let's Encrypt recommended)
- [ ] Health check endpoint responds (`/api/health`)

## 🔧 Troubleshooting

### Backend won't start
- Check MongoDB connection string
- Verify all environment variables are set
- Check logs: `pm2 logs interviewace-backend` or check Render/Railway logs

### Frontend can't connect to backend
- Verify `FRONTEND_URL` in backend matches frontend domain
- Check CORS settings
- Verify API URL in frontend code

### Socket.io connection fails
- Ensure WebSocket support is enabled on hosting platform
- Check Socket.io CORS configuration
- Verify both frontend and backend URLs are correct

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [MongoDB Atlas Setup](https://www.mongodb.com/cloud/atlas)
