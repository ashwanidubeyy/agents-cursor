# Usage Cheat Sheet — `.cursor/` Agent System

> One-page quick reference for day-to-day usage.
>
> **Rule of Thumb:** One Agent → One Task → One Output → One Stop
>
> Each agent performs a single responsibility, saves its output, and stops. Review the output before invoking the next agent.

---

# Quick Navigation

* [New Project Flow](#new-project-flow)
* [New Feature Flow](#new-feature-flow)
* [Agent Overview](#agent-overview)
* [Common Commands](#common-commands)
* [Usage Examples](#usage-examples)
* [Output Locations](#output-locations)
* [Setup Notes](#setup-notes)

---

# New Project Flow

```text
@project-scaffold-agent
        ↓
npm install
        ↓
cd ios && pod install
        ↓
Run Application
        ↓
Start Feature Development
```

---

# New Feature Flow

## Recommended Flow

```text
@figma-analyzer
        ↓
@planning-agent
        ↓
@coding-agent
        ↓
@documentation-agent
        ↓
@testcases-agent
        ↓
@e2e-testing-agent
        ↓
@fixing-agent
        ↓
@pre-pr-validation-agent
        ↓
@pr-orchestrator-agent
```

---

## Minimum Flow

For already-designed features:

```text
@figma-analyzer
        ↓
@planning-agent
        ↓
@coding-agent
        ↓
@fixing-agent
```

---

# Agent Overview

| Agent              | Purpose                           | Output                      |
| ------------------ | --------------------------------- | --------------------------- |
| Architecture & R&D | Research & architecture decisions | Architecture recommendation |
| Project Scaffold   | Create new project                | New RN project              |
| Prompt Generator   | Generate implementation prompts   | Prompt file                 |
| Figma Analyzer     | Extract Figma specifications      | Design specification        |
| Planning           | Create PRD                        | PRD document                |
| Coding             | Implement feature                 | Source code                 |
| useForm Builder    | Build a form with `useForm`       | Form + coding log           |
| Documentation      | Generate documentation            | Documented code             |
| Test Cases         | Generate test cases               | QA & Jest tests             |
| E2E Testing        | Run Detox tests                   | E2E reports                 |
| Fixing             | Fix issues                        | Fix report                  |
| Pre-PR Validation  | Validate PR readiness             | READY / NOT READY           |
| PR Orchestrator    | Generate PR document              | PR summary                  |

---

# Common Commands

## Architecture & R&D Agent

### Compare Technologies

```text
@architecture-rd-agent

Compare Fetch vs Axios for React Native.
```

```text
@architecture-rd-agent

Compare Redux Toolkit vs Zustand.

Consider:
- Performance
- Scalability
- Developer Experience
- Learning Curve
```

### State Management Recommendation

```text
@architecture-rd-agent

Recommend state management.

Options:
- Redux Toolkit
- Zustand
- React Query
- Context API

Application:
- 50+ screens
- Heavy API usage
```

### Folder Structure Review

```text
@architecture-rd-agent

Recommend the best folder structure for a scalable React Native application with 100+ modules.
```

---

## Project Scaffold Agent

### Create New Project

```text
@project-scaffold-agent

Create project MyApp
```

### Create Project with Custom Folder

```text
@project-scaffold-agent

Create project MyApp

Folder Name:
myapp-mobile
```

---

## Prompt Generator Agent

### Generate Feature Prompt

```text
@prompt-generator-agent

Generate implementation prompt for:
forgot-password-screen
```

### Generate Project Prompt

```text
@prompt-generator-agent

Generate project setup prompt for:
MyApp
```

---

## Figma Analyzer Agent

### Analyze Figma Design

```text
@figma-analyzer

Feature Name:
forgot-password-screen

Mobile URL:
https://www.figma.com/design/ABC123/App?node-id=10-8700

Mobile Frame:
M_Forgot_Password_Screen

Section:
Forgot password screen – layout, fields, buttons, copy, icons
```

---

## Planning Agent

### Create PRD

```text
@planning-agent

Plan feature:
forgot-password-screen

Source:
.cursor/cache/figma-specs-forgot-password-screen.md
```

---

## Coding Agent

### Implement PRD

```text
@coding-agent

Implement PRD from:

.cursor/logs/prd-forgot-password-screen-20260202-143000.md
```

---

## useForm Builder Agent

### Build a Validated Form

```text
@useform-builder-agent

Form: login
Fields: email (email, required), password (password, required, min 6)
Path: src/screens/Login
Service: authService.login
```

> Installs the hook automatically if missing (`node .cursor/scripts/setup-useform.js`).
> TypeScript when `tsconfig.json` exists, otherwise JavaScript. Rules: `.cursor/rules/useform-validation.mdc`.

---

## Documentation Agent

### Generate Documentation

```text
@documentation-agent

Document files from:

.cursor/logs/coding/coding-forgot-password-screen.md
```

---

## Test Cases Agent

### Generate Test Cases

```text
@testcases-agent

Author test cases for:

forgot-password-screen

PRD:
.cursor/logs/prd-forgot-password-screen-20260202-143000.md

Coding Log:
.cursor/logs/coding/coding-forgot-password-screen.md
```

---

## E2E Testing Agent

### Run Detox

```text
@e2e-testing-agent

Run E2E for:
forgot-password-screen

Target:
iOS Simulator
```

---

## Fixing Agent

### Fix Issues

```text
@fixing-agent

Fix issues from:
logs/fixing/fixing-forgot-password-screen.md
```

### Run Tests and Fix

```text
@fixing-agent

Test forgot-password-screen

Target:
iOS Simulator
```

---

## Pre-PR Validation Agent

### Validate Before PR

```text
@pre-pr-validation-agent

Validate my changes before raising a PR.

Base Branch:
main
```

### Review Changed Files

```text
@pre-pr-validation-agent

Review changed files and validate:

- Code Quality
- Team Standards
- Performance
- Security
- Testing
- Breaking Changes
```

---

## PR Orchestrator Agent

### Generate PR

```text
@pr-orchestrator-agent

Create PR document for:

forgot-password-screen
```

---

# Output Locations

## Architecture & R&D

```text
logs/architecture-rd/{topic}.md
```

---

## Figma Analyzer

```text
cache/figma-specs-{feature}.md
cache/figma-svgs/{feature}/
```

---

## Planning

```text
logs/prd-{feature}-{timestamp}.md
```

---

## Coding

```text
src/*
logs/coding/coding-{feature}.md
```

---

## Documentation

```text
logs/documentation/documentation-{feature}.md
```

---

## Test Cases

```text
logs/test-cases-{feature}.md
__tests__/{Feature}.test.js
```

---

## E2E Testing

```text
logs/e2e-testing/{feature}/{timestamp}/
```

---

## Fixing

```text
logs/fixing/fixing-{feature}.md
```

---

## Pre-PR Validation

```text
logs/pre-pr/pre-pr-{feature}.md
```

Output:

```text
READY
```

or

```text
NOT READY
```

---

## PR Orchestrator

```text
logs/pr/pr-{feature}.md
```

---

# End-to-End Example

## Forgot Password Feature

### Step 1 — Analyze Figma

```text
@figma-analyzer

Feature Name:
forgot-password-screen
```

Output:

```text
cache/figma-specs-forgot-password-screen.md
```

---

### Step 2 — Create PRD

```text
@planning-agent
```

Output:

```text
logs/prd-forgot-password-screen.md
```

---

### Step 3 — Implement Feature

```text
@coding-agent
```

Output:

```text
src/screens/ForgotPassword/*
```

---

### Step 4 — Generate Documentation

```text
@documentation-agent
```

---

### Step 5 — Generate Test Cases

```text
@testcases-agent
```

---

### Step 6 — Run E2E Tests

```text
@e2e-testing-agent
```

---

### Step 7 — Fix Issues

```text
@fixing-agent
```

---

### Step 8 — Validate PR

```text
@pre-pr-validation-agent
```

Output:

```text
READY
```

---

### Step 9 — Generate PR Document

```text
@pr-orchestrator-agent
```

Output:

```text
logs/pr/pr-forgot-password-screen.md
```

---

# Setup Notes

## Figma Setup

1. Copy:

```text
.env.example
```

to:

```text
.env
```

2. Add:

```env
FIGMA_ACCESS_TOKEN=your-token
```

3. Never commit the token.

---

## Optional Integrations

### ESLint

Used by:

```text
Pre-PR Validation Agent
```

---

### SonarQube

Used by:

```text
Pre-PR Validation Agent
```

---

### Snyk

Used by:

```text
Pre-PR Validation Agent
```

---

### Detox

Used by:

```text
E2E Testing Agent
```

---

### Jest

Used by:

```text
Test Cases Agent
Fixing Agent
Pre-PR Validation Agent
```

---

# Best Practices

* Run Architecture & R&D Agent before major technical decisions.
* Keep PRs focused and small.
* Always run Pre-PR Validation before creating a PR.
* Use changed-file validation instead of full repository scans.
* Fix all P1 issues before raising a PR.
* Keep Figma specs, PRDs, coding logs, and PR documents committed for traceability.
* Review every generated output before moving to the next agent.

---

# Quick Reminder

```text
Research
    ↓
Plan
    ↓
Build
    ↓
Test
    ↓
Fix
    ↓
Validate
    ↓
Raise PR
```
