#!/usr/bin/env node
/**
 * Install Connection Lost + Unauthorized error pages with global offline handling.
 *
 * Usage (from project root):
 *   node .cursor/scripts/setup-error-pages.js            # install (skip existing)
 *   node .cursor/scripts/setup-error-pages.js --force    # overwrite templates
 *
 * Copies:
 *   .cursor/setup/error-pages/** -> src/ (screens, layouts, hooks, utility)
 * Merges constants, screens barrel, Root.js (NetworkGate), AppRouteConfig.js
 * (navigationRef + Unauthorized route), and adds @react-native-community/netinfo.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SETUP = path.join(ROOT, '.cursor', 'setup', 'error-pages');
const SRC = path.join(ROOT, 'src');
const FORCE = process.argv.includes('--force');

const COPY_MAP = [
  {
    src: 'screens/ConnectionLost/index.js',
    dest: 'screens/ConnectionLost/index.js',
  },
  {
    src: 'screens/ConnectionLost/style.js',
    dest: 'screens/ConnectionLost/style.js',
  },
  {
    src: 'screens/Unauthorized/index.js',
    dest: 'screens/Unauthorized/index.js',
  },
  {
    src: 'screens/Unauthorized/style.js',
    dest: 'screens/Unauthorized/style.js',
  },
  {
    src: 'components/layouts/NetworkGate/index.js',
    dest: 'components/layouts/NetworkGate/index.js',
  },
  {
    src: 'hooks/useNetworkStatus.js',
    dest: 'hooks/useNetworkStatus.js',
  },
  {
    src: 'utility/navigationRef.js',
    dest: 'utility/navigationRef.js',
  },
  {
    src: 'utility/handleUnauthorized.js',
    dest: 'utility/handleUnauthorized.js',
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

function readErrorPagesConstants() {
  const constantsPath = path.join(SETUP, 'constants', 'errorPages.js');
  if (!fs.existsSync(constantsPath)) {
    return null;
  }
  delete require.cache[require.resolve(constantsPath)];
  return require(constantsPath);
}

function formatObjectLiteral(obj, indent = 2) {
  const pad = ' '.repeat(indent);
  const lines = Object.entries(obj).map(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return `${pad}${key}: {\n${formatObjectLiteral(value, indent + 2)}\n${pad}}`;
    }
    return `${pad}${key}: '${value}',`;
  });
  return lines.join('\n');
}

function mergeTitles() {
  const titlesPath = path.join(SRC, 'constants', 'titles.js');
  if (!fs.existsSync(titlesPath)) {
    console.log('\u2298 Skipped titles merge (titles.js not found)');
    return true;
  }
  const content = fs.readFileSync(titlesPath, 'utf8');
  if (content.includes('ERROR_PAGES:')) {
    console.log('\u2298 titles.js already has ERROR_PAGES');
    return true;
  }
  const ep = readErrorPagesConstants();
  if (!ep?.ERROR_PAGES_TITLES) {
    return false;
  }
  const block = `  ERROR_PAGES: {\n${formatObjectLiteral(ep.ERROR_PAGES_TITLES, 4)}\n  },`;
  const next = content.replace(/\n};\s*$/, `,\n${block}\n};`);
  if (next === content) {
    console.log('\u2298 Could not auto-merge ERROR_PAGES into titles.js — add manually');
    return true;
  }
  fs.writeFileSync(titlesPath, next);
  console.log('\u2713 Updated: src/constants/titles.js (ERROR_PAGES)');
  return true;
}

function mergeScreenNames() {
  const indexPath = path.join(SRC, 'constants', 'index.js');
  if (!fs.existsSync(indexPath)) {
    console.log('\u2298 Skipped SCREEN_NAMES merge (constants/index.js not found)');
    return true;
  }
  const content = fs.readFileSync(indexPath, 'utf8');
  if (content.includes('CONNECTION_LOST:') || content.includes('UNAUTHORIZED:')) {
    console.log('\u2298 SCREEN_NAMES already has error page routes');
    return true;
  }
  const ep = readErrorPagesConstants();
  if (!ep?.ERROR_PAGES_SCREEN_NAMES) {
    return false;
  }
  const entries = Object.entries(ep.ERROR_PAGES_SCREEN_NAMES)
    .map(([key, value]) => `  ${key}: '${value}',`)
    .join('\n');
  const next = content.replace(
    /(export const SCREEN_NAMES = \{[\s\S]*?)(\n};)/,
    `$1\n${entries}$2`,
  );
  if (next === content) {
    console.log('\u2298 Could not auto-merge SCREEN_NAMES — add manually');
    return true;
  }
  fs.writeFileSync(indexPath, next);
  console.log('\u2713 Updated: src/constants/index.js (SCREEN_NAMES)');
  return true;
}

function mergeTestIds() {
  const testIdsPath = path.join(SRC, 'constants', 'testIds.js');
  if (!fs.existsSync(testIdsPath)) {
    console.log('\u2298 Skipped TEST_IDS merge (testIds.js not found)');
    return true;
  }
  const content = fs.readFileSync(testIdsPath, 'utf8');
  if (content.includes('ERROR_PAGES:')) {
    console.log('\u2298 testIds.js already has ERROR_PAGES');
    return true;
  }
  const ep = readErrorPagesConstants();
  if (!ep?.ERROR_PAGES_TEST_IDS) {
    return false;
  }
  const block = `  ERROR_PAGES: {\n${formatObjectLiteral(ep.ERROR_PAGES_TEST_IDS, 4)}\n  },`;
  const next = content.replace(/\n};\s*$/, `,\n${block}\n};`);
  if (next === content) {
    console.log('\u2298 Could not auto-merge ERROR_PAGES into testIds.js — add manually');
    return true;
  }
  fs.writeFileSync(testIdsPath, next);
  console.log('\u2713 Updated: src/constants/testIds.js (ERROR_PAGES)');
  return true;
}

function mergeAlerts() {
  const alertsPath = path.join(SRC, 'constants', 'alerts.js');
  if (!fs.existsSync(alertsPath)) {
    console.log('\u2298 Skipped alerts merge (alerts.js not found)');
    return true;
  }
  const content = fs.readFileSync(alertsPath, 'utf8');
  if (content.includes('UNAUTHORIZED:')) {
    console.log('\u2298 alerts.js already has UNAUTHORIZED');
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
  console.log('\u2713 Updated: src/constants/alerts.js (UNAUTHORIZED)');
  return true;
}

function mergeScreensBarrel() {
  const barrelPath = path.join(SRC, 'screens', 'index.js');
  if (!fs.existsSync(barrelPath)) {
    console.log('\u2298 Skipped screens barrel (index.js not found)');
    return true;
  }
  const content = fs.readFileSync(barrelPath, 'utf8');
  let next = content;
  if (!content.includes("from './ConnectionLost'")) {
    next += "\nexport { default as ConnectionLost } from './ConnectionLost';\n";
  }
  if (!content.includes("from './Unauthorized'")) {
    next += "export { default as Unauthorized } from './Unauthorized';\n";
  }
  if (next !== content) {
    fs.writeFileSync(barrelPath, next);
    console.log('\u2713 Updated: src/screens/index.js (error page exports)');
  } else {
    console.log('\u2298 screens/index.js already exports error pages');
  }
  return true;
}

function patchRoot() {
  const rootPath = path.join(SRC, 'Root.js');
  if (!fs.existsSync(rootPath)) {
    console.log('\u2298 Skipped Root.js patch (not found)');
    return true;
  }
  let content = fs.readFileSync(rootPath, 'utf8');
  if (content.includes('NetworkGate')) {
    console.log('\u2298 Root.js already uses NetworkGate');
    return true;
  }
  if (!content.includes("import AppRouteConfig")) {
    console.log('\u2298 Root.js layout unexpected — patch manually');
    return true;
  }
  content = content.replace(
    "import AppRouteConfig from '@/AppRouteConfig';",
    "import AppRouteConfig from '@/AppRouteConfig';\nimport NetworkGate from '@layouts/NetworkGate';",
  );
  content = content.replace(
    '<AppRouteConfig />',
    '<NetworkGate>\n      <AppRouteConfig />\n    </NetworkGate>',
  );
  fs.writeFileSync(rootPath, content);
  console.log('\u2713 Updated: src/Root.js (NetworkGate wraps navigator)');
  return true;
}

function patchAppRouteConfig() {
  const routePath = path.join(SRC, 'AppRouteConfig.js');
  if (!fs.existsSync(routePath)) {
    console.log('\u2298 Skipped AppRouteConfig.js patch (not found)');
    return true;
  }
  let content = fs.readFileSync(routePath, 'utf8');
  if (content.includes('navigationRef')) {
    console.log('\u2298 AppRouteConfig.js already has navigationRef');
    return true;
  }
  content = content.replace(
    "import { SCREEN_NAMES } from '@constants';",
    "import { SCREEN_NAMES } from '@constants';\nimport { navigationRef } from '@utility/navigationRef';",
  );
  if (!content.includes('Unauthorized')) {
  content = content.replace(
    /import \{([^}]+)\} from '@screens';/,
    (match, names) => {
      const trimmed = names.trim();
      if (trimmed.includes('Unauthorized')) {
        return match;
      }
      return `import { ${trimmed}, Unauthorized } from '@screens';`;
    },
  );
  }
  content = content.replace(
    '<NavigationContainer>',
  '<NavigationContainer ref={navigationRef}>',
  );
  if (!content.includes('SCREEN_NAMES.UNAUTHORIZED')) {
    content = content.replace(
      '</Stack.Navigator>',
      `        <Stack.Screen name={SCREEN_NAMES.UNAUTHORIZED} component={Unauthorized} />\n      </Stack.Navigator>`,
    );
  }
  fs.writeFileSync(routePath, content);
  console.log('\u2713 Updated: src/AppRouteConfig.js (navigationRef + Unauthorized route)');
  return true;
}

function addNetInfoDependency() {
  const pkgPath = path.join(ROOT, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    console.log('\u2298 Skipped package.json (not found)');
    return true;
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const dep = '@react-native-community/netinfo';
  if (pkg.dependencies?.[dep]) {
    console.log('\u2298 package.json already has netinfo');
    return true;
  }
  pkg.dependencies = pkg.dependencies || {};
  pkg.dependencies[dep] = '^11.4.1';
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log('\u2713 Updated: package.json (@react-native-community/netinfo)');
  return true;
}

function main() {
  console.log('\nerror pages setup (Connection Lost + Unauthorized) -> src/\n');

  let ok = true;
  for (const entry of COPY_MAP) {
    ok = copyFile(entry) && ok;
  }
  ok = mergeTitles() && ok;
  ok = mergeScreenNames() && ok;
  ok = mergeTestIds() && ok;
  ok = mergeAlerts() && ok;
  ok = mergeScreensBarrel() && ok;
  ok = patchRoot() && ok;
  ok = patchAppRouteConfig() && ok;
  ok = addNetInfoDependency() && ok;

  console.log('\n--- Next steps ---');
  console.log('1. Run npm install (adds @react-native-community/netinfo).');
  console.log('2. cd ios && pod install');
  console.log('3. Wire fetch-client 401 interceptor: import { handleUnauthorized } from @utility/handleUnauthorized');
  console.log('4. Offline: NetworkGate shows ConnectionLost when NetInfo reports no connection.\n');

  if (!ok) {
    process.exit(1);
  }
}

main();
