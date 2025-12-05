# ⚡ Quick Deploy Guide - Free Hosting

**Fastest way to deploy InterviewAce for FREE!**

## 🎯 Stack
- Frontend: **Vercel** (Free Forever)
- Backend: **Render** (Free Tier)
- Database: **MongoDB Atlas** (Free Tier)

---

## 🚀 5-Minute Deployment

### 1️⃣ Setup MongoDB (2 min)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up → Create Free Cluster (M0)
3. Database Access → Create user (save password!)
4. Network Access → Allow from anywhere (0.0.0.0/0)
5. Clusters → Connect → Copy connection string
6. Replace `<password>` with your password

### 2️⃣ Deploy Backend (2 min)
1. Go to [render.com](https://render.com) → Sign up with GitHub
2. New → Web Service → Connect `interviewAce` repo
3. Settings:
   - **Name:** `interviewace-backend`
   - **Root Directory:** `backend`
   - **Build:** `npm install`
   - **Start:** `npm start`
   - **Plan:** Free
4. Environment Variables:
   ```
   NODE_ENV=production
   PORT=3001
   MONGODB_URI=your_mongodb_connection_string_here
   JWT_SECRET=any_random_secure_string_32_chars_minimum
   FRONTEND_URL=https://your-app.vercel.app
   LOG_LEVEL=info
   ```
5. Deploy → Copy backend URL (e.g., `https://interviewace-backend.onrender.com`)

### 3️⃣ Deploy Frontend (1 min)
1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Add New Project → Import `interviewAce`
3. Settings:
   - **Framework:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Environment Variables:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```
   (Use the backend URL from step 2)
5. Deploy → Copy frontend URL

### 4️⃣ Connect Them
1. Go back to Render dashboard
2. Update `FRONTEND_URL` = your Vercel URL
3. Redeploy backend

### 5️⃣ Done! 🎉
Visit your Vercel URL and test the app!

---

## 📝 Environment Variables Cheat Sheet

### Backend (Render):
```
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/interviewace
JWT_SECRET=your_secret_key_here
FRONTEND_URL=https://your-app.vercel.app
LOG_LEVEL=info
```

### Frontend (Vercel):
```
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## ⚠️ Important Notes

1. **Render Free Tier:** Backend spins down after 15 min inactivity (first request takes ~30s)
2. **MongoDB Atlas:** Free tier gives 512MB storage
3. **Vercel:** Unlimited deployments, 100GB bandwidth/month

---

## 🔧 Troubleshooting

**Backend slow to respond?**
- Normal for Render free tier (spins down)
- First request after inactivity takes ~30 seconds

**Frontend can't connect?**
- Check `VITE_API_URL` in Vercel environment variables
- Check `FRONTEND_URL` in Render matches Vercel URL exactly

**MongoDB connection fails?**
- Verify connection string has correct password
- Check IP whitelist allows all (0.0.0.0/0)

---

## 🎯 Next Steps

1. Test registration/login
2. Upload a resume
3. Start an interview session
4. Share your app URL!

**Need help?** Check `FREE_DEPLOYMENT.md` for detailed guide.
