import { useState, useEffect, useRef } from "react";
import { throttle}  from "../utils/throttle";
import { getTooltipResponse } from "../openai";

export default function useTooltipExplanation(keyword) {
  const [basicExplanation, setBasicExplanation] = useState("Loading...");
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const throttledFetchRef = useRef();

  const fetchExplanation = async () => {
    try {
      const prompt = `Explain briefly what '${keyword}' means in a Workday-style HR or payroll dashboard.`;
      const response = await getTooltipResponse(prompt);
      setBasicExplanation(response);
    } catch (err) {
      setBasicExplanation("Could not load tooltip.");
      console.error(err);
    }
  };

  useEffect(() => {
    throttledFetchRef.current = throttle(fetchExplanation, 3000);
  }, [keyword]);

  useEffect(() => {
    throttledFetchRef.current?.();
  }, [keyword]);

  return {
    basicExplanation,
    tooltipOpen,
    setTooltipOpen,
    fetchExplanation: () => throttledFetchRef.current?.(),
  };
}
