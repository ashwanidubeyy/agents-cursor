#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const featureName = process.argv[2] || 'create-ticket';
const projectRoot = path.resolve(__dirname, '..');
const artifactsRoot = path.join(projectRoot, '.cursor/logs/detox-testing/artifacts');
const timestamp = new Date()
  .toISOString()
  .replace(/[-:]/g, '')
  .replace('T', '-')
  .slice(0, 15);
const resultsDir = path.join(
  projectRoot,
  '.cursor/logs/detox-testing',
  featureName,
  timestamp,
);
const screenshotsDir = path.join(resultsDir, 'screenshots');
const videosDir = path.join(resultsDir, 'videos');

const TC_PATTERN = /TC-\d{3}/;

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const getLatestRunDir = () => {
  if (!fs.existsSync(artifactsRoot)) {
    return null;
  }
  const runs = fs
    .readdirSync(artifactsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  if (runs.length === 0) {
    return null;
  }
  return path.join(artifactsRoot, runs[runs.length - 1]);
};

const extractTcId = (folderName) => {
  const match = folderName.match(TC_PATTERN);
  return match ? match[0] : null;
};

const copyFile = (source, destination) => {
  fs.copyFileSync(source, destination);
};

const collect = () => {
  ensureDir(screenshotsDir);
  ensureDir(videosDir);

  const runDir = getLatestRunDir();
  const collected = [];

  if (!runDir) {
    console.log('No Detox artifacts folder found. Skipping collection.');
    return collected;
  }

  const testFolders = fs
    .readdirSync(runDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory());

  testFolders.forEach((entry) => {
    const tcId = extractTcId(entry.name);
    if (!tcId) {
      return;
    }

    const folderPath = path.join(runDir, entry.name);
    const failurePng = path.join(folderPath, 'testFnFailure.png');
    const videoMp4 = path.join(folderPath, 'test.mp4');

    if (fs.existsSync(failurePng)) {
      const dest = path.join(screenshotsDir, `${tcId}.png`);
      copyFile(failurePng, dest);
      collected.push({ tcId, type: 'screenshot', path: dest });
    }

    if (fs.existsSync(videoMp4)) {
      const dest = path.join(videosDir, `${tcId}.mp4`);
      copyFile(videoMp4, dest);
      collected.push({ tcId, type: 'video', path: dest });
    }
  });

  fs.rmSync(artifactsRoot, { recursive: true, force: true });

  const summary = {
    feature: featureName,
    timestamp,
    runDir,
    collectedCount: collected.length,
    items: collected,
  };

  fs.writeFileSync(
    path.join(resultsDir, 'artifacts-manifest.json'),
    JSON.stringify(summary, null, 2),
  );

  console.log(`Collected ${collected.length} artifact(s) → ${resultsDir}`);
  return collected;
};

collect();
