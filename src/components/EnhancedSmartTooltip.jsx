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

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > 0 && dialogOpen) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages, dialogOpen]);

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

  const handleSuggestionClick = (suggestion) => {
    setCurrentQuestion(suggestion);
    setShowSuggestions(false);
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
        title={
          <Box maxWidth={300}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {basicExplanation}
            </Typography>
            <Button
              size="small"
              variant="contained"
              onClick={handleDialogOpen}
              sx={{ 
                width: "100%",
                backgroundColor: '#1976d2',
                color: 'white',
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '0.875rem',
                py: 0.75,
                px: 1.5,
                '&:hover': {
                  backgroundColor: '#1565c0',
                  transform: 'translateY(-1px)',
                  boxShadow: 2
                }
              }}
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
          onClose={handleDialogClose} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: { minHeight: "70vh" }
          }}
        >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">AI Assistant: {keyword}</Typography>
            <Box>
              <MuiIconButton 
                size="small" 
                onClick={handleRefreshContext}
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
        
        <DialogContent 
          ref={dialogContentRef} 
          onScroll={handleScroll}
          sx={{ 
            position: 'relative',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#c1c1c1',
              borderRadius: '4px',
              '&:hover': {
                background: '#a8a8a8',
              },
            },
          }}
        >
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
            <Paper elevation={1} sx={{ mb: 3, p: 2, maxHeight: 300, overflowY: "auto" }}>
              <Typography variant="subtitle2" gutterBottom color="primary">
                Conversation History ({conversationLength} exchanges)
              </Typography>
              <List dense>
                {messages.map((message, index) => (
                  <ListItem key={message.id} sx={{ 
                    flexDirection: 'column', 
                    alignItems: 'flex-start',
                    bgcolor: message.role === 'user' ? 'primary.50' : 'grey.50',
                    mb: 1,
                    borderRadius: 1,
                    p: 1
                  }}>
                    <Chip 
                      label={message.role === 'user' ? 'Question' : 'Answer'} 
                      size="small" 
                      color={message.role === 'user' ? 'primary' : 'secondary'} 
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                    <Box sx={{ width: '100%' }}>
                      {message.role === 'user' ? (
                        <Typography variant="body2">
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
          <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
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
              sx={{ mb: 2 }}
            />
            
            <Button 
              onClick={handleAskQuestion} 
              variant="contained" 
              disabled={isLoading || !currentQuestion.trim()}
              sx={{ width: '100%' }}
            >
              {isLoading ? "Asking..." : "Ask Question"}
            </Button>
          </Paper>

          {/* Loading State */}
          {isLoading && (
            <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                AI is thinking...
              </Typography>
            </Box>
          )}

          {/* Intelligent Suggestions */}
          {shouldShowSuggestions() && (
            <Fade in={showSuggestions}>
              <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                  <LightbulbIcon color="primary" />
                  <Typography variant="subtitle2" color="primary">
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
                        borderRadius: 1, 
                        mb: 0.5,
                        '&:hover': { bgcolor: 'primary.50' }
                      }}
                    >
                      <ListItemText 
                        primary={suggestion}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Fade>
          )}

          {/* Conversation Tips */}
          {!hasConversationHistory && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
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
                '&:hover': {
                  boxShadow: 6,
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
