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

## Files

After building, you'll find these files in `dist-embed/`:
- `widget.iife.js` - Standalone JavaScript bundle (~646 KB, ~195 KB gzipped)
- `widget.css` - CSS styles (~14 KB, ~3.5 KB gzipped)
- `example.html` - Example HTML file demonstrating usage
