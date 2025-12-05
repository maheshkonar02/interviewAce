import express from 'express';
import { randomUUID } from 'crypto';
import { authenticateToken } from './auth.js';
import InterviewSession from '../models/InterviewSession.js';
import User from '../models/User.js';

const router = express.Router();
router.use(authenticateToken);

// Create new interview session
router.post('/create', async (req, res, next) => {
  try {
    const { platform } = req.body;
    const sessionId = randomUUID();

    const session = new InterviewSession({
      userId: req.userId,
      sessionId,
      platform: platform || 'other',
      status: 'active',
      startedAt: new Date()
    });

    await session.save();

    res.json({
      success: true,
      data: {
        session: {
          sessionId: session.sessionId,
          platform: session.platform,
          startedAt: session.startedAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get session details
router.get('/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = await InterviewSession.findOne({ 
      sessionId, 
      userId: req.userId 
    });

    if (!session) {
      return res.status(404).json({ 
        success: false, 
        error: 'Session not found' 
      });
    }

    res.json({
      success: true,
      data: { session }
    });
  } catch (error) {
    next(error);
  }
});

// End session
router.post('/:sessionId/end', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = await InterviewSession.findOne({ 
      sessionId, 
      userId: req.userId 
    });

    if (!session) {
      return res.status(404).json({ 
        success: false, 
        error: 'Session not found' 
      });
    }

    // Calculate duration in seconds
    const endedAt = new Date();
    const durationSeconds = Math.floor((endedAt - session.startedAt) / 1000);
    const durationMinutes = durationSeconds / 60;

    // Calculate credits to deduct: 0.5 credits per minute
    // Round up to nearest 0.5 (so 1 minute = 0.5, 1.1 minutes = 1.0, etc.)
    const creditsToDeduct = Math.ceil(durationMinutes * 2) / 2; // Round to nearest 0.5

    // Get user and deduct credits
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Check if user has enough credits
    if (user.credits < creditsToDeduct) {
      // Deduct what they have (can't go negative)
      const actualDeduction = user.credits;
      user.credits = 0;
      await user.save();

      // Update session
      session.status = 'completed';
      session.endedAt = endedAt;
      session.duration = durationSeconds;
      session.creditsDeducted = actualDeduction;
      await session.save();

      return res.json({
        success: true,
        data: {
          session: {
            sessionId: session.sessionId,
            status: session.status,
            duration: durationSeconds,
            durationMinutes: Math.round(durationMinutes * 10) / 10,
            endedAt: session.endedAt
          },
          credits: {
            deducted: actualDeduction,
            requested: creditsToDeduct,
            remaining: user.credits,
            insufficient: true
          }
        }
      });
    }

    // Deduct credits
    user.credits -= creditsToDeduct;
    await user.save();

    // Update session
    session.status = 'completed';
    session.endedAt = endedAt;
    session.duration = durationSeconds;
    session.creditsDeducted = creditsToDeduct;
    await session.save();

    res.json({
      success: true,
      data: {
        session: {
          sessionId: session.sessionId,
          status: session.status,
          duration: durationSeconds,
          durationMinutes: Math.round(durationMinutes * 10) / 10,
          endedAt: session.endedAt
        },
        credits: {
          deducted: creditsToDeduct,
          remaining: user.credits
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all user sessions
router.get('/', async (req, res, next) => {
  try {
    const sessions = await InterviewSession.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: { sessions }
    });
  } catch (error) {
    next(error);
  }
});

export default router;

