const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

let lastCallTimestamp = 0;
let queue = Promise.resolve();

export const getTooltipResponse = (prompt, debug = false, options = {}) => {
  if (debug) console.log("[getTooltipResponse] Prompt received:", prompt);

  return (queue = queue.then(() =>
    handleRateLimitedRequest(prompt, debug, options)
  ));
};

export const getTooltipResponseAsk = async (prompt, debug = false, options = {}) => {
  const controller = new AbortController();
  const timeoutMs = options.timeout || 10000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    if (debug) console.log("[getTooltipResponseAsk] Prompt:", prompt);

    const requestBody = {
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant in a SaaS dashboard. Provide clear, concise answers to HR or payroll-related user questions.",
        },
        { role: "user", content: prompt },
      ],
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 429) {
      console.warn("[getTooltipResponseAsk] Rate limited. Retrying in 5 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return getTooltipResponseAsk(prompt, debug, options);
    }

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data?.choices?.[0]?.message?.content?.trim();

    if (debug) console.log("[getTooltipResponseAsk] Result:", result);
    return result || "No response received.";
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error("Request timed out.");
    }
    if (debug) console.error("[getTooltipResponseAsk] Error:", err);
    throw err;
  }
};


async function handleRateLimitedRequest(prompt, debug = false, options = {}) {
  const now = Date.now();
  const waitTime = Math.max(3000 - (now - lastCallTimestamp), 0);

  if (debug) console.log(`[handleRateLimitedRequest] Waiting ${waitTime}ms to respect rate limit`);

  await delay(waitTime);
  lastCallTimestamp = Date.now();

  return sendGroqRequestWithTimeout(prompt, debug, options.timeout || 5000);
}

async function sendGroqRequestWithTimeout(prompt, debug = false, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await sendGroqRequest(prompt, debug, controller.signal);
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Request timed out.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function sendGroqRequest(prompt, debug = false, signal) {
  const requestBody = {
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      { role: "system", content: "You are a helpful assistant in a SaaS dashboard." },
      { role: "user", content: prompt },
    ],
  };

  try {
    if (debug) console.log("[sendGroqRequest] Sending request...");

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
      signal,
    });

    if (debug) console.log("[sendGroqRequest] Response status:", response.status);

    if (response.status === 429) {
      console.warn("[sendGroqRequest] Rate limited. Retrying in 5 seconds...");
      await delay(5000);
      return sendGroqRequest(prompt, debug, signal); // Retry once
    }

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data?.choices?.[0]?.message?.content?.trim();

    if (debug) console.log("[sendGroqRequest] Final result:", result);
    return result || "No response received.";
  } catch (err) {
    if (debug) console.error("[sendGroqRequest] Error:", err);
    throw err;
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
