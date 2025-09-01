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
  Fade,
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
        TransitionComponent={Fade}
        title={
          <Box maxWidth={320}>
            <Typography variant="body2" sx={{ mb: 1, color: '#23272f', fontWeight: 500 }}>
              {basicExplanation}
            </Typography>
            <Button
              size="small"
              variant="contained"
              onClick={handleDialogOpen}
              sx={{ 
                width: "100%",
                fontWeight: 700,
                borderRadius: 2,
                fontSize: '0.95rem',
                py: 1,
                px: 2,
                boxShadow: 1,
                textTransform: 'none',
                background: 'linear-gradient(90deg, #1976d2 0%, #1565c0 100%)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
                  boxShadow: 3,
                  transform: 'translateY(-1px) scale(1.03)'
                }
              }}
            >
              <HelpOutlineIcon sx={{ mr: 1, fontSize: 18 }} /> Ask Follow-up Questions
            </Button>
          </Box>
        }
      >
        <IconButton
          size="small"
          sx={{
            color: '#1976d2',
            bgcolor: '#fff',
            border: '2px solid #1976d2',
            borderRadius: '50%',
            boxShadow: 1,
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s, border 0.15s',
            '&:hover': {
              bgcolor: '#e3f2fd',
              border: '2px solid #1565c0',
            },
          }}
        >
          <HelpOutlineIcon fontSize="small" sx={{ fontWeight: 700, fontSize: 20 }} />
        </IconButton>
      </Tooltip>

      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { minHeight: "60vh", borderRadius: 4, boxShadow: 8, background: '#fafdff' }
        }}
        TransitionComponent={Fade}
      >
        <DialogTitle sx={{ pb: 1.5, borderBottom: '1px solid #e3e8ee', background: '#f6f8fa' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 700, letterSpacing: 0.5 }}>
              <HelpOutlineIcon sx={{ mr: 1, fontSize: 24, verticalAlign: 'middle' }} />
              Ask about: {keyword}
            </Typography>
            <Box>
              <MuiIconButton 
                size="small" 
                onClick={refreshContext}
                title="Refresh context"
                sx={{ color: '#1976d2', bgcolor: '#e3f2fd', mr: 1, '&:hover': { bgcolor: '#bbdefb' } }}
              >
                <RefreshIcon />
              </MuiIconButton>
              {hasConversationHistory && (
                <MuiIconButton 
                  size="small" 
                  onClick={clearConversation}
                  title="Clear conversation"
                  color="warning"
                  sx={{ color: '#d32f2f', bgcolor: '#ffebee', '&:hover': { bgcolor: '#ffcdd2' } }}
                >
                  <ClearIcon />
                </MuiIconButton>
              )}
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ background: '#fafdff' }}>
          {/* Context Information */}
          {detailedContext && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2, background: '#e3f2fd', color: '#1976d2' }}>
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
              <Typography variant="subtitle2" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
                Previous Questions:
              </Typography>
              <Box sx={{ maxHeight: 200, overflowY: "auto", bgcolor: '#f6f8fa', p: 1, borderRadius: 2 }}>
                {conversationHistory.map((exchange, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Chip 
                      label={`Q: ${exchange.question}`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ mb: 1, fontWeight: 600 }}
                    />
                    <Typography variant="body2" sx={{ pl: 1, fontWeight: 500 }}>
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
            sx={{ mb: 2, borderRadius: 2, background: '#f6f8fa' }}
          />
          <Button 
            onClick={handleAsk} 
            variant="contained" 
            disabled={loading || !question.trim()}
            sx={{ mb: 2, fontWeight: 700, borderRadius: 2, fontSize: '1rem', py: 1, background: 'linear-gradient(90deg, #1976d2 0%, #1565c0 100%)', '&:hover': { background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)', boxShadow: 3 } }}
          >
            {loading ? <><CircularProgress size={18} sx={{ mr: 1 }} /> Asking...</> : 'Ask Question'}
          </Button>

          {/* Loading State */}
          {loading && (
            <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2, justifyContent: 'center' }}>
              <CircularProgress size={22} color="primary" />
              <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                Getting your answer...
              </Typography>
            </Box>
          )}

          {/* Answer Display */}
          {answer && (
            <Box sx={{ mt: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
              <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                Answer:
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: "pre-line", fontWeight: 500 }}>
                {answer}
              </Typography>
            </Box>
          )}

          {/* Conversation Tips */}
          {!hasConversationHistory && (
            <Alert severity="success" sx={{ mt: 2, borderRadius: 2, background: '#e8f5e9', color: '#388e3c' }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
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
