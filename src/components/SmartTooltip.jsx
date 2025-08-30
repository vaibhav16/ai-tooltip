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
  Chip,
  Divider,
  Alert,
  IconButton as MuiIconButton,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import ClearIcon from "@mui/icons-material/Clear";
import useTooltipExplanation from "../hooks/useTooltipExplaination";
import useAskDialog from "../hooks/useAskDialog";

const SmartTooltip = ({ keyword, children }) => {
  const { 
    basicExplanation, 
    fetchExplanation, 
    tooltipOpen, 
    setTooltipOpen,
    detailedContext,
    refreshContext
  } = useTooltipExplanation(keyword);

  const {
    dialogOpen,
    question,
    answer,
    loading,
    setDialogOpen,
    setQuestion,
    handleAsk,
    conversationHistory,
    clearConversation,
    hasConversationHistory
  } = useAskDialog(keyword);

  const handleDialogOpen = () => {
    setDialogOpen(true);
    setTooltipOpen(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey && question.trim()) {
      e.preventDefault();
      handleAsk();
    }
  };

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
          <Box maxWidth={300}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {basicExplanation}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={handleDialogOpen}
              sx={{ width: "100%" }}
            >
              Ask Follow-up Questions
            </Button>
          </Box>
        }
      >
        <IconButton size="small">
          <HelpOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { minHeight: "60vh" }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Ask about: {keyword}</Typography>
            <Box>
              <MuiIconButton 
                size="small" 
                onClick={refreshContext}
                title="Refresh context"
              >
                <RefreshIcon />
              </MuiIconButton>
              {hasConversationHistory && (
                <MuiIconButton 
                  size="small" 
                  onClick={clearConversation}
                  title="Clear conversation"
                  color="warning"
                >
                  <ClearIcon />
                </MuiIconButton>
              )}
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {/* Context Information */}
          {detailedContext && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                Context for {keyword}:
              </Typography>
              <Typography variant="body2">
                {detailedContext}
              </Typography>
            </Alert>
          )}

          {/* Conversation History */}
          {hasConversationHistory && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Previous Questions:
              </Typography>
              <Box sx={{ maxHeight: 200, overflowY: "auto", bgcolor: "grey.50", p: 1, borderRadius: 1 }}>
                {conversationHistory.map((exchange, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Chip 
                      label={`Q: ${exchange.question}`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" sx={{ pl: 1 }}>
                      {exchange.answer}
                    </Typography>
                    {index < conversationHistory.length - 1 && <Divider sx={{ my: 1 }} />}
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Question Input */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="What would you like to understand?"
            placeholder="Ask a follow-up question about this topic..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            sx={{ mb: 2 }}
          />
          
          <Button 
            onClick={handleAsk} 
            variant="contained" 
            disabled={loading || !question.trim()}
            sx={{ mb: 2 }}
          >
            {loading ? "Asking..." : "Ask Question"}
          </Button>

          {/* Loading State */}
          {loading && (
            <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Getting your answer...
              </Typography>
            </Box>
          )}

          {/* Answer Display */}
          {answer && (
            <Box sx={{ mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                Answer:
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                {answer}
              </Typography>
            </Box>
          )}

          {/* Conversation Tips */}
          {!hasConversationHistory && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                💡 <strong>Tip:</strong> Ask follow-up questions to dive deeper into this topic. 
                The AI will remember our conversation and provide more contextual answers.
              </Typography>
            </Alert>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SmartTooltip;
