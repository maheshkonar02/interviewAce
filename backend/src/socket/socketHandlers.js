import { logger } from '../utils/logger.js';
import InterviewSession from '../models/InterviewSession.js';
import AIService from '../services/aiService.js';
import TranscriptionService from '../services/transcriptionService.js';
import ScreenCaptureService from '../services/screenCaptureService.js';
import User from '../models/User.js';

export function setupSocketHandlers(io) {
  const transcriptionService = new TranscriptionService();
  const screenCaptureService = new ScreenCaptureService();

  io.on('connection', (socket) => {
    logger.info('Client connected:', socket.id);

    let currentSessionId = null;
    let currentUserId = null;

    // Authenticate socket connection
    socket.on('authenticate', async (data) => {
      try {
        const { token, sessionId } = data;

        // In production, verify JWT token here
        // For now, we'll trust the client sends valid userId
        currentUserId = data.userId;
        currentSessionId = sessionId;

        socket.join(`session:${sessionId}`);
        socket.emit('authenticated', { success: true });

        logger.info('Socket authenticated:', { socketId: socket.id, sessionId });
      } catch (error) {
        logger.error('Socket authentication error:', error);
        socket.emit('error', { message: 'Authentication failed' });
      }
    });

    // Handle real-time transcription
    socket.on('transcription:audio', async (data) => {
      try {
        const { audioData, language } = data;

        // Process audio chunk
        const transcription = await transcriptionService.transcribeAudio(
          audioData,
          language || 'en-US'
        );

        if (transcription.text) {
          const isQuestion = transcriptionService.isQuestion(transcription.text);

          // Save to session
          if (currentSessionId) {
            await InterviewSession.findOneAndUpdate(
              { sessionId: currentSessionId },
              {
                $push: {
                  transcript: {
                    timestamp: new Date(),
                    speaker: 'interviewer',
                    text: transcription.text,
                    isQuestion
                  }
                }
              }
            );
          }

          // Emit transcription to client
          socket.emit('transcription:result', {
            text: transcription.text,
            isQuestion,
            confidence: transcription.confidence
          });

          // Auto-generate answer if it's a question
          if (isQuestion && currentUserId && currentSessionId) {
            try {
              const user = await User.findById(currentUserId).populate('resume');
              
              // Check user credits first
              if (user.credits <= 0) {
                socket.emit('error', { message: 'Insufficient credits to generate answer' });
                return;
              }

              const aiService = new AIService(user.preferences);
              
              const result = await aiService.generateAnswer(transcription.text, {
                resumeData: user.resume?.parsedData || null
              });

              // Deduct credit
              user.credits -= 1;
              await user.save();

              socket.emit('ai:answer', {
                question: transcription.text,
                answer: result.answer,
                model: result.model,
                creditsRemaining: user.credits
              });
            } catch (error) {
              logger.error('Error generating auto-answer:', error);
              
              // Provide user-friendly error messages
              let errorMessage = 'Failed to generate answer automatically';
              if (error.message.includes('quota exceeded')) {
                errorMessage = 'OpenAI API quota exceeded. Please add credits to your OpenAI account.';
              } else if (error.message.includes('API key')) {
                errorMessage = 'OpenAI API key is invalid. Please contact support.';
              }
              
              socket.emit('error', { message: errorMessage });
            }
          }
        }
      } catch (error) {
        logger.error('Transcription error:', error);
        socket.emit('error', { message: 'Transcription failed' });
      }
    });

    // Handle screen capture for coding interviews
    socket.on('screen:capture', async (data) => {
      try {
        const { imageData, sessionId } = data;
        const sessionIdToUse = sessionId || currentSessionId;

        if (!sessionIdToUse) {
          socket.emit('error', { message: 'No active session' });
          return;
        }

        // Save screen capture
        const capture = await screenCaptureService.saveScreenCapture(
          imageData,
          sessionIdToUse
        );

        // Extract code from image
        const codeExtraction = await screenCaptureService.extractCodeFromImage(
          capture.filePath
        );

        // Save to session
        await InterviewSession.findOneAndUpdate(
          { sessionId: sessionIdToUse },
          {
            $push: {
              screenCaptures: {
                timestamp: capture.timestamp,
                imagePath: capture.filePath,
                detectedCode: codeExtraction.code
              }
            }
          }
        );

        socket.emit('screen:captured', {
          capture: {
            ...capture,
            code: codeExtraction.code,
            language: codeExtraction.language
          }
        });
      } catch (error) {
        logger.error('Screen capture error:', error);
        socket.emit('error', { message: 'Screen capture failed' });
      }
    });

    // Handle manual question submission
    socket.on('question:submit', async (data) => {
      try {
        const { question, isCodingQuestion, codeContext } = data;

        if (!currentUserId || !currentSessionId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        const user = await User.findById(currentUserId).populate('resume');
        if (user.credits <= 0) {
          socket.emit('error', { message: 'Insufficient credits' });
          return;
        }

        const aiService = new AIService(user.preferences);
        
        let result;
        try {
          result = await aiService.generateAnswer(question, {
            resumeData: user.resume?.parsedData || null,
            isCodingQuestion,
            codeContext
          });
        } catch (apiError) {
          // Don't deduct credits if API call failed
          throw apiError;
        }

        // Deduct credit only if API call succeeded
        user.credits -= 1;
        await user.save();

        // Update session
        await InterviewSession.findOneAndUpdate(
          { sessionId: currentSessionId },
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

        socket.emit('ai:answer', {
          question,
          answer: result.answer,
          model: result.model,
          creditsRemaining: user.credits
        });
      } catch (error) {
        logger.error('Question submission error:', error);
        
        // Provide user-friendly error messages
        let errorMessage = 'Failed to generate answer';
        if (error.message.includes('quota exceeded')) {
          errorMessage = 'OpenAI API quota exceeded. Please add credits to your OpenAI account.';
        } else if (error.message.includes('API key')) {
          errorMessage = 'OpenAI API key is invalid. Please contact support.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        socket.emit('error', { message: errorMessage });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info('Client disconnected:', socket.id);
    });
  });
}

