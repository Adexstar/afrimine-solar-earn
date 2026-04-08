

## Fix: Add `"type": "module"` to root package.json

### Problem
The build fails because ESM-only packages (`@vitejs/plugin-react-swc`, `lovable-tagger`) cannot be loaded via `require()`. The root `package.json` is missing `"type": "module"`, so Node.js treats `.ts` config files as CommonJS.

### Solution
Add `"type": "module"` to the root `package.json` (line 2, after `"name"`). This is a one-line change.

### Technical Detail
```json
{
  "name": "afrimine-monorepo",
  "type": "module",
  ...
}
```

No other files need to change. The `vite.config.ts` is already written in ESM syntax and will work once this flag is set.

### Why the UI keeps breaking
Your project has a hybrid monorepo structure (Expo + Vite) nested under `apps/web/`. Every time the Lovable template updater runs, it may regenerate config files without this flag, causing the same ESM error. After this fix, I recommend not running the template updater again unless necessary.

