# Coding Standards (React Native Vibe Engineering)

Use in conjunction with agent-workflow and figma-to-react-native rules.

## General

- Self-documenting names; clear comments for complex logic; small, focused functions.
- DRY: extract to utility, components (widgets/layouts); reuse COLORS, fonts, commonStyles from constants.
- Error handling: use optional chaining (`obj?.value`, `COLORS?.primary`) for safe access.
- Import order: React/RN → third-party → aliased modules (@constants, @store, @layouts, @widgets, @api, @utility) → relative (./style).

## Project Structure

- **src/api** — API clients and endpoints.
- **src/components/layouts** — Feature-specific layouts (modals, cards, headers).
- **src/components/widgets** — Reusable UI (CustomButton, CustomInput, TitleText).
- **src/constants** — colors.js (COLORS), fonts.js (fontFamily, fontSize), commonStyles.js, **titles.js** (TITLES), **alerts.js** (ALERTS), keys.
- **src/screens** — One folder per screen: index.js + style.js; barrel index.js for AppRouteConfig.
- **src/store** — Redux by domain: Auth, Common, Devices, etc.; each with actions.js, actionTypes.js, reducers.js.
- **src/utility** — Helpers; re-export via index.js.
- **AppRouteConfig.js** — Navigation (Stack/Tab); **Root.js** — Provider, AppRouteConfig.

## Path Aliases

Use aliases instead of deep relative paths: `@constants`, `@store`, `@layouts`, `@widgets`, `@api`, `@assets`, `@utility`, `@screens`, `@components`. Example: `import { COLORS } from '@constants/colors';` `import CustomButton from '@widgets/CustomButton';`

## File Naming

- Components/Screens: PascalCase folder and component name (e.g. `Login/`, `CustomButton/`).
- Entry file: `index.js`; co-located styles: `style.js` (lowercase).
- Utilities/constants: camelCase (e.g. `colors.js`, `commonStyles.js`, `deviceDetailUtils.js`).

## Components and Screens

- Functional components with hooks only.
- One component per folder: `ComponentName/index.js` (default export) + `ComponentName/style.js`. Import styles: `import styles from './style';`
- Use `StyleSheet.create` in style.js; reference COLORS and fontFamily/fontSize from constants only (no hardcoded hex or font names in components).
- Use `moderateScale` (react-native-size-matters) for padding, margin, fontSize, and dimensions so layout scales.
- Accessibility: accessibilityLabel, accessibilityRole; touch targets ≥ 44px.

## Styles

- Colors: always `COLORS.xxx` from `@constants/colors` (e.g. `COLORS.primary`, `COLORS.screenBGColor`). No raw hex in style files.
- Typography: `fontFamily` and `fontSize` from `@constants/fonts` (e.g. `fontFamily.MONTSERRAT_BOLD`, `fontSize._18`). Use optional chaining in styles: `fontFamily?.MONTSERRAT_BOLD`.
- Shared layout/visual patterns: use `commonStyles` from `@constants/commonStyles` (e.g. container, row, alignCenter, modalBg).
- Shadows: iOS — shadowColor, shadowOffset, shadowOpacity, shadowRadius; Android — elevation.

## Static Text and Alerts

- **Static text:** All static UI copy (screen titles, headings, labels, placeholders, button labels, accessibility strings) must live in **`src/constants/titles.js`** (export `TITLES`). Group by screen or feature (e.g. `TITLES.forgotPassword`, `TITLES.home`). Import from `@constants/titles` or `@constants`; **no hardcoded copy** in components or screens.
- **Alert/error messages:** All user-facing alert and error messages (inline validation errors, `Alert.alert()` text, toast messages) must live in **`src/constants/alerts.js`** (export `ALERTS`). Group by screen or feature (e.g. `ALERTS.forgotPassword`, `ALERTS.generic`). Import from `@constants/alerts` or `@constants`; **no hardcoded alert/error strings** in components or screens.

## State

- Local state (useState) for UI-only.
- Redux for shared/persisted state; domain folders under store (actions, actionTypes, reducers). Use aliases: `import { login } from '@store/Auth/actions';`

## Lists and Images

- Use FlatList or FlashList for lists (avoid ScrollView + map for long lists).
- Use FastImage for network images when available; handle loading and error states.

## Redux Slice Pattern

- Per domain: `actions.js`, `actionTypes.js`, `reducers.js`. Root: `store/index.js` combines reducers; optional appReducer for global reset (e.g. logout).

For full structure and path aliases, see `.cursor/skills/react-native-architecture/SKILL.md`.
