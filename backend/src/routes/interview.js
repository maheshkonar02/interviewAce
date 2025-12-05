import express from 'express';
import { authenticateToken } from './auth.js';
import AIService from '../services/aiService.js';
import User from '../models/User.js';
import InterviewSession from '../models/InterviewSession.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Generate answer for a question
router.post('/answer', async (req, res, next) => {
  try {
    const { question, sessionId, isCodingQuestion, codeContext } = req.body;
    const userId = req.userId;

    if (!question) {
      return res.status(400).json({ 
        success: false, 
        error: 'Question is required' 
      });
    }

    const user = await User.findById(userId).populate('resume');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Check credits
    if (user.credits <= 0) {
      return res.status(402).json({ 
        success: false, 
        error: 'Insufficient credits' 
      });
    }

    const aiService = new AIService(user.preferences);
    
    // Get conversation history if session exists
    let conversationHistory = [];
    if (sessionId) {
      const session = await InterviewSession.findOne({ 
        sessionId, 
        userId 
      });
      if (session) {
        conversationHistory = session.transcript.slice(-10);
      }
    }

    const resumeData = user.resume?.parsedData || null;

    let result;
    try {
      result = await aiService.generateAnswer(question, {
        resumeData,
        conversationHistory,
        isCodingQuestion,
        codeContext
      });
    } catch (error) {
      // Don't deduct credits if API call failed
      if (error.message.includes('quota exceeded')) {
        return res.status(503).json({
          success: false,
          error: 'OpenAI API quota exceeded. Please add credits to your OpenAI account or contact support.'
        });
      }
      if (error.message.includes('API key')) {
        return res.status(500).json({
          success: false,
          error: 'OpenAI API configuration error. Please contact support.'
        });
      }
      throw error; // Re-throw other errors
    }

    // Deduct credit only if API call succeeded
    user.credits -= 1;
    await user.save();

    // Update session if exists
    if (sessionId) {
      await InterviewSession.findOneAndUpdate(
        { sessionId, userId },
        {
          $push: {
            questions: {
              question,
              answer: result.answer,
              timestamp: new Date(),
              aiModel: result.model
            }
          }
        }
      );
    }

    res.json({
      success: true,
      data: {
        answer: result.answer,
        model: result.model,
        creditsRemaining: user.credits
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get interview summary
router.get('/summary/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.userId;

    const session = await InterviewSession.findOne({ 
      sessionId, 
      userId 
    });

    if (!session) {
      return res.status(404).json({ 
        success: false, 
        error: 'Session not found' 
      });
    }

    const user = await User.findById(userId);
    const aiService = new AIService(user.preferences);

    const summary = await aiService.generateInterviewSummary({
      questions: session.questions,
      duration: session.duration
    });

    session.summary = summary;
    await session.save();

    res.json({
      success: true,
      data: { summary }
    });
  } catch (error) {
    next(error);
  }
});

export default router;

