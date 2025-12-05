# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd frontend
npm install
```

### Step 2: Configure Environment

Create `backend/.env` file:

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/interviewace
JWT_SECRET=dev-secret-key-change-in-production
OPENAI_API_KEY=your-key-here
ANTHROPIC_API_KEY=your-key-here
FRONTEND_URL=http://localhost:3000
```

### Step 3: Start MongoDB

```bash
# Linux/Mac
sudo systemctl start mongod

# Or use MongoDB Atlas (cloud) - update MONGODB_URI in .env
```

### Step 4: Create Upload Directories

```bash
cd backend
mkdir -p uploads/resumes uploads/screenshots logs
```

### Step 5: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 6: Open Browser

Navigate to: **http://localhost:3000**

## 🎯 First Use

1. **Register** - Create a new account
2. **Upload Resume** (optional) - Get personalized answers
3. **Start Interview** - Begin a new session
4. **Test Features**:
   - Click "Start Recording" for real-time transcription
   - Type questions manually or wait for auto-detection
   - View AI-generated answers in real-time

## ⚠️ Important Notes

- **API Keys**: You need OpenAI or Anthropic API keys for AI features to work
- **MongoDB**: Must be running before starting the backend
- **Browser**: Use Chrome/Edge for best Web Speech API support
- **Credits**: Each answer uses 1 credit (add credits in database for testing)

## 🔧 Troubleshooting

**Backend won't start?**
- Check MongoDB is running
- Verify `.env` file exists
- Check port 3001 is available

**Frontend won't connect?**
- Ensure backend is running on port 3001
- Check browser console for errors
- Verify CORS settings in backend `.env`

**Speech recognition not working?**
- Use Chrome or Edge browser
- Allow microphone permissions
- Check browser console for errors

## 📚 Next Steps

- Read [SETUP.md](./SETUP.md) for detailed configuration
- Check [README.md](./README.md) for feature overview
- Customize AI models and preferences

Happy coding! 🎉

