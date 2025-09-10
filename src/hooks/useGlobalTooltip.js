import { useState, useRef, useCallback, useEffect } from "react";
import { throttle } from "../utils/throttle";
import { getTooltipResponse } from "../openai";

export default function useGlobalTooltip() {
  const [tooltip, setTooltip] = useState({
    open: true, // Always open - persistent popup
    content: "",
    isLoading: false,
    showConfirmation: false,
    hoveredText: "",
    hasContent: false,
    lastHoveredText: "", // Preserve the last hovered text
    collapsed: false // Collapse/expand state
  });

  const [cache, setCache] = useState(new Map());
  const hoverTimeoutRef = useRef(null);
  const lastHoveredElementRef = useRef(null);

  // Throttled API call function
  const throttledApiCall = useCallback(
    throttle(async (text, element) => {
      if (!text || text.length < 2) return;

      // Check cache first
      const cacheKey = text.toLowerCase().trim();
      if (cache.has(cacheKey)) {
        setTooltip(prev => ({
          ...prev,
          content: cache.get(cacheKey),
          isLoading: false
        }));
        return;
      }

      try {
        setTooltip(prev => ({ ...prev, isLoading: true }));

        const prompt = `You are an expert assistant for a SaaS application. Provide a brief, helpful explanation for the text "${text}".

Context: This text appears in a business application interface. The user is hovering over it and wants quick context.

Provide:
• What this refers to (1-2 sentences)
• Why it's important or useful (1 sentence)
• Any related concepts (1-2 terms)

IMPORTANT:
- Keep response under 60 words
- Use simple, clear language
- Focus on practical value
- Make it scannable with bullet points
- No repetition of the original text

Format as:
• [What it is]
• [Why it matters]
• Related: [concept1, concept2]`;

        const response = await getTooltipResponse(prompt);
        
        // Cache the response
        setCache(prev => new Map(prev).set(cacheKey, response));
        
        setTooltip(prev => ({
          ...prev,
          content: response,
          isLoading: false
        }));
      } catch (error) {
        console.error("Global tooltip API error:", error);
        setTooltip(prev => ({
          ...prev,
          content: "Unable to load context",
          isLoading: false
        }));
      }
    }, 1500), // 1.5 second throttle
    [cache]
  );

  const handleMouseEnter = useCallback((event) => {
    const element = event.target;
    const text = extractTextFromElement(element);
    
    // Skip if no meaningful text or if it's an existing tooltip element
    if (!text || text.length < 2 || isTooltipElement(element)) {
      return;
    }

    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Store the element reference
    lastHoveredElementRef.current = element;

    // Set timeout for showing sticky popup
    hoverTimeoutRef.current = setTimeout(() => {
      setTooltip(prev => ({
        ...prev,
        hoveredText: text,
        lastHoveredText: text, // Preserve the last hovered text
        showConfirmation: true,
        content: "",
        isLoading: false,
        hasContent: true
      }));
    }, 2000); // 2 second delay
  }, []);

  const handleMouseLeave = useCallback((event) => {
    // Clear timeout if mouse leaves before delay
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    // For sticky popup, we don't clear content on mouse leave
    // The popup stays open and preserves the last hovered text
    if (lastHoveredElementRef.current === event.target) {
      setTooltip(prev => ({
        ...prev,
        hasContent: false,
        hoveredText: "",
        showConfirmation: false
        // Keep lastHoveredText and content intact
      }));
    }
  }, []);


  const clearTooltip = useCallback(() => {
    setTooltip(prev => ({
      ...prev,
      isLoading: false,
      showConfirmation: false,
      content: "",
      hasContent: false,
      hoveredText: "",
      lastHoveredText: ""
    }));
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  const toggleCollapse = useCallback(() => {
    setTooltip(prev => ({
      ...prev,
      collapsed: !prev.collapsed
    }));
  }, []);

  const handleGetContext = useCallback(async () => {
    const textToSearch = tooltip.lastHoveredText || tooltip.hoveredText;
    if (!textToSearch) return;

    setTooltip(prev => ({
      ...prev,
      showConfirmation: false,
      isLoading: true
    }));

    // Check cache first
    const cacheKey = textToSearch.toLowerCase().trim();
    if (cache.has(cacheKey)) {
      setTooltip(prev => ({
        ...prev,
        content: cache.get(cacheKey),
        isLoading: false
      }));
      return;
    }

    try {
      const prompt = `You are an expert assistant for a SaaS application. Provide a brief, helpful explanation for the text "${textToSearch}".

Context: This text appears in a business application interface. The user is hovering over it and wants quick context.

Provide:
• What this refers to (1-2 sentences)
• Why it's important or useful (1 sentence)
• Any related concepts (1-2 terms)

IMPORTANT:
- Keep response under 60 words
- Use simple, clear language
- Focus on practical value
- Make it scannable with bullet points
- No repetition of the original text

Format as:
• [What it is]
• [Why it matters]
• Related: [concept1, concept2]`;

      const response = await getTooltipResponse(prompt);
      
      // Cache the response
      setCache(prev => new Map(prev).set(cacheKey, response));
      
      setTooltip(prev => ({
        ...prev,
        content: response,
        isLoading: false
      }));
    } catch (error) {
      console.error("Global tooltip API error:", error);
      setTooltip(prev => ({
        ...prev,
        content: "Unable to load context",
        isLoading: false
      }));
    }
  }, [tooltip.lastHoveredText, tooltip.hoveredText, cache]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return {
    tooltip,
    handleMouseEnter,
    handleMouseLeave,
    clearTooltip,
    handleGetContext,
    toggleCollapse
  };
}


// Helper function to extract meaningful text from an element
function extractTextFromElement(element) {
  // Skip if element has data attributes indicating it's a tooltip or interactive element
  if (element.dataset.tooltip || element.dataset.noTooltip) {
    return null;
  }

  // Get text content, prioritizing specific attributes
  let text = element.getAttribute('aria-label') || 
            element.getAttribute('title') || 
            element.textContent;

  if (!text) return null;

  // Clean up the text
  text = text.trim().replace(/\s+/g, ' ');
  
  // Skip very short or very long text
  if (text.length < 2 || text.length > 100) {
    return null;
  }

  // Skip if it's just numbers or special characters
  if (!/[a-zA-Z]/.test(text)) {
    return null;
  }

  return text;
}

// Helper function to check if element is a tooltip-related element
function isTooltipElement(element) {
  // Check if element or its parents have tooltip-related classes or data attributes
  let current = element;
  while (current && current !== document.body) {
    if (current.classList.contains('MuiTooltip-tooltip') ||
        current.classList.contains('MuiTooltip-popper') ||
        current.dataset.tooltip ||
        current.dataset.noTooltip) {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}
