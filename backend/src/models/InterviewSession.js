import mongoose from 'mongoose';

const interviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  platform: {
    type: String,
    enum: ['zoom', 'teams', 'meet', 'hackerrank', 'leetcode', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  transcript: [{
    timestamp: Date,
    speaker: String,
    text: String,
    isQuestion: Boolean
  }],
  questions: [{
    question: String,
    answer: String,
    timestamp: Date,
    aiModel: String
  }],
  screenCaptures: [{
    timestamp: Date,
    imagePath: String,
    detectedCode: String
  }],
  summary: {
    totalQuestions: Number,
    totalAnswers: Number,
    performanceScore: Number,
    feedback: String,
    strengths: [String],
    improvements: [String]
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  creditsDeducted: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('InterviewSession', interviewSessionSchema);

