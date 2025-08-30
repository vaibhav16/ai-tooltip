import { useState, useCallback } from "react";
import { getTooltipResponseAsk } from "../openai";
import { enforceTimeout } from "../utils/enforceTimeout";

export default function useAskDialog(keyword) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [contextSummary, setContextSummary] = useState("");

  // Enhanced prompt that includes conversation context
  const buildContextualPrompt = useCallback((currentQuestion) => {
    const baseContext = `You are an expert SaaS dashboard assistant specializing in Workday-style HR/finance applications. You're helping a user understand "${keyword}" in this context.`;
    
    let prompt = `${baseContext}\n\n`;
    
    // Add conversation history for context
    if (conversationHistory.length > 0) {
      prompt += `Previous conversation context:\n`;
      conversationHistory.forEach((exchange, index) => {
        prompt += `Q${index + 1}: ${exchange.question}\nA${index + 1}: ${exchange.answer}\n\n`;
      });
    }
    
    // Add the current question with enhanced context
    prompt += `Current question: "${currentQuestion}"\n\n`;
    prompt += `Please provide a clear, concise answer that:\n`;
    prompt += `• Directly addresses the specific question\n`;
    prompt += `• References previous context if relevant\n`;
    prompt += `• Provides practical examples when helpful\n`;
    prompt += `• Suggests related topics the user might want to explore\n`;
    prompt += `• Uses clear, professional language suitable for HR/finance professionals\n\n`;
    
    prompt += `IMPORTANT FORMATTING REQUIREMENTS:\n`;
    prompt += `- Use bullet points (•) for lists and key information\n`;
    prompt += `- Separate different topics with clear headings (e.g., "Key Points:", "Examples:", "Related Topics:")\n`;
    prompt += `- Use paragraphs to group related information\n`;
    prompt += `- Keep sentences clear and concise\n`;
    prompt += `- Use numbered lists (1., 2., 3.) for step-by-step processes\n`;
    prompt += `- Add spacing between sections for better readability\n`;
    prompt += `- Keep your response focused and avoid unnecessary details\n\n`;
    
    if (conversationHistory.length === 0) {
      prompt += `This is the first question about "${keyword}", so provide foundational context.`;
    } else {
      prompt += `This is a follow-up question. Build upon our previous discussion.`;
    }
    
    prompt += `\n\nFormat your response for easy reading with proper structure and bullet points. Keep it concise and actionable.`;
    
    return prompt;
  }, [keyword, conversationHistory]);

  const handleAsk = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");

    const contextualPrompt = buildContextualPrompt(question);

    try {
      const result = await enforceTimeout(
        getTooltipResponseAsk(contextualPrompt),
        15000 // Increased timeout for more complex responses
      );
      
      const finalAnswer = typeof result === "string" ? result : "Sorry, no valid response.";
      setAnswer(finalAnswer);
      
      // Update conversation history
      const newExchange = {
        question: question.trim(),
        answer: finalAnswer,
        timestamp: new Date().toISOString()
      };
      
      setConversationHistory(prev => [...prev, newExchange]);
      
      // Clear the current question for next interaction
      setQuestion("");
      
    } catch (err) {
      console.error("[handleAsk] Error:", err);
      setAnswer(
        err.message === "Request timed out"
          ? "Request timed out. Please try again."
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to clear conversation history
  const clearConversation = useCallback(() => {
    setConversationHistory([]);
    setAnswer("");
    setQuestion("");
  }, []);

  // Function to get conversation summary for better context
  const getConversationSummary = useCallback(() => {
    if (conversationHistory.length === 0) return "";
    
    const recentExchanges = conversationHistory.slice(-3); // Last 3 exchanges
    return recentExchanges.map(exchange => 
      `Q: ${exchange.question}\nA: ${exchange.answer}`
    ).join('\n\n');
  }, [conversationHistory]);

  return {
    dialogOpen,
    setDialogOpen,
    question,
    setQuestion,
    answer,
    loading,
    handleAsk,
    conversationHistory,
    clearConversation,
    getConversationSummary,
    hasConversationHistory: conversationHistory.length > 0
  };
}
