# macOS Code Signing & Notarization Guide for Converta

To distribute **Converta** outside the Mac App Store without triggering macOS Gatekeeper warnings, follow this standard Apple notarization workflow.

## Prerequisites
- Active Apple Developer Program membership ($99/year).
- "Developer ID Application" Certificate installed in Keychain Access.
- App-specific password generated from [appleid.apple.com](https://appleid.apple.com).

## Step 1: Code Sign the Application Bundle

After running `./build_dmg.sh` or compiling in Xcode:

```bash
# Verify signing identity name
security find-identity -p codesigning -v

# Deep sign the app bundle with hardened runtime & entitlements
codesign --deep --force --verify --verbose \
  --options runtime \
  --entitlements Converta/Resources/Converta.entitlements \
  --sign "Developer ID Application: Your Name (TEAM_ID)" \
  "build/Release/Converta.app"
```

Verify signature:
```bash
codesign --verify --deep --strict --verbose=2 "build/Release/Converta.app"
spctl --assess --type execute --verbose "build/Release/Converta.app"
```

## Step 2: Package & Sign the DMG

Create the DMG using `./build_dmg.sh` or `hdiutil`, then sign the DMG container:

```bash
codesign --force --sign "Developer ID Application: Your Name (TEAM_ID)" "build/Converta.dmg"
```

## Step 3: Store Apple Credentials in Keychain

```bash
xcrun notarytool store-credentials "CONVERTA_NOTARY" \
  --apple-id "your-apple-id@email.com" \
  --team-id "TEAM_ID" \
  --password "xxxx-xxxx-xxxx-xxxx"
```

## Step 4: Submit for Notarization

```bash
xcrun notarytool submit "build/Converta.dmg" \
  --keychain-profile "CONVERTA_NOTARY" \
  --wait
```

## Step 5: Staple the Notarization Ticket

Once Apple approves the submission:

```bash
xcrun stapler staple "build/Converta.dmg"
```

Now `Converta.dmg` can be mounted and installed on any macOS Sonoma or later machine with zero Gatekeeper warnings!
