# 🚀 Deployment Steps - Follow These Exactly

I'll guide you through each step. Let me know when you complete each one!

## ✅ Pre-Deployment Checklist

- [x] Code is ready
- [x] Build tested successfully
- [ ] All changes committed to GitHub
- [ ] MongoDB Atlas account created
- [ ] Render account created
- [ ] Vercel account created

---

## Step 1: Commit & Push to GitHub

**I'll help you with this first!** Let me know if you want me to commit the changes.

---

## Step 2: Setup MongoDB Atlas (5 minutes)

1. **Go to:** https://www.mongodb.com/cloud/atlas/register
2. **Sign up** (use Google/GitHub for faster signup)
3. **Create Free Cluster:**
   - Choose "M0 Free" tier
   - Select region closest to you
   - Click "Create"
   - Wait 3-5 minutes for cluster creation

4. **Create Database User:**
   - Go to "Database Access" → "Add New Database User"
   - Authentication Method: Password
   - Username: `interviewace` (or any name)
   - Password: Click "Autogenerate Secure Password" (SAVE THIS!)
   - Database User Privileges: "Atlas admin"
   - Click "Add User"

5. **Whitelist IP Address:**
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

6. **Get Connection String:**
   - Go to "Clusters" → Click "Connect"
   - Choose "Connect your application"
   - Driver: Node.js, Version: 5.5 or later
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://interviewace:YourPassword123@cluster0.xxxxx.mongodb.net/interviewace?retryWrites=true&w=majority`

**✅ When done, tell me:** "MongoDB ready" and share your connection string (I'll help you format it)

---

## Step 3: Deploy Backend on Render (10 minutes)

1. **Go to:** https://render.com
2. **Sign up** with GitHub (recommended)
3. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect repository: `maheshkonar02/interviewAce`
   - Click "Connect"

4. **Configure Service:**
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

5. **Add Environment Variables:**
   Click "Environment" tab, then add these one by one:

   ```
   Key: NODE_ENV
   Value: production

   Key: PORT
   Value: 3001

   Key: MONGODB_URI
   Value: [Your MongoDB connection string from Step 2]

   Key: JWT_SECRET
   Value: [Generate a random string - at least 32 characters]
   (You can use: openssl rand -base64 32)

   Key: FRONTEND_URL
   Value: https://interviewace.vercel.app
   (We'll update this after frontend deployment)

   Key: LOG_LEVEL
   Value: info

   Key: MAX_FILE_SIZE
   Value: 10485760
   ```

6. **Click "Create Web Service"**
   - Wait 5-10 minutes for first deployment
   - Watch the logs for any errors

7. **Copy your backend URL:**
   - It will be something like: `https://interviewace-backend.onrender.com`
   - Save this URL!

**✅ When done, tell me:** "Backend deployed" and share your backend URL

---

## Step 4: Deploy Frontend on Vercel (5 minutes)

1. **Go to:** https://vercel.com
2. **Sign up** with GitHub
3. **Import Project:**
   - Click "Add New..." → "Project"
   - Find and select `maheshkonar02/interviewAce`
   - Click "Import"

4. **Configure Project:**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

5. **Add Environment Variable:**
   - Click "Environment Variables"
   - Add:
     ```
     Key: VITE_API_URL
     Value: https://your-backend-url.onrender.com/api
     (Use the backend URL from Step 3)
     ```

6. **Click "Deploy"**
   - Wait 2-3 minutes
   - Copy your frontend URL (e.g., `https://interviewace.vercel.app`)

**✅ When done, tell me:** "Frontend deployed" and share your frontend URL

---

## Step 5: Connect Frontend & Backend (2 minutes)

1. **Go back to Render dashboard**
2. **Find your backend service**
3. **Go to Environment tab**
4. **Update FRONTEND_URL:**
   - Change value to your Vercel frontend URL
   - Click "Save Changes"
   - Render will auto-redeploy

**✅ When done, tell me:** "Connected"

---

## Step 6: Test Your Deployment

1. Visit your Vercel frontend URL
2. Try to register a new user
3. Try to login
4. Test other features

**✅ Tell me:** "Testing complete" and share any errors you see

---

## 🆘 Need Help?

At any step, if you encounter errors:
1. Share the error message
2. Share which step you're on
3. I'll help you fix it!

---

## 📋 Quick Reference

**MongoDB Atlas:** https://cloud.mongodb.com
**Render:** https://dashboard.render.com
**Vercel:** https://vercel.com/dashboard

**Your Repo:** https://github.com/maheshkonar02/interviewAce
