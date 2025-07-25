import { useState } from "react";
import { getTooltipResponseAsk } from "../openai";
import { enforceTimeout} from "../utils/enforceTimeout";

export default function useAskDialog(keyword) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question) return;

    setLoading(true);
    setAnswer("");

    const prompt = `You are a helpful SaaS dashboard assistant in a Workday-style HR/finance application.\nExplain clearly:\n• The meaning of \"${keyword}\"\n• Context on how it's used\n• Why it matters to users\nAs if a user just asked: \"${question}\"\nKeep it concise but informative.`;

    try {
      const result = await enforceTimeout(
        getTooltipResponseAsk(prompt),
        10000
      );
      setAnswer(typeof result === "string" ? result : "Sorry, no valid response.");
    } catch (err) {
      console.error("[handleAsk] Error:", err);
      setAnswer(
        err.message === "Request timed out"
          ? "Request timed out. Please try again."
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    dialogOpen,
    setDialogOpen,
    question,
    setQuestion,
    answer,
    loading,
    handleAsk,
  };
}
