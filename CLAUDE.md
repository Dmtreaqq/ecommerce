# Project Overview
Monorepo with two folders: `client/` (frontend) and `server/` (backend).

## Code style
- Do not add comments that just restate what the code does (e.g. `// loop through items` above a for-loop).
- Only comment on things that aren't obvious from the code itself: tricky workarounds, non-standard business logic, or "why", not "what".
- Don't leave TODO/FIXME comments unless I explicitly ask for them.

## Dev servers
- Never leave a dev server running in the background once you're done testing a feature.
- Before ending your turn, check for and kill any background process you started (e.g. `npm run dev`, `nodemon`, etc.).
- Prefer one-off commands for verification (e.g. `curl localhost:PORT/api/health`) over keeping a server alive for the whole session.