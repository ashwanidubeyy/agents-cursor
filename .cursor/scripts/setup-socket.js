#!/usr/bin/env node
/**
 * Install WebSocket client infrastructure and optional module scaffolding.
 *
 * Usage (from project root):
 *   node .cursor/scripts/setup-socket.js
 *   node .cursor/scripts/setup-socket.js --force
 *   node .cursor/scripts/setup-socket.js --mode=configure-only
 *   node .cursor/scripts/setup-socket.js --mode=existing-module --module=Tickets
 *   node .cursor/scripts/setup-socket.js --mode=new-module --module=Chat
 *
 * Copies:
 *   .cursor/setup/socket/** -> src/ (utility, hooks, services, constants)
 * Merges constants barrel and hooks barrel.
 * With --mode=new-module, scaffolds screen + module hook + service + constants.
 * With --mode=existing-module, scaffolds module hook + service only.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const SETUP = path.join(ROOT, '.cursor', 'setup', 'socket');
const MODULE_TEMPLATES = path.join(SETUP, 'module-templates');
const SRC = path.join(ROOT, 'src');
const FORCE = process.argv.includes('--force');

const MODE_ARG = process.argv.find((arg) => arg.startsWith('--mode='));
const MODULE_ARG = process.argv.find((arg) => arg.startsWith('--module='));
const MODE = MODE_ARG ? MODE_ARG.split('=')[1] : 'configure-only';
const MODULE_RAW = MODULE_ARG ? MODULE_ARG.split('=')[1] : '';

const COPY_MAP = [
  { src: 'utility/socketClient.js', dest: 'utility/socketClient.js' },
  { src: 'hooks/useSocket.js', dest: 'hooks/useSocket.js' },
  { src: 'services/socket.service.js', dest: 'services/socket.service.js' },
  { src: 'constants/socket.js', dest: 'constants/socket.js' },
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

function toPascalCase(value) {
  return value
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
}

function toCamelCase(value) {
  const pascal = toPascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toKebabCase(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase();
}

function applyModulePlaceholders(content, moduleName) {
  const pascal = toPascalCase(moduleName);
  const camel = toCamelCase(moduleName);
  return content
    .replace(/__MODULE__/g, pascal)
    .replace(/__module__/g, camel);
}

function copyModuleTemplate(relSrc, relDest, moduleName) {
  const srcPath = path.join(MODULE_TEMPLATES, relSrc);
  const destPath = path.join(SRC, relDest);

  if (!fs.existsSync(srcPath)) {
    console.error(`\u2717 Missing module template: ${srcPath}`);
    return false;
  }
  if (fs.existsSync(destPath) && !FORCE) {
    console.log(
      `\u2298 Skipped (exists): ${path.relative(ROOT, destPath)} (use --force to overwrite)`,
    );
    return true;
  }

  const raw = fs.readFileSync(srcPath, 'utf8');
  const content = applyModulePlaceholders(raw, moduleName);
  ensureDir(destPath);
  fs.writeFileSync(destPath, content);
  console.log(`\u2713 Installed: ${path.relative(ROOT, destPath)}`);
  return true;
}

function mergeConstantsBarrel() {
  const indexPath = path.join(SRC, 'constants', 'index.js');
  if (!fs.existsSync(indexPath)) {
    console.log('\u2298 Skipped constants merge (constants/index.js not found)');
    return true;
  }
  const content = fs.readFileSync(indexPath, 'utf8');
  if (content.includes("from './socket'")) {
    console.log('\u2298 constants/index.js already exports socket constants');
    return true;
  }
  const next = content.replace(
    "export { COLORS } from './colors';",
    "export { COLORS } from './colors';\nexport {\n  SOCKET_DEFAULTS,\n  SOCKET_EVENTS,\n  SOCKET_ALERTS,\n} from './socket';",
  );
  fs.writeFileSync(indexPath, next);
  console.log('\u2713 Updated: src/constants/index.js (socket exports)');
  return true;
}

function mergePathAliases() {
  const babelPath = path.join(ROOT, 'babel.config.js');
  if (fs.existsSync(babelPath)) {
    let content = fs.readFileSync(babelPath, 'utf8');
    if (!content.includes("'@services'")) {
      content = content.replace(
        "'@hooks': './src/hooks',",
        "'@hooks': './src/hooks',\n          '@services': './src/services',",
      );
      fs.writeFileSync(babelPath, content);
      console.log('\u2713 Updated: babel.config.js (@services alias)');
    }
  }

  const tsconfigPath = path.join(ROOT, 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    const content = fs.readFileSync(tsconfigPath, 'utf8');
    if (!content.includes('"@services/*"')) {
      const next = content.replace(
        '"@hooks/*": ["src/hooks/*"]',
        '"@hooks/*": ["src/hooks/*"],\n      "@services/*": ["src/services/*"]',
      );
      fs.writeFileSync(tsconfigPath, next);
      console.log('\u2713 Updated: tsconfig.json (@services path)');
    }
  }

  return true;
}

function mergeHooksBarrel() {
  const indexPath = path.join(SRC, 'hooks', 'index.js');
  if (!fs.existsSync(indexPath)) {
    console.log('\u2298 Skipped hooks merge (hooks/index.js not found)');
    return true;
  }
  const content = fs.readFileSync(indexPath, 'utf8');
  if (content.includes("from './useSocket'")) {
    console.log('\u2298 hooks/index.js already exports useSocket');
    return true;
  }
  const next = `${content.trim()}\nexport { useSocket } from './useSocket';\n`;
  fs.writeFileSync(indexPath, next);
  console.log('\u2713 Updated: src/hooks/index.js (useSocket export)');
  return true;
}

function mergeScreensBarrel(moduleName) {
  const barrelPath = path.join(SRC, 'screens', 'index.js');
  if (!fs.existsSync(barrelPath)) {
    console.log('\u2298 Skipped screens barrel (index.js not found)');
    return true;
  }
  const pascal = toPascalCase(moduleName);
  const content = fs.readFileSync(barrelPath, 'utf8');
  const importLine = `export { default as ${pascal} } from './${pascal}';`;
  if (content.includes(importLine)) {
    console.log(`\u2298 screens/index.js already exports ${pascal}`);
    return true;
  }
  fs.writeFileSync(barrelPath, `${content.trim()}\n${importLine}\n`);
  console.log(`\u2713 Updated: src/screens/index.js (${pascal} export)`);
  return true;
}

function mergeScreenNames(moduleName) {
  const indexPath = path.join(SRC, 'constants', 'index.js');
  if (!fs.existsSync(indexPath)) {
    return true;
  }
  const pascal = toPascalCase(moduleName);
  const key = pascal.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();
  const content = fs.readFileSync(indexPath, 'utf8');
  if (content.includes(`${key}:`)) {
    console.log(`\u2298 SCREEN_NAMES already has ${key}`);
    return true;
  }
  const next = content.replace(
    /(export const SCREEN_NAMES = \{[\s\S]*?)(\n};)/,
    `$1\n  ${key}: '${pascal}',$2`,
  );
  if (next === content) {
    console.log('\u2298 Could not auto-merge SCREEN_NAMES — add manually');
    return true;
  }
  fs.writeFileSync(indexPath, next);
  console.log(`\u2713 Updated: src/constants/index.js (SCREEN_NAMES.${key})`);
  return true;
}

function scaffoldModule(mode, moduleName) {
  if (!moduleName) {
    console.log('\u2298 Module name required for existing-module / new-module modes');
    return false;
  }

  const pascal = toPascalCase(moduleName);
  const camel = toCamelCase(moduleName);
  let ok = true;

  ok =
    copyModuleTemplate(
      'hooks/use__MODULE__Socket.js',
      `hooks/use${pascal}Socket.js`,
      moduleName,
    ) && ok;

  ok =
    copyModuleTemplate(
      'services/__module__.service.js',
      `services/${camel}.service.js`,
      moduleName,
    ) && ok;

  ok =
    copyModuleTemplate(
      'constants/__module__.js',
      `constants/${camel}.js`,
      moduleName,
    ) && ok;

  if (mode === 'new-module') {
    ok =
      copyModuleTemplate(
        'screens/__MODULE__/index.js',
        `screens/${pascal}/index.js`,
        moduleName,
      ) && ok;
    ok =
      copyModuleTemplate(
        'screens/__MODULE__/style.js',
        `screens/${pascal}/style.js`,
        moduleName,
      ) && ok;
    ok = mergeScreensBarrel(moduleName) && ok;
    ok = mergeScreenNames(moduleName) && ok;
  }

  return ok;
}

function runKeyboardLayoutSetup() {
  const scriptPath = path.join(ROOT, '.cursor', 'scripts', 'setup-keyboard-layout.js');
  if (!fs.existsSync(scriptPath)) {
    console.log('\u2298 Skipped keyboard layout setup (script not found)');
    return true;
  }
  try {
    const forceFlag = FORCE ? ' --force' : '';
    execSync(`node "${scriptPath}"${forceFlag}`, { cwd: ROOT, stdio: 'inherit' });
    return true;
  } catch {
    return false;
  }
}

function main() {
  console.log('\nsocket setup (WebSocket client) -> src/\n');
  console.log(`Mode: ${MODE}`);
  if (MODULE_RAW) {
    console.log(`Module: ${toPascalCase(MODULE_RAW)} (${toCamelCase(MODULE_RAW)})`);
  }

  let ok = runKeyboardLayoutSetup();
  for (const entry of COPY_MAP) {
    ok = copyFile(entry) && ok;
  }
  ok = mergeConstantsBarrel() && ok;
  ok = mergePathAliases() && ok;
  ok = mergeHooksBarrel() && ok;

  if (MODE === 'existing-module' || MODE === 'new-module') {
    ok = scaffoldModule(MODE, MODULE_RAW) && ok;
  }

  console.log('\n--- Next steps ---');
  console.log('1. Set SOCKET_URL in .env (e.g. wss://your-api.example.com/ws).');
  console.log('2. Register new screen route in AppRouteConfig.js (new-module mode).');
  console.log('3. Run agent Step 3b: verify chat uses ChatKeyboardLayout (keyboard-layout.mdc).');
  console.log('4. Add TITLES / TEST_IDS for the module; wire optional global FAB.');
  console.log(`5. Coding log: .cursor/logs/coding/coding-socket-${toKebabCase(MODULE_RAW || 'core')}.md\n`);

  if (!ok) {
    process.exit(1);
  }
}

main();
