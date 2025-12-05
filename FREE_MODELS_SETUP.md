# Free AI Models Setup Guide

InterviewAce now supports **FREE AI models**! No paid API keys required to get started.

## 🆓 Free Models Available

### 1. Hugging Face (Default - Completely FREE)
- **No API key required** for basic usage
- Uses `mistralai/Mistral-7B-Instruct-v0.2` model
- Good quality answers
- Works immediately without setup

**Optional:** Get a free API key at https://huggingface.co/settings/tokens for better rate limits

### 2. Groq (FREE Tier)
- **Very fast** inference
- Free tier with generous limits
- Uses `mixtral-8x7b-32768` model
- **Requires:** Free API key from https://console.groq.com

## 🚀 Quick Setup

### Option 1: Use Hugging Face (No Setup Required)
**Default model - works immediately!**

Just start the backend - it will use Hugging Face by default.

### Option 2: Use Groq (Fast & Free)

1. **Get Free API Key:**
   - Visit https://console.groq.com
   - Sign up (free)
   - Create an API key

2. **Add to `.env` file:**
   ```env
   GROQ_API_KEY=your-groq-api-key-here
   ```

3. **Change default model** (optional):
   - The app defaults to `huggingface-free`
   - Users can select `groq-free` in preferences

## 📝 Environment Variables

Add to `backend/.env`:

```env
# Hugging Face (Optional - works without key)
HUGGINGFACE_API_KEY=your-huggingface-api-key-here

# Groq (Optional - but recommended for better performance)
GROQ_API_KEY=your-groq-api-key-here

# OpenAI (Optional - Paid)
OPENAI_API_KEY=your-openai-api-key-here

# Anthropic Claude (Optional - Paid)
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

## 🎯 Model Selection

Users can select models in their preferences:
- `huggingface-free` - Free, no setup (default)
- `groq-free` - Free, fast, requires API key
- `gpt-3.5-turbo` - Paid (OpenAI)
- `gpt-4` - Paid (OpenAI)
- `claude-3-sonnet` - Paid (Anthropic)

## ⚡ Performance Comparison

| Model | Speed | Quality | Cost | Setup |
|-------|-------|---------|------|-------|
| Hugging Face | Medium | Good | FREE | None |
| Groq | Very Fast | Excellent | FREE | API Key |
| GPT-3.5 | Fast | Excellent | Paid | API Key |
| GPT-4 | Medium | Best | Paid | API Key |

## 🔄 Automatic Fallback

The system automatically falls back to free models if paid APIs fail:
1. Tries selected model
2. If fails → Falls back to Groq (if configured)
3. If still fails → Falls back to Hugging Face

## 💡 Recommendations

**For Development/Testing:**
- Use `huggingface-free` (default) - works immediately

**For Production:**
- Use `groq-free` - faster and more reliable
- Get free API key from Groq

**For Best Quality:**
- Use paid models (GPT-4, Claude) when you have credits

## 🐛 Troubleshooting

### Hugging Face errors?
- Some models may be loading (first request takes time)
- Try again after 30 seconds
- Consider getting a free API key for better rate limits

### Groq errors?
- Make sure you've added `GROQ_API_KEY` to `.env`
- Verify your API key at https://console.groq.com
- Check if you've exceeded free tier limits

### Want to use a different Hugging Face model?
Edit `backend/src/services/aiService.js` and change the model name in `generateHuggingFaceAnswer()` function.

Popular free models:
- `mistralai/Mistral-7B-Instruct-v0.2` (current)
- `meta-llama/Llama-2-7b-chat-hf`
- `google/flan-t5-large`

---

**Enjoy your free AI-powered interview assistant! 🎉**

