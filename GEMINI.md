# EffiKit Frontend Development Rules

This document summarizes the frontend development rules for the EffiKit Chrome extension project, derived from the `.cursor/rules/frontend/` directory. These rules ensure consistency, maintainability, and adherence to best practices across the codebase.

---

## 1. Chrome Extension Development Guide (`chrome_extension_guide.mdc`)

This guide outlines best practices for developing Chrome extensions:

*   **Code Style and Structure**: Write clear, modular TypeScript, follow functional programming, use descriptive names, structure files logically (popup, background, content scripts, utils), implement error handling, and document with JSDoc.
*   **Architecture and Best Practices**: Strictly follow Manifest V3, divide responsibilities, configure least privilege permissions, use modern build tools (webpack/vite), and implement proper version control.
*   **Chrome API Usage**: Use `chrome.*` APIs correctly (storage, tabs, runtime), handle asynchronous operations with Promises, use Service Workers for background scripts (MV3), implement `chrome.alarms` for scheduled tasks, and use `chrome.action` for browser actions.
*   **Security and Privacy**: Implement Content Security Policy (CSP), handle user data securely, prevent XSS and injection attacks, use secure messaging, handle cross-origin requests safely, implement secure data encryption, and follow `web_accessible_resources` best practices.
*   **Performance and Optimization**: Minimize resource usage, optimize background script performance, implement caching, handle asynchronous operations efficiently, and monitor CPU/memory usage.
*   **UI and User Experience**: Follow Apple Design guidelines, implement responsive popups, provide clear user feedback, support keyboard navigation, ensure proper loading states, and add appropriate animations.
*   **Internationalization**: Use `chrome.i18n` API for translations, follow `_locales` structure, support RTL languages, and handle regional formats.
*   **Accessibility**: Implement ARIA labels, ensure sufficient color contrast, support screen readers, and add keyboard shortcuts.
*   **Testing and Debugging**: Use Chrome DevTools effectively, write unit and integration tests, test cross-browser compatibility, monitor performance, and handle error scenarios.
*   **Publishing and Maintenance**: Prepare store listings, write clear privacy policies, implement update mechanisms, handle user feedback, and maintain documentation.
*   **Official Documentation**: Refer to Chrome Extension documentation, stay updated with Manifest V3 changes, follow Chrome Web Store guidelines, and monitor Chrome platform updates.

---

## 2. Code Style Guide (`code_style_guide.mdc`)

This guide establishes consistent code style standards, focusing on module import/export practices:

*   **Module Export Specification**:
    *   **Mandatory Named Export**: All components, functions, and types must use named exports.
    *   **Prohibited Default Export**: Avoid default exports to prevent naming inconsistencies and refactoring difficulties.
    *   **Unified Export Method**: Maintain consistency in export methods across the codebase.
    *   **Improved Refactorability**: Named exports support better IDE refactoring and static analysis.
*   **Export Format Standard**:
    *   **Component Export**: React components must use named exports.
    *   **Utility Function Export**: All utility functions use named exports.
    *   **Type Definition Export**: TypeScript types and interfaces use named exports.
    *   **Constant Export**: Configuration constants and enums use named exports.
*   **Import Format Standard**:
    *   **Structured Import**: Use destructuring to import specific named exports.
    *   **Clear Dependencies**: Import statements clearly indicate the specific module content used.
    *   **Avoid Wildcards**: Do not use `import *` for imports.
    *   **Separate Type Imports**: Use `import type` for importing only type definitions.

---

## 3. Project Structure Guide (`project_structure_guide.mdc`)

This guide defines a clear and consistent directory structure for the Chrome extension project:

*   **Core Directory Responsibilities**:
    *   `lib/`: General utility library for reusable functions, types, and core logic.
    *   `sidebar/`: Main user interface and business logic for the extension's sidebar.
    *   `sidebar/components/`: Components specific to the sidebar's business logic.
    *   `sidebar/hooks/`: React Hooks specific to sidebar state management and business logic.
    *   `hooks/`: Global React Hooks reusable across multiple components, unrelated to the sidebar.
    *   `components/`: Global reusable UI components, not dependent on specific business scenarios.
    *   `components/ui/`: Basic UI components based on `shadcn/ui` (atomic-level, highly reusable).
*   **Static Resource Directories**:
    *   `public/`: Public static files (e.g., logo, icons).
    *   `images/`: Extension-specific icons and images.
*   **Configuration and Metadata Directories**:
    *   `.cursor/`: Cursor IDE configuration (MCP config, project rules).
    *   `.cursor/rules/`: Project development specifications and best practices.
    *   `.cursor/rules/frontend/`: Frontend code specifications and component development rules.
    *   `.cursor/rules/taskmaster/`: TaskMaster related rules.
    *   `.cursor/rules/workflows/`: Development workflow rules.
    *   `.taskmaster/`: TaskMaster configuration and data storage.
    *   `.taskmaster/docs/`: Project requirements and design documents.
    *   `.taskmaster/tasks/`: Task definitions and tracking files.
    *   `.taskmaster/reports/`: Task complexity analysis and progress reports.
    *   `.taskmaster/templates/`: Project templates and example files.

---

## 4. React Coding Guide (`react_coding_guide.mdc`)

This guide establishes React component development standards based on the "Hook First" principle:

*   **Strict Separation of View and Logic**:
    *   **View Layer**: Components are only responsible for UI rendering and event binding.
    *   **Logic Layer**: All business logic, state management, and side effects must be encapsulated in custom Hooks.
    *   **Data Layer**: Data fetching, caching, and synchronization are managed through dedicated Hooks.
*   **Hook First Principle**:
    *   Prioritize using custom Hooks to encapsulate all business logic.
    *   Prohibit writing business logic directly within components.
    *   Each Hook should have a single responsibility and be reusable.
    *   All custom Hooks must be named with the `use` prefix.
*   **UI Component and Icon Selection Standard**:
    *   **Prioritize `shadcn/ui`**: All basic UI components must use the `shadcn/ui` library.
    *   **Use `Lucide Icons`**: All icons must be imported from the `Lucide React` icon library.
    *   **Component Customization over Recreation**: Extend `shadcn/ui` components for special UI needs, rather than rebuilding from scratch.
    *   **Maintain Visual Consistency**: Strictly follow the project's design system.
*   **Component Structure Standard**:
    *   **Component and Hook Format**: Do not use `const` or `FC` for defining components and hooks; use `function` declarations.
    *   **Props Interface Definition**: Each component must define a clear Props interface.
    *   **Error Boundary Handling**: Handle errors uniformly within Hooks; components only display error states.
*   **Hook Design Specification**:
    *   **Separation of Concerns**: Manage data, search logic, and UI states with different Hooks.
    *   **Hook Composition**: Create complex functionalities by composing multiple simple Hooks.
    *   **Unified Return Value**: Hooks return an object containing state, action functions, and error handling.
    *   **Side Effect Encapsulation**: All `useEffect` logic is encapsulated within Hooks.
*   **State Management Principles**:
    *   **Local State First**: Use `useState` for component internal state.
    *   **Global State Caution**: Use Context only for truly cross-component shared state.
    *   **State Hoisting**: Manage state at appropriate levels to avoid excessive hoisting.
    *   **Immutable Updates**: Follow immutable principles for state updates.
*   **Component Splitting Strategy**:
    *   **Container vs. Presentational Components**: Logic components handle data, presentational components handle rendering.
    *   **Single Responsibility Principle**: Each component has one clear function.
    *   **Appropriate Component Granularity**: Avoid over-splitting or monolithic components.
    *   **Reusability Consideration**: Extract general components to the `components` directory.

---

## 5. Frontend Tech Stack (`tech_stack_guide.mdc`)

This guide defines the frontend technology stack for the EffiKit Chrome extension project:

*   **Chrome Extension Development**:
    *   **Framework**: Extension.js
    *   **Manifest**: Manifest V3
    *   **Browser Support**: Chromium and Firefox
    *   **Side Panel**: Side Panel API
    *   **Permissions**: Least privilege principle
    *   **Background**: Service Worker
*   **React Ecosystem**:
    *   **Version**: React 18.3.1+
    *   **Rendering**: `ReactDOM.createRoot`
    *   **Mode**: `React.StrictMode` in development
    *   **JSX**: `.tsx` files
    *   **Routing**: React Router DOM 7.6.2
    *   **State Management**: Prioritize React built-in hooks (`useState`, `useReducer`, etc.)
*   **TypeScript Configuration**:
    *   **Version**: TypeScript 5.3.3
    *   **Configuration**: Strict mode enabled, including all strict type checks.
    *   **Module System**: ESNext
    *   **JSX Handling**: `preserve` mode
    *   **Type Definition**: Includes Chrome API type definitions.
    *   **Path Mapping**: Supports `@/*` path aliases.
*   **Styling System**:
    *   **Framework**: Tailwind CSS 4.1.10
    *   **Configuration**: CSS variables for theming.
    *   **Component Styling**: Integrated with `shadcn/ui` design system.
    *   **Preprocessing**: PostCSS
    *   **Responsiveness**: Mobile-first responsive design.
*   **UI Component Library**:
    *   **Main Library**: `shadcn/ui` (New York style)
    *   **Base Components**: Radix UI (headless)
    *   **Icons**: Lucide React
    *   **Utilities**: `class-variance-authority` for conditional styles, `tailwind-merge` and `clsx` for class name handling.
*   **Development Tools**:
    *   **Package Manager**: pnpm 10.7.0+
*   **Project Structure**:
    *   **Components**: `/components` for general components.
    *   **Styles**: `/sidebar/styles.css` as the main style file.
    *   **Types**: TypeScript type definitions distributed across modules.
    *   **Path Aliases**: `@/*` points to the project root.
*   **API Documentation Access**:
    *   **Source**: Use `Context7 MCP` for latest official documentation when encountering API errors or needing updates.
    *   **Method**: Use `resolve-library-id` then `get-library-docs`.
    *   **Applicable Scenarios**: Chrome Extension API, React API, TypeScript API, Tailwind CSS API, and all other third-party library APIs.
    *   **Priority**: Context7 MCP > local cache > web search.
    *   **Principle**: Ensure use of the latest API syntax and best practices.