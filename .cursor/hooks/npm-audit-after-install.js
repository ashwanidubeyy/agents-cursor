#!/usr/bin/env node
/**
 * Cursor afterShellExecution hook.
 * Runs npm audit auto-fix after successful npm install / npm ci commands.
 */

const fs = require('fs');
const path = require('path');
const { runAutoFix, buildNotification } = require('../scripts/npm-audit-auto-fix');

const INSTALL_PATTERN = /(?:^|[;&|]\s*)npm\s+(?:install|i|ci)\b/i;

function readHookInput() {
  try {
    const raw = fs.readFileSync(0, 'utf8');
    if (!raw.trim()) {
      return {};
    }
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function resolveProjectRoot(input) {
  if (Array.isArray(input.workspace_roots) && input.workspace_roots[0]) {
    return path.resolve(input.workspace_roots[0]);
  }
  if (input.cwd) {
    return path.resolve(input.cwd);
  }
  return process.cwd();
}

function installFailed(output) {
  const text = String(output || '').toLowerCase();
  return (
    text.includes('npm err!') ||
    text.includes('command failed') ||
    text.includes('exit code 1') ||
    text.includes('eacces') ||
    text.includes('enoent')
  );
}

function main() {
  const input = readHookInput();
  const command = String(input.command || '');

  if (!INSTALL_PATTERN.test(command)) {
    process.stdout.write('{}\n');
    return;
  }

  if (installFailed(input.output)) {
    const reportDir = path.join(resolveProjectRoot(input), '.cursor', 'logs', 'vulnerability');
    fs.mkdirSync(reportDir, { recursive: true });
    const reportPath = path.join(reportDir, `npm-audit-auto-fix-skipped-${Date.now()}.md`);
    const report = [
      '# npm Audit Auto-Fix — Skipped',
      '',
      `- **Reason:** npm install command appears to have failed`,
      `- **Command:** \`${command}\``,
      `- **Date:** ${new Date().toISOString()}`,
      '',
      '## Terminal Output (truncated)',
      '',
      '```',
      String(input.output || '').slice(0, 8000),
      '```',
      '',
      'Auto-fix was not run because install did not complete successfully.',
    ].join('\n');
    fs.writeFileSync(reportPath, report, 'utf8');

    const context = [
      '⚠️ **npm Audit Auto-Fix skipped**',
      '',
      'The `npm install` command may have failed. Auto-fix was not run.',
      `Report: \`${reportPath}\``,
      '',
      'Review the install error, fix it, then run `@npm-audit-auto-fix-agent` if needed.',
    ].join('\n');

    process.stdout.write(`${JSON.stringify({ additional_context: context })}\n`);
    return;
  }

  const projectRoot = resolveProjectRoot(input);
  const result = runAutoFix({
    cwd: projectRoot,
    trigger: 'hook-after-npm-install',
    installCommand: command,
  });

  const notification = buildNotification(result);
  process.stdout.write(`${JSON.stringify({ additional_context: notification })}\n`);
}

main();
