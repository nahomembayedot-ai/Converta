# Converta — macOS Standalone File Converter

Converta is a high-performance, private, and offline macOS file conversion utility with a circular radial wheel user interface inspired by [filee.sh](https://filee.sh/).

## Architecture & Features

- **Swift 5.9 / 6.0 & SwiftUI**: Modern macOS 14+ Sonoma desktop UI with AppKit integration.
- **Radial Wheel Interface**: Interactive segmented wheel with 8 categories:
  - **Images**: PNG, JPG, JPEG, WEBP, HEIC, TIFF, BMP, GIF, ICO, SVG.
  - **Video**: MP4, MOV, MKV, AVI, WEBM, GIF Video (AVFoundation + FFmpeg).
  - **Audio**: MP3, WAV, FLAC, AAC, M4A, OGG, AIFF (AVFoundation + FFmpeg).
  - **Documents**: DOCX, DOC, TXT, RTF, ODT, XLSX, CSV, PPTX.
  - **PDF**: PDF to Images, Images to PDF, PDF merge, compression.
  - **Archives**: ZIP, TAR, GZ, 7Z (via macOS ditto & tar).
  - **Developer Tools**: JSON, XML, YAML, CSV, Markdown, HTML.
  - **Other Formats**: Vector, font and raw conversions.
- **Offline & Private**: 100% of conversion logic runs locally on the user's Mac. Zero cloud uploads.
- **Batch Processing**: Drag and drop single or multiple files with automatic file type detection.

## Building and Running

### Method 1: Open in Xcode
1. Double-click `Converta.xcodeproj` to open the project in Xcode 15 or 16.
2. Select the **Converta** scheme and destination **My Mac**.
3. Press `Cmd + R` to build and run.

### Method 2: Swift Package Manager
```bash
cd Converta
swift build -c release
swift test
```

### Method 3: Automated Standalone DMG Installer
To compile the release binary and generate a distributable `Converta.dmg` installer with `/Applications` shortcut:

```bash
chmod +x build_dmg.sh
./build_dmg.sh
```

The resulting `Converta.dmg` file will be generated in `build/Converta.dmg`.

## Code Signing & Notarization

See [NOTARIZATION.md](NOTARIZATION.md) for full instructions on signing with an Apple Developer ID certificate and submitting to Apple's Notary service.
