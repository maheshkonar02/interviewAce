# InterviewAce Setup Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB installed and running (or use MongoDB Atlas)
- npm or yarn package manager
- API keys for OpenAI and/or Anthropic (optional for testing)

## Installation Steps

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/interviewace
JWT_SECRET=your-super-secret-jwt-key-change-in-production
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here
FRONTEND_URL=http://localhost:3000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

### 3. Create Required Directories

```bash
# In backend directory
mkdir -p uploads/resumes uploads/screenshots logs
```

### 4. Start MongoDB

Make sure MongoDB is running:

```bash
# On Linux/Mac
sudo systemctl start mongod
# or
mongod

# On Windows
net start MongoDB
```

Or use MongoDB Atlas (cloud) and update `MONGODB_URI` in `.env`.

### 5. Start the Application

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

### 6. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## First Steps

1. Register a new account at http://localhost:3000/register
2. Upload your resume (optional but recommended)
3. Start an interview session
4. Test the real-time transcription and AI answers

## Features Overview

### ✅ Implemented Features

- User authentication (register/login)
- Resume upload and storage
- Interview session management
- Real-time transcription using Web Speech API
- AI-powered answer generation (OpenAI GPT-4, Claude)
- Screen capture for coding interviews
- Session history and analytics
- Credit system for API usage

### 🔧 Configuration

#### AI Models

You can configure which AI model to use in user preferences:
- `gpt-4` - OpenAI GPT-4
- `gpt-4-turbo` - OpenAI GPT-4 Turbo
- `claude-3-opus` - Anthropic Claude 3 Opus
- `claude-3-sonnet` - Anthropic Claude 3 Sonnet

#### Speech Recognition

Currently uses browser's Web Speech API. For production, integrate:
- Google Cloud Speech-to-Text
- AWS Transcribe
- Azure Speech Services
- Deepgram

#### Screen Capture & OCR

For coding interview support, integrate OCR services:
- Tesseract.js (client-side)
- Google Cloud Vision API
- AWS Textract

## Development Notes

### Backend Structure

```
backend/
├── src/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── socket/           # WebSocket handlers
│   ├── middleware/       # Express middleware
│   └── utils/           # Utilities
└── uploads/             # File uploads
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/      # React components
│   ├── pages/          # Page components
│   ├── store/          # State management
│   └── utils/          # Utilities
```

## Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify MongoDB port (default: 27017)

### API Key Errors

- Ensure OpenAI/Anthropic API keys are set in `.env`
- Check API key validity and billing status

### CORS Errors

- Verify `FRONTEND_URL` in backend `.env` matches frontend URL
- Check browser console for specific CORS errors

### Socket Connection Issues

- Ensure backend is running on port 3001
- Check firewall settings
- Verify WebSocket support in browser

## Production Deployment

### Environment Variables

Update all `.env` files with production values:
- Use strong `JWT_SECRET`
- Set `NODE_ENV=production`
- Use production database URL
- Configure CORS for production domain

### Security Checklist

- [ ] Change default JWT secret
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable helmet security headers
- [ ] Use environment variables for secrets
- [ ] Set up proper file upload validation
- [ ] Configure database backups

## Next Steps

1. Integrate production speech-to-text service
2. Add OCR for code extraction from screenshots
3. Implement resume parsing (PDF/DOC extraction)
4. Add more AI models and fine-tuning
5. Enhance UI/UX based on feedback
6. Add unit and integration tests
7. Set up CI/CD pipeline

## Support

For issues or questions, check the codebase or create an issue in the repository.

