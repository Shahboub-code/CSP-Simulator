const EXPLANATION_CACHE_KEY = 'csp_explanation_cache';

const getCache = () => {
  try {
    const cached = localStorage.getItem(EXPLANATION_CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
};

const setCache = (cache) => {
  try {
    localStorage.setItem(EXPLANATION_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('Failed to save explanation cache:', e);
  }
};

const getCacheKey = (questionText, correctAnswer) => {
  const normalized = (questionText || '').substring(0, 100).toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${normalized}_${correctAnswer}`;
};

export const getCachedExplanation = (questionText, correctAnswer) => {
  const cache = getCache();
  const key = getCacheKey(questionText, correctAnswer);
  return cache[key] || null;
};

export const setCachedExplanation = (questionText, correctAnswer, explanation) => {
  const cache = getCache();
  const key = getCacheKey(questionText, correctAnswer);
  cache[key] = explanation;
  setCache(cache);
};

export const generateExplanation = async (questionText, options, correctAnswer, apiKey) => {
  if (!apiKey) {
    throw new Error('API key required');
  }

  const prompt = `You are a safety exam tutor. Explain why the correct answer is correct for this CSP/ASP exam question.

Question: ${questionText}

Options:
${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}

Correct Answer: ${correctAnswer}

Provide a clear, concise explanation (2-3 sentences) of why this answer is correct and why the other options are incorrect. Focus on the key safety concept being tested.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful safety exam tutor.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || 'Failed to generate explanation');
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || '';
};

export const getApiKey = () => {
  try {
    return localStorage.getItem('csp_openai_api_key') || '';
  } catch {
    return '';
  }
};

export const setApiKey = (key) => {
  try {
    localStorage.setItem('csp_openai_api_key', key);
  } catch (e) {
    console.warn('Failed to save API key:', e);
  }
};
