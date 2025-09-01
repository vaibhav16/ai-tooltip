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
  List,
  ListItem,
  ListItemText,
  Paper,
  Fade,
  Zoom,
  Fab,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import ClearIcon from "@mui/icons-material/Clear";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import useTooltipExplanation from "../hooks/useTooltipExplaination";
import useAdvancedConversation from "../hooks/useAdvancedConversation";

const EnhancedSmartTooltip = ({ keyword, children }) => {
  const { 
    basicExplanation, 
    fetchExplanation, 
    tooltipOpen, 
    setTooltipOpen,
    detailedContext,
    refreshContext
  } = useTooltipExplanation(keyword);

  const {
    messages,
    isLoading,
    context,
    suggestions,
    askQuestion,
    clearConversation,
    getConversationSummary,
    hasConversationHistory,
    conversationLength
  } = useAdvancedConversation(keyword, detailedContext);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Refs for scrolling
  const dialogContentRef = useRef(null);
  const conversationEndRef = useRef(null);

  // State for scroll position
  const [showScrollButton, setShowScrollButton] = useState(false);


  // Auto-scroll to bottom when new messages are added or a new question is typed
  useEffect(() => {
    if (dialogOpen) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages.length, dialogOpen]);

  // Auto-scroll to bottom when loading state changes
  useEffect(() => {
    if (isLoading && dialogOpen) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [isLoading, dialogOpen]);

  // Handle scroll events to show/hide scroll button
  const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  // Function to scroll to bottom smoothly
  const scrollToBottom = () => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

  // Function to scroll to bottom immediately (for instant scroll)
  const scrollToBottomInstant = () => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ 
        behavior: 'auto',
        block: 'end'
      });
    }
  };

  // Add scroll event listener when dialog opens
  useEffect(() => {
    if (dialogOpen && dialogContentRef.current) {
      const contentElement = dialogContentRef.current;
      contentElement.addEventListener('scroll', handleScroll);
      
      return () => {
        contentElement.removeEventListener('scroll', handleScroll);
      };
    }
  }, [dialogOpen]);

  const handleDialogOpen = () => {
    // Prevent multiple dialogs from opening
    if (dialogOpen) return;
    
    setDialogOpen(true);
    setTooltipOpen(false);
    setShowSuggestions(true);
    setCurrentQuestion("");
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setTooltipOpen(false);
    setShowSuggestions(true);
    setCurrentQuestion("");
  };

  const handleRefreshContext = () => {
    // Clear conversation and refresh context
    clearConversation();
    refreshContext();
    setShowSuggestions(true);
    setCurrentQuestion("");
  };

  const handleAskQuestion = async () => {
    if (!currentQuestion.trim()) return;
    
    await askQuestion(currentQuestion);
    setCurrentQuestion("");
    setShowSuggestions(false);
    // Scroll to bottom after asking question
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey && currentQuestion.trim()) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  // When a suggestion is clicked, fill the input and immediately ask the question
  const handleSuggestionClick = async (suggestion) => {
    setCurrentQuestion(suggestion);
    setShowSuggestions(false);
    // Wait for state to update, then ask
    setTimeout(async () => {
      await askQuestion(suggestion);
      setCurrentQuestion("");
      setShowSuggestions(false);
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }, 0);
  };

  // Function to check if content should show suggestions
  const shouldShowSuggestions = () => {
    return showSuggestions && suggestions.length > 0 && !isLoading;
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
            color: '#23272f',
            bgcolor: '#f8f5f1', // light beige
            border: '2px solid #d6cec2',
            borderRadius: '50%',
            boxShadow: 1,
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s, border 0.15s',
            '&:hover': {
              bgcolor: '#f3ede6',
              border: '2px solid #a89c8e',
            },
          }}
        >
          <HelpOutlineIcon fontSize="small" sx={{ fontWeight: 700, fontSize: 20, color: '#23272f' }} />
        </IconButton>
      </Tooltip>

      <Dialog 
        open={dialogOpen} 
        onClose={handleDialogClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { minHeight: "70vh", borderRadius: 4, boxShadow: 8, background: '#fafdff' }
        }}
        TransitionComponent={Fade}
      >
        <DialogTitle sx={{ pb: 1.5, borderBottom: '1px solid #e3e8ee', background: '#f6f8fa' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 700, letterSpacing: 0.5 }}>
              <HelpOutlineIcon sx={{ mr: 1, fontSize: 24, verticalAlign: 'middle' }} />
              AI Assistant: {keyword}
            </Typography>
            <Box>
              <MuiIconButton 
                size="small" 
                onClick={handleRefreshContext}
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
        
        <DialogContent 
          ref={dialogContentRef} 
          onScroll={handleScroll}
          sx={{ 
            position: 'relative',
            background: '#fafdff',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#e3e8ee',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#b3c6e0',
              borderRadius: '4px',
              '&:hover': {
                background: '#90caf9',
              },
            },
          }}
        >
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
            <Paper elevation={1} sx={{ mb: 3, p: 2, maxHeight: 300, overflowY: "auto", background: '#f6f8fa', borderRadius: 3 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
                Conversation History ({conversationLength} exchanges)
              </Typography>
              <List dense>
                {messages.map((message, index) => (
                  <ListItem key={message.id} sx={{ 
                    flexDirection: 'column', 
                    alignItems: 'flex-start',
                    bgcolor: message.role === 'user' ? '#e3f2fd' : '#f1f8e9',
                    mb: 1,
                    borderRadius: 2,
                    p: 1.2
                  }}>
                    <Chip 
                      label={message.role === 'user' ? 'Question' : 'Answer'} 
                      size="small" 
                      color={message.role === 'user' ? 'primary' : 'success'} 
                      variant="outlined"
                      sx={{ mb: 1, fontWeight: 600 }}
                    />
                    <Box sx={{ width: '100%' }}>
                      {message.role === 'user' ? (
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {message.content}
                        </Typography>
                      ) : (
                        <FormattedAnswer content={message.content} />
                      )}
                    </Box>
                    {message.metadata?.isError && (
                      <Typography variant="caption" color="error">
                        Error occurred
                      </Typography>
                    )}
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* Question Input Section */}
          <Paper elevation={1} sx={{ p: 2, mb: 2, background: '#fff', borderRadius: 3, boxShadow: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
              Ask a follow-up question:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="What would you like to understand?"
              placeholder="Ask a follow-up question about this topic..."
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              sx={{ mb: 2, borderRadius: 2, background: '#f6f8fa' }}
            />
            <Button 
              onClick={handleAskQuestion} 
              variant="contained" 
              disabled={isLoading || !currentQuestion.trim()}
              sx={{ width: '100%',
                 fontWeight: 700, 
                 borderRadius: 2, 
                 fontSize: '1rem',
                  py: 1, boxShadow: 3 } }
            >
              {isLoading ? <><CircularProgress size={18} sx={{ mr: 1 }} /> Asking...</> : 'Ask Question'}
            </Button>
          </Paper>

          {/* Loading State */}
          {isLoading && (
            <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2, justifyContent: 'center' }}>
              <CircularProgress size={22} color="primary" />
              <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                AI is thinking...
              </Typography>
            </Box>
          )}

          {/* Intelligent Suggestions */}
          {shouldShowSuggestions() && (
            <Fade in={showSuggestions}>
              <Paper elevation={1} sx={{ p: 2, mb: 2, background: '#e3f2fd', borderRadius: 3, boxShadow: 1 }}>
                <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                  <LightbulbIcon color="primary" />
                  <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                    Suggested Follow-up Questions:
                  </Typography>
                </Box>
                <List dense>
                  {suggestions.map((suggestion, index) => (
                    <ListItem 
                      key={index} 
                      button 
                      onClick={() => handleSuggestionClick(suggestion)}
                      sx={{ 
                        borderRadius: 2, 
                        mb: 0.5,
                        bgcolor: '#fff',
                        boxShadow: 0,
                        transition: 'background 0.15s',
                        '&:hover': { bgcolor: '#bbdefb' }
                      }}
                    >
                      <ListItemText 
                        primary={suggestion}
                        primaryTypographyProps={{ variant: 'body2', sx: { fontWeight: 500 } }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Fade>
          )}

          {/* Conversation Tips */}
          {!hasConversationHistory && (
            <Alert severity="success" sx={{ mt: 2, borderRadius: 2, background: '#e8f5e9', color: '#388e3c' }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                💡 <strong>Pro Tip:</strong> This AI assistant remembers our conversation and provides contextual answers. 
                Ask follow-up questions to dive deeper into any topic!
              </Typography>
            </Alert>
          )}

          {/* Export Conversation */}
          {hasConversationHistory && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button 
                variant="outlined" 
                size="small"
                sx={{ borderRadius: 2, fontWeight: 600, color: '#1976d2', borderColor: '#1976d2', px: 2, py: 1, '&:hover': { background: '#e3f2fd', borderColor: '#1565c0' } }}
                onClick={() => {
                  const summary = getConversationSummary();
                  navigator.clipboard.writeText(summary);
                  // You could add a toast notification here
                }}
              >
                Copy Conversation Summary
              </Button>
            </Box>
          )}

          {/* Invisible element for scrolling to bottom */}
          <div ref={conversationEndRef} style={{ height: '1px' }} />
        </DialogContent>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <Fade in={showScrollButton}>
            <Fab
              size="small"
              color="primary"
              onClick={scrollToBottom}
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                zIndex: 1000,
                boxShadow: 3,
                color: '#fff',
                '&:hover': {
                  boxShadow: 6,
                  background: 'linear-gradient(90deg, #1565c0 0%, #1976d2 100%)',
                }
              }}
            >
              <KeyboardArrowDownIcon />
            </Fab>
          </Fade>
        )}
      </Dialog>
    </Box>
  );
};

// Enhanced FormattedAnswer component with better parsing
const FormattedAnswer = ({ content }) => {
  // Function to format the AI response with better readability
  const formatContent = (text) => {
    if (!text) return "";
    
    // Split by common separators and format
    const sections = text.split(/(?=\n\n|\n(?=[A-Z])|(?<=\.)\s+(?=[A-Z])|(?<=\.)\s+(?=\n))/);
    
    return sections.map((section, index) => {
      const trimmedSection = section.trim();
      if (!trimmedSection) return null;
      
      // Check if this looks like a numbered list item
      const isNumberedListItem = /^\d+\.\s/.test(trimmedSection);
      
      // Check if this looks like a bullet list item
      const isBulletListItem = /^[•\-\*]\s/.test(trimmedSection);
      
      // Check if this looks like a heading
      const isHeading = /^[A-Z][A-Z\s]+:/.test(trimmedSection) ||
                       /^[A-Z][a-z\s]+:/.test(trimmedSection);
      
      // Check if this looks like a key-value pair
      const isKeyValue = /^[A-Z][a-z\s]+:\s/.test(trimmedSection);
      
      if (isNumberedListItem) {
        // Handle numbered lists properly
        const match = trimmedSection.match(/^(\d+)\.\s+(.+)/);
        if (match) {
          const [, number, content] = match;
          return (
            <Box key={index} sx={{ mb: 1.5, pl: 2, display: 'flex', alignItems: 'flex-start' }}>
              <Typography 
                variant="body2" 
                component="span" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: 'primary.main',
                  minWidth: '24px',
                  mr: 1
                }}
              >
                {number}.
              </Typography>
              <Typography variant="body2" component="div" sx={{ flex: 1 }}>
                {content}
              </Typography>
            </Box>
          );
        }
      }
      
      if (isBulletListItem) {
        return (
          <Box key={index} sx={{ mb: 1, pl: 2, display: 'flex', alignItems: 'flex-start' }}>
            <Typography 
              variant="body2" 
              component="span" 
              sx={{ 
                color: 'primary.main',
                mr: 1,
                fontSize: '1.2em'
              }}
            >
              •
            </Typography>
                         <Typography variant="body2" component="span" sx={{ flex: 1 }}>
               {trimmedSection.replace(/^[•\-\*]\s/, '')}
             </Typography>
          </Box>
        );
      }
      
      if (isHeading) {
        return (
          <Typography 
            key={index} 
            variant="subtitle2" 
            component="div"
            color="primary" 
            sx={{ 
              mt: index > 0 ? 2 : 0, 
              mb: 1, 
              fontWeight: 'bold',
              borderBottom: '1px solid',
              borderColor: 'primary.200',
              pb: 0.5
            }}
          >
            {trimmedSection}
          </Typography>
        );
      }
      
      if (isKeyValue) {
        const [key, ...valueParts] = trimmedSection.split(':');
        const value = valueParts.join(':').trim();
        return (
          <Box key={index} sx={{ mb: 1.5 }}>
            <Typography 
              variant="body2" 
              component="span" 
              sx={{ 
                fontWeight: 'bold',
                color: 'primary.main'
              }}
            >
              {key}:
            </Typography>
            <Typography variant="body2" component="span" sx={{ ml: 1 }}>
              {value}
            </Typography>
          </Box>
        );
      }
      
      // Regular paragraph
      return (
        <Typography 
          key={index} 
          variant="body2" 
          component="div"
          sx={{ 
            mb: 1.5, 
            lineHeight: 1.6,
            textAlign: 'justify'
          }}
        >
          {trimmedSection}
        </Typography>
      );
    }).filter(Boolean);
  };

  return (
    <Box sx={{ 
      '& .MuiTypography-root': { 
        fontFamily: 'inherit',
        color: 'text.primary'
      }
    }}>
      {formatContent(content)}
    </Box>
  );
};

export default EnhancedSmartTooltip;
