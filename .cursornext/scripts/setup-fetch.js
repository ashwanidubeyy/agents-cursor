#!/usr/bin/env node
/**
 * Install the dependency-free fetch HTTP client (axios replacement).
 *
 * Usage (from project root):
 *   pnpm setup:fetch                               # single app  -> src/lib/fetch-client.ts
 *   FETCH_TARGET=packages/lib-utils pnpm setup:fetch   # monorepo shared package
 *   pnpm setup:fetch -- --force                    # overwrite existing
 *
 * Copies:
 *   .cursor/setup/lib/fetch-client.ts -> <target>/src/lib/fetch-client.ts
 *
 * Self-contained: no external dependencies. The client mirrors the axios
 * response/error shape so existing `.then()/.catch()` services keep working.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const SETUP = path.join(ROOT, ".cursor", "setup");
const FORCE = process.argv.includes("--force");
const TARGET = process.env.FETCH_TARGET || "";

let TARGET_ROOT;
if (!TARGET || TARGET === "src") {
  TARGET_ROOT = path.join(ROOT, "src");
} else {
  TARGET_ROOT = path.join(ROOT, TARGET, "src");
}

const SRC = path.join(SETUP, "lib", "fetch-client.ts");
const DEST = path.join(TARGET_ROOT, "lib", "fetch-client.ts");

function main() {
  const label = TARGET && TARGET !== "src" ? `${TARGET}/src` : "src";
  console.log(`\nfetch client setup -> ${label}/lib\n`);

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
  console.log("1. Set NEXT_PUBLIC_API_BASE_URL in .env (the default `http` instance reads it).");
  console.log("2. Add interceptors in fetch-client.ts (auth token, language, 401/403 handling).");
  console.log("3. Point services at `import { http } from '@/lib/fetch-client'` and use .then()/.catch().");
  console.log("4. Remove axios from package.json if nothing else imports it.\n");
}

main();
