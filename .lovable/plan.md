

# Fix: Rename Vite Config for Lovable Compatibility

## Problem
The project currently uses `vite.config.mts`, which Lovable's build system does not recognize. It requires a `vite.config.ts` file.

## Solution

### 1. Delete `vite.config.mts`
Remove the current config file that uses the `.mts` extension.

### 2. Create `vite.config.ts`
Create an identical file but with the `.ts` extension. The content stays the same -- port 8080, path alias pointing to the nested app source, React plugin, and lovable-tagger.

### 3. Add `"type": "module"` to `package.json`
This ensures ES module syntax (`import`/`export`) works in `.ts` config files without needing the `.mts` workaround.

---

### Technical Details

**`vite.config.ts`** (recreated):
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";
import { componentTagger } from "lovable-tagger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => ({
  server: { host: "::", port: 8080 },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./apps/web/afrimine-solar-earn-main/src"),
    },
  },
}));
```

**`package.json`** change:
- Add `"type": "module"` at the top level

This is the only change needed to unblock the build.

