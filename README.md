For React Native:
https://docs.google.com/document/d/1DB0if_g6tVlS1xhuW0uhhv3OoBF9yXhOKMyFjk00sQY/edit?tab=t.0#heading=h.oj34vq1p6br0

For Next JS:
https://docs.google.com/document/d/12rLzhaPYanMHOlRMxeJvsFF3KXl9EzZUhPzqNcAW0UM/edit?tab=t.0

This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Cursor AI Agent Systems

This repo ships two agentic "software factory" systems for Cursor. Each is a set of **12 specialized agents** that do one job, write their output to a file, then stop and hand off to the next agent (a human approves each step).

| System | Folder | Stack | E2E |
| ------ | ------ | ----- | --- |
| React Native | `.cursor/` | RN + TypeScript | Detox |
| Next.js | `.cursornext/` | Next.js + TypeScript | Playwright |

> **Quick start:** React Native cheat sheet → `.cursor/USAGE.md`; full guide → `.cursor/README.md`.

## Workflow (both systems)

```
@figma-analyzer → @planning-agent → @coding-agent → @documentation-agent
→ @testcases-agent → @e2e/detox-testing-agent → @fixing-agent
→ @code-scanning-agent → @vulnerability-agent → @pre-pr-validation-agent → @pr-orchestrator-agent
```

Minimum flow for a designed feature: `@figma-analyzer → @planning-agent → @coding-agent → @fixing-agent`.

## Agents (invoke with `@`)

| Agent | Invoke | Output |
| ----- | ------ | ------ |
| Project Scaffold | `@project-scaffold-agent` | New project + boilerplate |
| Prompt Generator | `@prompt-generator-agent` | Planning/project prompt |
| Figma Analyzer | `@figma-analyzer` | `cache/figma-specs-{feature}.md` + SVG/PNG export |
| Planning | `@planning-agent` | `logs/prd-{feature}-{ts}.md` |
| Coding | `@coding-agent` | Source + `logs/coding/coding-{feature}.md` |
| Documentation | `@documentation-agent` | Documented code |
| Test Cases | `@testcases-agent` | `logs/test-cases-{feature}.md` + Jest test |
| E2E Testing | `@detox-testing-agent` (RN) / `@e2e-testing-agent` (Next.js) | `logs/{e2e,detox}-testing/{feature}/{ts}/test-results.md` |
| Fixing | `@fixing-agent` | `logs/fixing/fixing-{feature}.md` |
| Code Scanning | `@code-scanning-agent` | `logs/code-scanning/...` |
| Vulnerability | `@vulnerability-agent` | `logs/vulnerability/...` |
| Pre-PR Validation | `@pre-pr-validation-agent` | READY / NOT READY report |
| PR Orchestrator | `@pr-orchestrator-agent` | `logs/pr/pr-{feature}-{ts}.md` |

## Rules (auto-applied by Cursor)

- **React Native** (`.cursor/rules/`): `agent-workflow-rules.mdc`, `react-native.mdc`, `figma-to-react-native.mdc`, `detox-testing.mdc`, `coding-standards.md`.
- **Next.js** (`.cursornext/rules/`): `agent-workflow-rules.mdc`, `nextjs.mdc`, `figma-to-nextjs.mdc`, `e2e-testing.mdc`, `coding-standards.md`.

## Reference docs

| Doc | Purpose |
| --- | ------- |
| `docs/DETOX-INTEGRATION.md` | RN Detox E2E setup (iOS + Android native wiring, troubleshooting, new-project checklist) |
| `.cursornext/docs/E2E-PLAYWRIGHT.md` | Next.js Playwright E2E setup (config, specs, troubleshooting, new-project checklist) |
| `.cursor/TOKEN-USAGE.md` | Tips to reduce Cursor token usage (incl. agent-system specifics) |
| `.cursor/USAGE.md` | One-page command cheat sheet |

## Scripts

**Detox artifacts** (`scripts/`):

```sh
node scripts/collect-detox-artifacts.js {feature}   # collect failure screenshots/videos → logs
```

**Figma export** (`.cursor/scripts/` and `.cursornext/scripts/`) — needs `FIGMA_ACCESS_TOKEN` (copy `.env.example` → `.env`):

```sh
node .cursor/scripts/export-figma-svg.js <nodeId> <name> [fileKey]
node .cursor/scripts/export-figma-png.js <nodeId> <android_name> <IosImageSet> [fileKey]
node .cursor/scripts/fetch-figma-nodes.js <fileKey> <nodeIds>
```

## E2E npm scripts

```sh
# React Native (Detox)
npm run e2e:build:android && npm run e2e:android   # emulator
npm run e2e:build:ios && npm run e2e:ios           # simulator
npm run e2e:android:attached                       # physical device

# Next.js (Playwright) — when used in a Next.js project
npm run e2e                                         # all specs
npx playwright test e2e/{feature}.spec.ts           # single spec
```

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
