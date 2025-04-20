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
- Use interface definitions for complex types
- Include JSDoc comments in service files
- Handle errors with try/catch blocks including console logging
- Extract styles to separate StyleSheet objects using StyleSheet.create()
- Order imports: React first, then external libraries, then local components/services
- Follow platform-specific patterns with .ios.tsx and .tsx file variations
- Use custom themed components for consistent styling across the app
- Implement singleton pattern for services