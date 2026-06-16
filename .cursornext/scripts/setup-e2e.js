#!/usr/bin/env node
/**
 * Bootstrap Playwright E2E for this Next.js (web) monorepo.
 * Detox does NOT work on web — this is the correct E2E stack.
 *
 * Usage:
 *   pnpm setup:e2e
 *   pnpm setup:e2e -- --force
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..", "..");
const SETUP = path.join(ROOT, ".cursor", "setup", "e2e");
const FORCE = process.argv.includes("--force");

const FILES = [
  {
    src: path.join(SETUP, "playwright.config.ts"),
    dest: path.join(ROOT, "playwright.config.ts"),
  },
  {
    src: path.join(SETUP, "example.spec.ts"),
    dest: path.join(ROOT, "e2e", "smoke.spec.ts"),
  },
];

function copy(entry) {
  if (!fs.existsSync(entry.src)) {
    console.error(`✗ Missing: ${entry.src}`);
    return false;
  }
  if (fs.existsSync(entry.dest) && !FORCE) {
    console.log(`⊘ Skipped (exists): ${entry.dest}`);
    return true;
  }
  fs.mkdirSync(path.dirname(entry.dest), { recursive: true });
  fs.copyFileSync(entry.src, entry.dest);
  console.log(`✓ Installed: ${entry.dest}`);
  return true;
}

function patchPackageJson() {
  const pkgPath = path.join(ROOT, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  pkg.scripts = pkg.scripts || {};
  let changed = false;
  if (!pkg.scripts.e2e) {
    pkg.scripts.e2e = "playwright test";
    changed = true;
  }
  if (!pkg.scripts["e2e:ui"]) {
    pkg.scripts["e2e:ui"] = "playwright test --ui";
    changed = true;
  }
  if (!pkg.scripts["e2e:report"]) {
    pkg.scripts["e2e:report"] = "playwright show-report";
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
    console.log("✓ Added e2e / e2e:ui / e2e:report scripts to package.json");
  }
}

function main() {
  console.log("\nPlaywright E2E setup (web — Detox is NOT supported)\n");

  try {
    execSync("pnpm add -D -w @playwright/test@1.49.1", {
      cwd: ROOT,
      stdio: "inherit",
    });
  } catch {
    console.warn(
      "⚠ Could not install @playwright/test automatically. Run: pnpm add -D -w @playwright/test"
    );
  }

  for (const entry of FILES) {
    copy(entry);
  }
  patchPackageJson();

  console.log("\nInstalling browsers (chromium, firefox, webkit)...");
  try {
    execSync("pnpm exec playwright install", { cwd: ROOT, stdio: "inherit" });
  } catch {
    console.warn("⚠ Run manually: pnpm exec playwright install");
  }

  console.log("\n--- Run E2E ---");
  console.log("  pnpm dev:edulac-main   # or let webServer start it");
  console.log("  pnpm e2e");
  console.log("  pnpm e2e:ui");
  console.log("\nSee .cursor/rules/e2e-testing.mdc and @e2e-testing-agent\n");
}

main();
