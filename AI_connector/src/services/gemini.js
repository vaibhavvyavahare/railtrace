import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

export async function generateSummary(prompt) {
  if (!GEMINI_API_KEY) {
    // Fallback to deterministic text if key is missing
    return `Summary: ${prompt.substring(0, 400)} ...`;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
  const body = {
    contents: [{ parts: [{ text: `Summarize the following rail operations data for actionable insights. Keep 6-10 sentences, concise bullets if helpful.\n\n${prompt}` }] }],
    generationConfig: {
      temperature: 0.4,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 512
    }
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Gemini API error ${resp.status}: ${errText}`);
  }

  const json = await resp.json();
  const candidate = json.candidates && json.candidates[0];
  const part = candidate && candidate.content && candidate.content.parts && candidate.content.parts[0];
  const text = part && part.text ? part.text : '';
  return text || `Summary: ${prompt.substring(0, 400)} ...`;
}


