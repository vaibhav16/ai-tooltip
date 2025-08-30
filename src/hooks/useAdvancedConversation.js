import { useState, useCallback, useRef, useEffect } from "react";
import { getTooltipResponseAsk } from "../openai";
import { enforceTimeout } from "../utils/enforceTimeout";

export default function useAdvancedConversation(keyword, initialContext = "") {
  const [conversationState, setConversationState] = useState({
    messages: [],
    currentQuestion: "",
    isLoading: false,
    context: initialContext,
    suggestions: [],
    conversationSummary: ""
  });

  const conversationRef = useRef(conversationState);
  const contextWindowRef = useRef([]);

  // Update ref when state changes
  useEffect(() => {
    conversationRef.current = conversationState;
  }, [conversationState]);

  // Generate intelligent follow-up suggestions
  const generateSuggestions = useCallback(async (currentContext) => {
    try {
      const suggestionPrompt = `Based on the conversation about "${keyword}" so far, suggest 3-4 intelligent follow-up questions that would help the user better understand this topic. 

Current context: ${currentContext}

Generate questions that:
• Build upon what's already been discussed
• Explore related concepts or edge cases
• Address practical implementation concerns
• Help users apply the knowledge

Format as a simple list, each question on a new line.`;

      const suggestions = await getTooltipResponseAsk(suggestionPrompt, false, { 
        isConversational: true,
        timeout: 8000 
      });

      const questionList = suggestions
        .split('\n')
        .filter(q => q.trim() && q.includes('?'))
        .slice(0, 4);

      setConversationState(prev => ({
        ...prev,
        suggestions: questionList
      }));

    } catch (error) {
      console.error("Failed to generate suggestions:", error);
    }
  }, [keyword]);

  // Add message to conversation with context management
  const addMessage = useCallback((role, content, metadata = {}) => {
    const newMessage = {
      id: Date.now(),
      role,
      content,
      timestamp: new Date().toISOString(),
      metadata
    };

    setConversationState(prev => {
      const updatedMessages = [...prev.messages, newMessage];
      
      // Keep only last 10 messages for context window
      const contextWindow = updatedMessages.slice(-10);
      contextWindowRef.current = contextWindow;

      return {
        ...prev,
        messages: updatedMessages,
        context: buildContextString(contextWindow, keyword)
      };
    });
  }, [keyword]);

  // Build context string from conversation history
  const buildContextString = useCallback((messages, topic) => {
    if (messages.length === 0) return `Topic: ${topic}`;
    
    const relevantMessages = messages
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .slice(-6); // Last 6 exchanges for context

    let context = `Topic: ${topic}\n\nRecent conversation:\n`;
    
    relevantMessages.forEach((msg, index) => {
      const prefix = msg.role === 'user' ? 'Q' : 'A';
      context += `${prefix}${index + 1}: ${msg.content}\n`;
    });

    return context;
  }, []);

  // Ask a question with enhanced context and formatting
  const askQuestion = useCallback(async (question) => {
    if (!question.trim()) return;

    const currentContext = conversationRef.current.context;
    
    // Add user question to conversation
    addMessage('user', question);

    setConversationState(prev => ({ ...prev, isLoading: true }));

    try {
      // Build enhanced prompt with conversation context and formatting instructions
      const enhancedPrompt = `You are an expert HR/finance SaaS dashboard assistant helping with "${keyword}".

${currentContext}

Current question: "${question}"

Please provide a comprehensive answer that:
• Directly addresses the specific question
• References relevant context from our conversation when applicable
• Uses clear formatting with bullet points (•) for key points
• Organizes information with clear headings and sections
• Provides practical examples when helpful
• Suggests related topics for further exploration
• Maintains consistency with previous explanations

IMPORTANT FORMATTING REQUIREMENTS:
- Use bullet points (•) for lists and key information
- Separate different topics with clear headings (e.g., "Key Points:", "Examples:", "Related Topics:")
- Use paragraphs to group related information
- Keep sentences clear and concise
- Use numbered lists (1., 2., 3.) for step-by-step processes
- Add spacing between sections for better readability

Be conversational but professional, and build upon our discussion. Format your response for easy reading.`;

      const response = await enforceTimeout(
        getTooltipResponseAsk(enhancedPrompt, false, { 
          isConversational: true,
          timeout: 15000 
        }),
        15000
      );

      // Add AI response to conversation
      addMessage('assistant', response, { 
        questionId: conversationRef.current.messages.length - 1 
      });

      // Generate new suggestions based on updated context
      setTimeout(() => {
        generateSuggestions(buildContextString(contextWindowRef.current, keyword));
      }, 500);

    } catch (error) {
      console.error("Error asking question:", error);
      const errorMessage = error.message === "Request timed out" 
        ? "Request timed out. Please try again."
        : "Something went wrong. Please try again.";
      
      addMessage('assistant', errorMessage, { isError: true });
    } finally {
      setConversationState(prev => ({ ...prev, isLoading: false }));
    }
  }, [keyword, addMessage, generateSuggestions, buildContextString]);

  // Clear conversation and reset state
  const clearConversation = useCallback(() => {
    setConversationState({
      messages: [],
      currentQuestion: "",
      isLoading: false,
      context: initialContext,
      suggestions: [],
      conversationSummary: ""
    });
    contextWindowRef.current = [];
  }, [initialContext]);

  // Get conversation summary for export or review
  const getConversationSummary = useCallback(() => {
    if (conversationState.messages.length === 0) return "";

    const summary = conversationState.messages
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => `${msg.role === 'user' ? 'Q' : 'A'}: ${msg.content}`)
      .join('\n\n');

    return `Conversation about "${keyword}":\n\n${summary}`;
  }, [conversationState.messages, keyword]);

  // Initialize conversation with context
  useEffect(() => {
    if (initialContext) {
      setConversationState(prev => ({
        ...prev,
        context: initialContext
      }));
    }
  }, [initialContext]);

  return {
    // State
    messages: conversationState.messages,
    currentQuestion: conversationState.currentQuestion,
    isLoading: conversationState.isLoading,
    context: conversationState.context,
    suggestions: conversationState.suggestions,
    
    // Actions
    askQuestion,
    clearConversation,
    getConversationSummary,
    addMessage,
    
    // Computed values
    hasConversationHistory: conversationState.messages.length > 0,
    conversationLength: conversationState.messages.length
  };
}
