#!/usr/bin/env node
/**
 * Scaffold a pnpm workspace monorepo (apps + packages). No Turborepo by default.
 *
 * Usage (run from the repo that contains this kit; creates a sibling folder by default):
 *   MONOREPO_NAME=my-platform node .cursornext/scripts/setup-monorepo.js
 *   MONOREPO_NAME=my-platform MONOREPO_APPS=web,admin node .cursornext/scripts/setup-monorepo.js
 *   MONOREPO_NAME=my-platform USE_TURBO=true node .cursornext/scripts/setup-monorepo.js
 *   MONOREPO_NAME=my-platform MONOREPO_DIR=/path/to/parent node .cursornext/scripts/setup-monorepo.js
 *
 * Inside a generated monorepo the same script is exposed as `pnpm setup:monorepo`.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// This script lives inside the kit folder (e.g. `.cursornext/scripts/`).
// KIT_DIR is the kit folder itself; it is copied into each new repo as `.cursor`.
const KIT_DIR = path.resolve(__dirname, "..");
const REPO_ROOT = path.dirname(KIT_DIR);
const TEMPLATE_DIR = path.join(KIT_DIR, "setup", "monorepo");

const MONOREPO_NAME = process.env.MONOREPO_NAME || process.argv[2];
const APPS = (process.env.MONOREPO_APPS || "web").split(",").map((s) => s.trim());
const USE_TURBO = process.env.USE_TURBO === "true";
const PARENT_DIR = process.env.MONOREPO_DIR || path.dirname(REPO_ROOT);

function kebab(name) {
  return name
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  console.log(`✓ ${filePath}`);
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function replacePlaceholders(text, vars) {
  let out = text;
  for (const [key, val] of Object.entries(vars)) {
    out = out.replace(new RegExp(`{{${key}}}`, "g"), val);
  }
  return out;
}

function main() {
  if (!MONOREPO_NAME) {
    console.error(
      "Usage: MONOREPO_NAME=my-platform node .cursornext/scripts/setup-monorepo.js\n       MONOREPO_NAME=my-platform MONOREPO_APPS=web,admin node .cursornext/scripts/setup-monorepo.js"
    );
    process.exit(1);
  }

  const folderName = kebab(MONOREPO_NAME);
  const root = path.join(PARENT_DIR, folderName);
  const primaryApp = APPS[0];

  if (fs.existsSync(root)) {
    console.error(`✗ Already exists: ${root}`);
    process.exit(1);
  }

  console.log(`\nScaffolding monorepo: ${root}\nApps: ${APPS.join(", ")}\nTurbo: ${USE_TURBO}\n`);

  fs.mkdirSync(root, { recursive: true });
  fs.mkdirSync(path.join(root, "apps"), { recursive: true });
  fs.mkdirSync(path.join(root, "packages"), { recursive: true });

  const rootPkg = replacePlaceholders(
    fs.readFileSync(path.join(TEMPLATE_DIR, "root-package.json"), "utf8"),
    { MONOREPO_NAME: folderName, PRIMARY_APP: primaryApp }
  );
  write(path.join(root, "package.json"), rootPkg);
  fs.copyFileSync(
    path.join(TEMPLATE_DIR, "pnpm-workspace.yaml"),
    path.join(root, "pnpm-workspace.yaml")
  );
  console.log(`✓ ${path.join(root, "pnpm-workspace.yaml")}`);

  write(
    path.join(root, ".gitignore"),
    "node_modules\n.next\n.turbo\ndist\n.env\nplaywright-report\ntest-results\n"
  );
  write(
    path.join(root, ".env"),
    "# API (used by packages/lib-utils/src/lib/fetch-client.ts)\nNEXT_PUBLIC_API_BASE_URL=\n\n# Figma (optional)\nFIGMA_ACCESS_TOKEN=\n"
  );

  if (USE_TURBO) {
    write(
      path.join(root, "turbo.json"),
      JSON.stringify(
        {
          $schema: "https://turbo.build/schema.json",
          tasks: {
            build: { dependsOn: ["^build"], outputs: [".next/**", "dist/**"] },
            dev: { cache: false, persistent: true },
            lint: {},
            typecheck: {},
          },
        },
        null,
        2
      ) + "\n"
    );
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    pkg.scripts.dev = "turbo run dev --filter=" + primaryApp;
    pkg.scripts.build = "turbo run build";
    pkg.scripts.lint = "turbo run lint";
    pkg.scripts.typecheck = "turbo run typecheck";
    pkg.devDependencies = { ...(pkg.devDependencies || {}), turbo: "latest" };
    fs.writeFileSync(path.join(root, "package.json"), JSON.stringify(pkg, null, 2) + "\n");
  }

  const libPkgPath = path.join(root, "packages", "lib-utils");
  const uiPkgPath = path.join(root, "packages", "ui");
  fs.mkdirSync(path.join(libPkgPath, "src"), { recursive: true });
  fs.mkdirSync(path.join(uiPkgPath, "src", "components", "widgets", "Button"), {
    recursive: true,
  });

  fs.copyFileSync(
    path.join(TEMPLATE_DIR, "packages-lib-utils-package.json"),
    path.join(libPkgPath, "package.json")
  );
  fs.copyFileSync(
    path.join(TEMPLATE_DIR, "packages-ui-package.json"),
    path.join(uiPkgPath, "package.json")
  );
  write(
    path.join(libPkgPath, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2020",
          module: "ESNext",
          moduleResolution: "bundler",
          jsx: "react-jsx",
          strict: true,
          skipLibCheck: true,
          noEmit: true,
        },
        include: ["src"],
      },
      null,
      2
    ) + "\n"
  );
  write(
    path.join(uiPkgPath, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2020",
          module: "ESNext",
          moduleResolution: "bundler",
          jsx: "react-jsx",
          strict: true,
          skipLibCheck: true,
          noEmit: true,
        },
        include: ["src"],
      },
      null,
      2
    ) + "\n"
  );

  // Copy this kit into the new repo as a standard `.cursor` folder so the
  // generated project's own scripts (setup-useform, setup-example) resolve.
  copyDir(KIT_DIR, path.join(root, ".cursor"));

  for (const appName of APPS) {
    console.log(`\nCreating app: apps/${appName} ...`);
    execSync(
      `pnpm create next-app@latest ${appName} --ts --app --eslint --src-dir --import-alias "@/*" --use-pnpm --no-tailwind`,
      {
        cwd: path.join(root, "apps"),
        stdio: "inherit",
      }
    );

    const appRoot = path.join(root, "apps", appName);
    const appPkgPath = path.join(appRoot, "package.json");
    const appPkg = JSON.parse(fs.readFileSync(appPkgPath, "utf8"));
    appPkg.dependencies = {
      ...appPkg.dependencies,
      "@repo/ui": "workspace:*",
      "@repo/lib-utils": "workspace:*",
      "styled-components": "^6.1.0",
    };
    appPkg.name = appName;
    fs.writeFileSync(appPkgPath, JSON.stringify(appPkg, null, 2) + "\n");

    const nextConfigPath = fs.existsSync(path.join(appRoot, "next.config.ts"))
      ? path.join(appRoot, "next.config.ts")
      : path.join(appRoot, "next.config.mjs");
    if (fs.existsSync(nextConfigPath)) {
      let nc = fs.readFileSync(nextConfigPath, "utf8");
      if (!nc.includes("transpilePackages")) {
        nc = nc.replace(
          /const nextConfig\s*=\s*\{/,
          "const nextConfig = {\n  transpilePackages: ['@repo/ui'],"
        );
        nc = nc.replace(
          /export default nextConfig;/,
          "nextConfig.compiler = { styledComponents: true };\nexport default nextConfig;"
        );
        fs.writeFileSync(nextConfigPath, nc);
      }
    }
  }

  console.log("\nInstalling dependencies...");
  execSync("pnpm install", { cwd: root, stdio: "inherit" });

  console.log("\nInstalling useForm into packages/lib-utils...");
  execSync("node .cursor/scripts/setup-useform.js", {
    cwd: root,
    env: { ...process.env, USEFORM_TARGET: "packages/lib-utils" },
    stdio: "inherit",
  });

  console.log("\nInstalling fetch client into packages/lib-utils...");
  execSync("node .cursor/scripts/setup-fetch.js", {
    cwd: root,
    env: { ...process.env, FETCH_TARGET: "packages/lib-utils" },
    stdio: "inherit",
  });

  console.log(`\nInstalling example module into apps/${primaryApp}...`);
  execSync("node .cursor/scripts/setup-example.js", {
    cwd: root,
    env: { ...process.env, EXAMPLE_TARGET: `apps/${primaryApp}` },
    stdio: "inherit",
  });

  console.log("\n✅ Monorepo ready:", root);
  console.log("\nNext steps:");
  console.log(`  cd ${root}`);
  console.log("  pnpm dev");
  console.log("  @monorepo-scaffold-agent — for guided customization");
  console.log("  @project-scaffold-agent — for a single-app project instead\n");
}

main();
