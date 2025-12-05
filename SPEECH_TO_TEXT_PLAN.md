# Speech-to-Text Implementation Plan

## 📋 Executive Summary

This document outlines the comprehensive plan for implementing production-grade speech-to-text services in InterviewAce, replacing the current browser-based Web Speech API with enterprise-level solutions.

## 🔍 Current State Analysis

### Existing Implementation
- **Frontend**: Uses Web Speech API (Chrome/Edge only, limited accuracy)
- **Backend**: Placeholder `TranscriptionService` with no actual processing
- **Audio Flow**: Currently sends text strings, not audio data
- **Limitations**:
  - Browser-dependent (Chrome/Edge only)
  - No server-side processing
  - Limited language support
  - No audio quality control
  - No speaker diarization
  - Accuracy issues in noisy environments

### Architecture Gaps
1. No audio capture mechanism (MediaRecorder API not implemented)
2. No audio streaming to backend
3. No audio format conversion/optimization
4. No fallback mechanisms
5. No audio storage for replay/analysis

## 🎯 Goals & Requirements

### Functional Requirements
1. **Real-time Transcription**: Sub-second latency for live interviews
2. **Multi-language Support**: 52+ languages (as per ParakeetAI)
3. **High Accuracy**: >95% accuracy in interview scenarios
4. **Speaker Diarization**: Identify interviewer vs candidate
5. **Interim Results**: Show partial transcriptions as user speaks
6. **Punctuation & Formatting**: Proper capitalization and punctuation
7. **Noise Handling**: Work in various audio environments

### Non-Functional Requirements
1. **Scalability**: Handle multiple concurrent sessions
2. **Cost Efficiency**: Optimize API usage costs
3. **Reliability**: Fallback mechanisms for service failures
4. **Privacy**: Audio data handling compliance (GDPR, etc.)
5. **Performance**: Low latency (<500ms for real-time)

## 🔄 Service Options Comparison

### Option 1: Google Cloud Speech-to-Text ⭐ RECOMMENDED
**Pros:**
- Excellent accuracy and language support (120+ languages)
- Real-time streaming API
- Speaker diarization support
- Punctuation and formatting
- Good documentation
- Competitive pricing

**Cons:**
- Requires Google Cloud account
- Setup complexity

**Pricing:** ~$0.006 per 15 seconds (Standard), ~$0.009 (Enhanced)

**Best For:** Production-ready, high-accuracy needs

---

### Option 2: AWS Transcribe
**Pros:**
- Good integration with AWS ecosystem
- Real-time streaming
- Speaker identification
- Custom vocabulary support

**Cons:**
- Slightly more expensive
- More complex setup

**Pricing:** ~$0.024 per minute (Real-time)

**Best For:** AWS-native deployments

---

### Option 3: Azure Speech Services
**Pros:**
- Good accuracy
- Real-time streaming
- Custom models support
- Good for Microsoft ecosystem

**Cons:**
- Less flexible pricing
- Documentation can be complex

**Pricing:** ~$1 per hour (Standard)

**Best For:** Microsoft/Azure environments

---

### Option 4: Deepgram ⭐ BEST FOR STARTUPS
**Pros:**
- Very fast (low latency)
- Simple API
- Good pricing for startups
- Real-time streaming
- Good developer experience

**Cons:**
- Smaller company (less enterprise support)
- Fewer features than Google/AWS

**Pricing:** ~$0.0043 per minute (Pay-as-you-go)

**Best For:** Fast implementation, cost-conscious startups

---

### Option 5: AssemblyAI
**Pros:**
- Easy to use API
- Good accuracy
- Speaker labels
- Auto-punctuation

**Cons:**
- Less enterprise features
- Smaller ecosystem

**Pricing:** ~$0.00025 per second

**Best For:** Quick implementation, good balance

---

### Option 6: Hybrid Approach (Recommended for MVP)
**Strategy:**
- Primary: Deepgram (fast, cost-effective)
- Fallback: Google Cloud Speech-to-Text (high accuracy)
- Client-side: Web Speech API (free fallback for testing)

## 🏗️ Architecture Design

### Proposed Architecture

```
┌─────────────────┐
│   Frontend      │
│  (React)        │
│                 │
│  ┌───────────┐ │
│  │ MediaRecorder│ │ ← Capture audio from mic/system
│  └─────┬─────┘ │
│        │       │
│        ▼       │
│  ┌───────────┐ │
│  │ Audio Buffer│ │ ← Buffer & chunk audio
│  └─────┬─────┘ │
│        │       │
└────────┼───────┘
         │ WebSocket (binary audio chunks)
         ▼
┌─────────────────┐
│   Backend       │
│  (Node.js)      │
│                 │
│  ┌───────────┐ │
│  │ Audio Buffer│ │ ← Receive & buffer chunks
│  └─────┬─────┘ │
│        │       │
│        ▼       │
│  ┌───────────┐ │
│  │ STT Service │ │ ← Route to selected provider
│  │  Adapter    │ │
│  └─────┬─────┘ │
│        │       │
│   ┌────┴────┐  │
│   │         │  │
│   ▼         ▼  │
│ Deepgram  Google│ ← Multiple providers
│  Cloud    STT   │
│                 │
│  ┌───────────┐ │
│  │ Process    │ │ ← Format, detect questions
│  │ Results    │ │
│  └─────┬─────┘ │
│        │       │
└────────┼───────┘
         │ WebSocket (transcription results)
         ▼
┌─────────────────┐
│   Frontend      │
│  (Display)       │
└─────────────────┘
```

### Component Breakdown

#### 1. Frontend Audio Capture (`frontend/src/utils/audioCapture.js`)
- **MediaRecorder API** for microphone capture
- **AudioWorklet** for system audio capture (advanced)
- Audio chunking (100-500ms chunks)
- Format conversion (PCM, Opus, etc.)
- Buffer management
- Error handling & retry logic

#### 2. Backend Audio Processor (`backend/src/services/audioProcessor.js`)
- Receive audio chunks via WebSocket
- Buffer management for streaming
- Format validation & conversion
- Audio quality checks
- Chunk aggregation for STT services

#### 3. STT Service Adapter (`backend/src/services/stt/`)
```
stt/
├── baseSTTService.js      # Abstract base class
├── deepgramService.js      # Deepgram implementation
├── googleSTTService.js     # Google Cloud implementation
├── awsTranscribeService.js # AWS implementation
└── sttServiceFactory.js    # Factory pattern for provider selection
```

#### 4. Enhanced Transcription Service (`backend/src/services/transcriptionService.js`)
- Provider selection logic
- Fallback mechanisms
- Result processing
- Question detection (enhanced)
- Speaker diarization handling
- Confidence scoring

## 📝 Implementation Steps

### Phase 1: Foundation (Week 1)
**Goal:** Set up audio capture and basic streaming

1. **Frontend Audio Capture**
   - [ ] Implement MediaRecorder API wrapper
   - [ ] Add microphone permission handling
   - [ ] Implement audio chunking (100ms chunks)
   - [ ] Add audio format conversion (PCM/WAV)
   - [ ] Create audio buffer management
   - [ ] Add error handling & user feedback

2. **Backend Audio Reception**
   - [ ] Extend WebSocket handler for binary audio
   - [ ] Create audio buffer manager
   - [ ] Implement audio chunk aggregation
   - [ ] Add audio validation
   - [ ] Create audio storage (optional, for replay)

3. **Testing**
   - [ ] Test audio capture in different browsers
   - [ ] Test WebSocket binary streaming
   - [ ] Verify audio quality
   - [ ] Test error scenarios

### Phase 2: STT Integration (Week 2)
**Goal:** Integrate primary STT service (Deepgram recommended)

1. **Deepgram Integration**
   - [ ] Set up Deepgram account & API keys
   - [ ] Install Deepgram SDK
   - [ ] Create `deepgramService.js`
   - [ ] Implement real-time streaming
   - [ ] Handle interim & final results
   - [ ] Add error handling & retries

2. **Service Adapter Pattern**
   - [ ] Create base STT service interface
   - [ ] Implement Deepgram adapter
   - [ ] Create service factory
   - [ ] Add configuration management

3. **Backend Integration**
   - [ ] Update `TranscriptionService` to use Deepgram
   - [ ] Connect audio processor to STT service
   - [ ] Implement result processing pipeline
   - [ ] Add question detection (enhanced)

4. **Testing**
   - [ ] Test real-time transcription
   - [ ] Test accuracy with sample audio
   - [ ] Test error handling
   - [ ] Performance testing

### Phase 3: Enhanced Features (Week 3)
**Goal:** Add advanced features and optimizations

1. **Multi-language Support**
   - [ ] Add language selection UI
   - [ ] Implement language detection
   - [ ] Update STT service calls with language codes
   - [ ] Test with multiple languages

2. **Speaker Diarization**
   - [ ] Integrate speaker identification
   - [ ] Update transcript model to include speaker
   - [ ] Add speaker labels in UI
   - [ ] Visual differentiation (interviewer vs candidate)

3. **Interim Results**
   - [ ] Handle partial transcriptions
   - [ ] Update UI to show interim results
   - [ ] Smooth transitions (interim → final)
   - [ ] Visual indicators for interim vs final

4. **Optimization**
   - [ ] Implement audio compression
   - [ ] Add chunk size optimization
   - [ ] Implement connection pooling
   - [ ] Add caching for common phrases
   - [ ] Cost optimization (chunk batching)

### Phase 4: Fallback & Production (Week 4)
**Goal:** Add fallback mechanisms and production readiness

1. **Fallback System**
   - [ ] Integrate Google Cloud STT as fallback
   - [ ] Implement automatic failover
   - [ ] Add health checks for STT services
   - [ ] Create fallback UI indicators

2. **Error Handling**
   - [ ] Comprehensive error handling
   - [ ] User-friendly error messages
   - [ ] Retry logic with exponential backoff
   - [ ] Graceful degradation

3. **Monitoring & Logging**
   - [ ] Add transcription metrics
   - [ ] Track accuracy scores
   - [ ] Monitor API costs
   - [ ] Add performance monitoring
   - [ ] Create admin dashboard (optional)

4. **Documentation**
   - [ ] Update API documentation
   - [ ] Create user guide
   - [ ] Add troubleshooting guide
   - [ ] Document configuration options

## 🔧 Technical Implementation Details

### Audio Format Specifications

**Recommended Format:**
- **Sample Rate**: 16000 Hz (16kHz) - optimal for speech
- **Channels**: Mono (1 channel)
- **Bit Depth**: 16-bit
- **Encoding**: PCM (Linear PCM) or Opus
- **Chunk Size**: 100-500ms chunks for real-time

**Why 16kHz?**
- Most STT services work best with 16kHz
- Reduces bandwidth and costs
- Sufficient quality for speech recognition

### WebSocket Protocol Enhancement

**Current:**
```javascript
socket.emit('transcription:audio', {
  audioData: 'text string', // Currently text
  language: 'en-US'
});
```

**Proposed:**
```javascript
socket.emit('transcription:audio', {
  audioChunk: ArrayBuffer, // Binary audio data
  format: 'pcm',
  sampleRate: 16000,
  language: 'en-US',
  sessionId: 'xxx',
  chunkIndex: 123,
  timestamp: Date.now()
});
```

### STT Service Interface

```javascript
class BaseSTTService {
  async startStream(options) {
    // Initialize streaming connection
  }
  
  async sendAudioChunk(chunk) {
    // Send audio chunk to STT service
  }
  
  async stopStream() {
    // Close streaming connection
  }
  
  onResult(callback) {
    // Handle transcription results
  }
  
  onError(callback) {
    // Handle errors
  }
}
```

## 💰 Cost Analysis

### Estimated Monthly Costs (1000 hours/month)

| Service | Cost/Hour | Monthly Cost | Notes |
|---------|-----------|--------------|-------|
| Deepgram | $0.26 | $260 | Best for startups |
| Google STT | $1.44 | $1,440 | High accuracy |
| AWS Transcribe | $1.44 | $1,440 | AWS ecosystem |
| AssemblyAI | $0.90 | $900 | Good balance |

**Optimization Strategies:**
1. **Chunk Batching**: Send larger chunks (500ms vs 100ms) = 5x reduction
2. **Silence Detection**: Skip silent chunks = 20-30% reduction
3. **Compression**: Use Opus codec = 50% bandwidth reduction
4. **Caching**: Cache common phrases = 5-10% reduction

**Estimated Optimized Cost:** $150-300/month for 1000 hours

## 🧪 Testing Strategy

### Unit Tests
- Audio capture functionality
- Chunk processing
- Format conversion
- STT service adapters
- Error handling

### Integration Tests
- End-to-end audio flow
- WebSocket streaming
- STT service integration
- Fallback mechanisms

### Performance Tests
- Latency measurement
- Throughput testing
- Concurrent session handling
- Memory usage

### Accuracy Tests
- Test with various accents
- Test with background noise
- Test with different languages
- Compare providers

## 🚨 Risk Mitigation

### Technical Risks
1. **Browser Compatibility**
   - Mitigation: Feature detection, polyfills, fallback to Web Speech API

2. **Audio Quality Issues**
   - Mitigation: Audio preprocessing, noise reduction, quality checks

3. **Service Downtime**
   - Mitigation: Multiple providers, automatic failover, caching

4. **Cost Overruns**
   - Mitigation: Usage monitoring, rate limiting, cost alerts

### Business Risks
1. **API Rate Limits**
   - Mitigation: Request queuing, rate limiting, multiple accounts

2. **Privacy Concerns**
   - Mitigation: Data encryption, secure storage, GDPR compliance

## 📊 Success Metrics

### Performance Metrics
- **Latency**: <500ms from speech to transcription
- **Accuracy**: >95% word accuracy
- **Uptime**: >99.9% availability
- **Cost**: <$0.50 per hour of transcription

### User Experience Metrics
- Transcription appears within 1 second
- Smooth interim → final transitions
- Clear error messages
- Works across browsers

## 🔄 Migration Path

### Phase 1: Parallel Running
- Keep Web Speech API as fallback
- New STT service runs alongside
- A/B testing with users

### Phase 2: Gradual Migration
- Default to new STT service
- Fallback to Web Speech API if needed
- Monitor performance & costs

### Phase 3: Full Migration
- Remove Web Speech API dependency
- Optimize based on usage data
- Scale infrastructure

## 📚 Dependencies & Libraries

### Frontend
```json
{
  "recordrtc": "^5.6.2",        // Audio recording
  "opus-media-recorder": "^0.9.0", // Opus encoding
  "audio-buffer-utils": "^5.1.0"   // Audio processing
}
```

### Backend
```json
{
  "@deepgram/sdk": "^3.0.0",           // Deepgram SDK
  "@google-cloud/speech": "^6.0.0",     // Google Cloud STT
  "aws-sdk": "^2.1500.0",               // AWS SDK (for Transcribe)
  "wav": "^1.0.2",                      // WAV file handling
  "node-opus": "^0.3.3"                 // Opus decoding
}
```

## ✅ Implementation Checklist

### Frontend
- [ ] Audio capture component
- [ ] MediaRecorder wrapper
- [ ] Audio chunking logic
- [ ] Format conversion
- [ ] WebSocket binary streaming
- [ ] UI for transcription display
- [ ] Error handling UI
- [ ] Language selection
- [ ] Speaker labels display

### Backend
- [ ] WebSocket binary handler
- [ ] Audio buffer manager
- [ ] STT service base class
- [ ] Deepgram service implementation
- [ ] Google Cloud STT implementation (fallback)
- [ ] Service factory
- [ ] Enhanced transcription service
- [ ] Question detection (improved)
- [ ] Speaker diarization handling
- [ ] Error handling & retries
- [ ] Cost tracking
- [ ] Monitoring & logging

### Infrastructure
- [ ] Environment variables setup
- [ ] API key management
- [ ] Rate limiting
- [ ] Cost monitoring
- [ ] Error tracking (Sentry, etc.)
- [ ] Performance monitoring

## 🎯 Next Steps

1. **Review this plan** with the team
2. **Choose primary STT provider** (recommend Deepgram for MVP)
3. **Set up development environment** with API keys
4. **Start Phase 1** implementation
5. **Iterate based on testing** results

---

## 📝 Notes

- This plan prioritizes **Deepgram** as primary provider for cost-effectiveness and ease of implementation
- **Google Cloud STT** recommended as fallback for high-accuracy scenarios
- Plan is designed to be **modular** - can swap providers easily
- **Audio storage** is optional but recommended for replay/analysis features
- Consider **WebRTC** for system audio capture (advanced feature)

---

**Ready for implementation?** Review this plan and let me know if you'd like any modifications before we start coding! 🚀

