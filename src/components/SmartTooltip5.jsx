import React, { useState, useRef, useEffect } from "react";
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
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { getTooltipResponse, getTooltipResponseAsk } from "../openai";
import { throttle } from "../utils/throttle";
import useTooltipExplanation from "../hooks/useTooltipExplaination";
import useAskDialog from "../hooks/useAskDialog";




// // === Hook: Tooltip Explanation ===
// function useTooltipExplanation(keyword) {
//   const [basicExplanation, setBasicExplanation] = useState("Loading...");
//   const [tooltipOpen, setTooltipOpen] = useState(false);
//   const throttledFetchRef = useRef();

//   const fetchExplanation = async () => {
//     try {
//       const prompt = `Explain briefly what '${keyword}' means in a Workday-style HR or payroll dashboard.`;
//       const response = await getTooltipResponse(prompt);
//       setBasicExplanation(response);
//     } catch (err) {
//       setBasicExplanation("Could not load tooltip.");
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     throttledFetchRef.current = throttle(fetchExplanation, 3000);
//   }, [keyword]);

//   useEffect(() => {
//     throttledFetchRef.current?.();
//   }, [keyword]);

//   return {
//     basicExplanation,
//     tooltipOpen,
//     setTooltipOpen,
//     fetchExplanation: () => throttledFetchRef.current?.(),
//   };
// }

// // === Hook: Ask Dialog ===
// function useAskDialog(keyword) {
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [question, setQuestion] = useState("");
//   const [answer, setAnswer] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleAsk = async () => {
//     if (!question) return;

//     setLoading(true);
//     setAnswer("");

//     const prompt = `You are a helpful SaaS dashboard assistant in a Workday-style HR/finance application.\nExplain clearly:\n• The meaning of \"${keyword}\"\n• Context on how it's used\n• Why it matters to users\nAs if a user just asked: \"${question}\"\nKeep it concise but informative.`;

//     try {
//       const result = await enforceTimeout(
//         getTooltipResponseAsk(prompt),
//         10000
//       );
//       setAnswer(typeof result === "string" ? result : "Sorry, no valid response.");
//     } catch (err) {
//       console.error("[handleAsk] Error:", err);
//       setAnswer(
//         err.message === "Request timed out" ?
//         "Request timed out. Please try again." :
//         "Something went wrong."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return {
//     dialogOpen,
//     setDialogOpen,
//     question,
//     setQuestion,
//     answer,
//     loading,
//     handleAsk,
//   };
// }

// === Main Component ===
const SmartTooltip = ({ keyword, children }) => {
//   const { basicExplanation, fetchExplanation, tooltipOpen, setTooltipOpen } =
//     useTooltipExplanation(keyword);

//   const {
//     dialogOpen,
//     question,
//     answer,
//     loading,
//     setDialogOpen,
//     setQuestion,
//     handleAsk,
//   } = useAskDialog(keyword);

   const { basicExplanation, fetchExplanation, tooltipOpen, setTooltipOpen } =
    useTooltipExplanation(keyword);

  const {
    dialogOpen,
    question,
    answer,
    loading,
    setDialogOpen,
    setQuestion,
    handleAsk,
  } = useAskDialog(keyword);

  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
      {children && <span>{children}</span>}

      <Tooltip
        open={tooltipOpen}
        onClose={() => setTooltipOpen(false)}
        onOpen={() => {
          setTooltipOpen(true);
          fetchExplanation();
        }}
        title={
          <Box maxWidth={250}>
            <Typography variant="body2">{basicExplanation}</Typography>
            <Button
              size="small"
              onClick={() => {
                setDialogOpen(true);
                setTooltipOpen(false);
              }}
            >
              Explain More
            </Button>
          </Box>
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
            <Typography variant="body1" sx={{ mt: 3, whiteSpace: "pre-line" }}>
              {answer}
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SmartTooltip;
