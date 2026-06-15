#!/usr/bin/env node
/**
 * Export a Figma node as SVG to .cursor/cache/figma-svgs/{feature-name}/icon-back.svg
 * Loads FIGMA_ACCESS_TOKEN from .env in project root if the file exists.
 *
 * Usage:
 *   node .cursor/scripts/export-figma-svg.js <feature-name> <node-id> [file-key]
 *   (Ensure .env exists with FIGMA_ACCESS_TOKEN=your-token, or set env var.)
 * Example:
 *   node .cursor/scripts/export-figma-svg.js common-header 196:8815
 */

const fs = require('fs');
const path = require('path');

// Load .env from project root if it exists (no dotenv dependency)
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
const featureName = process.argv[2];
const nodeId = process.argv[3];
const fileKey = process.argv[4] || 'nY7625ccS767LrTVnELBzA';
const outFileName = process.argv[5] || 'icon-back.svg';

if (!token) {
  console.error('Missing FIGMA_ACCESS_TOKEN.');
  console.error('  1. Copy .env.example to .env and set FIGMA_ACCESS_TOKEN=your-token');
  console.error('  2. Or run: FIGMA_ACCESS_TOKEN=<token> node .cursor/scripts/export-figma-svg.js <feature> <node-id>');
  process.exit(1);
}
if (!featureName || !nodeId) {
  console.error('Usage: node .cursor/scripts/export-figma-svg.js <feature-name> <node-id> [file-key] [output-filename]');
  process.exit(1);
}

const outDir = path.join(process.cwd(), '.cursor', 'cache', 'figma-svgs', featureName);
const outPath = path.join(outDir, outFileName.replace(/\.svg$/i, '') === outFileName ? outFileName + '.svg' : outFileName);

async function run() {
  const url = `https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(nodeId)}&format=svg`;
  const res = await fetch(url, {
    headers: { 'X-Figma-Token': token },
  });
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
