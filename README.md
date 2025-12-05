# InterviewAce - AI Interview Assistant

A real-time AI-powered interview assistant that helps you ace job interviews with automatic transcription, AI-generated answers, and coding interview support.

## Features

- 🎤 **Real-time Transcription** - Blazing fast speech-to-text conversion
- 🤖 **AI-Powered Answers** - Get instant answers using GPT-4, Claude, or other LLMs
- 💻 **Coding Interview Support** - Screen capture and code analysis for technical interviews
- 📄 **Resume Integration** - Upload resume for personalized answers
- 🌍 **Multilingual Support** - Works in 52+ languages
- 🔒 **Privacy First** - Undetectable and secure
- 📊 **Interview Analytics** - Get summaries and performance insights

## Tech Stack

- **Backend**: Node.js, Express, Socket.io, WebRTC
- **Frontend**: React, TypeScript, Tailwind CSS
- **AI**: OpenAI API, Anthropic Claude API
- **Storage**: MongoDB/PostgreSQL
- **Real-time**: WebSocket, WebRTC

## Project Structure

```
interviewace/
├── backend/          # Node.js backend server
├── frontend/         # React frontend application
├── shared/           # Shared types and utilities
└── docs/             # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB (or PostgreSQL)
- API keys for OpenAI/Anthropic

### Installation

1. Clone the repository
2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

4. Set up environment variables (see `.env.example` files)

5. Start the backend:
```bash
cd backend
npm run dev
```

6. Start the frontend:
```bash
cd frontend
npm start
```

## Development

- Backend runs on `http://localhost:3001`
- Frontend runs on `http://localhost:3000`

## License

MIT

