import React from "react";
import SmartTooltip from "./SmartTooltip";

/**
 * HOC to wrap any component with a SmartTooltip.
 * Usage: withSmartTooltip(Component, { keyword, description })
 *
 * - keyword: string to fetch context for (defaults to element's text/aria-label)
 * - description: fallback or extra context for the tooltip
 */
const withSmartTooltip = (WrappedComponent, options = {}) => {
  return React.forwardRef((props, ref) => {
    // Try to infer a keyword for context
    let keyword = options.keyword;
    if (!keyword) {
      if (props["aria-label"]) keyword = props["aria-label"];
      else if (props.children && typeof props.children === "string") keyword = props.children;
      else if (props.label) keyword = props.label;
      else keyword = "Element";
    }
    return (
      <SmartTooltip keyword={keyword}>
        <WrappedComponent ref={ref} {...props} />
      </SmartTooltip>
    );
  });
};

export default withSmartTooltip;
