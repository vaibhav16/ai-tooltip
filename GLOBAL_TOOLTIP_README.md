# Global Tooltip System

This project now includes a global tooltip system that provides contextual information when hovering over any text element or button within the application.

## Features

- **Universal Coverage**: Works on any text element or button throughout the application
- **Smart Detection**: Automatically detects meaningful text content and skips tooltip elements
- **API Throttling**: Only makes API calls after hovering for 1.5 seconds to prevent excessive requests
- **Caching**: Caches responses to avoid repeated API calls for the same content
- **Conflict Prevention**: Does not interfere with existing `EnhancedSmartTooltip` components
- **Performance Optimized**: Uses throttling and caching to minimize API calls

## How It Works

### 1. Global Event Listeners
The `GlobalTooltipProvider` component adds global mouse event listeners to detect hover events across the entire application.

### 2. Text Extraction
When hovering over an element, the system:
- Extracts meaningful text content
- Skips elements that are too short, too long, or contain only numbers/special characters
- Ignores elements that are part of existing tooltip systems

### 3. API Throttling
- Waits 1.5 seconds before making an API call
- Cancels the API call if the user moves away before the delay
- Uses a throttling mechanism to prevent rapid successive calls

### 4. Caching
- Caches API responses based on the text content
- Avoids repeated API calls for the same text
- Improves performance and reduces costs

### 5. Conflict Prevention
The system automatically detects and skips:
- Elements with `data-enhanced-tooltip` attribute
- Elements with `data-no-tooltip` attribute
- Elements inside existing MUI Tooltip components
- Elements with tooltip-related CSS classes

## Components

### `useGlobalTooltip` Hook
- Manages tooltip state and API calls
- Handles text extraction and caching
- Implements throttling logic

### `GlobalTooltipProvider` Component
- Wraps the entire application
- Provides global event listeners
- Renders the tooltip UI

### `GlobalTooltipDemo` Component
- Demonstrates the global tooltip functionality
- Shows various types of content that trigger tooltips

## Usage

The global tooltip system is automatically active once you wrap your app with `GlobalTooltipProvider`:

```jsx
import GlobalTooltipProvider from "./components/GlobalTooltipProvider";

function App() {
  return (
    <GlobalTooltipProvider>
      {/* Your app content */}
    </GlobalTooltipProvider>
  );
}
```

## Configuration

### Excluding Elements
To exclude specific elements from the global tooltip system, add the `data-no-tooltip` attribute:

```jsx
<span data-no-tooltip="true">This text won't show a tooltip</span>
```

### Existing Tooltip Components
The system automatically detects and skips existing tooltip components. For custom tooltip components, add the `data-enhanced-tooltip` attribute:

```jsx
<div data-enhanced-tooltip="true">
  {/* Your custom tooltip content */}
</div>
```

## API Integration

The system uses the existing `getTooltipResponse` function from `openai.js` to generate contextual information. The prompt is optimized for:
- Brief, scannable explanations
- Practical business context
- Clear formatting with bullet points
- Under 60 words per response

## Performance Considerations

- **Throttling**: 1.5-second delay prevents excessive API calls
- **Caching**: Responses are cached to avoid repeated calls
- **Smart Detection**: Only processes meaningful text content
- **Event Delegation**: Uses efficient event listeners on the document level

## Troubleshooting

### Tooltip Not Appearing
- Check if the element has `data-no-tooltip` attribute
- Ensure the text is meaningful (not just numbers or special characters)
- Verify the element is not inside an existing tooltip component

### API Calls Not Working
- Check the `openai.js` configuration
- Verify network connectivity
- Check browser console for error messages

### Conflicts with Existing Tooltips
- Ensure existing tooltip components have proper data attributes
- Check that `data-enhanced-tooltip` is set on custom tooltip containers
- Verify `data-no-tooltip` is set on elements that should be excluded
