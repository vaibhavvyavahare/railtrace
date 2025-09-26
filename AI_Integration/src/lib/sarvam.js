import axios from 'axios';

const SARVAM_BASE_URL = process.env.SARVAM_BASE_URL || 'https://api.sarvam.ai';
const SARVAM_API_KEY = process.env.SARVAM_API_KEY || '';

function getHeaders() {
  if (!SARVAM_API_KEY) {
    throw new Error('Missing SARVAM_API_KEY. Set it in your environment.');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SARVAM_API_KEY}`
  };
}

export async function generateTextSummary({ prompt, model = 'saarika:v2.5' }) {
  // Placeholder endpoint; adapt to the specific Sarvam text/chat API in use
  const url = `${SARVAM_BASE_URL}/v1/text/complete`;
  const body = {
    model,
    input: prompt
  };
  const { data } = await axios.post(url, body, { headers: getHeaders() });
  return data;
}


