import React, { useEffect, useState, useRef } from "react";
import {
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Box,
} from "@mui/material";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { getTooltipResponse, getTooltipResponseAsk } from '../openai';
import { throttle } from '../utils/throttle';

const SmartTooltip = ({ keyword, children }) => {
  const [basicExplanation, setBasicExplanation] = useState("Loading...");
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const throttledFetchRef = useRef(null);

  const fetchBasicExplanation = async () => {
    try {
      const prompt = `Explain briefly what '${keyword}' means in a Workday-style HR or payroll dashboard.`;
      const explanation = await getTooltipResponse(prompt);
      setBasicExplanation(explanation);
    } catch (err) {
      setBasicExplanation("Could not load tooltip.");
      console.error(err);
    }
  };

  useEffect(() => {
    throttledFetchRef.current = throttle(fetchBasicExplanation, 3000);
  }, []);

  useEffect(() => {
    throttledFetchRef.current?.();
  }, [keyword]);

const handleAsk = async () => {
  if (!question) return;

  setLoading(true);
  setAnswer("");

  const prompt = `You are a helpful SaaS dashboard assistant in a Workday‑style HR/finance application.
Explain clearly:
• The meaning of "${keyword}"
• Context on how it's used
• Why it matters to users
As if a user just asked: "${question}".
Keep it concise but informative.`;


  try {
    const response = await enforceTimeout(
   getTooltipResponseAsk(prompt, true, { timeout: 10000 }),
      10000
    );

    setAnswer(typeof response === "string" ? response : "Sorry, no valid response.");
  } catch (err) {
    console.error("[handleAsk] Error:", err);
    setAnswer(err.message === "Request timed out" ? "Request timed out. Please try again." : "Something went wrong.");
  } finally {
    setLoading(false);
  }
};

// Reuse this timeout utility
function enforceTimeout(promise, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Request timed out"));
    }, timeoutMs);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}











  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
      {children && <span>{children}</span>}
      <Tooltip
        open={tooltipOpen}
        onClose={() => setTooltipOpen(false)}
        onOpen={() => {
          setTooltipOpen(true);
          throttledFetchRef.current?.();
        }}
        title={
          <div style={{ maxWidth: 250 }}>
            <Typography variant="body2">{basicExplanation}</Typography>
            <Button size="small" onClick={() => { setDialogOpen(true); setTooltipOpen(false); }}>
              Explain More
            </Button>
          </div>
        }
      >
        <IconButton size="small">
          <HelpOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ask about: {keyword}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="What would you like to understand?"
            variant="outlined"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
            sx={{ my: 2 }}
          />
          <Button onClick={handleAsk} variant="contained" disabled={loading || !question}>
            Ask
          </Button>

          {loading && <CircularProgress sx={{ mt: 2 }} />}
          {answer && (
            <Typography variant="body1" sx={{ mt: 3, whiteSpace: 'pre-line' }}>
              {answer}
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SmartTooltip;
