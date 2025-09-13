# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EffiKit is a Chrome extension that provides web page highlighting capabilities with cloud synchronization. It's built as a Manifest V3 extension using React, TypeScript, and Supabase for backend storage. The extension allows users to highlight text on web pages with different colors, add notes, and sync their highlights across devices.

## Commands

### Development
- `pnpm dev` - Run extension in development mode with hot reload
- `pnpm start` - Run extension in production preview mode
- `pnpm build` - Build extension for production deployment

### Code Quality
- `pnpm lint` - Run ESLint to check code style and catch errors
- `pnpm lint:fix` - Automatically fix ESLint issues where possible

## Architecture

### Core Components

**Extension Structure**
- `src/background.ts` - Service worker handling extension lifecycle and browser events
- `src/content-script.ts` - Injected into web pages to handle highlighting functionality
- `src/sidebar/` - React-based sidebar interface for managing highlights

**Highlighter System**
- `src/highlighter/` - Core highlighting functionality using Custom Elements + React
- `src/highlighter/dom.ts` - DOM manipulation and highlight rendering
- `src/highlighter/ui/` - React components wrapped in Custom Elements for style isolation

**Storage Architecture**
- `src/storage/StorageManager.ts` - Multi-backend storage with fallback strategy
- `src/storage/adapters/` - Storage adapters for Supabase (primary) and Chrome storage (backup)
- Implements adapter pattern with automatic fallback: Supabase → Chrome storage

**Key Design Patterns**
- Custom Elements + React hybrid for style isolation in content scripts
- Adapter pattern for storage with graceful degradation
- Event-driven communication between components
- Shadow DOM for complete CSS isolation from host pages

### Technology Stack

- **Framework**: React 18 with TypeScript
- **Extension**: Chrome Manifest V3 with Extension.js build system
- **Storage**: Supabase (cloud) + Chrome Storage API (local backup)
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React hooks with custom storage hooks
- **Build**: Extension.js (webpack-based) with hot reload support

### File Structure Conventions

- `@/` alias points to `src/` directory
- React components use `.tsx` extension
- Utility functions in `src/utils/`
- Type definitions in `src/types/`
- Storage adapters follow interface pattern in `src/storage/adapters/`

## Development Guidelines

### Highlighter Development
The highlighter system is currently being refactored to use Custom Elements + React architecture. See `src/highlighter/docs/README.md` for detailed architectural documentation. When working on highlighter features:

- Use the `ReactCustomElement` base class for new UI components
- Implement style isolation through Shadow DOM
- Follow event-driven communication patterns
- Test across different websites for style conflicts

### Storage Operations
- Always use `StorageManager.getInstance()` for storage operations
- Storage automatically falls back from Supabase to Chrome storage
- Handle async operations with proper error handling
- URL normalization is handled automatically for highlights

### Chrome Extension APIs
- Follow Manifest V3 patterns (Service Worker for background)
- Use chrome.runtime.sendMessage for content script ↔ background communication
- Implement proper permission handling for cross-origin requests
- Handle extension lifecycle events properly

### Code Style
- Follow the existing TypeScript patterns
- Use functional components with hooks
- Implement proper error boundaries
- Follow the commit conventions in COMMIT_CONVENTION.md
- Use ESLint configuration for code style consistency

## Testing

When making changes, ensure to test:
- Highlight creation and deletion on various websites
- Storage synchronization between Supabase and local storage
- Extension installation and update scenarios
- Cross-browser compatibility (Chrome focus)
- Style isolation (highlights should not affect page styles)

## Supabase Integration

The project uses Supabase for cloud storage with configuration in `src/config/supabase.ts`. Database schema and types are defined in `src/types/supabase.types.ts`. Always handle Supabase connection failures gracefully with fallback to Chrome storage.