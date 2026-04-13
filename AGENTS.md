# AGENTS.md — specter-link

Context file for AI coding agents. Read this before making any changes.

---

## What this project is

**specter-link** is a browser-native, peer-to-peer communication app — real-time text chat, audio calls, video calls, and screen share. No accounts, no server-side message storage. All media and data travel directly between browsers via WebRTC.

Two processes run in parallel:

| Process | What it does | Port |
|---------|-------------|------|
| Next.js frontend | React UI | 3000 |
| PeerJS signaling server | Brokers WebRTC handshake (ICE/SDP) only — no payload data | 9000 |

Once two peers are connected the signaling server is no longer in the data path.

---

## Running locally

```bash
npm install
cp .env.example .env   # values default to localhost — no edits needed for local dev
npm run dev            # starts both processes via concurrently
```

Open `http://localhost:3000` in two browser tabs to test a full session.

---

## Project layout

```
app/
  layout.tsx          Root layout — imports AEGIS globals, sets dark theme, loads icon fonts
  page.tsx            Thin server component; delegates to PageLoader (ssr: false)
  globals.css         Layout classes and responsive styles

components/
  PageLoader.tsx      'use client' wrapper — dynamic import of PageContent with ssr:false
                      (needed because @azelenets/aegis-design-system imports leaflet at
                      module level, which crashes during SSR)
  PageContent.tsx     Main app shell — lobby vs. in-room states, toolbar, modals
  RoomEntry.tsx       Lobby UI — shows own Peer ID, copy button, join-room input
  Chat.tsx            Chat panel — message list, auto-scroll, send input
  VideoPanel.tsx      Video panel — remote full-screen, local PiP, waiting overlay

hooks/
  usePeer.ts          All WebRTC logic — peer lifecycle, data + media connections,
                      call state, incoming call handling

server/
  peer-server.ts      Express + ExpressPeerServer signaling server
```

---

## Key architectural rules

### SSR must stay disabled for PageContent

`@azelenets/aegis-design-system` imports `leaflet` at module level. Leaflet accesses `window`/`document` on import and crashes Node. The fix is the `PageLoader → dynamic(..., { ssr: false })` chain. Do not remove it or move the design-system import out of client components.

### PeerJS path configuration

The peer server must be configured as:

```ts
// server/peer-server.ts
const peerServer = ExpressPeerServer(server, { path: '/' });  // ← must be '/'
app.use(PATH, peerServer);                                      // PATH = '/peerjs'
```

Passing `path: PATH` to both `ExpressPeerServer` and `app.use` doubles up the path segment. The peer library appends its own `/peerjs` suffix when building WS and HTTP URLs — using `path: '/'` with the Express mount handles this correctly:

- HTTP ID endpoint: `http://localhost:9000/peerjs/peerjs/id` ✓
- WebSocket: `ws://localhost:9000/peerjs/peerjs` ✓

### `usePeer` is the entire WebRTC boundary

All peer lifecycle code lives in `hooks/usePeer.ts`. Components only call its public API (`joinRoom`, `sendMessage`, `startCall`, `endCall`, `leaveRoom`, `answerCall`, `declineCall`). Do not reach into PeerJS types or WebRTC APIs from components.

PeerJS is dynamically imported inside the `useEffect` to avoid SSR:

```ts
const { Peer } = await import('peerjs');
```

### Both peers are symmetric

There is no "host" vs. "guest" mode in the application logic. The side that owns the ID waits; the side that types in a remote ID initiates via `peer.connect()`. Both sides can start calls.

---

## Environment variables

| Variable | Used by | Default | Purpose |
|----------|---------|---------|---------|
| `PEERJS_PORT` | server | `9000` | Port the signaling server listens on |
| `PEERJS_PATH` | server | `/peerjs` | URL path for the signaling server |
| `NEXT_PUBLIC_PEER_HOST` | browser | `localhost` | Signaling server hostname |
| `NEXT_PUBLIC_PEER_PORT` | browser | `9000` | Signaling server port |
| `NEXT_PUBLIC_PEER_PATH` | browser | `/peerjs` | Signaling server path |

`usePeer.ts` auto-detects localhost and disables TLS (`secure: false`). For any other host it enables WSS automatically — no code change needed for production.

---

## UI / styling

**Design system:** `@azelenets/aegis-design-system` — provides `Button`, `Input`, `Spinner`, `Alert`, `Modal`, `ModalHeader`, `ModalBody`, `ModalFooter`, `Accordion`, and more.

**CSS variables** (set by the design system's `globals.css`):

| Variable | Role |
|----------|------|
| `--color-primary` | Cyan accent (`0 243 255`) |
| `--color-hazard` | Yellow warning (`250 204 21`) |
| `--color-alert` | Red destructive (`255 0 60`) |
| `--color-bg-dark` | Page background |
| `--color-panel-dark` | Card / panel background |
| `--color-surface-terminal` | Code / terminal surface |
| `--color-border-dark` | Borders |

**Fonts:**

| Font | Usage |
|------|-------|
| Orbitron | Brand name / display headings |
| JetBrains Mono | IDs, status text, labels, chat messages |
| Material Symbols Outlined | Icons (loaded from Google Fonts in `layout.tsx`) |

**Responsive breakpoints** (in `globals.css`):

| Breakpoint | Effect |
|------------|--------|
| `max-width: 1024px` | `.call-container` switches from two-column to single-column |
| `max-width: 640px` | Desktop toolbar controls hidden; hamburger + accordion mobile menu shown |

**Layout classes** defined in `globals.css` (prefer extending these over inline styles for layout):
`room-entry`, `call-container`, `chat-container`, `message-self`, `message-peer`,
`video-local`, `video-remote`, `navbar-header`, `navbar-controls-desktop`,
`navbar-hamburger`, `navbar-mobile-menu`, `navbar-mobile-item`, `truncate-id`

---

## TypeScript configuration

Two separate configs exist — use the right one:

| Config | Covers | Module system |
|--------|--------|---------------|
| `tsconfig.json` | `app/`, `components/`, `hooks/` | ESNext / bundler (Next.js) |
| `tsconfig.server.json` | `server/` | CommonJS (Node.js) |

Path alias `@/*` maps to the repo root (e.g. `@/hooks/usePeer`, `@/components/Chat`).

---

## Gotchas

- **`peer` package version:** Must stay on `^1.0.2`. Version 2.x does not exist on npm; the package was never published past `1.1.0-rc.2`.
- **`next/dynamic` with `ssr: false`** cannot be called in a Server Component. It must live inside a `'use client'` file — that is why `PageLoader.tsx` exists as an intermediary.
- **Privacy:** The signaling server logs peer IDs only. Never log message content, call metadata, or stream data.
- **Media cleanup:** `cleanupMediaCall` in `usePeer.ts` stops all local tracks. Always go through this function when ending a call — do not call `mediaConn.close()` directly from components.
