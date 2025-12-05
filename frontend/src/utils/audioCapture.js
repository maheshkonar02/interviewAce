/**
 * Audio Capture Utility
 * Captures system audio from video calls (Zoom, Meet, Teams, etc.)
 */

export class AudioCapture {
  constructor() {
    this.mediaStream = null;
    this.audioContext = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isCapturing = false;
    this.onTranscriptCallback = null;
  }

  /**
   * Start capturing system audio from video call
   * Uses getDisplayMedia to capture screen + system audio
   */
  async startSystemAudioCapture(options = {}) {
    try {
      // Request screen share with audio
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: 'screen',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 16000,
          channelCount: 1
        }
      });

      // Check if audio track exists
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio track available. Please enable "Share system audio" in your browser.');
      }

      this.mediaStream = stream;

      // Handle stream end (user stops sharing)
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        this.stopSystemAudioCapture();
      });

      // Set up audio processing
      await this.setupAudioProcessing(stream);

      this.isCapturing = true;
      return { success: true, stream };
    } catch (error) {
      console.error('Error starting system audio capture:', error);
      throw error;
    }
  }

  /**
   * Set up audio processing pipeline
   */
  async setupAudioProcessing(stream) {
    try {
      // Create AudioContext for processing
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      });

      const source = this.audioContext.createMediaStreamSource(stream);
      
      // Create MediaRecorder for audio chunks
      const options = {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 16000
      };

      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/webm';
      }

      this.mediaRecorder = new MediaRecorder(stream, options);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          this.processAudioChunk(event.data);
        }
      };

      // Start recording with 500ms chunks for real-time processing
      this.mediaRecorder.start(500);
    } catch (error) {
      console.error('Error setting up audio processing:', error);
      throw error;
    }
  }

  /**
   * Process audio chunk for transcription
   * Note: Web Speech API works with microphone input, not audio streams directly
   * For system audio, we need to use Web Speech API separately or send to backend STT service
   */
  async processAudioChunk(audioBlob) {
    try {
      // Store audio chunks for potential backend processing
      // In production, send these chunks to backend STT service via WebSocket
      
      // For now, we'll rely on Web Speech API running in parallel
      // The actual transcription happens via the SpeechRecognition API
      // which listens to the system audio through the browser's audio routing
      
      if (this.onTranscriptCallback) {
        // This is called but actual transcription happens via SpeechRecognition
        // In production, convert blob to audio buffer and send to STT service
        console.log('Audio chunk received:', audioBlob.size, 'bytes');
      }
    } catch (error) {
      console.error('Error processing audio chunk:', error);
    }
  }

  /**
   * Start microphone capture (fallback)
   */
  async startMicrophoneCapture() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1
        }
      });

      this.mediaStream = stream;
      await this.setupAudioProcessing(stream);
      this.isCapturing = true;
      return { success: true, stream };
    } catch (error) {
      console.error('Error starting microphone capture:', error);
      throw error;
    }
  }

  /**
   * Stop audio capture
   */
  stopSystemAudioCapture() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.isCapturing = false;
    this.audioChunks = [];
  }

  /**
   * Set callback for transcription results
   */
  onTranscript(callback) {
    this.onTranscriptCallback = callback;
  }

  /**
   * Get current audio stream
   */
  getStream() {
    return this.mediaStream;
  }
}

export default AudioCapture;

