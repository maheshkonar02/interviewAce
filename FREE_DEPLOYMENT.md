# 🆓 Free Hosting Deployment Guide

This guide covers deploying InterviewAce completely FREE using free hosting services.

## 🎯 Recommended Free Stack

- **Frontend:** Vercel (Free Forever)
- **Backend:** Render (Free Tier) or Railway (Free Tier)
- **Database:** MongoDB Atlas (Free Tier - 512MB)

## 📋 Prerequisites

1. GitHub account (free)
2. Vercel account (free) - [vercel.com](https://vercel.com)
3. Render account (free) - [render.com](https://render.com)
4. MongoDB Atlas account (free) - [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

---

## 🗄️ Step 1: Setup MongoDB Atlas (Free Database)

1. **Sign up** at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Create a free cluster** (M0 Free Tier)
3. **Create database user:**
   - Go to Database Access → Add New Database User
   - Username: `interviewace`
   - Password: Generate secure password (save it!)
4. **Whitelist IP addresses:**
   - Go to Network Access → Add IP Address
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
5. **Get connection string:**
   - Go to Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database password
   - Example: `mongodb+srv://interviewace:yourpassword@cluster0.xxxxx.mongodb.net/interviewace?retryWrites=true&w=majority`

---

## 🖥️ Step 2: Deploy Backend (Render - Free)

### Option A: Render (Recommended - Free Tier)

1. **Sign up** at [render.com](https://render.com) (use GitHub to sign in)

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `maheshkonar02/interviewAce`
   - Click "Connect"

3. **Configure Service:**
   ```
   Name: interviewace-backend
   Region: Oregon (or closest to you)
   Branch: master
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

4. **Set Environment Variables:**
   Click "Environment" tab and add:
   ```
   NODE_ENV = production
   PORT = 3001
   MONGODB_URI = mongodb+srv://interviewace:yourpassword@cluster0.xxxxx.mongodb.net/interviewace?retryWrites=true&w=majority
   JWT_SECRET = your_very_secure_random_secret_key_minimum_32_characters
   FRONTEND_URL = https://your-frontend-name.vercel.app
   LOG_LEVEL = info
   MAX_FILE_SIZE = 10485760
   ```
   (You'll update FRONTEND_URL after deploying frontend)

5. **Click "Create Web Service"**
   - Wait 5-10 minutes for first deployment
   - Copy your backend URL (e.g., `https://interviewace-backend.onrender.com`)

### Option B: Railway (Alternative Free Option)

1. **Sign up** at [railway.app](https://railway.app) (use GitHub)

2. **Create New Project:**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select `interviewAce` repository

3. **Configure Service:**
   - Click on the service → Settings
   - Set Root Directory: `backend`
   - Set Start Command: `npm start`

4. **Add Environment Variables:**
   - Go to Variables tab
   - Add all variables from Step 4 above

5. **Deploy:**
   - Railway auto-deploys on git push
   - Copy your backend URL

---

## 🎨 Step 3: Deploy Frontend (Vercel - Free Forever)

### Method 1: Via Vercel Dashboard (Easiest)

1. **Sign up** at [vercel.com](https://vercel.com) (use GitHub)

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Import `maheshkonar02/interviewAce` repository

3. **Configure Project:**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Set Environment Variables (if needed):**
   ```
   VITE_API_URL = https://your-backend-url.onrender.com/api
   ```
   (Optional - only if you need to override API URL)

5. **Click "Deploy"**
   - Wait 2-3 minutes
   - Copy your frontend URL (e.g., `https://interviewace.vercel.app`)

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy frontend
cd frontend
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? interviewace-frontend
# - Directory? ./
# - Override settings? No
```

---

## 🔗 Step 4: Connect Frontend and Backend

1. **Update Backend Environment Variable:**
   - Go back to Render/Railway dashboard
   - Update `FRONTEND_URL` environment variable:
     ```
     FRONTEND_URL = https://your-frontend-name.vercel.app
     ```
   - Redeploy backend (or it will auto-redeploy)

2. **Update Frontend API Configuration (if needed):**
   - If your frontend uses `/api` proxy, it should work automatically
   - If not, update `frontend/src/utils/api.js`:
     ```javascript
     const api = axios.create({
       baseURL: 'https://your-backend-url.onrender.com/api',
       // ... rest of config
     });
     ```
   - Commit and push changes
   - Vercel will auto-redeploy

---

## ✅ Step 5: Verify Deployment

1. **Check Backend Health:**
   - Visit: `https://your-backend.onrender.com/api/health`
   - Should return: `{ "status": "ok" }`

2. **Check Frontend:**
   - Visit: `https://your-frontend.vercel.app`
   - Should load the app

3. **Test Features:**
   - Register a new user
   - Login
   - Upload resume
   - Start an interview session

---

## 🆓 Free Tier Limits

### Vercel (Frontend)
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic SSL
- ✅ Global CDN
- ✅ No credit card required

### Render (Backend)
- ✅ 750 hours/month (enough for 24/7)
- ✅ 512MB RAM
- ⚠️ Spins down after 15 minutes of inactivity (first request takes ~30s)
- ✅ Automatic SSL
- ✅ No credit card required

### Railway (Backend Alternative)
- ✅ $5 free credit/month
- ✅ 512MB RAM
- ⚠️ Requires credit card (but won't charge if under limit)
- ✅ No spin-down (always on)

### MongoDB Atlas
- ✅ 512MB storage
- ✅ Shared RAM
- ✅ No credit card required

---

## 🔧 Troubleshooting

### Backend takes 30 seconds to respond
- **Cause:** Render free tier spins down after inactivity
- **Solution:** 
  - Use Railway instead (always on)
  - Or upgrade Render to paid ($7/month)
  - Or use a cron job to ping your backend every 10 minutes

### Frontend can't connect to backend
- Check `FRONTEND_URL` in backend environment variables
- Check CORS settings
- Verify backend URL is correct
- Check browser console for errors

### MongoDB connection fails
- Verify connection string is correct
- Check IP whitelist in MongoDB Atlas
- Ensure password doesn't have special characters (URL encode if needed)

### Build fails on Vercel
- Check build logs in Vercel dashboard
- Ensure `package.json` has correct build script
- Verify Node.js version compatibility

---

## 🚀 Quick Deploy Commands

```bash
# 1. Build locally to test
npm run build

# 2. Commit and push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin master

# 3. Deploy frontend (if using CLI)
cd frontend && vercel

# Backend will auto-deploy on Render/Railway when you push to GitHub
```

---

## 📝 Environment Variables Checklist

### Backend (Render/Railway):
- [ ] `NODE_ENV=production`
- [ ] `PORT=3001`
- [ ] `MONGODB_URI=your_mongodb_connection_string`
- [ ] `JWT_SECRET=secure_random_string_32_chars_min`
- [ ] `FRONTEND_URL=https://your-frontend.vercel.app`
- [ ] `LOG_LEVEL=info`
- [ ] `MAX_FILE_SIZE=10485760`
- [ ] `OPENAI_API_KEY=sk-...` (optional)
- [ ] `ANTHROPIC_API_KEY=sk-ant-...` (optional)

### Frontend (Vercel):
- [ ] `VITE_API_URL=https://your-backend.onrender.com/api` (optional)

---

## 🎉 You're Done!

Your app should now be live at:
- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://your-backend.onrender.com`

Share your app URL and start using InterviewAce! 🚀
