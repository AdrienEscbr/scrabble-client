ScrabbleIO – Client (React + Express)

Commands

- `npm install` at repo root installs root dev tools. Then:
- `npm run dev` runs Vite dev server (client) and Express (for /health) concurrently.
- `npm run build` builds the React client to `client/dist`.
- `npm run start` serves the production build from Express on the configured port.

Environment

- `PORT_CLIENT` – Express port (default 3000)
- `VITE_GAME_SERVER_URL` – URL of the game server (socket.io). Default: `http://localhost:4000`

Structure

- `client/` – React + TypeScript + Vite app
  - `src/` – components, screens, context, hooks, services
  - `src/services/socket.ts` – socket.io-client integration with the app store
  - `src/context/ClientContext.tsx` – global store (connection, player, room, gameState)
  - `src/router/` – React Router screens
  - `public/` – static assets
- `server/` – Express server to serve the built client and `/health`

Notes

- LocalStorage key: `scrabble-client` stores `playerId`, `nickname`, `lastRoomId`, `soundsEnabled`.
- On WebSocket connect, the client attempts `reconnect` if `playerId` and `lastRoomId` exist.
- Sounds: enable using the speaker button (🔊/🔇). Minimal tones are generated via WebAudio.

