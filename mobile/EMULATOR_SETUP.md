# Android Emulator + Maestro Setup

This document describes how to set up the Android emulator and run Maestro E2E flows
on this machine (WSL2, x86_64, KVM available, 56GB RAM).

## Prerequisites

- KVM available at `/dev/kvm` (required for hardware-accelerated emulation)
- Java 17+ installed
- Android SDK Command Line Tools downloaded

## Step 1 — Install JDK 17

```bash
sudo apt-get install -y openjdk-17-jdk-headless
java -version   # should print openjdk 17.x.x
```

## Step 2 — Install Android SDK Command Line Tools

```bash
mkdir -p ~/Android/sdk/cmdline-tools
cd ~/Android/sdk/cmdline-tools
wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O cmdline-tools.zip
unzip -q cmdline-tools.zip
mv cmdline-tools latest
rm cmdline-tools.zip
```

## Step 3 — Configure Environment Variables

Add to `~/.bashrc` (or run in each session):

```bash
export ANDROID_HOME="$HOME/Android/sdk"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
```

## Step 4 — Accept Licenses and Install Packages

```bash
yes | sdkmanager --licenses > /dev/null 2>&1
sdkmanager "platform-tools" "emulator" "platforms;android-34" "system-images;android-34;google_apis;x86_64"
```

This downloads ~4GB. Takes 10–15 minutes on a fast connection.

## Step 5 — Create AVD

```bash
echo "no" | avdmanager create avd \
  --name sakapuss_test \
  --package "system-images;android-34;google_apis;x86_64" \
  --device "pixel_4" \
  --force
```

## Step 6 — Start Emulator (No GUI, KVM-accelerated)

```bash
$ANDROID_HOME/emulator/emulator \
  -avd sakapuss_test \
  -no-window \
  -no-audio \
  -no-boot-anim \
  -gpu swiftshader_indirect \
  -memory 2048 \
  -cores 2 &

# Wait for full boot
$ANDROID_HOME/platform-tools/adb wait-for-device
$ANDROID_HOME/platform-tools/adb shell while [[ -z $(getprop sys.boot_completed) ]]; do sleep 3; done
echo "Emulator ready"
```

## Step 7 — Install Maestro

```bash
export MAESTRO_VERSION=1.39.0
curl -Ls "https://get.maestro.mobile.dev" | bash
export PATH="$PATH:$HOME/.maestro/bin"
maestro --version
```

## Step 8 — Build and Install App

Option A — Expo Dev Client (recommended):

```bash
cd /home/charchess/sakapuss/mobile
npx expo run:android
```

Option B — Prebuild then build:

```bash
npx expo prebuild --platform android
cd android && ./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```

## Step 9 — Run Maestro Flows

```bash
export PATH="$PATH:$HOME/.maestro/bin"
cd /home/charchess/sakapuss/mobile

# Single flow
maestro test .maestro/flows/login.yaml

# All flows
maestro test .maestro/flows/
```

## API URL Configuration

The app auto-detects the correct API URL:
- **Android emulator** (`Platform.OS === 'android'`): `http://10.0.2.2:8000`
- **iOS / web / jest** (`Platform.OS === 'ios'`): `http://localhost:8000`

The WSL2 FastAPI backend must be running on port 8000 before running Maestro flows.

## Notes

- The `jest.setup.ts` MSW handlers always intercept `http://localhost:8000` — the real
  network is never hit during Jest tests.
- Maestro flows hit the real FastAPI backend; make sure it's running with seed data
  (`playwright-e2e@test.sakapuss.local` / `PlaywrightTest123!`).
