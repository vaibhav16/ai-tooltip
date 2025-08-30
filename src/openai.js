const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const DEFAULT_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const RATE_LIMIT_MS = 3000;
const DEFAULT_TIMEOUT = 5000;

let lastRequestTime = 0;
let requestQueue = Promise.resolve();

export const getTooltipResponse = (prompt, debug = false, options = {}) => {
  return (requestQueue = requestQueue.then(() =>
    makeRateLimitedRequest(prompt, debug, options)
  ));
};

export const getTooltipResponseAsk = (prompt, debug = false, options = {}) => {
  return makeApiRequest(prompt, debug, options);
};

async function makeRateLimitedRequest(prompt, debug = false, options = {}) {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  const delayNeeded = Math.max(RATE_LIMIT_MS - timeSinceLastRequest, 0);

  if (debug) {
    console.log(`[RateLimit] Waiting ${delayNeeded}ms before next request`);
  }

  if (delayNeeded > 0) await delay(delayNeeded);

  lastRequestTime = Date.now();
  return makeApiRequest(prompt, debug, options);
}

async function makeApiRequest(prompt, debug = false, options = {}) {
  const timeout = options.timeout || DEFAULT_TIMEOUT;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const payload = createRequestPayload(prompt, options);
  const headers = createRequestHeaders();

  try {
    if (debug) console.log("[API] Sending prompt:", prompt);

    const response = await fetch(API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 429) {
      if (debug) console.warn("[API] Rate limit hit. Retrying in 5s...");
      await delay(5000);
      return makeApiRequest(prompt, debug, options); // Retry once
    }

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const json = await response.json();
    const message = json?.choices?.[0]?.message?.content?.trim();

    if (debug) console.log("[API] Response received:", message);
    return message || "No response received.";
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error("Request timed out.");
    }
    if (debug) console.error("[API] Error:", err);
    throw err;
  }
}

function createRequestPayload(prompt, options = {}) {
  const isConversational = options.isConversational || prompt.includes("Previous conversation context");
  
  const systemPrompt = isConversational 
    ? `You are an expert HR/finance SaaS dashboard assistant with deep knowledge of Workday-style applications. You excel at:

• Understanding context from previous conversations
• Providing detailed, actionable explanations
• Connecting related concepts and workflows
• Suggesting relevant follow-up topics
• Using professional but accessible language

When answering follow-up questions:
• Reference previous context when relevant
• Build upon earlier explanations
• Provide practical examples and use cases
• Anticipate what users might want to know next
• Maintain consistency with previous answers

Always be helpful, accurate, and contextually aware.`
    : `You are a helpful assistant in a SaaS dashboard. Provide clear, concise answers to HR or payroll-related user questions.`;

  return {
    model: DEFAULT_MODEL,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: isConversational ? 0.3 : 0.1, // Lower temperature for more consistent follow-up responses
    max_tokens: isConversational ? 800 : 400, // More tokens for conversational responses
    top_p: 0.9,
    frequency_penalty: isConversational ? 0.1 : 0, // Slight frequency penalty for conversational responses
    presence_penalty: isConversational ? 0.1 : 0, // Slight presence penalty for conversational responses
  };
}

function createRequestHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
