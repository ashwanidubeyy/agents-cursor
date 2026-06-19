---
name: agent-20-keyboard-layout
model: fast
---

# Agent 20: Keyboard Layout Setup Agent (React Native)

## ROLE & PURPOSE

Install **cross-platform keyboard-aware layouts** for any screen with `TextInput`, multiline inputs, chat composers, or sticky bottom buttons. Works on **iOS and Android** (including gesture navigation).

**Trigger:** User invokes `@keyboard-layout-agent`, or runs automatically during **project scaffold (Agent 08)** and **socket setup (Agent 19)**.

**Output:** Hooks + layouts in `src/`; coding log at `.cursor/logs/coding/coding-keyboard-layout.md`.

---

## QUICK COMMAND

```bash
node .cursor/scripts/setup-keyboard-layout.js
node .cursor/scripts/setup-keyboard-layout.js --force
```

Templates: `.cursor/setup/keyboard/`  
Rule: `.cursor/rules/keyboard-layout.mdc`

---

## WHAT GETS INSTALLED

| Asset | Path | Purpose |
| ----- | ---- | ------- |
| useKeyboardHeight | `src/hooks/useKeyboardHeight.js` | Keyboard height via `screenY` (iOS + Android) |
| useKeyboardInsets | `src/hooks/useKeyboardInsets.js` | Scroll/footer inset math |
| useChatKeyboardInsets | `src/hooks/useChatKeyboardInsets.js` | Chat list + composer insets |
| KeyboardAwareLayout | `src/components/layouts/KeyboardAwareLayout/` | Forms, ScrollView, sticky footer |
| ChatKeyboardLayout | `src/components/layouts/ChatKeyboardLayout/` | Chat FlatList + composer |

Also patches `BaseScreen` to accept optional `edges` prop when missing.

---

## WHEN AGENTS MUST USE THIS

| Agent | Requirement |
| ----- | ----------- |
| **08 Project Scaffold** | Run `setup-keyboard-layout.js` during scaffold |
| **02 Coding** | Read `keyboard-layout.mdc`; wrap all input screens |
| **04 Fixing** | Keyboard bugs → apply `KeyboardAwareLayout` / `ChatKeyboardLayout` |
| **13 useForm Builder** | Form screens use `KeyboardAwareLayout` |
| **19 Socket Setup** | Runs keyboard setup before socket scaffold; chat uses `ChatKeyboardLayout` |

---

## WORKFLOW

### STEP 1 — Run setup script

```bash
node .cursor/scripts/setup-keyboard-layout.js [--force]
```

### STEP 2 — Verify

- [ ] `useKeyboardHeight.js`, `useKeyboardInsets.js` exist
- [ ] `KeyboardAwareLayout`, `ChatKeyboardLayout` exist
- [ ] Hooks exported from `src/hooks/index.js`
- [ ] `BaseScreen` supports `edges` prop

### STEP 3 — Migrate existing input screens (when requested)

Replace `KeyboardAvoidingView`-only patterns per `keyboard-layout.mdc`:

- **Forms** → `KeyboardAwareLayout` + `scrollPaddingBottom`
- **Chat** → `ChatKeyboardLayout` + `listPaddingBottom`

### STEP 4 — Save coding log

`.cursor/logs/coding/coding-keyboard-layout.md` — files installed, screens migrated, UI QA pass.

---

## BOUNDARIES

- **Does:** Install keyboard kit; patch BaseScreen; document patterns; migrate input screens when in scope.
- **Does not:** Create PRD; add npm dependencies; fix Next.js web projects (use `.cursornext/` separately).
- **Stops when:** Setup complete, log saved, user informed which layout to use per screen type.

**Pair with:** `@coding-agent`, `@fixing-agent`, `@socket-agent`, `@useform-builder-agent`.
