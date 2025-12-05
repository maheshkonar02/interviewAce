import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export class AIService {
  constructor(userPreferences = {}) {
    // Always use Groq as primary model (free and fast)
    // This overrides any saved user preferences to ensure Groq is used
    this.model = 'groq-free';
    this.language = userPreferences.language || 'en';
    
    // Store original preference for reference (but don't use it)
    this.userPreferredModel = userPreferences.aiModel;
  }

  async generateAnswer(question, context = {}) {
    try {
      const { resumeData, conversationHistory, isCodingQuestion, codeContext } = context;

      let prompt = this.buildPrompt(question, resumeData, conversationHistory, isCodingQuestion, codeContext);

      // Try free models first, then fallback to paid
      if (this.model.startsWith('huggingface') || this.model === 'huggingface-free') {
        return await this.generateHuggingFaceAnswer(prompt);
      } else if (this.model.startsWith('groq')) {
        return await this.generateGroqAnswer(prompt);
      } else if (this.model.startsWith('gpt')) {
        return await this.generateOpenAIAnswer(prompt);
      } else if (this.model.startsWith('claude')) {
        return await this.generateClaudeAnswer(prompt);
      } else {
        // Default fallback to Groq free model
        logger.warn(`Unknown model ${this.model}, falling back to Groq`);
        return await this.generateGroqAnswer(prompt);
      }
    } catch (error) {
      logger.error('AI service error:', error);
      // If Groq fails, try Hugging Face as fallback
      if (!this.model.startsWith('huggingface')) {
        try {
          logger.info('Falling back to Hugging Face free model');
          const { resumeData, conversationHistory, isCodingQuestion, codeContext } = context;
          const fallbackPrompt = this.buildPrompt(question, resumeData, conversationHistory, isCodingQuestion, codeContext);
          return await this.generateHuggingFaceAnswer(fallbackPrompt);
        } catch (fallbackError) {
          logger.error('Fallback model also failed:', fallbackError);
        }
      }
      throw error;
    }
  }

  buildPrompt(question, resumeData, conversationHistory, isCodingQuestion, codeContext) {
    let prompt = '';

    if (resumeData) {
      prompt += `Based on the following resume information:\n${JSON.stringify(resumeData, null, 2)}\n\n`;
    }

    if (isCodingQuestion && codeContext) {
      prompt += `This is a coding interview question. Here's the code context:\n${codeContext}\n\n`;
    }

    if (conversationHistory && conversationHistory.length > 0) {
      prompt += 'Previous conversation context:\n';
      conversationHistory.slice(-5).forEach(msg => {
        prompt += `${msg.speaker}: ${msg.text}\n`;
      });
      prompt += '\n';
    }

    prompt += `Question: ${question}\n\n`;
    prompt += `Please provide a clear, concise, and professional answer in ${this.language}. `;

    if (isCodingQuestion) {
      prompt += 'Include code examples if relevant, and explain your approach.';
    } else {
      prompt += 'If relevant, relate your answer to your experience and background.';
    }

    return prompt;
  }

  async generateOpenAIAnswer(prompt) {
    // Map user-friendly model names to actual OpenAI API model names
    const modelMap = {
      'gpt-4': 'gpt-4o', // Use GPT-4o (latest GPT-4 model)
      'gpt-4-turbo': 'gpt-4-turbo',
      'gpt-3.5-turbo': 'gpt-3.5-turbo',
      'gpt-4o': 'gpt-4o',
      'gpt-4o-mini': 'gpt-4o-mini'
    };

    // Default to gpt-3.5-turbo if model not found (most reliable and available)
    let model = modelMap[this.model] || 'gpt-3.5-turbo';

    try {
      const response = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful interview assistant. Provide clear, professional answers that help the candidate succeed in their job interview.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      return {
        answer: response.choices[0].message.content,
        model: this.model,
        tokensUsed: response.usage.total_tokens
      };
    } catch (error) {
      // Handle quota exceeded error
      if (error.code === 'insufficient_quota' || error.status === 429) {
        logger.error('OpenAI API quota exceeded. Please check your billing and plan.');
        throw new Error('OpenAI API quota exceeded. Please add credits to your OpenAI account or contact support.');
      }

      // If model doesn't exist or access denied, fallback to gpt-3.5-turbo
      if (error.code === 'model_not_found' || error.status === 404) {
        logger.warn(`Model ${model} not available, falling back to gpt-3.5-turbo`);

        if (model !== 'gpt-3.5-turbo') {
          try {
            model = 'gpt-3.5-turbo';
            const response = await openai.chat.completions.create({
              model: model,
              messages: [
                {
                  role: 'system',
                  content: 'You are a helpful interview assistant. Provide clear, professional answers that help the candidate succeed in their job interview.'
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: 0.7,
              max_tokens: 1000
            });

            return {
              answer: response.choices[0].message.content,
              model: 'gpt-3.5-turbo', // Return the actual model used
              tokensUsed: response.usage.total_tokens
            };
          } catch (fallbackError) {
            // If fallback also fails, throw original error
            if (fallbackError.code === 'insufficient_quota' || fallbackError.status === 429) {
              throw new Error('OpenAI API quota exceeded. Please add credits to your OpenAI account.');
            }
            throw fallbackError;
          }
        }
      }

      // Handle authentication errors
      if (error.code === 'invalid_api_key' || error.status === 401) {
        logger.error('OpenAI API key is invalid or missing.');
        throw new Error('OpenAI API key is invalid. Please check your API key configuration.');
      }

      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Generate answer using Hugging Face Inference API (FREE)
   * Uses free models like mistralai/Mistral-7B-Instruct-v0.2
   */
  async generateHuggingFaceAnswer(prompt) {
    try {
      // Using a free model from Hugging Face
      // You can use any model from https://huggingface.co/models
      const model = 'mistralai/Mistral-7B-Instruct-v0.2'; // Free and good quality

      const apiUrl = `https://router.huggingface.co/models/${model}`;
      const apiKey = process.env.HUGGINGFACE_API_KEY || ''; // Optional, works without key for some models

      const headers = {
        'Content-Type': 'application/json',
      };

      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      // Format prompt for Mistral
      const formattedPrompt = `<s>[INST] You are a helpful interview assistant. Provide clear, professional answers that help the candidate succeed in their job interview.

${prompt} [/INST]</s>`;

      const response = await axios.post(
        apiUrl,
        {
          inputs: formattedPrompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            return_full_text: false
          }
        },
        {
          headers,
          timeout: 30000 // 30 second timeout
        }
      );

      // Check if model is still loading
      if (response.data.error && response.data.error.includes('loading')) {
        throw new Error('Model is loading. Please wait a moment and try again.');
      }

      let answer = '';

      // Handle different response formats from Hugging Face
      if (Array.isArray(response.data) && response.data.length > 0) {
        // Standard format: [{ generated_text: "..." }]
        answer = response.data[0]?.generated_text || response.data[0]?.text || '';
      } else if (response.data && typeof response.data === 'object') {
        // Single object format: { generated_text: "..." }
        if (response.data.generated_text) {
          answer = response.data.generated_text;
        } else if (response.data[0]?.generated_text) {
          answer = response.data[0].generated_text;
        } else if (response.data.text) {
          answer = response.data.text;
        }
      }

      // Clean up the answer (remove prompt if included)
      if (answer) {
        answer = answer.replace(formattedPrompt, '').trim();
        // Remove any remaining INST tags
        answer = answer.replace(/\[INST\].*?\[\/INST\]/s, '').trim();
        // Remove any leading/trailing whitespace or special chars
        answer = answer.replace(/^[\s\n\r]+|[\s\n\r]+$/g, '');
      }

      // If still no answer, provide a fallback
      if (!answer || answer.length < 10) {
        answer = 'I apologize, but I could not generate a complete response. Please try rephrasing your question or try again in a moment.';
      }

      return {
        answer: answer || 'I apologize, but I could not generate a response. Please try again.',
        model: 'huggingface-free',
        tokensUsed: 0 // Hugging Face doesn't always return token count
      };
    } catch (error) {
      logger.error('Hugging Face API error:', error.response?.data || error.message);
      throw new Error(`Hugging Face API error: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Generate answer using Groq API (FREE tier available)
   * Very fast inference with free tier
   */
  async generateGroqAnswer(prompt) {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error('Groq API key not configured. Get a free key at https://console.groq.com');
    }

    // Try multiple free models in order of preference
    const models = [
      'llama-3.1-70b-versatile',  // High quality, free tier
      'llama-3.1-8b-instant',      // Faster, free tier
      'gemma-7b-it',               // Alternative free model
      'llama-3.2-3b-instruct'     // Lightweight fallback
    ];

    for (const model of models) {
      try {
        const response = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: model,
            messages: [
              {
                role: 'system',
                content: 'You are a helpful interview assistant. Provide clear, professional answers that help the candidate succeed in their job interview.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 1000
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000
          }
        );

        return {
          answer: response.data.choices[0].message.content,
          model: 'groq-free',
          tokensUsed: response.data.usage?.total_tokens || 0
        };
      } catch (error) {
        // If model is decommissioned or unavailable, try next model
        if (error.response?.data?.error?.code === 'model_decommissioned' || 
            error.response?.data?.error?.code === 'model_not_found') {
          logger.warn(`Groq model ${model} not available, trying next model...`);
          continue;
        }
        // If it's the last model or a different error, throw it
        if (model === models[models.length - 1]) {
          logger.error('Groq API error:', error.response?.data || error.message);
          throw new Error(`Groq API error: ${error.response?.data?.error?.message || error.message}`);
        }
      }
    }

    // If all models failed
    throw new Error('All Groq models failed. Please check your API key and try again.');
  }

  async generateClaudeAnswer(prompt) {
    const modelMap = {
      'claude-3-opus': 'claude-3-opus-20240229',
      'claude-3-sonnet': 'claude-3-sonnet-20240229'
    };

    const model = modelMap[this.model] || 'claude-3-sonnet-20240229';

    const response = await anthropic.messages.create({
      model: model,
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return {
      answer: response.content[0].text,
      model: this.model,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens
    };
  }

  async generateInterviewSummary(sessionData) {
    const summaryPrompt = `Analyze this interview session and provide:
1. Overall performance score (0-100)
2. Key strengths demonstrated
3. Areas for improvement
4. General feedback

Interview data:
- Total questions: ${sessionData.questions?.length || 0}
- Duration: ${sessionData.duration} seconds
- Questions and answers: ${JSON.stringify(sessionData.questions, null, 2)}

Provide a JSON response with: performanceScore, strengths (array), improvements (array), feedback (string).`;

    try {
      const response = await this.generateAnswer(summaryPrompt);
      const summary = JSON.parse(response.answer);
      return summary;
    } catch (error) {
      logger.error('Error generating summary:', error);
      return {
        performanceScore: 75,
        strengths: ['Good communication'],
        improvements: ['Could provide more specific examples'],
        feedback: 'Overall good performance. Continue practicing.'
      };
    }
  }
}

export default AIService;

