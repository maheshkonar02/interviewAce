# Call Audio Capture & Floating Overlay Guide

## 🎯 Overview

InterviewAce now supports capturing audio directly from video calls (Zoom, Google Meet, Microsoft Teams, etc.) and displaying AI answers in a floating overlay that remains visible during screen sharing.

## ✨ Features

1. **System Audio Capture**: Listen to audio from video calls
2. **Floating Answer Overlay**: Answers displayed in a draggable, always-visible overlay
3. **Screen Share Compatible**: Overlay stays visible even when sharing your screen
4. **Real-time Transcription**: Automatically transcribes questions from the call
5. **Auto-Answer**: Generates AI answers automatically when questions are detected

## 🚀 How to Use

### Step 1: Start an Interview Session

1. Navigate to the **Interview** page
2. Select your platform (Zoom, Meet, Teams, etc.)
3. A session will be created automatically

### Step 2: Capture Call Audio

1. Click the **"Capture Call Audio"** button (purple button with headphones icon)
2. A browser prompt will appear asking for screen and audio sharing permissions
3. **IMPORTANT**: Check the box for **"Share system audio"** or **"Share tab audio"**
4. Select the window/tab where your video call is running
5. Click **"Share"**

### Step 3: Enable Floating Overlay

1. Click the **"Show Overlay"** button (indigo button with eye icon)
2. A floating overlay will appear in the top-right corner
3. You can drag it anywhere on your screen
4. The overlay will show AI answers automatically

### Step 4: During Your Interview

- The system will automatically listen to the call audio
- When a question is detected, it will be transcribed
- AI will generate an answer automatically
- The answer will appear in:
  - The main Interview page
  - The floating overlay (visible during screen share)

### Step 5: Screen Sharing

1. When you share your screen in Zoom/Meet/Teams, the floating overlay will remain visible
2. You can drag it to a position that's comfortable for you
3. The overlay is always on top (z-index: 99999)
4. Interviewers won't see it unless you position it in the shared area

## 🎨 Overlay Features

### Controls

- **Copy Button**: Copy the answer to clipboard
- **Minimize/Maximize**: Minimize to header only or expand to full view
- **Close Button**: Hide the overlay (can be shown again with "Show Overlay" button)

### Dragging

- Click and drag the overlay header to move it
- The overlay will stay within screen bounds
- Position it wherever is most convenient

## 🔧 Browser Compatibility

### Chrome/Edge (Recommended)
- ✅ Full support for system audio capture
- ✅ Best performance
- ✅ All features work

### Firefox
- ⚠️ Limited system audio support
- May need to use microphone capture instead

### Safari
- ⚠️ Limited support
- System audio capture may not work

## 📝 Tips & Best Practices

1. **Enable System Audio**: Always check "Share system audio" when prompted
2. **Position Overlay**: Place overlay in a corner that won't interfere with your screen share
3. **Test First**: Test the audio capture before your actual interview
4. **Microphone vs System Audio**:
   - **System Audio**: Captures audio from the call (recommended)
   - **Microphone**: Captures your microphone (fallback option)

## 🐛 Troubleshooting

### "No audio track detected"
- **Solution**: Make sure you checked "Share system audio" in the browser prompt
- Try selecting a different window/tab
- Ensure your video call is active and playing audio

### Overlay not visible during screen share
- **Solution**: The overlay uses z-index 99999, it should be visible
- Make sure you clicked "Show Overlay" button
- Check if overlay is minimized (click maximize button)

### Audio not being captured
- **Solution**: 
  1. Check browser permissions (Settings > Privacy > Microphone)
  2. Make sure system audio sharing is enabled
  3. Try refreshing the page and starting again
  4. Use "Start Mic Recording" as fallback

### Transcription not working
- **Solution**:
  1. Ensure Web Speech API is supported (Chrome/Edge recommended)
  2. Check microphone permissions
  3. Make sure audio is actually playing in the call
  4. Try speaking louder or checking audio levels

## 🔒 Privacy Notes

- Audio is processed locally using Web Speech API (browser-based)
- In production, audio will be sent to STT services (configurable)
- Overlay is only visible on your screen
- No audio is stored unless you explicitly save sessions

## 🚧 Future Enhancements

- [ ] Backend STT service integration (Deepgram, Google Cloud, etc.)
- [ ] Multiple overlay positions presets
- [ ] Customizable overlay appearance
- [ ] Keyboard shortcuts for overlay control
- [ ] Audio level indicators
- [ ] Speaker diarization (identify interviewer vs candidate)

---

**Need Help?** Check the main README or create an issue in the repository.

