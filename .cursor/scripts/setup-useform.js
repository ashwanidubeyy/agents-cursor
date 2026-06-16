#!/usr/bin/env node
/**
 * Install the React Native `useForm` hook + form validation helpers.
 *
 * Usage (from project root):
 *   node .cursor/scripts/setup-useform.js            # auto: TypeScript if tsconfig.json exists, else JS
 *   node .cursor/scripts/setup-useform.js --ts       # force TypeScript (.ts)
 *   node .cursor/scripts/setup-useform.js --js       # force JavaScript (.js)
 *   node .cursor/scripts/setup-useform.js --force    # overwrite existing files
 *
 * Copies (extension depends on language):
 *   .cursor/setup/hooks/useForm.<ext>          -> src/hooks/useForm.<ext>
 *   .cursor/setup/utility/form-validators.<ext> -> src/utility/form-validators.<ext>
 * and ensures the src/hooks barrel re-exports useForm.
 *
 * Self-contained: no external dependencies. Requires the @hooks / @utility /
 * @constants / @widgets path aliases from the standard scaffold.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SETUP = path.join(ROOT, '.cursor', 'setup');
const SRC = path.join(ROOT, 'src');
const FORCE = process.argv.includes('--force');

const WANT_TS = process.argv.includes('--ts');
const WANT_JS = process.argv.includes('--js');
const HAS_TSCONFIG = fs.existsSync(path.join(ROOT, 'tsconfig.json'));
const USE_TS = WANT_TS || (!WANT_JS && HAS_TSCONFIG);
const EXT = USE_TS ? 'ts' : 'js';

const FILES = [
  {
    src: path.join(SETUP, 'hooks', `useForm.${EXT}`),
    dest: path.join(SRC, 'hooks', `useForm.${EXT}`),
    label: 'useForm hook',
  },
  {
    src: path.join(SETUP, 'utility', `form-validators.${EXT}`),
    dest: path.join(SRC, 'utility', `form-validators.${EXT}`),
    label: 'form validators',
  },
];

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function copyFile(entry) {
  if (!fs.existsSync(entry.src)) {
    console.error(`\u2717 Missing template: ${entry.src}`);
    return false;
  }
  if (fs.existsSync(entry.dest) && !FORCE) {
    console.log(
      `\u2298 Skipped (exists): ${path.relative(ROOT, entry.dest)} (use --force to overwrite)`,
    );
    return true;
  }
  ensureDir(entry.dest);
  fs.copyFileSync(entry.src, entry.dest);
  console.log(`\u2713 Installed: ${path.relative(ROOT, entry.dest)} (${entry.label})`);
  return true;
}

function ensureHooksBarrel() {
  const line = "export { useForm } from './useForm';";
  const existing = ['index.ts', 'index.tsx', 'index.js']
    .map((f) => path.join(SRC, 'hooks', f))
    .find((p) => fs.existsSync(p));

  if (!existing) {
    const barrel = path.join(SRC, 'hooks', `index.${EXT}`);
    ensureDir(barrel);
    fs.writeFileSync(barrel, `${line}\n`);
    console.log(`\u2713 Created: ${path.relative(ROOT, barrel)} (with useForm export)`);
    return true;
  }

  const content = fs.readFileSync(existing, 'utf8');
  if (content.includes("from './useForm'")) {
    console.log(`\u2298 ${path.relative(ROOT, existing)} already exports useForm`);
    return true;
  }
  const next = content.endsWith('\n') ? `${content}${line}\n` : `${content}\n${line}\n`;
  fs.writeFileSync(existing, next);
  console.log(`\u2713 Updated: ${path.relative(ROOT, existing)} (added useForm export)`);
  return true;
}

function main() {
  console.log(`\nuseForm setup (React Native, ${USE_TS ? 'TypeScript' : 'JavaScript'}) -> src/\n`);

  let ok = true;
  for (const entry of FILES) {
    ok = copyFile(entry) && ok;
  }
  ok = ensureHooksBarrel() && ok;

  console.log('\n--- Next steps ---');
  console.log('1. Ensure @hooks and @utility aliases exist in babel.config.js (standard scaffold).');
  console.log('2. Add validation messages to src/constants/alerts (e.g. ALERTS.VALIDATION.EMAIL_INVALID).');
  console.log('3. Read .cursor/rules/useform-validation.mdc');
  console.log('4. Invoke @useform-builder-agent to build forms.\n');

  if (!ok) {
    process.exit(1);
  }
}

main();
