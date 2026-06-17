#!/usr/bin/env node
/**
 * Export a Figma node as a raster image (PNG/WebP) into public/images/ for use with next/image.
 * Loads FIGMA_ACCESS_TOKEN from `.env` in project root if present.
 *
 * Usage: node .cursornext/scripts/export-figma-png.js <node-id> <output-name> <file-key> [scale]
 * Example: node .cursornext/scripts/export-figma-png.js 372:2801 hero-bg <fileKey> 2
 *
 * Output: public/images/<output-name>.png  (use via <Image src="/images/<output-name>.png" .../>)
 * If no project yet, falls back to .cursornext/cache/figma-images/<output-name>.png
 */

const fs = require('fs');
const path = require('path');

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
const nodeId = process.argv[2];
const outputName = process.argv[3]; // e.g. hero-bg (no extension)
const fileKey = process.argv[4];
const scale = process.argv[5] || '2';

if (!token || !nodeId || !outputName || !fileKey) {
  console.error('Usage: node .cursornext/scripts/export-figma-png.js <node-id> <output-name> <file-key> [scale]');
  process.exit(1);
}

const publicDir = path.join(process.cwd(), 'public', 'images');
const fallbackDir = path.join(process.cwd(), '.cursornext', 'cache', 'figma-images');
const targetDir = fs.existsSync(path.join(process.cwd(), 'public')) ? publicDir : fallbackDir;
const pngName = outputName.replace(/\.(png|webp|jpg|jpeg)$/i, '') + '.png';

async function run() {
  const url = `https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(nodeId)}&format=png&scale=${scale}`;
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
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) {
    console.error('Failed to fetch PNG:', imgRes.status);
    process.exit(1);
  }
  const buffer = Buffer.from(await imgRes.arrayBuffer());
  fs.mkdirSync(targetDir, { recursive: true });
  const outPath = path.join(targetDir, pngName);
  fs.writeFileSync(outPath, buffer);
  console.log('Exported:', outPath);
  if (targetDir === publicDir) {
    console.log('Use in code: <Image src="/images/' + pngName + '" width={...} height={...} alt="..." />');
  } else {
    console.log('No public/ dir found; saved to cache. Move to public/images/ in your Next.js project.');
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
