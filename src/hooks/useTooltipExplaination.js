import { useState, useEffect, useRef, useCallback } from "react";
import { throttle } from "../utils/throttle";
import { getTooltipResponse } from "../openai";

export default function useTooltipExplanation(keyword) {
  const [basicExplanation, setBasicExplanation] = useState("Loading...");
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [detailedContext, setDetailedContext] = useState("");
  const throttledFetchRef = useRef();

  const fetchExplanation = useCallback(async () => {
    try {
      // Enhanced prompt for better initial explanation with formatting
      const prompt = `You are an expert HR/finance SaaS dashboard assistant. Provide a very brief, scannable explanation of "${keyword}".

Provide only the essential information in this format:
• What it is (one sentence)
• Why it matters (one benefit)
• Related concept (one term)

IMPORTANT: 
- Keep response under 50 words
- Use simple, direct language
- No repetition of the keyword/title
- Focus on practical value
- Make it easy to read at a glance

Example format:
• Tracks monthly new employee additions
• Helps identify hiring patterns and trends
• Related: Time-to-Hire metrics`;

      const response = await getTooltipResponse(prompt);
      setBasicExplanation(response);
      
      // Fetch additional context for follow-up questions
      fetchDetailedContext();
    } catch (err) {
      setBasicExplanation("Could not load tooltip.");
      console.error(err);
    }
  }, [keyword]);

  const fetchDetailedContext = useCallback(async () => {
    try {
      const contextPrompt = `For "${keyword}" in a Workday-style HR/finance SaaS application, provide very brief additional context.

Include only:
• 2 common use cases
• 2 related terms

IMPORTANT: 
- Keep response under 60 words
- Use bullet points (•)
- Focus on practical applications
- Avoid technical jargon`;

      const contextResponse = await getTooltipResponse(contextPrompt);
      setDetailedContext(contextResponse);
    } catch (err) {
      console.error("Failed to fetch detailed context:", err);
      setDetailedContext("");
    }
  }, [keyword]);

  useEffect(() => {
    throttledFetchRef.current = throttle(fetchExplanation, 3000);
  }, [fetchExplanation]);

  useEffect(() => {
    throttledFetchRef.current?.();
  }, [keyword]);

  return {
    basicExplanation,
    tooltipOpen,
    setTooltipOpen,
    detailedContext,
    fetchExplanation: () => throttledFetchRef.current?.(),
    refreshContext: fetchDetailedContext
  };
}
