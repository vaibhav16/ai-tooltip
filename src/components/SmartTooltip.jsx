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
import useTooltipExplanation from "../hooks/useTooltipExplaination";
import useAskDialog from "../hooks/useAskDialog";

const SmartTooltip = ({ keyword, children }) => {

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
