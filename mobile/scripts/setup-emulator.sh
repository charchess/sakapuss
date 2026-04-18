#!/usr/bin/env bash
# Run this script after Android SDK and Maestro are fully downloaded
# Usage: bash mobile/scripts/setup-emulator.sh

set -e

export ANDROID_HOME="$HOME/Android/sdk"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
export PATH="$PATH:$HOME/.maestro/bin"

echo "=== Step 1: Install Maestro from zip ==="
if [ ! -f ~/.maestro/bin/maestro ]; then
  if [ -f ~/.maestro/tmp/maestro.zip ]; then
    python3 -c "import zipfile; z=zipfile.ZipFile('$HOME/.maestro/tmp/maestro.zip'); print('valid zip')" 2>/dev/null || {
      echo "Maestro zip invalid, re-downloading..."
      curl --fail --location --silent \
        "https://github.com/mobile-dev-inc/maestro/releases/download/cli-1.39.0/maestro.zip" \
        -o ~/.maestro/tmp/maestro.zip
    }
    mkdir -p ~/.maestro
    unzip -q ~/.maestro/tmp/maestro.zip -d ~/.maestro
    echo "Maestro installed: $(~/.maestro/bin/maestro --version)"
  else
    echo "ERROR: ~/.maestro/tmp/maestro.zip not found"
    exit 1
  fi
else
  echo "Maestro already installed: $(~/.maestro/bin/maestro --version)"
fi

echo ""
echo "=== Step 2: Create AVD ==="
if avdmanager list avd | grep -q "sakapuss_test"; then
  echo "AVD sakapuss_test already exists"
else
  echo "no" | avdmanager create avd \
    --name sakapuss_test \
    --package "system-images;android-34;google_apis;x86_64" \
    --device "pixel_4" \
    --force
  echo "AVD created"
fi

echo ""
echo "=== Step 3: Start emulator in background ==="
$ANDROID_HOME/emulator/emulator \
  -avd sakapuss_test \
  -no-window \
  -no-audio \
  -no-boot-anim \
  -gpu swiftshader_indirect \
  -memory 2048 \
  -cores 2 &

EMU_PID=$!
echo "Emulator started (PID $EMU_PID)"

echo "Waiting for device to come online..."
$ANDROID_HOME/platform-tools/adb wait-for-device

echo "Waiting for full boot..."
until $ANDROID_HOME/platform-tools/adb shell getprop sys.boot_completed 2>/dev/null | grep -q "1"; do
  sleep 3
done
echo "Emulator ready!"

echo ""
echo "=== Step 4: Build and install app ==="
cd /home/charchess/sakapuss/mobile

if command -v npx &>/dev/null; then
  echo "Running expo run:android..."
  npx expo run:android 2>&1 || {
    echo "expo run:android failed — trying prebuild + gradlew..."
    npx expo prebuild --platform android 2>&1
    cd android && ./gradlew assembleDebug 2>&1
    $ANDROID_HOME/platform-tools/adb install app/build/outputs/apk/debug/app-debug.apk
    cd ..
  }
fi

echo ""
echo "=== Step 5: Run Maestro flows ==="
echo "Running login flow..."
~/.maestro/bin/maestro test .maestro/flows/login.yaml --format junit --output /tmp/maestro-login.xml 2>&1 || true

echo "Running all flows..."
~/.maestro/bin/maestro test .maestro/flows/ --format junit --output /tmp/maestro-all.xml 2>&1 || true

echo ""
echo "=== Done ==="
echo "Maestro results:"
ls /tmp/maestro-*.xml 2>/dev/null || echo "No result files found"
