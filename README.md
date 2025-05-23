# Windsurf Chat App

A modern chat application built with Quasar Framework and Vue 3, inspired by Google's Gemini AI interface. This application provides a clean, responsive chat experience with support for markdown rendering and code syntax highlighting.

![Windsurf Chat App Screenshot](![image](https://github.com/user-attachments/assets/fa425f7a-86dc-4726-8f6a-3c1b19724e55)
)

## Features

- **Modern UI**: Clean, responsive interface inspired by Google's Gemini AI
- **Chat Functionality**:
  - Send and receive messages with simulated assistant responses
  - Auto-scrolling chat history
  - Input field auto-focus after assistant responses
  - "New Chat" feature to start fresh conversations
- **Rich Content**:
  - Markdown rendering for formatted text
  - Code syntax highlighting with highlight.js
  - Support for multiple programming languages in code blocks
- **UI Enhancements**:
  - Discrete scrollbars that only appear during scrolling
  - Chat messages aligned with input box width
  - Hover effects for interactive elements
  - Responsive layout for all device sizes
- **State Management**: Persistent chat sessions using Pinia store

## Prerequisites

- Node.js (v14.x or later)
- npm or yarn package manager

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/windsurf-chat-app.git
   cd windsurf-chat-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

## Development

Start the app in development mode with hot-code reloading:

```bash
# Using npm
npm run dev

# Using yarn
yarn dev

# Using Quasar CLI
quasar dev
```

The application will be available at `http://localhost:9000` by default.

## Building for Production

Build the application for production:

```bash
# Using npm
npm run build

# Using yarn
yarn build

# Using Quasar CLI
quasar build
```

## Code Quality

### Lint the files
```bash
# Using npm
npm run lint

# Using yarn
yarn lint
```

### Format the files
```bash
# Using npm
npm run format

# Using yarn
yarn format
```

## Project Structure

- `src/components/` - Vue components including ChatInterface, ChatItem, etc.
- `src/layouts/` - Layout components including MainLayout
- `src/pages/` - Page components
- `src/stores/` - Pinia stores for state management
- `src/css/` - Global CSS styles

## Technologies Used

- [Vue 3](https://v3.vuejs.org/) - Progressive JavaScript framework
- [Quasar Framework](https://quasar.dev/) - Vue-based framework for building responsive applications
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- [Pinia](https://pinia.vuejs.org/) - State management
- [highlight.js](https://highlightjs.org/) - Syntax highlighting for code blocks
- [marked](https://marked.js.org/) - Markdown parser and compiler

## License

MIT
### Customize the configuration
See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
