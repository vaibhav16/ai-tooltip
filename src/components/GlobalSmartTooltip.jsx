import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Paper, CircularProgress, Typography, Fade, Box } from "@mui/material";
import { getTooltipResponse } from "../openai";

function getElementContext(el) {
  if (!el) return "Element";
  if (el.getAttribute("data-tooltip-context")) return el.getAttribute("data-tooltip-context");
  if (el.getAttribute("aria-label")) return el.getAttribute("aria-label");
  if (el.alt) return el.alt;
  if (el.title) return el.title;
  if (el.innerText && el.innerText.trim().length > 0) return el.innerText.trim().slice(0, 80);
  if (el.tagName) return el.tagName;
  return "Element";
}

const GlobalSmartTooltip = () => {
  const [show, setShow] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0 });
  const [context, setContext] = useState("");
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);
  const tooltipRef = useRef();
  const timeoutRef = useRef();
  const fetchController = useRef();
  const targetElRef = useRef(null);

  // Helper to extract some parent/section context
  function getParentContext(el) {
    if (!el) return "";
    let parent = el.closest('[data-section-label], section, [role="region"], [role="group"]');
    if (parent && parent !== el) {
      if (parent.getAttribute('data-section-label')) return parent.getAttribute('data-section-label');
      if (parent.getAttribute('aria-label')) return parent.getAttribute('aria-label');
      if (parent.title) return parent.title;
      if (parent.innerText && parent.innerText.trim().length > 0) return parent.innerText.trim().slice(0, 80);
    }
    return "";
  }

  useEffect(() => {
    function handleMouseOver(e) {
      if (tooltipRef.current && tooltipRef.current.contains(e.target)) return;
      if (!(e.target instanceof HTMLElement)) return;
      if (["BODY", "HTML"].includes(e.target.tagName)) return;
      if (e.target.closest("[data-global-smart-tooltip]") || e.target.closest(".MuiTooltip-tooltip")) return;
      const label = getElementContext(e.target);
      if (!label || label.length < 2) return;
      setContext(label);
      setAnchor({ x: e.clientX, y: e.clientY });
      targetElRef.current = e.target;
      timeoutRef.current = setTimeout(() => setShow(true), 350);
    }
    function handleMouseMove(e) {
      if (show) setAnchor({ x: e.clientX, y: e.clientY });
    }
    function handleMouseOut(e) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setShow(false);
      setAiText("");
      setContext("");
      setLoading(false);
      targetElRef.current = null;
      if (fetchController.current) fetchController.current.abort();
    }
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseout", handleMouseOut);
    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [show]);

  useEffect(() => {
    if (show && context) {
      setLoading(true);
      setAiText("");
      fetchController.current = new AbortController();
      // Try to get more context from parent/section
      let parentContext = "";
      if (targetElRef.current) parentContext = getParentContext(targetElRef.current);
      // Build a context-aware prompt
      const prompt = `You are an expert HR/finance SaaS dashboard assistant. Explain the following UI element in the context of a Workday-style application.\n\nElement: "${context}"${parentContext ? `\nSection/Context: "${parentContext}"` : ""}\n\nProvide only the essential information in this format:\n• What it is (one sentence)\n• Why it matters (one benefit)\n• Related concept (one term)\n\nIMPORTANT:\n- Keep response under 50 words\n- Use simple, direct language\n- No repetition of the keyword/title\n- Focus on practical value\n- Make it easy to read at a glance`;
      getTooltipResponse(prompt, false, { signal: fetchController.current.signal })
        .then((result) => {
          setAiText(result);
        })
        .catch(() => setAiText("Could not load context."))
        .finally(() => setLoading(false));
    }
  }, [show, context]);

  if (!show || !context) return null;
  return ReactDOM.createPortal(
    <Fade in={show}>
      <Paper
        ref={tooltipRef}
        data-global-smart-tooltip
        elevation={6}
        sx={{
          position: "fixed",
          left: anchor.x + 16,
          top: anchor.y + 16,
          zIndex: 20000,
          minWidth: 220,
          maxWidth: 340,
          pointerEvents: "none",
          p: 2,
          borderRadius: 2,
          bgcolor: "#fff",
          color: "#23272f",
          boxShadow: 6,
          border: "1px solid #e3e8ee",
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 600, color: '#888', mb: 0.5 }}>
          {context}
        </Typography>
        {loading ? (
          <Box display="flex" alignItems="center" gap={1}>
            <CircularProgress size={16} />
            <Typography variant="body2">Loading context…</Typography>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>
            {aiText}
          </Typography>
        )}
      </Paper>
    </Fade>,
    document.body
  );
};

export default GlobalSmartTooltip;
