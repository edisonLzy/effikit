# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EffiKit is a Chrome extension (Manifest V3) that provides a comprehensive developer toolkit including network monitoring, response editing, performance analysis, and web page highlighting features. The project uses Extension.js as the build framework and targets both Chromium and Firefox browsers.

## Development Commands

### Core Commands
- `pnpm dev` - Development mode with hot reload
- `pnpm start` - Production preview mode
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Run ESLint with auto-fix

### Package Manager
- **Required**: pnpm 10.12.4+ (enforced by packageManager field)
- **Never use**: npm or yarn

## Architecture

### Core Structure
- **Extension Framework**: Extension.js for cross-browser compatibility
- **Frontend**: React 18.3.1 with TypeScript 5.3.3
- **Styling**: Tailwind CSS 4.1.10 with shadcn/ui components
- **Build**: Manifest V3 with Service Worker background script

### Key Directories
- `features/` - Core extension features (highlighter, sidebar)
- `features/sidebar/` - Main UI with side panel interface
- `features/sidebar/tools/` - Individual tool implementations
- `components/ui/` - Reusable shadcn/ui components
- `hooks/` - Global React hooks
- `lib/` - Utility functions and constants

### Chrome Extension Architecture
- **Background Script**: `background.ts` (Service Worker)
- **Content Script**: `features/highlighter/content-script.ts`
- **Side Panel**: `features/sidebar/index.html`
- **Permissions**: Minimal required permissions following least privilege principle

## Technology Stack

### Frontend
- React 18.3.1 with TypeScript
- React Router DOM 7.6.2 for routing
- Tailwind CSS 4.1.10 for styling
- shadcn/ui (New York style) for UI components
- Radix UI for headless components
- Lucide React for icons

### Development Tools
- ESLint with TypeScript integration
- Commitlint for conventional commits
- Husky for git hooks
- Lint-staged for pre-commit linting

### Chrome Extension APIs
- Side Panel API for main interface
- Storage API for data persistence
- Runtime messaging for component communication
- Content Scripts for web page interaction
- WebRequest API for network monitoring

## Code Standards

### TypeScript
- Strict mode enabled
- Use proper type definitions for all Chrome APIs
- ESNext module system
- Preserve JSX mode

### React Patterns
- Functional components only
- Custom hooks for business logic
- React Router for navigation
- Strict mode in development

### Styling
- Tailwind CSS classes only (no inline styles or external CSS)
- Use shadcn/ui components when available
- CSS variables for theme system
- Mobile-first responsive design

### File Organization
- `*.tsx` for React components
- `*.ts` for utilities and types
- Collocate related files (component + hook + types)
- Use absolute imports with path aliases

## Testing and Quality

### Linting
- ESLint with TypeScript, React, and import plugins
- Stylistic plugin for code formatting
- Unused imports detection
- Pre-commit hooks enforce linting

### Build Process
- Extension.js handles bundling and optimization
- TypeScript compilation with strict checking
- Tailwind CSS processing through PostCSS
- Chrome extension manifest validation

## Development Workflow

### Adding New Features
1. Create feature directory under `features/`
2. Implement background script logic if needed
3. Add content script for web page interaction
4. Create UI components in `sidebar/tools/`
5. Add proper TypeScript types
6. Follow Chrome extension security best practices

### Component Development
1. Use shadcn/ui components as base
2. Create custom hooks for complex logic
3. Implement proper error boundaries
4. Add loading states and error handling
5. Ensure accessibility compliance

### Chrome Extension Specifics
- Use Service Worker patterns for background script
- Implement proper message passing between contexts
- Handle extension lifecycle events
- Follow Content Security Policy requirements
- Use chrome.storage for data persistence