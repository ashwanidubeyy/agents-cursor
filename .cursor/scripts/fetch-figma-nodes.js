#!/usr/bin/env node
/**
 * Fetch Figma node(s) and save document to .cursor/cache/{outfile}.
 * Usage: node .cursor/scripts/fetch-figma-nodes.js <fileKey> <nodeId> [outfile]
 * Example: node .cursor/scripts/fetch-figma-nodes.js LZ0lkhqnMQyLDJJRcWrgJW 12100:552 pdp-frame.json
 */
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
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
const fileKey = process.argv[2];
const nodeId = process.argv[3];
const outfile = process.argv[4] || 'frame.json';

if (!token || !fileKey || !nodeId) {
  console.error('Usage: node fetch-figma-nodes.js <fileKey> <nodeId> [outfile]');
  process.exit(1);
}

const cacheDir = path.join(process.cwd(), '.cursor', 'cache');
const outPath = path.join(cacheDir, outfile);

async function run() {
  const url = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`;
  const res = await fetch(url, { headers: { 'X-Figma-Token': token } });
  if (!res.ok) {
    console.error('Figma API error:', res.status, await res.text());
    process.exit(1);
  }
  const data = await res.json();
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Saved:', outPath);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
