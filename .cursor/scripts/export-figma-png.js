#!/usr/bin/env node
/**
 * Export a Figma node as PNG and place in Android drawable and iOS Images.xcassets.
 * Loads FIGMA_ACCESS_TOKEN from .env in project root if it exists.
 *
 * Usage: node .cursor/scripts/export-figma-png.js <node-id> <android-name> <ios-imageset-name> [file-key]
 * Example: node .cursor/scripts/export-figma-png.js 372:2801 login_bg LoginBg
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
const nodeId = process.argv[2];
const androidName = process.argv[3]; // e.g. login_bg (no extension)
const iosSetName = process.argv[4];  // e.g. LoginBg (Images.xcassets set name)
const fileKey = process.argv[5] || 'nY7625ccS767LrTVnELBzA';

if (!token || !nodeId || !androidName || !iosSetName) {
  console.error('Usage: node export-figma-png.js <node-id> <android-filename> <ios-imageset-name> [file-key]');
  process.exit(1);
}

const androidDir = path.join(process.cwd(), 'android', 'app', 'src', 'main', 'res', 'drawable');
const iosDir = path.join(process.cwd(), 'ios', 'ReactNativeEngineeringPoc', 'Images.xcassets', iosSetName + '.imageset');
const pngName = androidName.replace(/\.png$/i, '') + '.png';

async function run() {
  const url = `https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(nodeId)}&format=png&scale=2`;
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

  fs.mkdirSync(androidDir, { recursive: true });
  fs.writeFileSync(path.join(androidDir, pngName), buffer);
  console.log('Android:', path.join(androidDir, pngName));

  fs.mkdirSync(iosDir, { recursive: true });
  fs.writeFileSync(path.join(iosDir, pngName), buffer);
  const contents = {
    images: [
      { filename: pngName, idiom: 'universal', scale: '1x' },
      { idiom: 'universal', scale: '2x' },
      { idiom: 'universal', scale: '3x' }
    ],
    info: { author: 'xcode', version: 1 }
  };
  fs.writeFileSync(path.join(iosDir, 'Contents.json'), JSON.stringify(contents, null, 2));
  console.log('iOS:', iosDir);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
