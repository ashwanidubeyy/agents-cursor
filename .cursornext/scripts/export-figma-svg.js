#!/usr/bin/env node
/**
 * Export a Figma node as SVG to .cursornext/cache/figma-svgs/{feature-name}/{out}.svg
 * Loads FIGMA_ACCESS_TOKEN from `.env` in project root if present.
 *
 * Usage:
 *   node .cursornext/scripts/export-figma-svg.js <feature-name> <node-id> [file-key] [output-filename]
 *   (Ensure `.env` exists with FIGMA_ACCESS_TOKEN=your-token, or set env var.)
 * Example:
 *   node .cursornext/scripts/export-figma-svg.js app-header 196:8815 <fileKey> icon-back.svg
 *
 * After export, copy the SVG into src/assets/icons/ (as a React component / via SVGR)
 * or public/ for direct <img>/next/image usage.
 */

const fs = require('fs');
const path = require('path');

// Load `.env` from project root if present (no dotenv dependency)
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  try {
    fs.readFileSync(envPath, "utf8").split("\n").forEach((line) => {
      const match = line.match(/^\s*([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = value;
      }
    });
  } catch (_) {}
}

const token = process.env.FIGMA_ACCESS_TOKEN || process.env.FIGMA_TOKEN;
const featureName = process.argv[2];
const nodeId = process.argv[3];
const fileKey = process.argv[4];
const outFileName = process.argv[5] || 'icon.svg';

if (!token) {
  console.error('Missing FIGMA_ACCESS_TOKEN.');
  console.error('  1. Create `.env` in the project root and set FIGMA_ACCESS_TOKEN=your-token');
  console.error('  2. Or run: FIGMA_ACCESS_TOKEN=<token> node .cursornext/scripts/export-figma-svg.js <feature> <node-id> <file-key>');
  process.exit(1);
}
if (!featureName || !nodeId || !fileKey) {
  console.error('Usage: node .cursornext/scripts/export-figma-svg.js <feature-name> <node-id> <file-key> [output-filename]');
  process.exit(1);
}

const outDir = path.join(process.cwd(), '.cursornext', 'cache', 'figma-svgs', featureName);
const outPath = path.join(outDir, /\.svg$/i.test(outFileName) ? outFileName : outFileName + '.svg');

async function run() {
  const url = `https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(nodeId)}&format=svg`;
  const res = await fetch(url, { headers: { 'X-Figma-Token': token } });
  if (!res.ok) {
    console.error('Figma API error:', res.status, await res.text());
    process.exit(1);
  }
  const data = await res.json();
  const imageUrl = data?.images?.[nodeId];
  if (!imageUrl) {
    console.error('No image URL for node', nodeId, data);
    process.exit(1);
  }
  const svgRes = await fetch(imageUrl);
  if (!svgRes.ok) {
    console.error('Failed to fetch SVG:', svgRes.status);
    process.exit(1);
  }
  const svg = await svgRes.text();
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, svg, 'utf8');
  console.log('Exported:', outPath);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
