#!/usr/bin/env node
/**
 * npm-audit-auto-fix.js
 * Scans npm dependencies for vulnerabilities and applies semver-safe fixes only.
 * Never uses `npm audit fix --force` (no breaking major upgrades).
 * Used by Agent 18 and the afterShellExecution hook.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SEVERITIES = ['critical', 'high', 'moderate', 'low', 'info'];

function parseArgs(argv) {
  const options = {
    cwd: process.cwd(),
    trigger: 'cli',
    installCommand: '',
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--cwd' && argv[i + 1]) {
      options.cwd = path.resolve(argv[i + 1]);
      i += 1;
    } else if (arg === '--trigger' && argv[i + 1]) {
      options.trigger = argv[i + 1];
      i += 1;
    } else if (arg === '--install-command' && argv[i + 1]) {
      options.installCommand = argv[i + 1];
      i += 1;
    }
  }

  return options;
}

function timestamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

function runCommand(command, cwd) {
  try {
    const output = execSync(command, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 20 * 1024 * 1024,
    });
    return { ok: true, code: 0, stdout: output, stderr: '' };
  } catch (error) {
    return {
      ok: false,
      code: typeof error.status === 'number' ? error.status : 1,
      stdout: error.stdout ? String(error.stdout) : '',
      stderr: error.stderr ? String(error.stderr) : String(error.message || 'Unknown error'),
    };
  }
}

function parseSemver(version) {
  const match = String(version || '')
    .trim()
    .replace(/^v/, '')
    .match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    return null;
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    raw: `${match[1]}.${match[2]}.${match[3]}`,
  };
}

function compareSemver(a, b) {
  if (a.major !== b.major) {
    return a.major - b.major;
  }
  if (a.minor !== b.minor) {
    return a.minor - b.minor;
  }
  return a.patch - b.patch;
}

function countVulnerabilities(auditJson) {
  const counts = { critical: 0, high: 0, moderate: 0, low: 0, info: 0, total: 0 };

  if (!auditJson || typeof auditJson !== 'object') {
    return counts;
  }

  const metadata = auditJson.metadata?.vulnerabilities;
  if (metadata && typeof metadata === 'object') {
    for (const severity of SEVERITIES) {
      counts[severity] = Number(metadata[severity] || 0);
    }
    counts.total = Number(metadata.total || 0);
    return counts;
  }

  const advisories = auditJson.vulnerabilities || {};
  for (const advisory of Object.values(advisories)) {
    const severity = String(advisory?.severity || 'info').toLowerCase();
    if (counts[severity] !== undefined) {
      counts[severity] += 1;
    } else {
      counts.info += 1;
    }
    counts.total += 1;
  }

  return counts;
}

function parseAudit(stdout) {
  if (!stdout || !stdout.trim()) {
    return null;
  }

  try {
    return JSON.parse(stdout);
  } catch {
    return null;
  }
}

function listAdvisories(auditJson, limit = 25) {
  if (!auditJson?.vulnerabilities) {
    return [];
  }

  return Object.values(auditJson.vulnerabilities)
    .slice(0, limit)
    .map((item) => ({
      name: item.name,
      severity: item.severity,
      title: item.title,
      via: Array.isArray(item.via)
        ? item.via
            .map((entry) => (typeof entry === 'string' ? entry : entry?.title || entry?.name))
            .filter(Boolean)
            .join('; ')
        : '',
      fixAvailable: item.fixAvailable,
      range: item.range,
    }));
}

function formatCounts(counts) {
  return `critical=${counts.critical}, high=${counts.high}, moderate=${counts.moderate}, low=${counts.low}, info=${counts.info}, total=${counts.total}`;
}

function readPackageJson(packageJsonPath) {
  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
}

function getDirectDependencyNames(packageJson) {
  return new Set([
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.devDependencies || {}),
    ...Object.keys(packageJson.optionalDependencies || {}),
  ]);
}

function getVulnerablePackageNames(auditJson) {
  if (!auditJson?.vulnerabilities) {
    return new Set();
  }
  return new Set(Object.keys(auditJson.vulnerabilities));
}

function collectSemverSafeFixes(auditJson) {
  const fixes = new Map();

  if (!auditJson?.vulnerabilities) {
    return fixes;
  }

  for (const [name, advisory] of Object.entries(auditJson.vulnerabilities)) {
    const fix = advisory?.fixAvailable;
    if (!fix) {
      continue;
    }

    if (fix === true) {
      continue;
    }

    if (typeof fix === 'object' && fix.version && fix.isSemVerMajor === false) {
      const pkgName = fix.name || name;
      const existing = fixes.get(pkgName);
      const next = parseSemver(fix.version);
      const prev = existing ? parseSemver(existing) : null;
      if (!next) {
        continue;
      }
      if (!prev || compareSemver(next, prev) > 0) {
        fixes.set(pkgName, fix.version);
      }
    }
  }

  return fixes;
}

function getInstalledVersion(packageName, cwd) {
  const result = runCommand(`npm ls ${packageName} --json --depth=0`, cwd);
  const json = parseAudit(result.stdout);
  if (!json) {
    return null;
  }

  const fromDependencies = (deps) => {
    if (!deps || typeof deps !== 'object') {
      return null;
    }
    if (deps[packageName]?.version) {
      return deps[packageName].version;
    }
    for (const dep of Object.values(deps)) {
      const nested = fromDependencies(dep?.dependencies);
      if (nested) {
        return nested;
      }
    }
    return null;
  };

  return (
    json.dependencies?.[packageName]?.version ||
    fromDependencies(json.dependencies) ||
    null
  );
}

function getLatestVersionInMajor(packageName, major, cwd) {
  const result = runCommand(`npm view ${packageName} versions --json`, cwd);
  const versions = parseAudit(result.stdout);
  if (!Array.isArray(versions)) {
    const single = runCommand(`npm view ${packageName} version --json`, cwd);
    const one = parseAudit(single.stdout);
    if (typeof one === 'string' && parseSemver(one)?.major === major) {
      return one;
    }
    return null;
  }

  const sameMajor = versions
    .map((version) => ({ version, parsed: parseSemver(version) }))
    .filter((entry) => entry.parsed && entry.parsed.major === major)
    .sort((a, b) => compareSemver(a.parsed, b.parsed));

  return sameMajor.length > 0 ? sameMajor[sameMajor.length - 1].version : null;
}

function installPackages(packages, cwd, actions, errors, label) {
  if (packages.size === 0) {
    return;
  }

  for (const [name, version] of packages) {
    const command = `npm install ${name}@${version}`;
    const result = runCommand(command, cwd);
    if (result.ok) {
      actions.push(`${label}: \`${command}\``);
    } else {
      errors.push(`${label} failed for ${name}@${version}: ${result.stderr.trim() || result.stdout.trim()}`);
    }
  }
}

function applySemverSafeFixes(auditJson, cwd, actions, errors) {
  const fixes = collectSemverSafeFixes(auditJson);
  installPackages(fixes, cwd, actions, errors, 'Applied semver-safe audit fix');
}

function upgradeDirectDepsToLatestMinor(auditJson, packageJsonPath, cwd, actions, errors) {
  const packageJson = readPackageJson(packageJsonPath);
  const directDeps = getDirectDependencyNames(packageJson);
  const vulnerable = getVulnerablePackageNames(auditJson);
  const upgrades = new Map();

  for (const name of vulnerable) {
    if (!directDeps.has(name)) {
      continue;
    }

    const installed = getInstalledVersion(name, cwd);
    const current = parseSemver(installed);
    if (!current) {
      continue;
    }

    const latest = getLatestVersionInMajor(name, current.major, cwd);
    const latestParsed = parseSemver(latest);
    if (!latestParsed || compareSemver(latestParsed, current) <= 0) {
      continue;
    }

    upgrades.set(name, latest);
  }

  installPackages(upgrades, cwd, actions, errors, 'Upgraded direct dependency to latest minor/patch');
}

function applySafeOverrides(auditJson, packageJsonPath, cwd, actions, errors) {
  const packageJson = readPackageJson(packageJsonPath);
  const directDeps = getDirectDependencyNames(packageJson);
  const fixes = collectSemverSafeFixes(auditJson);
  const overrides = { ...(packageJson.overrides || {}) };
  let changed = false;

  for (const [name, version] of fixes) {
    if (directDeps.has(name)) {
      continue;
    }
    if (overrides[name] === version) {
      continue;
    }
    overrides[name] = version;
    changed = true;
    actions.push(`Added safe override: \`${name}@${version}\` (same major, no breaking change).`);
  }

  if (!changed) {
    return;
  }

  packageJson.overrides = overrides;
  fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8');

  const installResult = runCommand('npm install', cwd);
  if (!installResult.ok) {
    errors.push(`npm install after overrides failed: ${installResult.stderr.trim() || installResult.stdout.trim()}`);
  } else {
    actions.push('Ran `npm install` to apply safe overrides.');
  }
}

function runAuditPass(cwd) {
  const audit = runCommand('npm audit --json', cwd);
  const json = parseAudit(audit.stdout);
  return { json, counts: countVulnerabilities(json) };
}

function buildReport({
  trigger,
  cwd,
  installCommand,
  beforeCounts,
  afterCounts,
  actions,
  errors,
  remainingAdvisories,
  reportPath,
}) {
  const lines = [
    '# npm Audit Auto-Fix Report',
    '',
    `- **Date:** ${new Date().toISOString()}`,
    `- **Trigger:** ${trigger}`,
    `- **Project:** \`${cwd}\``,
    `- **Strategy:** Semver-safe only (no \`npm audit fix --force\`)`,
  ];

  if (installCommand) {
    lines.push(`- **Install command:** \`${installCommand}\``);
  }

  lines.push(
    '',
    '## Summary',
    '',
    `- **Before:** ${formatCounts(beforeCounts)}`,
    `- **After:** ${formatCounts(afterCounts)}`,
    `- **Status:** ${afterCounts.total === 0 ? '✅ Vulnerability-free' : '⚠️ Remaining vulnerabilities'}`,
    '',
    '## Actions Taken',
    '',
  );

  if (actions.length === 0) {
    lines.push('- No fix actions were required.');
  } else {
    for (const action of actions) {
      lines.push(`- ${action}`);
    }
  }

  lines.push('', '## Errors', '');
  if (errors.length === 0) {
    lines.push('- None');
  } else {
    for (const error of errors) {
      lines.push(`- ${error}`);
    }
  }

  lines.push('', '## Remaining Advisories', '');
  if (remainingAdvisories.length === 0) {
    lines.push('- None');
  } else {
    for (const advisory of remainingAdvisories) {
      const fixNote =
        advisory.fixAvailable && typeof advisory.fixAvailable === 'object' && advisory.fixAvailable.isSemVerMajor
          ? ' (requires major upgrade — not auto-applied)'
          : '';
      lines.push(
        `- **${advisory.name}** (${advisory.severity}): ${advisory.title}${advisory.via ? ` — ${advisory.via}` : ''}${fixNote}`,
      );
    }
  }

  lines.push('', '## Next Steps', '');
  if (afterCounts.total === 0) {
    lines.push('- No action required. Dependencies are vulnerability-free.');
  } else {
    lines.push(
      '- Invoke `@npm-audit-auto-fix-agent` for manual review of remaining advisories.',
      '- Review lockfile changes before committing.',
      '- Major-version upgrades are **not** applied automatically to avoid breaking features.',
      '- If a major upgrade is required, evaluate compatibility and test thoroughly before applying manually.',
    );
  }

  lines.push('', '---', `Report file: \`${reportPath}\``);
  return `${lines.join('\n')}\n`;
}

function getKitDir() {
  return path.basename(path.dirname(__dirname));
}

function ensureReportDir(cwd) {
  const reportDir = path.join(cwd, getKitDir(), 'logs', 'vulnerability');
  fs.mkdirSync(reportDir, { recursive: true });
  return reportDir;
}

function writeReport(result, options, reportName) {
  const reportDir = ensureReportDir(options.cwd);
  result.reportPath = path.join(reportDir, reportName);
  fs.writeFileSync(
    result.reportPath,
    buildReport({
      trigger: options.trigger,
      cwd: options.cwd,
      installCommand: options.installCommand,
      beforeCounts: result.beforeCounts,
      afterCounts: result.afterCounts,
      actions: result.actions,
      errors: result.errors,
      remainingAdvisories: result.remainingAdvisories,
      reportPath: result.reportPath,
    }),
    'utf8',
  );
}

function applySafeRemediationSteps(options, result, auditJson) {
  const packageJsonPath = path.join(options.cwd, 'package.json');

  const fixResult = runCommand('npm audit fix', options.cwd);
  result.actions.push('Ran `npm audit fix` (semver-compatible fixes only).');
  if (!fixResult.ok && fixResult.stderr) {
    result.errors.push(`npm audit fix stderr: ${fixResult.stderr.trim()}`);
  }

  let pass = runAuditPass(options.cwd);
  if (pass.counts.total === 0) {
    return pass;
  }

  const updateResult = runCommand('npm update', options.cwd);
  result.actions.push('Ran `npm update` to pull latest minor/patch within declared ranges.');
  if (!updateResult.ok && updateResult.stderr) {
    result.errors.push(`npm update stderr: ${updateResult.stderr.trim()}`);
  }

  pass = runAuditPass(options.cwd);
  if (pass.counts.total === 0) {
    return pass;
  }

  applySemverSafeFixes(pass.json, options.cwd, result.actions, result.errors);
  pass = runAuditPass(options.cwd);
  if (pass.counts.total === 0) {
    return pass;
  }

  upgradeDirectDepsToLatestMinor(pass.json, packageJsonPath, options.cwd, result.actions, result.errors);
  pass = runAuditPass(options.cwd);
  if (pass.counts.total === 0) {
    return pass;
  }

  applySafeOverrides(pass.json, packageJsonPath, options.cwd, result.actions, result.errors);
  return runAuditPass(options.cwd);
}

function runAutoFix(options) {
  const result = {
    success: false,
    cwd: options.cwd,
    trigger: options.trigger,
    installCommand: options.installCommand || '',
    beforeCounts: { critical: 0, high: 0, moderate: 0, low: 0, info: 0, total: 0 },
    afterCounts: { critical: 0, high: 0, moderate: 0, low: 0, info: 0, total: 0 },
    actions: [],
    errors: [],
    remainingAdvisories: [],
    reportPath: '',
    message: '',
  };

  const packageJsonPath = path.join(options.cwd, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    result.errors.push('package.json not found in project root. Skipping npm audit auto-fix.');
    result.message = result.errors[0];
    return result;
  }

  const npmCheck = runCommand('npm --version', options.cwd);
  if (!npmCheck.ok) {
    result.errors.push(`npm is not available: ${npmCheck.stderr.trim()}`);
    result.message = result.errors[0];
    return result;
  }

  const initialPass = runAuditPass(options.cwd);
  const initialJson = initialPass.json;

  if (!initialJson) {
    result.errors.push('Failed to parse npm audit output.');
    const initialAudit = runCommand('npm audit --json', options.cwd);
    if (initialAudit.stderr) {
      result.errors.push(initialAudit.stderr.trim());
    }
    if (initialAudit.stdout) {
      result.errors.push(initialAudit.stdout.trim().slice(0, 2000));
    }
    result.message = 'npm audit failed. See report for error log.';
    writeReport(result, options, `npm-audit-auto-fix-error-${timestamp()}.md`);
    return result;
  }

  result.beforeCounts = initialPass.counts;

  if (result.beforeCounts.total === 0) {
    result.afterCounts = result.beforeCounts;
    result.success = true;
    result.actions.push('npm audit — no vulnerabilities found.');
    result.message = 'No vulnerabilities found after install.';
    writeReport(result, options, `npm-audit-auto-fix-${timestamp()}.md`);
    return result;
  }

  result.actions.push(`Found vulnerabilities before fix: ${formatCounts(result.beforeCounts)}.`);

  const finalPass = applySafeRemediationSteps(options, result, initialJson);
  result.afterCounts = finalPass.counts;
  result.remainingAdvisories = listAdvisories(finalPass.json);
  result.success = result.afterCounts.total === 0;

  if (result.afterCounts.total === 0) {
    result.message = 'All vulnerabilities were fixed using semver-safe upgrades.';
  } else {
    result.message = `Remaining vulnerabilities after semver-safe auto-fix: ${formatCounts(result.afterCounts)}.`;
    result.errors.push(
      `${result.afterCounts.total} vulnerabilities require manual review (may need major upgrades).`,
    );
  }

  const reportName =
    result.success && result.errors.length === 0
      ? `npm-audit-auto-fix-${timestamp()}.md`
      : `npm-audit-auto-fix-${result.success ? 'partial' : 'error'}-${timestamp()}.md`;
  writeReport(result, options, reportName);

  return result;
}

function buildNotification(result) {
  const statusIcon = result.success && result.errors.length === 0 ? '✅' : '⚠️';
  const lines = [
    `${statusIcon} **npm Audit Auto-Fix** (${result.trigger})`,
    '',
    `- Strategy: semver-safe only (no \`--force\`)`,
    `- Before: ${formatCounts(result.beforeCounts)}`,
    `- After: ${formatCounts(result.afterCounts)}`,
    `- Report: \`${result.reportPath}\``,
    `- Message: ${result.message}`,
  ];

  if (result.errors.length > 0) {
    lines.push('', '**Errors / warnings:**');
    for (const error of result.errors) {
      lines.push(`- ${error}`);
    }
    lines.push('', 'Invoke `@npm-audit-auto-fix-agent` for manual remediation.');
  }

  return lines.join('\n');
}

if (require.main === module) {
  const options = parseArgs(process.argv);
  const result = runAutoFix(options);
  const payload = {
    ...result,
    notification: buildNotification(result),
  };
  process.stdout.write(`${JSON.stringify(payload)}\n`);
  process.exit(result.success && result.errors.length === 0 ? 0 : 1);
}

module.exports = {
  runAutoFix,
  buildNotification,
  countVulnerabilities,
  collectSemverSafeFixes,
  parseSemver,
};
