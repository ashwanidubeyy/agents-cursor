/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath:
        'ios/build/Build/Products/Debug-iphonesimulator/AgentsReactNative.app',
      build:
        'xcodebuild -workspace ios/AgentsReactNative.xcworkspace -scheme AgentsReactNative -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath:
        'ios/build/Build/Products/Release-iphonesimulator/AgentsReactNative.app',
      build:
        'xcodebuild -workspace ios/AgentsReactNative.xcworkspace -scheme AgentsReactNative -configuration Release -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      testBinaryPath:
        'android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk',
      build:
        'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug && cd ..',
      reversePorts: [8081],
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      testBinaryPath:
        'android/app/build/outputs/apk/androidTest/release/app-release-androidTest.apk',
      build:
        'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release && cd ..',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 15',
      },
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_7_API_34',
      },
    },
    attached: {
      type: 'android.attached',
      device: {
        adbName: '10BF2Q0DZH000CH',
      },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
      artifacts: {
        rootDir: '.cursor/logs/detox-testing/artifacts',
        plugins: {
          screenshot: {
            enabled: true,
            shouldTakeAutomaticSnapshots: true,
            keepOnlyFailedTestsArtifacts: true,
          },
          video: {
            enabled: true,
            keepOnlyFailedTestsArtifacts: true,
          },
        },
      },
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release',
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
      artifacts: {
        rootDir: '.cursor/logs/detox-testing/artifacts',
        plugins: {
          screenshot: {
            enabled: true,
            shouldTakeAutomaticSnapshots: true,
            keepOnlyFailedTestsArtifacts: true,
          },
          video: {
            enabled: true,
            keepOnlyFailedTestsArtifacts: true,
          },
        },
      },
    },
    'android.emu.release': {
      device: 'emulator',
      app: 'android.release',
    },
    'android.att.debug': {
      device: 'attached',
      app: 'android.debug',
      artifacts: {
        rootDir: '.cursor/logs/detox-testing/artifacts',
        plugins: {
          screenshot: {
            enabled: true,
            shouldTakeAutomaticSnapshots: true,
            keepOnlyFailedTestsArtifacts: true,
          },
          video: {
            enabled: true,
            keepOnlyFailedTestsArtifacts: true,
          },
        },
      },
    },
  },
};
