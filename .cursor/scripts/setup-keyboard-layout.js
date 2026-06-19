#!/usr/bin/env node
/**
 * Install cross-platform keyboard-aware layouts for inputs, textareas, and chat composers.
 *
 * Usage (from project root):
 *   node .cursor/scripts/setup-keyboard-layout.js
 *   node .cursor/scripts/setup-keyboard-layout.js --force
 *
 * Copies:
 *   .cursor/setup/keyboard/** -> src/ (hooks, layouts)
 * Patches BaseScreen to accept optional `edges` prop when missing.
 * Merges hooks barrel exports.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SETUP = path.join(ROOT, '.cursor', 'setup', 'keyboard');
const SRC = path.join(ROOT, 'src');
const FORCE = process.argv.includes('--force');

const COPY_MAP = [
  { src: 'hooks/useKeyboardHeight.js', dest: 'hooks/useKeyboardHeight.js' },
  { src: 'hooks/useKeyboardInsets.js', dest: 'hooks/useKeyboardInsets.js' },
  { src: 'hooks/useChatKeyboardInsets.js', dest: 'hooks/useChatKeyboardInsets.js' },
  {
    src: 'layouts/KeyboardAwareLayout/index.js',
    dest: 'components/layouts/KeyboardAwareLayout/index.js',
  },
  {
    src: 'layouts/KeyboardAwareLayout/style.js',
    dest: 'components/layouts/KeyboardAwareLayout/style.js',
  },
  {
    src: 'layouts/ChatKeyboardLayout/index.js',
    dest: 'components/layouts/ChatKeyboardLayout/index.js',
  },
  {
    src: 'layouts/ChatKeyboardLayout/style.js',
    dest: 'components/layouts/ChatKeyboardLayout/style.js',
  },
];

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function copyFile(relPath) {
  const srcPath = path.join(SETUP, relPath.src);
  const destPath = path.join(SRC, relPath.dest);

  if (!fs.existsSync(srcPath)) {
    console.error(`\u2717 Missing template: ${srcPath}`);
    return false;
  }
  if (fs.existsSync(destPath) && !FORCE) {
    console.log(
      `\u2298 Skipped (exists): ${path.relative(ROOT, destPath)} (use --force to overwrite)`,
    );
    return true;
  }
  ensureDir(destPath);
  fs.copyFileSync(srcPath, destPath);
  console.log(`\u2713 Installed: ${path.relative(ROOT, destPath)}`);
  return true;
}

function mergeHooksBarrel() {
  const indexPath = path.join(SRC, 'hooks', 'index.js');
  if (!fs.existsSync(indexPath)) {
    console.log('\u2298 Skipped hooks merge (hooks/index.js not found)');
    return true;
  }

  const exportsToAdd = [
    { token: "from './useKeyboardHeight'", line: "export { useKeyboardHeight } from './useKeyboardHeight';" },
    { token: "from './useKeyboardInsets'", line: "export { useKeyboardInsets } from './useKeyboardInsets';" },
    { token: "from './useChatKeyboardInsets'", line: "export { useChatKeyboardInsets } from './useChatKeyboardInsets';" },
  ];

  let content = fs.readFileSync(indexPath, 'utf8');
  let changed = false;

  exportsToAdd.forEach(({ token, line }) => {
    if (!content.includes(token)) {
      content = `${content.trim()}\n${line}\n`;
      changed = true;
      console.log(`\u2713 Updated: src/hooks/index.js (${token})`);
    }
  });

  if (changed) {
    fs.writeFileSync(indexPath, content);
  }

  return true;
}

function patchBaseScreenEdges() {
  const baseScreenPath = path.join(SRC, 'components', 'layouts', 'BaseScreen', 'index.js');
  if (!fs.existsSync(baseScreenPath)) {
    console.log('\u2298 Skipped BaseScreen patch (not found)');
    return true;
  }

  const content = fs.readFileSync(baseScreenPath, 'utf8');
  if (content.includes('edges')) {
    console.log('\u2298 BaseScreen already supports edges prop');
    return true;
  }

  const next = content
    .replace(
      'const BaseScreen = ({ children }) => {',
      'const BaseScreen = ({ children, edges }) => {',
    )
    .replace(
      '<SafeAreaView style={styles.safeArea}>',
      '<SafeAreaView style={styles.safeArea} edges={edges}>',
    );

  if (next === content) {
    console.log('\u2298 Could not auto-patch BaseScreen edges — patch manually');
    return true;
  }

  fs.writeFileSync(baseScreenPath, next);
  console.log('\u2713 Updated: BaseScreen supports optional edges prop');
  return true;
}

function main() {
  console.log('\nkeyboard layout setup -> src/\n');

  let ok = true;
  for (const entry of COPY_MAP) {
    ok = copyFile(entry) && ok;
  }
  ok = mergeHooksBarrel() && ok;
  ok = patchBaseScreenEdges() && ok;

  console.log('\n--- Usage ---');
  console.log('Forms/ScrollView: KeyboardAwareLayout + scrollPaddingBottom');
  console.log('Chat/fixed footer: ChatKeyboardLayout + listPaddingBottom');
  console.log('Rule: .cursor/rules/keyboard-layout.mdc\n');

  if (!ok) {
    process.exit(1);
  }
}

main();
