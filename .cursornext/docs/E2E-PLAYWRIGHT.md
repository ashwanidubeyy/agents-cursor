# Playwright E2E Integration (Next.js)

End-to-end setup, agent workflow, and troubleshooting for Playwright in a Next.js project. This doc is referenced by `@e2e-testing-agent`, `@fixing-agent`, `@testcases-agent`, and the rule `.cursornext/rules/e2e-testing.mdc`.

> **Goal:** A ready-to-go Playwright setup you can replicate in any Next.js project using the `.cursornext` agent system. This is the Next.js counterpart of `docs/DETOX-INTEGRATION.md` (React Native / Detox).

---

## 1. Overview

| Item | Value |
| ---- | ----- |
| Runner | `@playwright/test` |
| Config | `playwright.config.ts` |
| Specs | `e2e/**/*.spec.ts` |
| Browsers | chromium / firefox / webkit (projects) |
| Base URL | `http://localhost:3000` (default) |
| App server | `webServer` block (auto-starts `npm run dev`) |
| Artifacts | `test-results/` (raw) + `playwright-report/` (HTML) → collected into `.cursornext/logs/e2e-testing/{feature}/{timestamp}/` |

Unit tests (Jest/Vitest) and Playwright specs stay separate: Playwright only matches `e2e/**/*.spec.ts` via `testDir`.

---

## 2. Prerequisites

- **Node** ≥ 18 (Next.js 14+), **npm**/**pnpm**/**yarn**.
- A runnable Next.js app (`npm run dev` serves on `http://localhost:3000`).
- Playwright browsers installed (`npx playwright install`).

---

## 3. Install

```bash
npm install --save-dev @playwright/test
npx playwright install          # download browser binaries
# optional: system deps on Linux/CI
npx playwright install --with-deps
```

`package.json` scripts:

```json
{
  "scripts": {
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "e2e:headed": "playwright test --headed",
    "e2e:report": "playwright show-report"
  }
}
```

---

## 4. Config — `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

Key points:
- `webServer` lets Playwright **start the app itself** and wait for `baseURL`; `reuseExistingServer` avoids double-starting when you already have `npm run dev` running locally.
- `screenshot` / `video` / `trace` are failure-only to keep artifacts small.
- For production-like runs, set `command: 'npm run build && npm run start'`.

---

## 5. Spec structure — `e2e/{feature}.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('TC-001: dashboard renders', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-title')).toBeVisible();
  });

  test('TC-002: opens the create modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
```

---

## 6. Selectors / test ids

- Prefer **accessible locators**: `getByRole`, `getByLabel`, `getByText`.
- For stable hooks, use `data-testid="value"` + `getByTestId('value')`.
- test ids are authored in `.cursornext/logs/test-cases-{feature}.md` (section **selectors / test ids (for E2E)**) by `@testcases-agent`.
- `@fixing-agent` adds or preserves `data-testid` when fixing E2E failures.

> **Next.js gotcha:** Server Components don't run client handlers — assert on rendered output. For hydration/timing, use Playwright's auto-waiting locators (`expect(locator).toBeVisible()`) instead of fixed `waitForTimeout`.

---

## 7. Artifacts collection

Playwright writes raw artifacts to `test-results/` (per-test folders with `test-failed-*.png`, `video.webm`, `trace.zip`) and an HTML report to `playwright-report/`. The E2E agent copies failure artifacts into:

```
.cursornext/logs/e2e-testing/{feature}/{timestamp}/
├── test-results.md      (embedded screenshot references)
├── screenshots/         (TC-XXX-{name}.png)
├── videos/              ({spec}.webm)
└── traces/              ({spec}.zip)
```

- Open a trace: `npx playwright show-trace traces/{spec}.zip`
- Open the HTML report: `npx playwright show-report`

> **Token/repo tip:** raw `test-results/` and `playwright-report/` are heavy and add no model value. Gitignore them and keep only `test-results.md` + collected `{TC-ID}` media. See the equivalent guidance in `.cursor/TOKEN-USAGE.md`.

---

## 8. Commands quick reference

| Action | Command |
| ------ | ------- |
| Install browsers | `npx playwright install` |
| Run all | `npm run e2e` |
| Single spec | `npx playwright test e2e/{feature}.spec.ts` |
| One browser | `npx playwright test --project=chromium` |
| Headed | `npx playwright test --headed` |
| UI mode | `npx playwright test --ui` |
| Debug | `npx playwright test --debug` |
| HTML report | `npx playwright show-report` |
| Trace viewer | `npx playwright show-trace traces/{spec}.zip` |

---

## 9. Agent workflow

| Agent | Role with Playwright |
| ----- | -------------------- |
| `@testcases-agent` | Authors selectors/test ids + manual test cases used by specs. |
| `@e2e-testing-agent` | Creates `e2e/{feature}.spec.ts` if missing, runs tests against the base URL, collects artifacts, writes `test-results.md`. **Recommendations only.** |
| `@fixing-agent` | Runs Playwright in test-and-fix mode; fixes failures (incl. adding `data-testid`). |

Invoke: `@e2e-testing-agent` with **feature name** + **base URL** (default `http://localhost:3000`).

---

## 10. Troubleshooting

| Symptom | Cause / Fix |
| ------- | ----------- |
| `Timed out waiting for http://localhost:3000` | App not running and no/bad `webServer`. Start `npm run dev` or fix the `webServer` block. |
| `browserType.launch: Executable doesn't exist` | Browsers not installed. Run `npx playwright install`. |
| Locator not found / timeout | Missing `data-testid` or accessible name, or element not rendered. Add the hook; check the route navigated. |
| Flaky hydration failures | Use auto-waiting `expect(locator)`; avoid `waitForTimeout`; ensure client component is interactive. |
| Tests pass locally, fail in CI | Set `reuseExistingServer: false` in CI; install with `--with-deps`; bump `retries`. |
| Port already in use | Another dev server on 3000; stop it or set a different `baseURL`/`url`. |
| No artifacts captured | Confirm `screenshot`/`video`/`trace` in `use`; check `test-results/`; open `npx playwright show-report`. |

---

## 11. Replicating in a new Next.js project (checklist)

- [ ] `npm i -D @playwright/test`; `npx playwright install`.
- [ ] Add the `e2e:*` scripts to `package.json`.
- [ ] Add `playwright.config.ts` (set `baseURL`, artifacts, `webServer`).
- [ ] Create `e2e/{feature}.spec.ts` (accessible locators / `data-testid`).
- [ ] Add `data-testid` to key elements per the test-cases file.
- [ ] Gitignore `test-results/` and `playwright-report/`.
- [ ] Smoke test: `npm run e2e -- --project=chromium`.
