#!/usr/bin/env node
/**
 * Install WebSocket client infrastructure and optional module scaffolding (Next.js).
 *
 * Usage (from project root):
 *   node .cursornext/scripts/setup-socket.js
 *   node .cursornext/scripts/setup-socket.js --force
 *   node .cursornext/scripts/setup-socket.js --mode=configure-only
 *   node .cursornext/scripts/setup-socket.js --mode=existing-module --module=Chat
 *   node .cursornext/scripts/setup-socket.js --mode=new-module --module=Chat
 *   SOCKET_TARGET=apps/web node .cursornext/scripts/setup-socket.js   # monorepo app
 *
 * Copies:
 *   .cursornext/setup/socket/** -> src/ (lib, hooks, services, constants)
 * With --mode=new-module, scaffolds feature + App Router page + route constant.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const KIT_DIR = path.resolve(__dirname, '..');
const SETUP = path.join(KIT_DIR, 'setup', 'socket');
const MODULE_TEMPLATES = path.join(SETUP, 'module-templates');
const FORCE = process.argv.includes('--force');
const TARGET = process.env.SOCKET_TARGET || '';
const TARGET_ROOT = TARGET ? path.join(ROOT, TARGET) : ROOT;
const SRC = path.join(TARGET_ROOT, 'src');

const MODE_ARG = process.argv.find((arg) => arg.startsWith('--mode='));
const MODULE_ARG = process.argv.find((arg) => arg.startsWith('--module='));
const MODE = MODE_ARG ? MODE_ARG.split('=')[1] : 'configure-only';
const MODULE_RAW = MODULE_ARG ? MODULE_ARG.split('=')[1] : '';

const COPY_MAP = [
  { src: 'lib/socketClient.ts', dest: 'lib/socketClient.ts' },
  { src: 'hooks/useSocket.ts', dest: 'hooks/useSocket.ts' },
  { src: 'services/socket.service.ts', dest: 'services/socket.service.ts' },
  { src: 'constants/socket.ts', dest: 'constants/socket.ts' },
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
      `\u2298 Skipped (exists): ${path.relative(TARGET_ROOT, destPath)} (use --force to overwrite)`,
    );
    return true;
  }
  ensureDir(destPath);
  fs.copyFileSync(srcPath, destPath);
  console.log(`\u2713 Installed: ${path.relative(TARGET_ROOT, destPath)}`);
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

function toScreamingSnake(value) {
  return toPascalCase(value)
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toUpperCase();
}

function applyModulePlaceholders(content, moduleName) {
  const pascal = toPascalCase(moduleName);
  const camel = toCamelCase(moduleName);
  const kebab = toKebabCase(moduleName);
  return content
    .replace(/__MODULE__/g, pascal)
    .replace(/__module__/g, camel)
    .replace(/__module-kebab__/g, kebab);
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
      `\u2298 Skipped (exists): ${path.relative(TARGET_ROOT, destPath)} (use --force to overwrite)`,
    );
    return true;
  }

  const raw = fs.readFileSync(srcPath, 'utf8');
  const content = applyModulePlaceholders(raw, moduleName);
  ensureDir(destPath);
  fs.writeFileSync(destPath, content);
  console.log(`\u2713 Installed: ${path.relative(TARGET_ROOT, destPath)}`);
  return true;
}

function mergeHooksBarrel() {
  const barrelPath = path.join(SRC, 'hooks', 'index.ts');
  const line = "export { useSocket } from './useSocket';";

  if (!fs.existsSync(barrelPath)) {
    ensureDir(barrelPath);
    fs.writeFileSync(barrelPath, `${line}\n`);
    console.log('\u2713 Created: src/hooks/index.ts (useSocket export)');
    return true;
  }

  const content = fs.readFileSync(barrelPath, 'utf8');
  if (content.includes('useSocket')) {
    console.log('\u2298 hooks/index.ts already exports useSocket');
    return true;
  }

  const next = content.endsWith('\n') ? `${content}${line}\n` : `${content}\n${line}\n`;
  fs.writeFileSync(barrelPath, next);
  console.log('\u2713 Updated: src/hooks/index.ts (useSocket export)');
  return true;
}

function mergeRoutes(moduleName) {
  const routesPath = path.join(SRC, 'constants', 'routes.ts');
  if (!fs.existsSync(routesPath)) {
    console.log('\u2298 Skipped routes merge (routes.ts not found)');
    return true;
  }

  const key = toScreamingSnake(moduleName);
  const route = `/${toKebabCase(moduleName)}`;
  const content = fs.readFileSync(routesPath, 'utf8');

  if (content.includes(`${key}:`)) {
    console.log(`\u2298 routes.ts already has ${key}`);
    return true;
  }

  const next = content.replace(
    /(export const ROUTES = \{[\s\S]*?)(\n};)/,
    `$1\n  ${key}: '${route}',$2`,
  );

  if (next === content) {
    console.log('\u2298 Could not auto-merge ROUTES — add manually');
    return true;
  }

  fs.writeFileSync(routesPath, next);
  console.log(`\u2713 Updated: src/constants/routes.ts (ROUTES.${key})`);
  return true;
}

function scaffoldModule(mode, moduleName) {
  if (!moduleName) {
    console.log('\u2298 Module name required for existing-module / new-module modes');
    return false;
  }

  const camel = toCamelCase(moduleName);
  const kebab = toKebabCase(moduleName);
  let ok = true;

  ok =
    copyModuleTemplate(
      'features/__module__/hooks/use__MODULE__Socket.ts',
      `features/${camel}/hooks/use${toPascalCase(moduleName)}Socket.ts`,
      moduleName,
    ) && ok;

  ok =
    copyModuleTemplate(
      'features/__module__/services/__module__.service.ts',
      `features/${camel}/services/${camel}.service.ts`,
      moduleName,
    ) && ok;

  ok =
    copyModuleTemplate(
      'features/__module__/constants/__module__.constants.ts',
      `features/${camel}/constants/${camel}.constants.ts`,
      moduleName,
    ) && ok;

  if (mode === 'new-module') {
    ok =
      copyModuleTemplate(
        'app/__module-kebab__/page.tsx',
        `app/${kebab}/page.tsx`,
        moduleName,
      ) && ok;
    ok =
      copyModuleTemplate(
        'app/__module-kebab__/styles.ts',
        `app/${kebab}/styles.ts`,
        moduleName,
      ) && ok;
    ok = mergeRoutes(moduleName) && ok;
  }

  return ok;
}

function addPackageScript() {
  const pkgPath = path.join(TARGET_ROOT, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    return true;
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.scripts = pkg.scripts || {};
  if (!pkg.scripts['setup:socket']) {
    pkg.scripts['setup:socket'] = 'node .cursor/scripts/setup-socket.js';
    fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
    console.log('\u2713 Updated: package.json (setup:socket script)');
  }
  return true;
}

function main() {
  const label = TARGET ? `${TARGET}/src` : 'src';
  console.log(`\nsocket setup (Next.js WebSocket) -> ${label}/\n`);
  console.log(`Mode: ${MODE}`);
  if (MODULE_RAW) {
    console.log(`Module: ${toPascalCase(MODULE_RAW)} (${toCamelCase(MODULE_RAW)})`);
  }

  if (!fs.existsSync(SRC)) {
    console.error(`\u2717 Missing src directory: ${SRC}`);
    process.exit(1);
  }

  let ok = true;
  for (const entry of COPY_MAP) {
    ok = copyFile(entry) && ok;
  }
  ok = mergeHooksBarrel() && ok;

  if (MODE === 'existing-module' || MODE === 'new-module') {
    ok = scaffoldModule(MODE, MODULE_RAW) && ok;
  }

  ok = addPackageScript() && ok;

  console.log('\n--- Next steps ---');
  console.log('1. Set NEXT_PUBLIC_SOCKET_URL in .env (e.g. wss://your-api.example.com/ws).');
  console.log('2. Wire useSocket or use{Module}Socket in the target page (Client Component).');
  console.log('3. Add i18n keys for socket alerts and module strings.');
  console.log(
    `4. Coding log: .cursornext/logs/coding/coding-socket-${toKebabCase(MODULE_RAW || 'core')}.md\n`,
  );

  if (!ok) {
    process.exit(1);
  }
}

main();
