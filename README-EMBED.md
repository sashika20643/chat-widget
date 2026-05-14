# Chat Widget - Embeddable Version

## Installation

### 1. Build the Embeddable Widget

Build the standalone embeddable widget:

```bash
npm run build:embed
```

This will create a standalone bundle in the `dist-embed` folder with:
- `widget.iife.js` - The JavaScript bundle
- `widget.css` - The CSS styles

### 2. Embed in Your Website

Add these lines to your HTML, just before the closing `</body>` tag:

```html
<link rel="stylesheet" href="path/to/widget.css">
<script src="path/to/widget.iife.js"></script>
```

That's it! The chatbot launcher button will automatically appear in the bottom-right corner.

### 3. Open Chat Programmatically (Optional)

Use the global API to open the chat with product context:

```html
<button onclick="window.Chatbot.open({ id: 1, name: 'Product A', price: 99 })">
  Ask AI
</button>
```

## Global API

The widget exposes a global `window.Chatbot` object with the following methods:

### `Chatbot.open(config?)`

Opens the chat widget. Optionally accepts a configuration object:

```javascript
window.Chatbot.open({
  id: 1,
  name: 'Product A',
  price: 99
})
```

### `Chatbot.close()`

Closes the chat widget:

```javascript
window.Chatbot.close()
```

### `Chatbot.toggle()`

Toggles the chat widget open/closed:

```javascript
window.Chatbot.toggle()
```

## Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
</head>
<body>
    <h1>Welcome to My Website</h1>
    
    <button onclick="window.Chatbot.open({ id: 1, name: 'Product A', price: 99 })">
        Ask AI About Product
    </button>
    
    <!-- Embed the chat widget -->
    <link rel="stylesheet" href="path/to/widget.css">
    <script src="path/to/widget.iife.js"></script>
</body>
</html>
```

## Configuration

The widget automatically initializes when the script loads. The button appears in the bottom-right corner and opens the chat window when clicked.

## Desktop side-by-side layout (minimize main panel)

On viewports **768px and up** (md breakpoint), the chat opens as a **full-height right sidebar** instead of a floating overlay. To make your main content shrink so it sits side-by-side with the chat, use the widget’s body attribute and optional events.

### Body attribute: `data-chat-open`

When the chat is open, the widget sets `data-chat-open="true"` on `<body>`. When the chat is closed, the attribute is removed. Use this in your site’s CSS to reserve space for the sidebar.

**Sidebar width:** The chat panel is `28rem` (448px) wide on desktop. Use the same value in your layout so content and chat align.

**Example – shrink main content when chat is open:**

```css
/* At the same breakpoint the widget uses for sidebar (768px) */
@media (min-width: 768px) {
  body[data-chat-open] main {
    width: calc(100% - 28rem);
    max-width: calc(100% - 28rem);
  }
}
```

If your layout uses a flex or grid wrapper, you can instead add `margin-right: 28rem` on the content container when `data-chat-open` is set, or reduce its flex basis.

### Custom events (optional)

The widget dispatches these events on `window` when the chat opens or closes, so you can react in JavaScript (e.g. animate, resize):

- **`chat-widget-open`** – fired when the chat is opened
- **`chat-widget-close`** – fired when the chat is closed

```javascript
window.addEventListener('chat-widget-open', () => {
  console.log('Chat opened')
})

window.addEventListener('chat-widget-close', () => {
  console.log('Chat closed')
})
```

## Files

After building, you'll find these files in `dist-embed/`:
- `widget.iife.js` - Standalone JavaScript bundle (~646 KB, ~195 KB gzipped)
- `widget.css` - CSS styles (~14 KB, ~3.5 KB gzipped)
- `example.html` - Example HTML file demonstrating usage
