# Detox E2E Integration (iOS + Android)

End-to-end setup, agent workflow, and troubleshooting for Detox in a React Native project. This doc is referenced by `@detox-testing-agent`, `@fixing-agent`, `@testcases-agent`, and the rule `.cursor/rules/detox-testing.mdc`.

> **Goal:** A ready-to-go Detox setup you can replicate in any React Native project. Replace `AgentsReactNative` / `com.agentsreactnative` with your app name / applicationId where shown.

---

## 1. Overview

| Item | Value |
| ---- | ----- |
| Runner | Jest (Detox's bundled jest-circus integration) |
| Config | `.detoxrc.js` |
| Jest config | `e2e/jest.config.js` |
| Specs | `e2e/**/*.e2e.js` |
| iOS configs | `ios.sim.debug`, `ios.sim.release` |
| Android configs | `android.emu.debug`, `android.emu.release`, `android.att.debug` (attached device) |
| Artifacts | `.cursor/logs/detox-testing/artifacts/` (screenshots + video) |

Unit Jest (`npm test`) only runs `__tests__/*`; E2E specs (`*.e2e.js`) are excluded so the two never collide.

---

## 2. Prerequisites

- **Node** ≥ 22.11 (project `engines`), **JDK 17** for Android Gradle.
- **detox-cli** (optional global): `npm i -g detox-cli`. Local `detox` devDependency is enough via `npx`.
- **iOS:** Xcode + `applesimutils` → `brew tap wix/brew && brew install applesimutils`.
- **Android:** Android SDK, an **AVD** (e.g. `Pixel_7_API_34`) or a physical device with USB debugging.

---

## 3. Install

```bash
npm install --save-dev detox
# iOS only:
brew tap wix/brew && brew install applesimutils
```

`package.json` scripts (already present):

```json
"e2e:build:ios": "detox build -c ios.sim.debug",
"e2e:build:android": "detox build -c android.emu.debug",
"e2e:build:android:attached": "detox build -c android.att.debug",
"e2e:ios": "detox test -c ios.sim.debug",
"e2e:android": "detox test -c android.emu.debug",
"e2e:android:attached": "detox test -c android.att.debug",
"e2e:collect-artifacts": "node scripts/collect-detox-artifacts.js"
```

---

## 4. Shared config (both platforms)

### `.detoxrc.js`
Defines `apps` (ios/android × debug/release), `devices` (simulator / emulator / attached), and `configurations` that pair a device with an app and enable artifacts. Key points:

- `testRunner` → Jest with `e2e/jest.config.js`, `setupTimeout: 120000`.
- Android `apps` set `testBinaryPath` to the androidTest APK and a `build` command that runs `assembleDebug assembleAndroidTest`.
- `android.debug` uses `reversePorts: [8081]` so the emulator can reach the Metro bundler.
- Artifacts `rootDir` is `.cursor/logs/detox-testing/artifacts` with `screenshot` + `video` plugins (`keepOnlyFailedTestsArtifacts: true`).

### `e2e/jest.config.js`

```js
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/e2e/**/*.e2e.js'],
  testTimeout: 120000,
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: ['detox/runners/jest/reporter'],
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true,
};
```

### Smoke spec — `e2e/starter.e2e.js`
Launches the app and asserts the root view (`testID="app-root"`, set in `src/Root.js`) is visible. Use it to confirm wiring before writing feature specs.

---

## 5. Android native setup (the part not covered elsewhere)

This is the wiring that makes `npm run e2e:android` work. All of it must exist for a fresh project.

### 5.1 `android/build.gradle` — add the Detox Maven repo
```gradle
allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url("$rootDir/../node_modules/detox/Detox-android") }
    }
}
```

### 5.2 `android/app/build.gradle`
```gradle
android {
    defaultConfig {
        testBuildType System.getProperty('testBuildType', 'debug')
        testInstrumentationRunner 'androidx.test.runner.AndroidJUnitRunner'
    }
    buildTypes {
        release {
            // Detox proguard rules for release E2E
            proguardFile "${rootProject.projectDir}/../node_modules/detox/android/detox/proguard-rules-app.pro"
        }
    }
}

dependencies {
    androidTestImplementation('com.wix:detox:+')
    androidTestImplementation 'androidx.test.ext:junit:1.2.1'
    androidTestImplementation 'androidx.test:runner:1.5.2'
}
```

### 5.3 Detox test runner — `android/app/src/androidTest/java/com/<applicationId>/DetoxTest.java`
```java
package com.agentsreactnative;

import com.wix.detox.Detox;
import com.wix.detox.config.DetoxConfig;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.filters.LargeTest;
import androidx.test.rule.ActivityTestRule;

@RunWith(AndroidJUnit4.class)
@LargeTest
public class DetoxTest {
    @Rule
    public ActivityTestRule<MainActivity> mActivityRule = new ActivityTestRule<>(MainActivity.class, false, false);

    @Test
    public void runDetoxTests() {
        DetoxConfig detoxConfig = new DetoxConfig();
        detoxConfig.idlePolicyConfig.masterTimeoutSec = 90;
        detoxConfig.idlePolicyConfig.idleResourceTimeoutSec = 60;
        detoxConfig.rnContextLoadTimeoutSec = (BuildConfig.DEBUG ? 180 : 60);
        Detox.runTests(mActivityRule, detoxConfig);
    }
}
```
> The package + `MainActivity` import must match your `applicationId` / namespace (here `com.agentsreactnative`).

### 5.4 Cleartext to Metro — `AndroidManifest.xml` + `res/xml/network_security_config.xml`
Debug builds talk to the Metro bundler over cleartext. The manifest sets `android:networkSecurityConfig="@xml/network_security_config"`, and the config whitelists the emulator host:
```xml
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">localhost</domain>
    </domain-config>
</network-security-config>
```
> `10.0.2.2` is the host loopback from inside an Android emulator.

### 5.5 Run on an emulator vs. attached device
- **Emulator:** set `devices.emulator.device.avdName` in `.detoxrc.js` to a locally installed AVD, then `npm run e2e:build:android && npm run e2e:android`.
- **Attached physical device:** set `devices.attached.device.adbName` to your `adb devices` id, then `npm run e2e:build:android:attached && npm run e2e:android:attached`.

---

## 6. iOS native setup

Mostly automatic via CocoaPods. Ensure:
- `binaryPath` / `build` in `.detoxrc.js` match your scheme + workspace (`ios/<App>.xcworkspace`, scheme `<App>`).
- Run `cd ios && pod install` once to generate the `.xcworkspace`.
- Build + run:
```bash
npm run e2e:build:ios
npm run e2e:ios
```

---

## 7. testIDs

- Specs select elements with `by.id('testID-value')`; the element must render `testID="testID-value"`.
- testIDs are authored in `.cursor/logs/test-cases-{feature}.md` (section **testID / selectors (for E2E)**) by `@testcases-agent`.
- `@fixing-agent` adds or preserves testIDs when fixing E2E failures.

---

## 8. Artifacts collection

Detox writes per-run artifacts to `.cursor/logs/detox-testing/artifacts/<config>.<timestamp>/`. The helper `scripts/collect-detox-artifacts.js`:
- finds the latest run folder,
- copies `testFnFailure.png` → `screenshots/{TC-ID}.png` and `test.mp4` → `videos/{TC-ID}.mp4`,
- writes `artifacts-manifest.json`,
- deletes the raw `artifacts/` folder to keep the repo lean.

```bash
node scripts/collect-detox-artifacts.js {feature-name}
```

> **Token/repo tip:** raw `artifacts/` PNG/MP4 files are gitignored (see `.gitignore`). Run `scripts/collect-detox-artifacts.js` to copy failure media into `{feature}/{timestamp}/screenshots/` and `videos/`, then keep `test-results.md`. See `.cursor/TOKEN-USAGE.md`.

---

## 9. Commands quick reference

| Action | iOS | Android (emulator) | Android (attached) |
| ------ | --- | ------------------ | ------------------ |
| Build | `npm run e2e:build:ios` | `npm run e2e:build:android` | `npm run e2e:build:android:attached` |
| Test all | `npm run e2e:ios` | `npm run e2e:android` | `npm run e2e:android:attached` |
| Single spec | `npm run e2e:ios -- e2e/<f>.e2e.js` | `npm run e2e:android -- e2e/<f>.e2e.js` | `npm run e2e:android:attached -- e2e/<f>.e2e.js` |
| Raw detox | `detox test -c ios.sim.debug` | `detox test -c android.emu.debug` | `detox test -c android.att.debug` |

---

## 10. Agent workflow

| Agent | Role with Detox |
| ----- | --------------- |
| `@testcases-agent` | Authors testIDs + manual test cases used by specs. |
| `@detox-testing-agent` | Creates `e2e/{feature}.e2e.js` if missing, runs tests on the chosen target, collects artifacts, writes `test-results.md`. **Recommendations only.** |
| `@fixing-agent` | Runs Detox in test-and-fix mode; fixes failures (incl. adding testIDs). |

Invoke: `@detox-testing-agent` with **feature name** + **testing target** (iOS Simulator / Android Emulator / Both).

---

## 11. Troubleshooting

| Symptom | Cause / Fix |
| ------- | ----------- |
| `Failed to run application on the device` (Android) | App not built. Run `npm run e2e:build:android` first. |
| Tests hang then time out at launch | Metro not reachable. Ensure `reversePorts: [8081]` (emulator) and cleartext config; start Metro or let Detox launch it. |
| `No connected devices` (attached) | `adbName` in `.detoxrc.js` doesn't match `adb devices`. Update it. |
| `Cannot find AVD` | `avdName` doesn't match an installed AVD (`emulator -list-avds`). Update `.detoxrc.js`. |
| `applesimutils not found` (iOS) | `brew tap wix/brew && brew install applesimutils`. |
| iOS build can't find workspace | Run `cd ios && pod install`; verify `.detoxrc.js` `build`/`binaryPath` scheme names. |
| `BuildConfig` unresolved in `DetoxTest.java` | Build once so Gradle generates `BuildConfig`; ensure package matches `applicationId`. |
| Element not found by id | Add `testID="..."` to the component; ids come from the test-cases file. |
| `EBADENGINE` npm warning | Node version mismatch (Node 20 vs required 22); non-blocking. |

---

## 12. Replicating in a new project (checklist)

- [ ] `npm i -D detox`; add the `e2e:*` scripts to `package.json`.
- [ ] Add `.detoxrc.js` (update app name, scheme, applicationId, AVD/device ids).
- [ ] Add `e2e/jest.config.js` + `e2e/starter.e2e.js`.
- [ ] Add `testID="app-root"` to the app root view.
- [ ] **Android:** Detox Maven repo in `android/build.gradle`; `testBuildType` + `testInstrumentationRunner` + `androidTestImplementation` deps + release proguard line in `android/app/build.gradle`; `DetoxTest.java` under `androidTest/.../<applicationId>/`; `network_security_config.xml` + manifest reference.
- [ ] **iOS:** `cd ios && pod install`; verify scheme/workspace in `.detoxrc.js`.
- [ ] Add `scripts/collect-detox-artifacts.js`; `.cursor/logs/detox-testing/artifacts/` is already in `.gitignore`.
- [ ] Smoke test: `npm run e2e:build:android && npm run e2e:android`.
