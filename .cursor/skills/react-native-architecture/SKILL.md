# React Native Architecture Skill (Vibe Engineering)

Reference for Planning and Coding agents. Adapt paths to your project.

## App Structure

```
src/
├── api/                  # API clients and endpoints
│   ├── apiEndPoints.js
│   └── commonApi.js
├── AppRouteConfig.js      # Navigation: Stack + Tab navigators, screen registration
├── Root.js                # Root: Provider, KeyboardProvider, AppRouteConfig
├── assets/                # Fonts, SVGs (as components), images, gifs
│   ├── fonts/
│   └── SVGs/
├── components/
│   ├── layouts/          # Feature-specific layouts (Header, DeviceCard, modals, etc.)
│   │   └── ComponentName/
│   │       ├── index.js
│   │       └── style.js
│   └── widgets/          # Reusable UI (CustomButton, CustomInput, TitleText, etc.)
│       └── WidgetName/
│           ├── index.js
│           └── style.js
├── constants/            # Design system and app constants
│   ├── colors.js         # COLORS object (no hex in component styles)
│   ├── fonts.js          # fontFamily, fontSize
│   ├── commonStyles.js   # Shared StyleSheet (container, row, modal, etc.)
│   ├── alerts.js
│   ├── keys.js
│   ├── titles.js
│   ├── common.js         # screen dimensions, etc.
│   └── index.js          # Re-export all
├── hooks/                # Custom hooks (e.g. useDeviceSyncStatus)
├── screens/              # One folder per screen: index.js + style.js
│   ├── ScreenName/
│   │   ├── index.js
│   │   └── style.js
│   └── index.js          # Barrel: re-export all screens for AppRouteConfig
├── store/                # Redux by domain
│   ├── Auth/             # actions.js, actionTypes.js, reducers.js
│   ├── Common/
│   ├── Devices/
│   └── index.js          # combineReducers, appReducer
└── utility/              # Helpers (deviceDetailUtils, notificationUtils, index.js)
```

## Path Aliases (babel-plugin-module-resolver)

Use these in imports; do not use deep relative paths.

| Alias        | Path                    |
|-------------|-------------------------|
| `@`         | `./src`                 |
| `@components` | `./src/components`   |
| `@screens`  | `./src/screens`         |
| `@constants`| `./src/constants`       |
| `@store`    | `./src/store`           |
| `@utility`  | `./src/utility`        |
| `@api`      | `./src/api`             |
| `@assets`   | `./src/assets`          |
| `@layouts`  | `./src/components/layouts` |
| `@widgets`  | `./src/components/widgets` |

Example: `import { COLORS } from '@constants/colors';`  
Example: `import CustomButton from '@widgets/CustomButton';`  
Example: `import { login } from '@store/Auth/actions';`

## Design System

- **Colors:** Export a `COLORS` object from `constants/colors.js`. Use only `COLORS.xxx` in styles; no raw hex in component/style files.
- **Typography:** Export `fontFamily` and `fontSize` from `constants/fonts.js`. Use `fontFamily.MONTSERRAT_BOLD`, `fontSize._18`, etc. in styles; no hardcoded fontFamily/fontSize in components.
- **Shared styles:** `constants/commonStyles.js` — StyleSheet with shared keys (container, row, alignCenter, modalBg, safeAreaStyle, etc.). Use `commonStyles` + local `style.js` per component/screen.
- **Scaling:** Use `moderateScale` from `react-native-size-matters` for dimensions (padding, margin, fontSize, width, height) so UI scales across devices.
- **Shadows:** iOS: `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`; Android: `elevation`.

## File and Folder Conventions

- **Components/Screens:** One folder per component/screen. Default export from `index.js`; styles in `style.js` in the same folder. Import: `import Component from '@layouts/ComponentName';` or `import styles from './style';`.
- **Naming:** PascalCase for components/screens; camelCase for utilities and constants files. Style file: `style.js` (lowercase).
- **Store:** One folder per domain (e.g. Auth, Devices). Each has `actions.js`, `actionTypes.js`, `reducers.js`. Root store in `store/index.js` (combineReducers, optional appReducer for logout reset).

## Patterns

- Functional components + hooks only.
- State: `useState` (UI), Redux (shared/app state). Use path aliases for store imports.
- Lists: FlatList/FlashList; images: FastImage or Image with proper sizing.
- StyleSheet.create in `style.js`; use COLORS and fontFamily/fontSize from constants; use optional chaining (`COLORS?.primary`, `fontFamily?.MONTSERRAT_BOLD`).
- Error handling: optional chaining (`obj?.value`) when accessing nested or optional data.
- a11y: accessibilityLabel, accessibilityRole; touch targets ≥ 44px where possible.

## Navigation

- Single `AppRouteConfig.js`: NavigationContainer, createNativeStackNavigator, createBottomTabNavigator. Screens imported from `./screens` (barrel). Nested navigators (e.g. Settings stack) as needed.

## Figma → React Native

- Map Figma colors to COLORS tokens; map typography to fontFamily + fontSize.
- Use shadow (iOS) and elevation (Android).
- Save Figma specs to `.cursor/cache/figma-specs-{feature}.md` via Figma Analyzer.

Update this SKILL when your project structure or design system changes.
