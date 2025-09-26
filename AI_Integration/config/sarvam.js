const axios = require('axios');

const SARVAM_BASE_URL = process.env.SARVAM_BASE_URL || 'https://api.sarvam.ai';
const SARVAM_API_KEY = process.env.SARVAM_API_KEY;

if (!SARVAM_API_KEY) {
  console.warn('⚠️  SARVAM_API_KEY not found in environment variables');
}

const sarvamClient = axios.create({
  baseURL: SARVAM_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SARVAM_API_KEY}`
  }
});

// Text completion using Sarvam AI
const generateTextCompletion = async (prompt, options = {}) => {
  try {
    const response = await sarvamClient.post('/v1/text/complete', {
      model: options.model || 'saarika:v2.5',
      input: prompt,
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Sarvam AI API error:', error.response?.data || error.message);
    throw new Error(`Sarvam AI API error: ${error.response?.data?.message || error.message}`);
  }
};

// Chat completion using Sarvam AI
const generateChatCompletion = async (messages, options = {}) => {
  try {
    const response = await sarvamClient.post('/v1/chat/completions', {
      model: options.model || 'saarika:v2.5',
      messages: messages,
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Sarvam AI Chat API error:', error.response?.data || error.message);
    throw new Error(`Sarvam AI Chat API error: ${error.response?.data?.message || error.message}`);
  }
};

// Text translation using Sarvam AI
const translateText = async (text, sourceLang = 'auto', targetLang = 'en', options = {}) => {
  try {
    const response = await sarvamClient.post('/v1/text/translate', {
      input: text,
      source_language_code: sourceLang,
      target_language_code: targetLang,
      speaker_gender: options.speakerGender || 'Male'
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Sarvam AI Translation error:', error.response?.data || error.message);
    throw new Error(`Sarvam AI Translation error: ${error.response?.data?.message || error.message}`);
  }
};

module.exports = {
  generateTextCompletion,
  generateChatCompletion,
  translateText,
  sarvamClient
};
