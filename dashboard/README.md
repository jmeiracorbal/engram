# Engram Dashboard

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-4-000000?logo=shadcnui&logoColor=white)](https://ui.shadcn.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Web dashboard for [engram](https://github.com/Gentleman-Programming/engram), the persistent memory system for AI coding agents. Provides a visual interface to explore observations, sessions, projects, and timelines stored by your agents.

## Prerequisites

- [**engram**](https://github.com/Gentleman-Programming/engram) installed and running (`engram serve` on port `7437`)
- **Node.js** >= 18

## Quick Start

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:5173` and proxies API requests to the engram backend at `http://127.0.0.1:7437`.

## Stack

- **React 19** + **TypeScript**
- **Vite 7** — bundler and dev server
- **Tailwind CSS 4** — utility-first styling
- **shadcn/ui 4** — component library
- **React Router 7** — client-side routing
- **react-markdown** — markdown rendering in observation detail

## API Proxy

In development, Vite proxies `/api/*` requests to the engram HTTP server:

```
/api/stats        →  http://127.0.0.1:7437/stats
/api/observations →  http://127.0.0.1:7437/observations
...
```

For production, configure your web server or reverse proxy to forward API requests to the engram backend.

## Project Structure

```
src/
├── components/
│   ├── layout/          # AppLayout, AppSidebar
│   ├── ui/              # shadcn/ui components
│   └── search-input.tsx # Reusable search input
├── hooks/
│   ├── use-async.ts     # Generic async data fetching hook
│   └── use-mobile.ts    # Mobile detection hook
├── lib/
│   ├── api.ts           # API client for engram HTTP endpoints
│   ├── format.ts        # Date, string, and type formatting utilities
│   ├── types.ts         # TypeScript interfaces matching engram data models
│   └── utils.ts         # General utilities (cn)
└── pages/
    ├── dashboard.tsx
    ├── observations.tsx
    ├── observation-detail.tsx
    ├── projects.tsx
    ├── search.tsx         # Unified observations page (list + search)
    ├── sessions.tsx
    ├── session-detail.tsx
    └── timeline.tsx
```

## Theme

Light theme based on the Rosé Pine palette used by engram's TUI, with custom CSS variables for accent colors (lavender, teal, peach, mauve).

## License

[MIT](LICENSE)
