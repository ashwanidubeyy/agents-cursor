#!/usr/bin/env node
/**
 * Install the React Native dependency-free fetch HTTP client (axios-free).
 *
 * Usage (from project root):
 *   node .cursor/scripts/setup-fetch.js            # -> src/lib/fetch-client.ts
 *   node .cursor/scripts/setup-fetch.js --force    # overwrite existing
 *
 * Copies:
 *   .cursor/setup/lib/fetch-client.ts -> src/lib/fetch-client.ts
 *
 * Self-contained: no external dependencies. React Native ships fetch,
 * XMLHttpRequest, FormData and AbortController globally. The client mirrors the
 * axios response/error shape so existing `.then()/.catch()` services keep working.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const SETUP = path.join(ROOT, ".cursor", "setup");
const SRC = path.join(SETUP, "lib", "fetch-client.ts");
const DEST = path.join(ROOT, "src", "lib", "fetch-client.ts");
const FORCE = process.argv.includes("--force");

function main() {
  console.log("\nfetch client setup (React Native) -> src/lib\n");

  if (!fs.existsSync(SRC)) {
    console.error(`\u2717 Missing template: ${SRC}`);
    process.exit(1);
  }
  if (fs.existsSync(DEST) && !FORCE) {
    console.log(
      `\u2298 Skipped (exists): ${path.relative(ROOT, DEST)} (use --force to overwrite)`
    );
  } else {
    fs.mkdirSync(path.dirname(DEST), { recursive: true });
    fs.copyFileSync(SRC, DEST);
    console.log(`\u2713 Installed: ${path.relative(ROOT, DEST)}`);
  }

  console.log("\n--- Next steps ---");
  console.log("1. Set API_BASE_URL in .env (wire fetch-client BASE_URL to your env layer).");
  console.log("2. Add interceptors in fetch-client.ts (auth token, language, 401/403 handling).");
  console.log("3. Point services at `import { http } from '@lib/fetch-client'` and use .then()/.catch().");
  console.log("4. Ensure an @lib path alias exists in babel.config.js and tsconfig paths.\n");

}

main();
