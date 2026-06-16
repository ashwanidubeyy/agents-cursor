#!/usr/bin/env node
/**
 * Install the example feature module into a project (feature-first structure).
 *
 * Usage (from project root):
 *   pnpm setup:example                          # single app → src/
 *   USEFORM_TARGET=apps/web pnpm setup:example   # monorepo app → apps/web/src/
 *   pnpm setup:example -- --force               # overwrite existing files
 *
 * Copies:
 *   .cursor/setup/example-module/feature/**  → <target>/src/features/example/**
 *   .cursor/setup/example-module/app/page.tsx → <target>/src/app/example/page.tsx
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const TEMPLATE = path.join(ROOT, ".cursor", "setup", "example-module");
const FORCE = process.argv.includes("--force");

// Reuse USEFORM_TARGET (or EXAMPLE_TARGET) so both installers share one target.
const TARGET = process.env.EXAMPLE_TARGET || process.env.USEFORM_TARGET || "";
const SRC_ROOT =
  !TARGET || TARGET === "src"
    ? path.join(ROOT, "src")
    : path.join(ROOT, TARGET, "src");

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
    return;
  }
  if (fs.existsSync(dest) && !FORCE) {
    console.log(`⊘ Skipped (exists): ${dest}`);
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`✓ Installed: ${dest}`);
}

function main() {
  const label = TARGET && TARGET !== "src" ? `${TARGET}/src` : "src";
  console.log(`\nExample module setup → ${label}/features/example\n`);

  if (!fs.existsSync(TEMPLATE)) {
    console.error(`✗ Template not found: ${TEMPLATE}`);
    process.exit(1);
  }

  copyRecursive(
    path.join(TEMPLATE, "feature"),
    path.join(SRC_ROOT, "features", "example")
  );
  copyRecursive(
    path.join(TEMPLATE, "app", "page.tsx"),
    path.join(SRC_ROOT, "app", "example", "page.tsx")
  );

  const hasUseForm = fs.existsSync(
    path.join(SRC_ROOT, "hooks", "useForm.tsx")
  );

  console.log("\n--- Next steps ---");
  if (!hasUseForm) {
    console.log("• ExampleForm imports @/hooks/useForm — run: pnpm setup:useform");
  }
  console.log("• Ensure styled-components is installed.");
  console.log("• Visit /example after starting the dev server.");
  console.log("• Optional: register exampleSlice in @/store to use Redux.");
  console.log("• Blueprint: copy src/features/example to your own feature.\n");
}

main();
