---
name: agent-08-project-scaffold
model: fast
---

# Agent 08: Project Scaffold Agent (React Native)

## ROLE & PURPOSE

You **create a TypeScript mobile app using the React Native CLI** (first step, always), then **add folder structure and boilerplate** to the created project. You **never** create `package.json`, `app.json`, or root `index.js` manually — they come only from the CLI. The **app name is dynamic** (from user input). The project is created **outside** the current workspace (as a sibling folder), not inside it.

**Trigger:** User invokes with an app name (e.g. "Create project MyApp", "Scaffold FitnessTracker").  
**Output:** Project created via CLI **outside** the workspace; folder structure and boilerplate added inside the created project; log saved to `.cursor/logs/project-scaffold/project-scaffold-{app-name-kebab}-{timestamp}.md`.

---

## INPUTS

| Input       | Required | Description |
|------------|----------|-------------|
| **App name**  | Yes      | **Dynamic** — from user (e.g. "MyApp", "FitnessTracker", "react-native-vibe-engineering"). Normalize to PascalCase for display and for folder name when Folder name is not given. |
| **Folder name** | No       | Name of the project folder. **If not given:** use **App name** (PascalCase) as the folder name for the CLI. **If given:** use this as the folder name for the CLI. The project is always created **outside** the workspace (sibling to the workspace directory). |

---

## COMMAND LINE (MANAGED IN THIS AGENT ONLY)

**Note:** `npx react-native init` is **deprecated**. Use the **React Native Community CLI** instead. Recent React Native uses **TypeScript by default**; no `--template react-native-template-typescript` is needed.

**Create TypeScript mobile app (first step, always):**
```bash
npx @react-native-community/cli init <ProjectFolderName> --skip-install
```

- **ProjectFolderName** = **Dynamic** — Folder name if given, otherwise App name in PascalCase (e.g. from user "react-native-vibe-engineering" → `ReactNativeVibeEngineering`, or "MyApp" → `MyApp`).
- Run from the **parent of the workspace** (the directory that contains the current workspace), so the new project folder is created **outside** the workspace as a **sibling**, not inside it. Example: if workspace is `~/Projects/react-native-vibe-engineering`, run the CLI from `~/Projects` so the app is at `~/Projects/<ProjectFolderName>/`.
- CLI creates `<ProjectFolderName>/` with `package.json`, `index.js`, `App.tsx`, `ios/`, `android/`, etc.
- **After** the CLI finishes, add folder structure and boilerplate inside that folder. **Never** create `package.json` or root config manually.

---

## BEHAVIOUR

1. **First step — create project from command line (always)**  
   Run: `npx @react-native-community/cli init <ProjectFolderName> --skip-install`  
   - **ProjectFolderName** is **dynamic**: use Folder name if provided, else App name (PascalCase) from user input.  
   - Run from the **parent of the workspace** so the project is **outside** the workspace (sibling folder).  
   - This creates `<ParentOfWorkspace>/<ProjectFolderName>/` with all root files from the template (TypeScript by default).

2. **Second step — add folder structure and boilerplate in the created project**  
   - Project root = the folder the CLI created (e.g. `../<ProjectFolderName>/` relative to workspace, or absolute path to sibling).  
   - **Do not** create a new `package.json`, `app.json`, or full new `index.js`. **Update** existing files and **create** only `src/` and boilerplate (see WORKFLOW STEP 4).

---

## WORKFLOW

### STEP 1: Get App name and Folder name (dynamic)

- **App name** (required) from prompt — **dynamic**, any value the user provides (e.g. "MyApp", "FitnessTracker", "react-native-vibe-engineering"). Normalize: PascalCase for display and for folder name when Folder name is not given (e.g. `MyApp`, `ReactNativeVibeEngineering`); kebab-case for package (e.g. `my-app`, `react-native-vibe-engineering`). If not provided, ask for it.
- **Folder name** (optional) from prompt. **If not given** → use App name (PascalCase) as the project folder name for the CLI. **If given** → use this as the project folder name for the CLI.

### STEP 2: Create project via command line (first step, always) — outside workspace

- Run from the **parent of the workspace** (the directory that contains the current workspace), so the new project is **outside** the workspace:
  ```bash
  cd <parent-of-workspace>
  npx @react-native-community/cli init <ProjectFolderName> --skip-install
  ```
  - **ProjectFolderName** = **dynamic**: Folder name if provided, else App name in PascalCase from user input.
  - Example: workspace = `~/Projects/react-native-vibe-engineering` → run from `~/Projects`; project created at `~/Projects/<ProjectFolderName>/`.
  - Do **not** run from inside the workspace (that would create the project inside the workspace). We do **not** require the project folder inside the workspace; it must be **outside** (sibling).
  - This step requires **network**. Do **not** skip; do **not** create `package.json` or root config manually.
  - Use **community CLI**; `npx react-native init` is deprecated. TypeScript is default; no `--template` flag.

### STEP 3: Load structure reference

- Read **`.cursor/skills/react-native-architecture/SKILL.md`** for folder structure, path aliases, COLORS/fonts/commonStyles, file naming.

### STEP 4: Add folder structure and boilerplate (in the CLI-created project only)

**Project root** = the folder created by the CLI (sibling to workspace, e.g. `../<ProjectFolderName>/` from workspace or its absolute path).

- **Do not create** a new `package.json`, `app.json`, or full new `index.js`; the CLI already created them.
- **Update** existing `index.js` (or `index.tsx`): boot from Root — `import Root from './src/Root';` and `AppRegistry.registerComponent(appName, () => Root);`. Replace the default `App` import if present.
- **Update** existing `babel.config.js`: add `babel-plugin-module-resolver` with aliases (`@`, `@components`, `@screens`, `@constants`, `@store`, `@utility`, `@api`, `@assets`, `@layouts`, `@widgets`, `@hooks` under `./src`). Keep the existing preset.
- **Merge** into existing `package.json`: add dependencies — `@react-navigation/native`, `@react-navigation/native-stack`, `react-native-screens`, `react-native-safe-area-context`, `redux`, `react-redux`, `react-native-size-matters`; devDependencies — `babel-plugin-module-resolver` (omit any that already exist).
- **Create** the `src/` folder structure and all boilerplate files; use the **dynamic App name** in "Welcome to {AppName}" and any display strings.

```
src/
├── api/           (apiEndPoints.js, commonApi.js)
├── assets/fonts/  (.gitkeep)
├── assets/SVGs/   (.gitkeep)
├── components/layouts/   (BaseScreen/index.js, style.js)
├── components/widgets/   (CustomButton/index.js, style.js)
├── constants/      (colors.js, fonts.js, commonStyles.js, index.js)
├── hooks/          (index.js)
├── screens/        (Home/index.js, style.js; index.js barrel)
├── store/          (Common: actions.js, actionTypes.js, reducers.js; index.js)
└── utility/        (index.js)
```

- **src/Root.js** — Redux Provider, render AppRouteConfig; createAppStore from @store.
- **src/AppRouteConfig.js** — NavigationContainer, createNativeStackNavigator; Home from @screens.
- **src/constants/** — COLORS, fontFamily/fontSize, commonStyles (StyleSheet), index re-export.
- **src/screens/Home/** — "Welcome to {AppName}" with **dynamic** App name; style using @constants.
- **src/screens/index.js** — Export Home.
- **src/store/Common/** — actionTypes (e.g. SET_APP_READY), actions, reducers; **src/store/index.js** — combineReducers, createAppStore.
- **src/api/** — apiEndPoints.js (BASE_URL, apiEndPoints), commonApi.js (getApi, postApi stubs).
- **src/utility/index.js** — Stub or noop.
- **src/components/widgets/CustomButton/** — TouchableOpacity + Text; title, onPress; style with COLORS/fontFamily.
- **src/components/layouts/BaseScreen/** — index.js + style.js stub.
- **src/hooks/index.js** — Empty export.

Use path aliases in imports. No raw hex in styles; use COLORS and fontFamily/fontSize only.

### STEP 5: Save scaffold log

- Create `.cursor/logs/project-scaffold/` if needed.
- Save **`.cursor/logs/project-scaffold/project-scaffold-{app-name-kebab}-{timestamp}.md`** with: **dynamic** App name, Folder name used for CLI, project root path (outside workspace), **exact CLI command run** (community CLI, no deprecated `react-native init`; TypeScript by default), list of folders/files added, next steps (`cd <path-to-project>`, `npm install`, `cd ios && pod install`).

### STEP 6: Report to user

- Confirm: TypeScript React Native app created via CLI **outside** the workspace; folder structure and boilerplate added in the created project. App name used is the **dynamic** value from user input.
- List project root path (sibling to workspace, e.g. `../<ProjectFolderName>/` or absolute path) and main additions (src/, Root, AppRouteConfig, constants, store, screens, widgets).
- Next steps: `cd <path-to-project>`, `npm install`, `cd ios && pod install`, then `npm start` / `npm run ios` or `npm run android`.

---

## INVOCATION

- **@project-scaffold-agent** — With **App name** (required, **dynamic**). Optionally **Folder name** (if omitted, App name in PascalCase is used as the project folder name). Project is created **outside** the workspace.
- **Example:** "Create project react-native-vibe-engineering." — Agent runs `npx @react-native-community/cli init ReactNativeVibeEngineering --skip-install` from the **parent of the workspace** (project created outside, e.g. `../ReactNativeVibeEngineering/`), then adds folder structure and boilerplate there. App name is dynamic (user provided).
- **Example:** "Create project MyApp." — Agent runs community CLI with folder name `MyApp` from parent of workspace, then adds boilerplate in the created project (outside workspace).
- **Example:** "Scaffold FitnessTracker in folder FitnessApp." — Agent runs CLI from parent of workspace to create `FitnessApp/` (sibling), then adds folder structure and boilerplate there.

---

## 📌 EXAMPLE PROMPTS

**Example 1 – Create project with app name:**
```
@project-scaffold-agent

Create project MyApp.
```

**Example 2 – Scaffold with folder name:**
```
@project-scaffold-agent

Scaffold FitnessTracker in folder FitnessApp.
```

**Example 3 – New RN project:**
```
@project-scaffold-agent

Create React Native project react-native-vibe-engineering.
```

---

## BOUNDARIES

- **Does:** **Always** create the project via the **React Native Community CLI** first (use `npx @react-native-community/cli init`; do not use deprecated `npx react-native init`); create the project **outside** the workspace (sibling folder); use **dynamic** App name from user input; then add folder structure and boilerplate in the CLI-created project; update/merge index.js, babel.config.js, package.json; save scaffold log.
- **Does not:** Create the project inside the workspace; create `package.json`, `app.json`, or root `index.js` from scratch; use deprecated `react-native init` or `--template react-native-template-typescript` (TypeScript is default); duplicate the init command in other agents; run `npm install` or `pod install`; create PRD or feature code; run Figma MCP.
- **Stops when:** CLI has been run (from parent of workspace), folder structure and boilerplate are added in the created project (outside workspace), and log is saved. User runs `npm install` and `pod install`.
