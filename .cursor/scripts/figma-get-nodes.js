#!/usr/bin/env node
/**
 * Fetch Figma node(s) and write JSON to .cursor/cache/figma-node-{name}.json
 * Loads FIGMA_ACCESS_TOKEN from .env in project root if it exists.
 * Usage: node .cursor/scripts/figma-get-nodes.js <node-id> [file-key] [output-name]
 * Example: node .cursor/scripts/figma-get-nodes.js 196:8813 nY7625ccS767LrTVnELBzA common-header
 */
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  try {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
      const match = line.match(/^\s*([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = value;
      }
    });
  } catch (_) {}
}

const token = process.env.FIGMA_ACCESS_TOKEN || process.env.FIGMA_TOKEN;
const nodeId = process.argv[2];
const fileKey = process.argv[3] || 'nY7625ccS767LrTVnELBzA';
const outName = process.argv[4] || 'figma-node';

if (!token) {
  console.error('Missing FIGMA_ACCESS_TOKEN. Set in .env or env.');
  process.exit(1);
}
if (!nodeId) {
  console.error('Usage: node figma-get-nodes.js <node-id> [file-key] [output-name]');
  process.exit(1);
}

async function run() {
  const url = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`;
  const res = await fetch(url, { headers: { 'X-Figma-Token': token } });
  if (!res.ok) {
    console.error('Figma API error:', res.status, await res.text());
    process.exit(1);
  }
  const data = await res.json();
  const cacheDir = path.join(process.cwd(), '.cursor', 'cache');
  fs.mkdirSync(cacheDir, { recursive: true });
  const outPath = path.join(cacheDir, `${outName}.json`);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Written:', outPath);
}

run().catch((e) => { console.error(e); process.exit(1); });
