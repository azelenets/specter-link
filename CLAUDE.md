# CLAUDE.md — specter-link

Instructions for Claude Code. See `AGENTS.md` for full project context.

## Commands

```bash
npm run dev          # start Next.js + peer signaling server concurrently
npm run lint         # ESLint (eslint-config-next/core-web-vitals)
npm run typecheck    # tsc for app + server configs
npm run build        # Next.js production build
```

Always run `lint` and `typecheck` after making changes.

## Critical rules

- **SSR is disabled** for the main page via `PageLoader → dynamic(..., { ssr: false })`.  
  Do not import `@azelenets/aegis-design-system` in any Server Component — it imports `leaflet` at module level and crashes Node.

- **PeerJS server path** must be `ExpressPeerServer(server, { path: '/' })` with `app.use('/peerjs', peerServer)`.  
  Using the same path string in both doubles up the segment and breaks WS + HTTP routing.

- **`next/dynamic` with `ssr: false`** must live in a `'use client'` file, not a Server Component.

- **Icons** — `Button icon` prop accepts only `MaterialIconName` (the `ICONS` registry in the design system).  
  Invalid names cause a TypeScript error. Check `AGENTS.md` for the full icon list.

- **Two TypeScript configs** — `tsconfig.json` for `app/`/`components/`/`hooks/`, `tsconfig.server.json` for `server/`. The `typecheck` script runs both.
