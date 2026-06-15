# React Native Best Practices (Vibe Engineering)

**Full rule:** See `.cursor/rules/react-native.mdc` for complete guidelines (feature-first structure, TypeScript, ColorCode, FONTS, performance, accessibility). This file is a short reference.

**Project structure and coding standards:** See `.cursor/skills/react-native-architecture/SKILL.md` and `.cursor/rules/coding-standards.md`.

Applied by Coding and Figma agents.

## Performance

- **Lists:** FlashList/FlatList with estimatedItemSize; memo for list items.
- **Images:** FastImage for network images; preload when needed; defaultSource/onError.
- **Memoization:** memo, useCallback, useMemo for expensive renders and callbacks.
- **Navigation:** Avoid heavy work in focus/blur; lazy load screen content.

## Platform

- **Shadow:** iOS shadowColor/shadowOffset/shadowOpacity/shadowRadius; Android elevation.
- **Safe area:** SafeAreaView or react-native-safe-area-context.
- **Keyboard:** KeyboardAvoidingView where needed.

## Accessibility

- accessibilityLabel, accessibilityRole, accessibilityHint.
- Touch targets ≥ 44px.
- Support screen readers and reduce-motion where applicable.

## Design System

- Colors: ColorCode only (no hex in styles).
- Typography: FONTS (e.g. FONTS.textParagraph14, FONTS.headingH2Bold).
- Spacing: consistent scale (e.g. 8, 12, 16, 24); reuse from theme if present.

## Error Handling

- Optional chaining: `obj?.value`, `arr?.[0]`.
- Try/catch for async; user-facing error states.

Full structure and patterns: `.cursor/skills/react-native-architecture/SKILL.md`, `.cursor/rules/coding-standards.md`.
