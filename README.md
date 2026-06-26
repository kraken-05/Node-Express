
## Quick Start (refactored)

Requirements: Node 18+ (Node 24 tested)

1. Install dependencies:

```bash
npm install
```

2. Provide secrets by copying `.env.example` to `.env` and replacing values, or export them in your shell.

3. Start the server:

```bash
npm run dev
# or
npm start
```

4. Run smoke tests (server should be running):

```bash
npm run smoke
```

Notes: cookies use `SameSite=Lax` in development to avoid requiring HTTPS; in production set `NODE_ENV=production`.
