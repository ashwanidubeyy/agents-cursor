#!/usr/bin/env node
/**
 * Install Connection Lost + Unauthorized error pages for Next.js (App Router).
 *
 * Usage (from project root):
 *   node .cursornext/scripts/setup-error-pages.js
 *   node .cursornext/scripts/setup-error-pages.js --force
 *   ERROR_PAGES_TARGET=apps/web node .cursornext/scripts/setup-error-pages.js  # monorepo app
 *
 * Copies templates from .cursornext/setup/error-pages/ and merges constants,
 * commonSlice (isOnline), root layout (AppShell), and /unauthorized route.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const KIT_DIR = path.resolve(__dirname, '..');
const SETUP = path.join(KIT_DIR, 'setup', 'error-pages');
const FORCE = process.argv.includes('--force');
const TARGET = process.env.ERROR_PAGES_TARGET || '';
const TARGET_ROOT = TARGET ? path.join(ROOT, TARGET) : ROOT;
const SRC = path.join(TARGET_ROOT, 'src');

const COPY_MAP = [
  {
    src: 'components/layouts/ConnectionLost/index.tsx',
    dest: 'components/layouts/ConnectionLost/index.tsx',
  },
  {
    src: 'components/layouts/ConnectionLost/styles.ts',
    dest: 'components/layouts/ConnectionLost/styles.ts',
  },
  {
    src: 'components/layouts/Unauthorized/index.tsx',
    dest: 'components/layouts/Unauthorized/index.tsx',
  },
  {
    src: 'components/layouts/Unauthorized/styles.ts',
    dest: 'components/layouts/Unauthorized/styles.ts',
  },
  {
    src: 'components/layouts/NetworkGate/index.tsx',
    dest: 'components/layouts/NetworkGate/index.tsx',
  },
  {
    src: 'components/layouts/AppShell/index.tsx',
    dest: 'components/layouts/AppShell/index.tsx',
  },
  { src: 'hooks/useNetworkStatus.ts', dest: 'hooks/useNetworkStatus.ts' },
  { src: 'utils/handleUnauthorized.ts', dest: 'utils/handleUnauthorized.ts' },
  { src: 'app/unauthorized/page.tsx', dest: 'app/unauthorized/page.tsx' },
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

function readErrorPagesConstants() {
  const constantsPath = path.join(SETUP, 'constants', 'errorPages.ts');
  if (!fs.existsSync(constantsPath)) {
    return null;
  }
  delete require.cache[require.resolve(constantsPath)];
  return require(constantsPath);
}

function formatObjectLiteral(obj, indent = 2) {
  const pad = ' '.repeat(indent);
  return Object.entries(obj)
    .map(([key, value]) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return `${pad}${key}: {\n${formatObjectLiteral(value, indent + 2)}\n${pad}},`;
      }
      return `${pad}${key}: '${value}',`;
    })
    .join('\n');
}

function mergeTitles() {
  const titlesPath = path.join(SRC, 'constants', 'titles.ts');
  if (!fs.existsSync(titlesPath)) {
    console.log('\u2298 Skipped titles merge (titles.ts not found)');
    return true;
  }
  const content = fs.readFileSync(titlesPath, 'utf8');
  if (content.includes('ERROR_PAGES:')) {
    console.log('\u2298 titles.ts already has ERROR_PAGES');
    return true;
  }
  const ep = readErrorPagesConstants();
  if (!ep?.ERROR_PAGES_TITLES) {
    return false;
  }
  const block = `  ERROR_PAGES: {\n${formatObjectLiteral(ep.ERROR_PAGES_TITLES, 4)}\n  },`;
  const next = content.replace(/\n};\s*$/, `,\n${block}\n};\n`);
  if (next === content) {
    console.log('\u2298 Could not auto-merge ERROR_PAGES into titles.ts');
    return true;
  }
  fs.writeFileSync(titlesPath, next);
  console.log('\u2713 Updated: src/constants/titles.ts (ERROR_PAGES)');
  return true;
}

function mergeRoutes() {
  const routesPath = path.join(SRC, 'constants', 'routes.ts');
  if (!fs.existsSync(routesPath)) {
    console.log('\u2298 Skipped routes merge (routes.ts not found)');
    return true;
  }
  const content = fs.readFileSync(routesPath, 'utf8');
  if (content.includes('UNAUTHORIZED:')) {
    console.log('\u2298 routes.ts already has UNAUTHORIZED');
    return true;
  }
  const ep = readErrorPagesConstants();
  if (!ep?.ERROR_PAGES_ROUTES) {
    return false;
  }
  const entries = Object.entries(ep.ERROR_PAGES_ROUTES)
    .map(([key, value]) => `  ${key}: '${value}',`)
    .join('\n');
  const next = content.replace(/(export const ROUTES = \{[\s\S]*?)(\n};)/, `$1\n${entries}$2`);
  if (next === content) {
    console.log('\u2298 Could not auto-merge ROUTES — add manually');
    return true;
  }
  fs.writeFileSync(routesPath, next);
  console.log('\u2713 Updated: src/constants/routes.ts (error page routes)');
  return true;
}

function mergeTestIds() {
  const testIdsPath = path.join(SRC, 'constants', 'testIds.ts');
  if (!fs.existsSync(testIdsPath)) {
    console.log('\u2298 Skipped testIds merge (testIds.ts not found)');
    return true;
  }
  const content = fs.readFileSync(testIdsPath, 'utf8');
  if (content.includes('ERROR_PAGES:')) {
    console.log('\u2298 testIds.ts already has ERROR_PAGES');
    return true;
  }
  const ep = readErrorPagesConstants();
  if (!ep?.ERROR_PAGES_TEST_IDS) {
    return false;
  }
  const block = `  ERROR_PAGES: {\n${formatObjectLiteral(ep.ERROR_PAGES_TEST_IDS, 4)}\n  },`;
  const next = content.replace(/\n};\s*$/, `,\n${block}\n};\n`);
  if (next === content) {
    console.log('\u2298 Could not auto-merge ERROR_PAGES into testIds.ts');
    return true;
  }
  fs.writeFileSync(testIdsPath, next);
  console.log('\u2713 Updated: src/constants/testIds.ts (ERROR_PAGES)');
  return true;
}

function mergeAlerts() {
  const alertsPath = path.join(SRC, 'constants', 'alerts.ts');
  if (!fs.existsSync(alertsPath)) {
    console.log('\u2298 Skipped alerts merge (alerts.ts not found)');
    return true;
  }
  const content = fs.readFileSync(alertsPath, 'utf8');
  if (content.includes('UNAUTHORIZED:')) {
    console.log('\u2298 alerts.ts already has UNAUTHORIZED');
    return true;
  }
  const ep = readErrorPagesConstants();
  if (!ep?.ERROR_PAGES_ALERTS) {
    return false;
  }
  const unauthorized = ep.ERROR_PAGES_ALERTS.UNAUTHORIZED;
  const next = content.replace(
    /(export const ALERTS = \{)/,
    `$1\n  UNAUTHORIZED: '${unauthorized}',`,
  );
  fs.writeFileSync(alertsPath, next);
  console.log('\u2713 Updated: src/constants/alerts.ts (UNAUTHORIZED)');
  return true;
}

function mergeCommonSlice() {
  const slicePath = path.join(SRC, 'store', 'slices', 'commonSlice.ts');
  if (!fs.existsSync(slicePath)) {
    console.log('\u2298 Skipped commonSlice patch (not found)');
    return true;
  }
  let content = fs.readFileSync(slicePath, 'utf8');
  if (content.includes('isOnline')) {
    console.log('\u2298 commonSlice already has isOnline');
    return true;
  }

  content = content.replace(
    /initialState\s*=\s*\{/,
    'initialState = {\n  isOnline: true,',
  );

  if (!content.includes('setOnlineStatus')) {
    const reducerBlock = `
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },`;
    content = content.replace(/reducers:\s*\{/, `reducers: {${reducerBlock}`);
  }

  if (!content.includes('setOnlineStatus')) {
    content = content.replace(
      /export const \{([^}]+)\}/,
      (match, exports) => `export const {${exports.trim()}, setOnlineStatus }`,
    );
  } else if (!content.includes('export const {') || !content.match(/setOnlineStatus/)) {
    content = content.replace(
      /export const \{([^}]+)\} = commonSlice\.actions;/,
      (match, exports) => {
        if (exports.includes('setOnlineStatus')) {
          return match;
        }
        return `export const {${exports.trim()}, setOnlineStatus } = commonSlice.actions;`;
      },
    );
  }

  fs.writeFileSync(slicePath, content);
  console.log('\u2713 Updated: src/store/slices/commonSlice.ts (isOnline + setOnlineStatus)');
  return true;
}

function mergeHooksBarrel() {
  const barrelPath = path.join(SRC, 'hooks', 'index.ts');
  const line = "export { useNetworkStatus } from './useNetworkStatus';";
  if (!fs.existsSync(barrelPath)) {
    ensureDir(barrelPath);
    fs.writeFileSync(barrelPath, `${line}\n`);
    console.log('\u2713 Created: src/hooks/index.ts (useNetworkStatus export)');
    return true;
  }
  const content = fs.readFileSync(barrelPath, 'utf8');
  if (content.includes('useNetworkStatus')) {
    console.log('\u2298 hooks/index.ts already exports useNetworkStatus');
    return true;
  }
  const next = content.endsWith('\n') ? `${content}${line}\n` : `${content}\n${line}\n`;
  fs.writeFileSync(barrelPath, next);
  console.log('\u2713 Updated: src/hooks/index.ts (useNetworkStatus export)');
  return true;
}

function patchLayout() {
  const layoutPath = path.join(SRC, 'app', 'layout.tsx');
  if (!fs.existsSync(layoutPath)) {
    console.log('\u2298 Skipped layout.tsx patch (not found)');
    return true;
  }
  let content = fs.readFileSync(layoutPath, 'utf8');
  if (content.includes('AppShell')) {
    console.log('\u2298 layout.tsx already uses AppShell');
    return true;
  }

  if (!content.includes("import AppShell")) {
    content = content.replace(
      /(import .+ from ['"][^'"]+['"];?\n)/,
      `$1import AppShell from '@/components/layouts/AppShell';\n`,
    );
  }

  if (content.includes('{children}') && !content.includes('<AppShell>')) {
    content = content.replace('{children}', '<AppShell>{children}</AppShell>');
  }

  fs.writeFileSync(layoutPath, content);
  console.log('\u2713 Updated: src/app/layout.tsx (AppShell wraps children)');
  return true;
}

function addPackageScript() {
  const pkgPath = path.join(TARGET_ROOT, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    return true;
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.scripts = pkg.scripts || {};
  if (!pkg.scripts['setup:error-pages']) {
    pkg.scripts['setup:error-pages'] = 'node .cursor/scripts/setup-error-pages.js';
    fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
    console.log('\u2713 Updated: package.json (setup:error-pages script)');
  }
  return true;
}

function main() {
  const label = TARGET ? `${TARGET}/src` : 'src';
  console.log(`\nerror pages setup (Next.js) -> ${label}/\n`);

  if (!fs.existsSync(SRC)) {
    console.error(`\u2717 Missing src directory: ${SRC}`);
    process.exit(1);
  }

  let ok = true;
  for (const entry of COPY_MAP) {
    ok = copyFile(entry) && ok;
  }
  ok = mergeTitles() && ok;
  ok = mergeRoutes() && ok;
  ok = mergeTestIds() && ok;
  ok = mergeAlerts() && ok;
  ok = mergeCommonSlice() && ok;
  ok = mergeHooksBarrel() && ok;
  ok = patchLayout() && ok;
  ok = addPackageScript() && ok;

  console.log('\n--- Next steps ---');
  console.log('1. Ensure theme has COLORS + TYPOGRAPHY tokens used by error page styles.');
  console.log('2. Ensure @/widgets/Button supports title, onClick, testId props.');
  console.log('3. Wire fetch-client 401/403: import { handleUnauthorized } from @/utils/handleUnauthorized');
  console.log('4. Offline: AppShell + NetworkGate show ConnectionLost when navigator.onLine is false.\n');

  if (!ok) {
    process.exit(1);
  }
}

main();
