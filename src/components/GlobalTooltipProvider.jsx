import React, { useEffect } from "react";
import { Tooltip, Fade, Box, Typography, CircularProgress, Button, Paper, IconButton, Collapse } from "@mui/material";
import { ExpandLess, ExpandMore, HelpOutline } from "@mui/icons-material";
import useGlobalTooltip from "../hooks/useGlobalTooltip";

const GlobalTooltipProvider = ({ children }) => {
  const { 
    tooltip, 
    handleMouseEnter, 
    handleMouseLeave, 
    clearTooltip, 
    handleGetContext,
    toggleCollapse
  } = useGlobalTooltip();

  // Add global event listeners
  useEffect(() => {
    const handleGlobalMouseEnter = (event) => {
      // Only handle elements that are not inside existing tooltip components or the sticky popup
      if (!isInsideExistingTooltip(event.target) && !isInsideStickyPopup(event.target)) {
        handleMouseEnter(event);
      }
    };

    const handleGlobalMouseLeave = (event) => {
      handleMouseLeave(event);
    };

    // Add event listeners to the document
    document.addEventListener('mouseenter', handleGlobalMouseEnter, true);
    document.addEventListener('mouseleave', handleGlobalMouseLeave, true);

    return () => {
      document.removeEventListener('mouseenter', handleGlobalMouseEnter, true);
      document.removeEventListener('mouseleave', handleGlobalMouseLeave, true);
    };
  }, [handleMouseEnter, handleMouseLeave]);

  return (
    <>
      {children}
      
      {/* Sticky Global Tooltip - Top Right */}
      {tooltip.open && (
        <Paper
          data-sticky-popup="true"
          elevation={8}
          sx={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            width: tooltip.collapsed ? 60 : 320,
            minHeight: tooltip.collapsed ? 60 : 120,
            maxWidth: 'calc(100vw - 40px)', // Ensure it doesn't exceed viewport width
            p: tooltip.collapsed ? 1 : 2,
            bgcolor: '#f8f5f1',
            border: '2px solid #d6cec2',
            borderRadius: 3,
            boxShadow: 6,
            pointerEvents: 'auto',
            transition: 'all 0.3s ease-in-out',
            overflow: 'hidden', // Prevent content from overflowing
            wordWrap: 'break-word' // Ensure text wraps properly
          }}
        >
          {/* Header with toggle button */}
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            sx={{ mb: tooltip.collapsed ? 0 : 1 }}
          >
            {!tooltip.collapsed && (
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#1976d2', 
                  fontWeight: 600,
                  fontSize: '1rem'
                }}
              >
                Context Assistant
              </Typography>
            )}
            <IconButton
              data-no-tooltip="true"
              onClick={toggleCollapse}
              size="small"
              sx={{
                color: '#1976d2',
                bgcolor: tooltip.collapsed ? '#e3f2fd' : 'transparent',
                '&:hover': {
                  bgcolor: '#e3f2fd',
                }
              }}
            >
              {tooltip.collapsed ? <ExpandMore /> : <ExpandLess />}
            </IconButton>
          </Box>

          {/* Collapsible content */}
          <Collapse in={!tooltip.collapsed} timeout="auto" unmountOnExit>
            {!tooltip.lastHoveredText && !tooltip.content && (
              <Box textAlign="center" py={2}>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Hover over any text or button to get context
                </Typography>
              </Box>
            )}

            {tooltip.lastHoveredText && !tooltip.content && !tooltip.isLoading && (
              <Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mb: 2, 
                    color: '#23272f', 
                    fontWeight: 500,
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'auto'
                  }}
                >
                  Get context for: <strong>"{tooltip.lastHoveredText}"</strong>
                </Typography>
                <Box display="flex" gap={1}>
                  <Button
                    data-no-tooltip="true"
                    size="small"
                    variant="contained"
                    onClick={handleGetContext}
                    sx={{
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: 'none',
                      px: 3,
                      py: 1,
                      background: 'linear-gradient(90deg, #1976d2 0%, #1565c0 100%)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #1565c0 0%, #0d47a1 100%)',
                      }
                    }}
                  >
                    Get Context
                  </Button>
                  <Button
                    data-no-tooltip="true"
                    size="small"
                    variant="outlined"
                    onClick={clearTooltip}
                    sx={{
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: 'none',
                      px: 3,
                      py: 1,
                      borderColor: '#d6cec2',
                      color: '#666',
                      '&:hover': {
                        borderColor: '#a89c8e',
                        backgroundColor: '#f3ede6'
                      }
                    }}
                  >
                    Clear
                  </Button>
                </Box>
              </Box>
            )}

            {tooltip.isLoading && (
              <Box display="flex" alignItems="center" gap={2} py={2}>
                <CircularProgress size={20} color="primary" />
                <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                  Loading context...
                </Typography>
              </Box>
            )}

            {tooltip.content && !tooltip.isLoading && (
              <Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mb: 2, 
                    color: '#23272f', 
                    fontWeight: 500,
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'auto'
                  }}
                >
                  Context for: <strong>"{tooltip.lastHoveredText}"</strong>
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#23272f', 
                    fontWeight: 500,
                    lineHeight: 1.6,
                    mb: 2,
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'auto',
                    '& .MuiTypography-root': {
                      fontFamily: 'inherit'
                    }
                  }}
                >
                  {tooltip.content}
                </Typography>
                <Box display="flex" gap={1} justifyContent="flex-end">
                  <Button
                    data-no-tooltip="true"
                    size="small"
                    variant="outlined"
                    onClick={clearTooltip}
                    sx={{
                      fontWeight: 600,
                      textTransform: 'none',
                      borderRadius: 2,
                      px: 2,
                      py: 0.5,
                      borderColor: '#d6cec2',
                      color: '#666',
                      '&:hover': {
                        borderColor: '#a89c8e',
                        backgroundColor: '#f3ede6'
                      }
                    }}
                  >
                    Clear
                  </Button>
                </Box>
              </Box>
            )}
          </Collapse>
        </Paper>
      )}
    </>
  );
};

// Helper function to check if element is inside an existing tooltip component
function isInsideExistingTooltip(element) {
  let current = element;
  while (current && current !== document.body) {
    // Check for existing tooltip components
    if (current.classList.contains('MuiTooltip-tooltip') ||
        current.classList.contains('MuiTooltip-popper') ||
        current.dataset.tooltip ||
        current.dataset.noTooltip ||
        current.closest('[data-enhanced-tooltip]') ||
        current.closest('.enhanced-smart-tooltip')) {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

// Helper function to check if element is inside the sticky popup
function isInsideStickyPopup(element) {
  let current = element;
  while (current && current !== document.body) {
    // Check if element is inside the sticky popup
    if (current.getAttribute('data-sticky-popup') === 'true' ||
        current.closest('[data-sticky-popup="true"]')) {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

export default GlobalTooltipProvider;
