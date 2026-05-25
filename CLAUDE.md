# API Proxy Tool

A browser extension for proxying API requests to mock URLs. Built with Chrome Extension Manifest V3.

## Tech Stack

- **Framework**: React 18+
- **UI Library**: Ant Design 6
- **Language**: TypeScript
- **Build Tool**: Vite 6
- **Styling**: TailwindCSS 4
- **State Management**: Zustand
- **Package Manager**: pnpm
- **Lint**: ESLint + Prettier
- **Quality**: Husky + lint-staged + commitlint

## Commands

| Command              | Description                                       |
| :------------------- | :------------------------------------------------ |
| `pnpm dev`           | Start Chrome dev server with hot reload           |
| `pnpm dev:firefox`   | Start Firefox dev server                          |
| `pnpm build:chrome`  | Build Chrome extension (output: `dist_chrome/`)   |
| `pnpm build:firefox` | Build Firefox extension (output: `dist_firefox/`) |
| `pnpm lint`          | Run ESLint checks                                 |
| `pnpm lint:fix`      | Auto-fix ESLint issues                            |
| `pnpm commit`        | Commit with Commitizen interactive prompt         |

## Project Structure

```
src/
├── assets/          # Static assets
├── components/      # Reusable UI components
├── constant/        # Constants and enums
├── hooks/           # Custom React hooks
├── locales/         # i18n locale files
├── pages/           # Extension pages (options, popup)
├── store/           # Zustand state stores
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── global.d.ts      # Global type declarations
├── vite-env.d.ts    # Vite environment types
```

## Conventions

- **Components**: Function components with hooks, PascalCase filenames
- **Hooks**: `use` prefix, camelCase, each hook in its own file
- **Store**: Zustand stores, `store` suffix, each store in its own file
- **CSS**: TailwindCSS utility classes + Ant Design theming
- **Lint**: ESLint with TypeScript + React plugins

## Code Style

- Follow existing ESLint / Prettier configuration
- Use `const` over `function` for component declarations
- Event handlers prefixed with `handle`
- Early return for guard clauses

## AI Collaboration

This project maintains AI collaboration rules in [AGENTS.md](./AGENTS.md), covering:

- Code review standards and security boundaries
- Commit message conventions
- AI coding constraints (complexity, comments, etc.)

> AI Agent: Always read AGENTS.md alongside this file before starting work.

## Architecture

See [STACK_ARCHITECTURE.md](./STACK_ARCHITECTURE.md) for architecture decisions, data flow, and component hierarchy.
