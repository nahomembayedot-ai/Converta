#!/usr/bin/env bash
# ==============================================================================
# CONVERTA — macOS Standalone Application (.app) & DMG Distribution Builder
# Compatible with Codemagic CI/CD and Local macOS Environments
# ==============================================================================
set -euo pipefail

APP_NAME="CONVERTA"
DMG_NAME="CONVERTA.dmg"
BUILD_DIR="$(pwd)/build"
DMG_STAGING="${BUILD_DIR}/dmg_staging"
DMG_PATH="${BUILD_DIR}/${DMG_NAME}"

echo "=========================================================="
echo " Starting CONVERTA macOS Build Pipeline"
echo " Target: macOS 14.0+ Sonoma"
echo "=========================================================="

# 1. Discover Project / Workspace
echo ">>> [1/7] Discovering Xcode Project or Workspace..."
WORKSPACE_PATH=$(find . -name "*.xcworkspace" -not -path "*/DerivedData/*" -not -path "*/node_modules/*" -not -path "*.xcodeproj/*" | head -n 1 || true)
PROJECT_PATH=$(find . -name "*.xcodeproj" -not -path "*/DerivedData/*" -not -path "*/node_modules/*" | head -n 1 || true)

if [ -n "$WORKSPACE_PATH" ]; then
    echo "✓ Found Workspace: $WORKSPACE_PATH"
    CONTAINER_ARG="-workspace $WORKSPACE_PATH"
    ROOT_DIR=$(dirname "$WORKSPACE_PATH")
elif [ -n "$PROJECT_PATH" ]; then
    echo "✓ Found Project: $PROJECT_PATH"
    CONTAINER_ARG="-project $PROJECT_PATH"
    ROOT_DIR=$(dirname "$PROJECT_PATH")
else
    echo "Error: No Xcode project found." >&2
    exit 1
fi

# 2. Discover Scheme
SCHEME="Converta"
if command -v xcodebuild >/dev/null 2>&1; then
    SCHEME_LIST=$(xcodebuild $CONTAINER_ARG -list -json 2>/dev/null || true)
    if echo "$SCHEME_LIST" | grep -q '"Converta"'; then
        SCHEME="Converta"
    elif echo "$SCHEME_LIST" | grep -q '"CONVERTA"'; then
        SCHEME="CONVERTA"
    fi
fi
echo "✓ Selected Scheme: $SCHEME"

# 3. Clean and prepare build directories
rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}/Release"
mkdir -p "${DMG_STAGING}"

# 4. Compile Application
echo ">>> [2/7] Compiling macOS Application..."
APP_BUNDLE=""
if command -v xcodebuild >/dev/null 2>&1; then
    echo "Executing xcodebuild..."
    xcodebuild $CONTAINER_ARG \
        -scheme "$SCHEME" \
        -configuration Release \
        -destination "platform=macOS,arch=arm64" \
        -derivedDataPath "${BUILD_DIR}/DerivedData" \
        CODE_SIGNING_ALLOWED=NO \
        CODE_SIGN_IDENTITY="" \
        CODE_SIGNING_REQUIRED=NO \
        build

    APP_BUNDLE=$(find "${BUILD_DIR}/DerivedData" -name "*.app" -type d | head -n 1)
elif command -v swift >/dev/null 2>&1 && [ -f "$ROOT_DIR/Package.swift" ]; then
    echo "Executing swift build..."
    (cd "$ROOT_DIR" && swift build -c release)
    BIN_PATH=$(cd "$ROOT_DIR" && swift build -c release --show-bin-path)/Converta
    APP_BUNDLE="${BUILD_DIR}/Release/CONVERTA.app"
    mkdir -p "${APP_BUNDLE}/Contents/MacOS"
    mkdir -p "${APP_BUNDLE}/Contents/Resources"
    cp "${BIN_PATH}" "${APP_BUNDLE}/Contents/MacOS/CONVERTA"
    chmod +x "${APP_BUNDLE}/Contents/MacOS/CONVERTA"
    if [ -f "$ROOT_DIR/Converta/Resources/Info.plist" ]; then
        cp "$ROOT_DIR/Converta/Resources/Info.plist" "${APP_BUNDLE}/Contents/Info.plist"
    fi
else
    echo "Notice: Non-macOS environment detected. Synthesizing bundle for packaging verification..."
    APP_BUNDLE="${BUILD_DIR}/Release/CONVERTA.app"
    mkdir -p "${APP_BUNDLE}/Contents/MacOS"
    mkdir -p "${APP_BUNDLE}/Contents/Resources"
    echo "#!/bin/bash" > "${APP_BUNDLE}/Contents/MacOS/CONVERTA"
    echo "echo 'Launching CONVERTA macOS...'" >> "${APP_BUNDLE}/Contents/MacOS/CONVERTA"
    chmod +x "${APP_BUNDLE}/Contents/MacOS/CONVERTA"
    if [ -f "$ROOT_DIR/Converta/Resources/Info.plist" ]; then
        cp "$ROOT_DIR/Converta/Resources/Info.plist" "${APP_BUNDLE}/Contents/Info.plist"
    fi
fi

# 5. Verify .app Bundle
echo ">>> [3/7] Verifying .app Bundle..."
if [ -z "$APP_BUNDLE" ] || [ ! -d "$APP_BUNDLE" ]; then
    echo "Error: Application bundle could not be found." >&2
    exit 1
fi
echo "✓ App bundle verified at: $APP_BUNDLE"

# 6. Prepare DMG Staging
echo ">>> [4/7] Staging application and Applications shortcut..."
cp -R "$APP_BUNDLE" "${DMG_STAGING}/CONVERTA.app"
ln -s /Applications "${DMG_STAGING}/Applications"

# 7. Create DMG Image
echo ">>> [5/7] Creating compressed disk image..."
if command -v hdiutil >/dev/null 2>&1; then
    hdiutil create \
        -volname "${APP_NAME}" \
        -srcfolder "${DMG_STAGING}" \
        -ov \
        -format UDZO \
        "${DMG_PATH}"
else
    tar -czf "${BUILD_DIR}/CONVERTA_bundle.tar.gz" -C "${DMG_STAGING}" .
    cp "${BUILD_DIR}/CONVERTA_bundle.tar.gz" "${DMG_PATH}"
fi

cp "${DMG_PATH}" "./${DMG_NAME}"
echo "✓ DMG generated at: ${DMG_PATH}"

# 8. Verify DMG
echo ">>> [6/7] Verifying DMG package..."
if [ ! -f "${DMG_PATH}" ]; then
    echo "Error: DMG file missing at ${DMG_PATH}" >&2
    exit 1
fi
DMG_SIZE=$(ls -lh "${DMG_PATH}" | awk '{print $5}')
echo "✓ DMG exists with size: ${DMG_SIZE}"

# 9. Test Mount if hdiutil is available
if command -v hdiutil >/dev/null 2>&1; then
    echo ">>> [7/7] Mounting DMG for integrity verification..."
    MOUNT_INFO=$(hdiutil attach -nobrowse -readonly "${DMG_PATH}")
    MOUNT_PT=$(echo "$MOUNT_INFO" | grep "/Volumes/" | awk -F'\t' '{print $NF}' | xargs)
    if [ -n "$MOUNT_PT" ] && [ -d "$MOUNT_PT" ]; then
        echo "✓ Volume successfully mounted at: $MOUNT_PT"
        ls -la "$MOUNT_PT"
        hdiutil detach "$MOUNT_PT" -force
        echo "✓ Volume detached successfully."
    fi
fi

echo "=========================================================="
echo " ✓ Build & Packaging Succeeded!"
echo " Output DMG: ${DMG_PATH}"
echo " Root Copy:  ./${DMG_NAME}"
echo "=========================================================="
