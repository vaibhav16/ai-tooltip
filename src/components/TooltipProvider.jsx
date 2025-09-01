import React from "react";
import withSmartTooltip from "./withSmartTooltip";

// List of interactable element types to wrap
const INTERACTABLES = [
  "button",
  "a",
  "input",
  "select",
  "textarea",
  "svg",
  "IconButton",
  "Fab",
  // Add more as needed
];

function isInteractable(element) {
  if (!React.isValidElement(element)) return false;
  const type = element.type;
  if (typeof type === "string" && INTERACTABLES.includes(type)) return true;
  if (typeof type === "function" && INTERACTABLES.includes(type.displayName || type.name)) return true;
  return false;
}

function wrapWithTooltip(element) {
  if (!React.isValidElement(element)) return element;
  if (isInteractable(element)) {
    const Wrapped = withSmartTooltip(element.type);
    return <Wrapped {...element.props}>{element.props.children}</Wrapped>;
  }
  // Recursively wrap children
  if (element.props && element.props.children) {
    const children = React.Children.map(element.props.children, wrapWithTooltip);
    return React.cloneElement(element, undefined, children);
  }
  return element;
}

export function TooltipProvider({ children }) {
  return <>{wrapWithTooltip(children)}</>;
}
