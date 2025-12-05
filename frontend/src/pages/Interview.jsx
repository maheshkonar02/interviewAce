import { useState, useEffect, useRef } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '../utils/socket';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { Mic, MicOff, Send, Monitor, Square, X, Headphones, Eye, PlayCircle } from 'lucide-react';
import AudioCapture from '../utils/audioCapture';
import FloatingAnswerOverlay from '../components/FloatingAnswerOverlay';

export default function Interview() {
  const { fetchUser } = useAuthStore();
  const [sessionId, setSessionId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [platform, setPlatform] = useState('other');
  const [isScreenCapture, setIsScreenCapture] = useState(false);
  const [isSystemAudioCapturing, setIsSystemAudioCapturing] = useState(false);
  const [showFloatingOverlay, setShowFloatingOverlay] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0); // in seconds
  const overlayWindowRef = useRef(null);

  const recognitionRef = useRef(null);
  const canvasRef = useRef(null);
  const sessionCreatedRef = useRef(false);
  const audioCaptureRef = useRef(null);
  const durationIntervalRef = useRef(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      // Cleanup on unmount
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (audioCaptureRef.current) {
        audioCaptureRef.current.stopSystemAudioCapture();
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      disconnectSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (sessionId) {
      const socket = connectSocket(sessionId);

      socket.on('transcription:result', (data) => {
        setTranscript(prev => [...prev, {
          type: 'transcription',
          text: data.text,
          isQuestion: data.isQuestion,
          timestamp: new Date()
        }]);
      });

      socket.on('ai:answer', async (data) => {
        setAnswer(data.answer);
        setTranscript(prev => [...prev, {
          type: 'answer',
          question: data.question,
          answer: data.answer,
          timestamp: new Date()
        }]);
        setIsLoading(false);
        // Show floating overlay when answer is received
        if (!showFloatingOverlay) {
          setShowFloatingOverlay(true);
        }
        // Update overlay window if it exists
        if (overlayWindowRef.current && !overlayWindowRef.current.closed) {
          overlayWindowRef.current.postMessage({
            type: 'UPDATE_ANSWER',
            answer: data.answer
          }, window.location.origin);
        }
        // Refresh user data to update credits
        await fetchUser();
      });

      socket.on('error', (error) => {
        toast.error(error.message || 'An error occurred');
        setIsLoading(false);
      });

      return () => {
        socket.off('transcription:result');
        socket.off('ai:answer');
        socket.off('error');
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const createSession = async () => {
    // Prevent creating multiple sessions
    if (sessionId || isCreatingSession) {
      return;
    }

    // Mark that we're creating a session
    sessionCreatedRef.current = true;

    setIsCreatingSession(true);
    try {
      const response = await api.post('/session/create', { platform });
      const newSessionId = response.data.data.session.sessionId;
      setSessionId(newSessionId);
      setSessionDuration(0); // Reset duration
      toast.success('Interview session started');

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      toast.error('Failed to create session');
      sessionCreatedRef.current = false; // Allow retry
    } finally {
      setIsCreatingSession(false);
    }
  };

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        const socket = getSocket();
        if (socket) {
          socket.emit('transcription:audio', {
            audioData: finalTranscript, // In production, send actual audio buffer
            language: 'en-US'
          });
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      toast.error('Speech recognition error');
    };

    recognition.onend = () => {
      if (isRecording) {
        recognition.start();
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
    toast.success('Recording started');
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    toast.success('Recording stopped');
  };

  const handleSubmitQuestion = async () => {
    if (!currentQuestion.trim()) return;

    setIsLoading(true);
    const socket = getSocket();

    if (socket) {
      socket.emit('question:submit', {
        question: currentQuestion,
        isCodingQuestion: false
      });
    } else {
      // Fallback to HTTP API
      try {
        const response = await api.post('/interview/answer', {
          question: currentQuestion,
          sessionId
        });
        setAnswer(response.data.data.answer);
        setIsLoading(false);
        // Refresh user data to update credits
        await fetchUser();
      } catch (error) {
        toast.error('Failed to get answer');
        setIsLoading(false);
      }
    }

    setCurrentQuestion('');
  };

  /**
   * Start capturing system audio from video call
   * This captures audio from Zoom, Meet, Teams, etc.
   * Uses getDisplayMedia with audio to capture system audio
   */
  const startSystemAudioCapture = async () => {
    if (!sessionId) {
      toast.error('Please start a session first');
      return;
    }

    try {
      // Request screen share with system audio
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: 'screen'
        },
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 16000
        }
      });

      // Check if audio track exists
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        stream.getTracks().forEach(track => track.stop());
        toast.error('No audio track detected. Please enable "Share system audio" or "Share tab audio" in the browser prompt.');
        return;
      }

      // Store the stream
      if (!audioCaptureRef.current) {
        audioCaptureRef.current = new AudioCapture();
      }
      audioCaptureRef.current.mediaStream = stream;

      // Handle stream end (user stops sharing)
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopSystemAudioCapture();
        toast.info('Screen share ended. System audio capture stopped.');
      });

      // Start Web Speech API to transcribe the system audio
      // Web Speech API will pick up the audio being played through the system
      if (!isRecording) {
        startRecording();
      }

      setIsSystemAudioCapturing(true);
      toast.success('System audio capture started! Web Speech API is listening to the call audio.');

    } catch (error) {
      console.error('Error starting system audio capture:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('Permission denied. Please allow screen and audio sharing.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No audio source found. Make sure your video call is active.');
      } else {
        toast.error('Failed to start system audio capture: ' + error.message);
      }
    }
  };

  /**
   * Stop system audio capture
   */
  const stopSystemAudioCapture = () => {
    if (audioCaptureRef.current && audioCaptureRef.current.mediaStream) {
      audioCaptureRef.current.mediaStream.getTracks().forEach(track => track.stop());
      audioCaptureRef.current.mediaStream = null;
    }
    setIsSystemAudioCapturing(false);
    toast.success('System audio capture stopped');
  };

  const captureScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' }
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      video.addEventListener('loadedmetadata', () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        canvas.toBlob((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result.split(',')[1];
            const socket = getSocket();
            if (socket) {
              socket.emit('screen:capture', {
                imageData: base64data,
                sessionId
              });
            }
            stream.getTracks().forEach(track => track.stop());
            toast.success('Screen captured');
          };
          reader.readAsDataURL(blob);
        });
      });

      setIsScreenCapture(true);
    } catch (error) {
      toast.error('Failed to capture screen');
    }
  };

  const openOverlayWindow = () => {
    // Check if overlay window already exists and is open
    if (overlayWindowRef.current && !overlayWindowRef.current.closed) {
      overlayWindowRef.current.focus();
      overlayWindowRef.current.postMessage({
        type: 'SHOW_OVERLAY',
        answer: answer
      }, window.location.origin);
      return;
    }

    // Calculate position for overlay window (top-right corner)
    const width = 420;
    const height = 350;
    const left = window.screen.width - width - 20;
    const top = 20;

    // Open new window with overlay
    const overlayWindow = window.open(
      '/overlay',
      'InterviewAceOverlay',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=no,resizable=yes`
    );

    if (overlayWindow) {
      overlayWindowRef.current = overlayWindow;

      // Send current answer when window loads
      const sendAnswer = () => {
        overlayWindow.postMessage({
          type: 'UPDATE_ANSWER',
          answer: answer
        }, window.location.origin);
      };

      overlayWindow.addEventListener('load', sendAnswer);
      setTimeout(sendAnswer, 500); // Also send after a delay in case load event already fired

      // Handle window close
      const checkClosed = setInterval(() => {
        if (overlayWindow.closed) {
          clearInterval(checkClosed);
          overlayWindowRef.current = null;
          setShowFloatingOverlay(false);
        }
      }, 500);
    } else {
      toast.error('Popup blocked! Please allow popups for this site.');
    }
  };

  // Listen for messages from overlay window
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'OVERLAY_READY' && overlayWindowRef.current) {
        // Send current answer when overlay is ready
        overlayWindowRef.current.postMessage({
          type: 'UPDATE_ANSWER',
          answer: answer
        }, window.location.origin);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [answer]);

  const endSession = async () => {
    if (!sessionId) return;

    // Stop recording if active
    if (isRecording && recognitionRef.current) {
      stopRecording();
    }

    // Stop system audio capture if active
    if (isSystemAudioCapturing && audioCaptureRef.current) {
      stopSystemAudioCapture();
    }

    try {
      const response = await api.post(`/session/${sessionId}/end`);
      const { credits, session: sessionData } = response.data.data;

      // Show credits deduction info
      if (credits) {
        const durationMinutes = sessionData.durationMinutes || (sessionData.duration / 60);
        if (credits.insufficient) {
          toast.error(
            `Session ended. Insufficient credits! Deducted ${credits.deducted} credits (${durationMinutes.toFixed(1)} min session). Please add more credits.`,
            { duration: 5000 }
          );
        } else {
          toast.success(
            `Session ended! Duration: ${durationMinutes.toFixed(1)} min. Deducted: ${credits.deducted} credits. Remaining: ${credits.remaining} credits.`,
            { duration: 5000 }
          );
        }
      } else {
        toast.success('Session ended successfully');
      }

      // Refresh user data to update credits display
      await fetchUser();

      // Clear duration timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      // Reset state
      setSessionId(null);
      setTranscript([]);
      setAnswer('');
      setCurrentQuestion('');
      setIsRecording(false);
      setIsSystemAudioCapturing(false);
      setShowFloatingOverlay(false);
      setSessionDuration(0);
      sessionCreatedRef.current = false;

      // Close overlay window if open
      if (overlayWindowRef.current && !overlayWindowRef.current.closed) {
        overlayWindowRef.current.close();
        overlayWindowRef.current = null;
      }

      // Disconnect socket
      disconnectSocket();
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Failed to end session');
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Interview Session</h1>
          {isCreatingSession ? (
            <span className="text-sm text-gray-300">Creating session...</span>
          ) : sessionId ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-sm text-gray-300">
                  Session: {sessionId.substring(0, 8)}...
                </span>
                <div className="text-xs text-gray-400">
                  Duration: {Math.floor(sessionDuration / 60)}:{(sessionDuration % 60).toString().padStart(2, '0')}
                  {' • '}
                  Est. Credits: {Math.ceil((sessionDuration / 60) * 2) / 2}
                </div>
              </div>
              <button
                onClick={endSession}
                className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                title="End Session"
              >
                <X className="w-5 h-5 mr-2" />
                End Session
              </button>
            </div>
          ) : (
            <button
              onClick={createSession}
              disabled={isCreatingSession}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Start Session"
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              Start Session
            </button>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-2">
            Platform
          </label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full px-3 py-2 bg-gray-900/80 border border-white/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'rgba(17, 24, 39, 0.9)',
              color: '#ffffff'
            }}
            disabled={!!sessionId}
          >
            <option value="zoom" className="bg-gray-900 text-white">Zoom</option>
            <option value="teams" className="bg-gray-900 text-white">Microsoft Teams</option>
            <option value="meet" className="bg-gray-900 text-white">Google Meet</option>
            <option value="hackerrank" className="bg-gray-900 text-white">HackerRank</option>
            <option value="leetcode" className="bg-gray-900 text-white">LeetCode</option>
            <option value="other" className="bg-gray-900 text-white">Other</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!sessionId}
            className={`flex items-center px-4 py-2 rounded-md ${isRecording
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-green-600 hover:bg-green-700'
              } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-5 h-5 mr-2" />
                Stop Mic Recording
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 mr-2" />
                Start Mic Recording
              </>
            )}
          </button>

          <button
            onClick={isSystemAudioCapturing ? stopSystemAudioCapture : startSystemAudioCapture}
            disabled={!sessionId}
            className={`flex items-center px-4 py-2 rounded-md ${isSystemAudioCapturing
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-purple-600 hover:bg-purple-700'
              } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSystemAudioCapturing ? (
              <>
                <Headphones className="w-5 h-5 mr-2" />
                Stop Call Audio
              </>
            ) : (
              <>
                <Headphones className="w-5 h-5 mr-2" />
                Capture Call Audio
              </>
            )}
          </button>

          <button
            onClick={captureScreen}
            disabled={!sessionId}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Monitor className="w-5 h-5 mr-2" />
            Capture Screen
          </button>

          <button
            onClick={() => {
              if (showFloatingOverlay && overlayWindowRef.current && !overlayWindowRef.current.closed) {
                // Hide overlay - close the window
                overlayWindowRef.current.close();
                overlayWindowRef.current = null;
                setShowFloatingOverlay(false);
              } else {
                // Show overlay - open in separate window
                openOverlayWindow();
                setShowFloatingOverlay(true);
              }
            }}
            className={`flex items-center px-4 py-2 rounded-md ${showFloatingOverlay
              ? 'bg-yellow-600 hover:bg-yellow-700'
              : 'bg-indigo-600 hover:bg-indigo-700'
              } text-white`}
          >
            <Eye className="w-5 h-5 mr-2" />
            {showFloatingOverlay ? 'Close' : 'Open'} Overlay Window
          </button>
        </div>

        {isSystemAudioCapturing && (
          <div className="mb-4 p-3 bg-purple-900/30 border border-purple-500/50 rounded-lg">
            <p className="text-purple-200 text-sm">
              <strong>System Audio Capture Active:</strong> Listening to audio from your video call.
              The floating overlay will show answers that are visible during screen share.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Transcript</h2>
            <div className="bg-black/30 rounded-lg p-4 h-64 overflow-y-auto">
              {transcript.length === 0 ? (
                <p className="text-gray-400">No transcript yet...</p>
              ) : (
                transcript.map((item, index) => (
                  <div key={index} className="mb-2">
                    {item.type === 'transcription' && (
                      <div className="text-white">
                        <span className="text-xs text-gray-400">
                          {item.timestamp.toLocaleTimeString()}
                        </span>
                        <p className={item.isQuestion ? 'text-yellow-300' : ''}>
                          {item.text}
                        </p>
                      </div>
                    )}
                    {item.type === 'answer' && (
                      <div className="mt-2 p-2 bg-green-900/30 rounded">
                        <p className="text-green-200 text-sm">
                          <strong>Q:</strong> {item.question}
                        </p>
                        <p className="text-white mt-1">
                          <strong>A:</strong> {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-4">AI Answer</h2>
            <div className="bg-black/30 rounded-lg p-4 h-64 overflow-y-auto">
              {isLoading ? (
                <p className="text-gray-400">Generating answer...</p>
              ) : answer ? (
                <p className="text-white whitespace-pre-wrap">{answer}</p>
              ) : (
                <p className="text-gray-400">Answer will appear here...</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <input
            type="text"
            value={currentQuestion}
            onChange={(e) => setCurrentQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmitQuestion()}
            placeholder="Type a question or wait for transcription..."
            className="flex-1 px-4 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-gray-400"
          />
          <button
            onClick={handleSubmitQuestion}
            disabled={!currentQuestion.trim() || isLoading}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Floating Answer Overlay - Visible during screen share */}
      <FloatingAnswerOverlay
        answer={answer}
        isVisible={showFloatingOverlay}
        onClose={() => setShowFloatingOverlay(false)}
      />
    </div>
  );
}

