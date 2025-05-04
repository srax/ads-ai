# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Build: `expo start`
- iOS: `expo start --ios`
- Android: `expo start --android`
- Web: `expo start --web`
- Test: `jest --watchAll`
- Test single file: `jest path/to/file.test.tsx`
- Lint: `expo lint`
- Reset project: `node ./scripts/reset-project.js`

## Code Style
- Use functional components with TypeScript interfaces for props
- Prefer named exports for components
- Use type/interface definitions for props and complex types
- Include JSDoc comments in service files with param/return documentation
- Handle errors with try/catch blocks including detailed console logging
- Extract styles to separate StyleSheet objects using StyleSheet.create()
- Order imports: React first, then external libraries, then local imports (@/ paths)
- Follow platform-specific patterns with .ios.tsx and .tsx file variations
- Use custom themed components for consistent styling across the app
- Implement singleton pattern for services with private methods
- Write snapshot tests for UI components using jest-expo