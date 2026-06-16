#!/usr/bin/env node
/**
 * Install the useForm hook + form validation utilities.
 *
 * Usage (from project root):
 *   pnpm setup:useform                          # single app → src/
 *   USEFORM_TARGET=packages/lib-utils pnpm setup:useform   # monorepo shared package
 *   pnpm setup:useform -- --force
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const SETUP = path.join(ROOT, ".cursor", "setup");
const FORCE = process.argv.includes("--force");
const TARGET = process.env.USEFORM_TARGET || "";

let TARGET_ROOT;
if (!TARGET || TARGET === "src") {
  TARGET_ROOT = path.join(ROOT, "src");
} else {
  TARGET_ROOT = path.join(ROOT, TARGET, "src");
}

const FILES = [
  {
    src: path.join(SETUP, "hooks", "useForm.tsx"),
    dest: path.join(TARGET_ROOT, "hooks", "useForm.tsx"),
    label: "useForm hook",
  },
  {
    src: path.join(SETUP, "hooks", "useTranslation.tsx"),
    dest: path.join(TARGET_ROOT, "hooks", "useTranslation.tsx"),
    label: "useTranslation hook",
  },
  {
    src: path.join(SETUP, "constants", "form-validators.ts"),
    dest: path.join(TARGET_ROOT, "constants", "form-validators.ts"),
    label: "form validators",
  },
];

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

// The hook imports `../constants/strings` (STATIC_VALUES + TRANSLATION_KEYS).
// If the project already has a strings file, leave it alone and tell the user
// to merge. Otherwise drop the stub in as `strings.ts` so the hook compiles.
function ensureStrings() {
  const constantsDir = path.join(TARGET_ROOT, "constants");
  const existing = ["strings.ts", "strings.tsx"]
    .map((f) => path.join(constantsDir, f))
    .find((p) => fs.existsSync(p));

  if (existing && !FORCE) {
    console.log(
      `⊘ Found existing ${path.relative(ROOT, existing)} — merge keys from .cursor/setup/constants/strings-stub.ts (STATIC_VALUES, TRANSLATION_KEYS).`
    );
    return true;
  }

  const stub = path.join(SETUP, "constants", "strings-stub.ts");
  if (!fs.existsSync(stub)) {
    console.error(`✗ Missing template: ${stub}`);
    return false;
  }
  const dest = path.join(constantsDir, "strings.ts");
  ensureDir(dest);
  fs.copyFileSync(stub, dest);
  console.log(`✓ Installed: ${dest} (from strings-stub.ts)`);
  return true;
}

function copyFile(entry) {
  if (!fs.existsSync(entry.src)) {
    console.error(`✗ Missing template: ${entry.src}`);
    return false;
  }
  if (fs.existsSync(entry.dest) && !FORCE) {
    console.log(`⊘ Skipped (exists): ${entry.dest}`);
    return true;
  }
  ensureDir(entry.dest);
  fs.copyFileSync(entry.src, entry.dest);
  console.log(`✓ Installed: ${entry.dest}`);
  return true;
}

function main() {
  const label = TARGET && TARGET !== "src" ? `${TARGET}/src` : "src";
  console.log(`\nuseForm setup → ${label}\n`);

  if (!fs.existsSync(path.dirname(TARGET_ROOT))) {
    fs.mkdirSync(TARGET_ROOT, { recursive: true });
  }

  let ok = true;
  for (const entry of FILES) {
    ok = copyFile(entry) && ok;
  }
  ok = ensureStrings() && ok;

  console.log("\n--- Next steps ---");
  console.log("1. Install lodash if missing:  pnpm add lodash  (useForm uses _.cloneDeep).");
  console.log("2. Install react-i18next if missing (useTranslation):  pnpm add react-i18next i18next.");
  console.log("3. If you already had a strings file, merge the stub keys (STATIC_VALUES, TRANSLATION_KEYS) into it.");
  console.log("4. Read .cursor/rules/useform-validation.mdc");
  console.log("5. Invoke @useform-builder-agent to build forms.\n");

  if (!ok) process.exit(1);
}

main();
