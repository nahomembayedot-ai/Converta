import React, { useState } from 'react';
import {
  Code2,
  Download,
  Terminal,
  FolderTree,
  FileCode,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  Cpu,
  Layers,
  Sparkles,
  Apple,
} from 'lucide-react';

interface FileNode {
  name: string;
  path: string;
  language: string;
  content: string;
}

const NATIVE_FILES: FileNode[] = [
  {
    name: 'ConvertaApp.swift',
    path: 'Converta/App/ConvertaApp.swift',
    language: 'swift',
    content: `import SwiftUI
import AppKit

@main
struct ConvertaApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        WindowGroup {
            MainContentView()
                .frame(minWidth: 880, minHeight: 640)
        }
        .windowStyle(.hiddenTitleBar)
        .windowToolbarStyle(.unified(showsTitle: false))
        .commands {
            SidebarCommands()
            CommandGroup(replacing: .newItem) {
                Button("Open File...") {
                    let openPanel = NSOpenPanel()
                    openPanel.canChooseFiles = true
                    openPanel.canChooseDirectories = false
                    if openPanel.runModal() == .OK, let url = openPanel.url {
                        NotificationCenter.default.post(name: NSNotification.Name("ConvertaOpenFile"), object: url)
                    }
                }
                .keyboardShortcut("o", modifiers: .command)
            }
        }

        Settings {
            SettingsView()
                .frame(width: 480, height: 380)
        }
    }
}`,
  },
  {
    name: 'RadialWheelView.swift',
    path: 'Converta/Wheel/RadialWheelView.swift',
    language: 'swift',
    content: `import SwiftUI

public struct RadialWheelView: View {
    @Binding public var selectedCategory: FileCategory?
    @Binding public var selectedFormat: FileType?
    public var onFileDropped: (URL) -> Void
    public var onSelectFormat: (FileType) -> Void

    @State private var hoveredCategory: FileCategory?
    private let categories = FileCategory.allCases

    public var body: some View {
        GeometryReader { geometry in
            let wheelSize = min(geometry.size.width, geometry.size.height) * 0.78
            let segmentAngle = 360.0 / Double(categories.count)

            ZStack {
                // Background Ambient Glow
                if let activeCat = selectedCategory ?? hoveredCategory {
                    Circle()
                        .fill(activeCat.themeColor.opacity(0.18))
                        .frame(width: wheelSize * 1.15, height: wheelSize * 1.15)
                        .blur(radius: 35)
                }

                // Outer Radial Ring of Format Options
                if let category = selectedCategory {
                    FormatOrbRingView(
                        category: category,
                        selectedFormat: selectedFormat,
                        onSelectFormat: onSelectFormat
                    )
                    .frame(width: wheelSize * 1.3, height: wheelSize * 1.3)
                    .transition(.scale.combined(with: .opacity))
                }

                // Main Segmented Radial Wheel (Annular sectors)
                ZStack {
                    ForEach(Array(categories.enumerated()), id: \\.element.id) { index, category in
                        let startAngle = Angle.degrees(Double(index) * segmentAngle - 90.0)
                        let endAngle = Angle.degrees(Double(index + 1) * segmentAngle - 90.0)
                        let isSelected = selectedCategory == category
                        let isHovered = hoveredCategory == category

                        WheelSegmentShape(startAngle: startAngle, endAngle: endAngle, innerRadiusRatio: 0.52)
                            .fill(isSelected ? category.themeColor : (isHovered ? category.themeColor.opacity(0.35) : Color(NSColor.controlBackgroundColor).opacity(0.8)))
                            .overlay(WheelSegmentShape(startAngle: startAngle, endAngle: endAngle, innerRadiusRatio: 0.52).stroke(isSelected ? Color.white : Color.white.opacity(0.1), lineWidth: isSelected ? 2 : 1))
                            .scaleEffect(isSelected ? 1.04 : (isHovered ? 1.02 : 1.0))
                            .onHover { hovering in
                                withAnimation(.easeInOut(duration: 0.2)) { hoveredCategory = hovering ? category : nil }
                            }
                            .onTapGesture {
                                withAnimation(.spring(response: 0.4, dampingFraction: 0.75)) {
                                    selectedCategory = selectedCategory == category ? nil : category
                                }
                            }
                    }
                }
                .frame(width: wheelSize, height: wheelSize)

                // Central Hub (Drop Target)
                CentralHubDropView(selectedCategory: selectedCategory, onFileDropped: onFileDropped)
                    .frame(width: wheelSize * 0.46, height: wheelSize * 0.46)
            }
        }
    }
}`,
  },
  {
    name: 'ImageConverter.swift',
    path: 'Converta/Converters/ImageConverter/ImageConverter.swift',
    language: 'swift',
    content: `import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

public final class ImageConverter {
    public static let shared = ImageConverter()

    public func convert(
        sourceURL: URL,
        targetType: FileType,
        settings: ConversionSettings,
        progressHandler: @escaping (Double) -> Void
    ) async throws -> URL {
        progressHandler(0.1)

        guard let source = CGImageSourceCreateWithURL(sourceURL as CFURL, nil),
              let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
            throw ConversionError.invalidInputFile("Cannot read image from \(sourceURL.lastPathComponent)")
        }

        let outDir = settings.outputDirectory ?? sourceURL.deletingLastPathComponent()
        let outputURL = outDir.appendingPathComponent("\(sourceURL.deletingPathExtension().lastPathComponent)-converted.\(targetType.fileExtension)")

        guard let destination = CGImageDestinationCreateWithURL(outputURL as CFURL, targetType.uniformTypeIdentifier as CFString, 1, nil) else {
            throw ConversionError.unsupportedFormat("Failed to create destination for \(targetType.rawValue)")
        }

        var properties = [CFString: Any]()
        properties[kCGImageDestinationLossyCompressionQuality] = settings.imageQuality

        if settings.preserveMetadata, let meta = CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [CFString: Any] {
            properties[kCGImageDestinationMergeMetadata] = kCFBooleanTrue
            properties[kCGImagePropertyExifDictionary] = meta[kCGImagePropertyExifDictionary]
        }

        CGImageDestinationAddImage(destination, image, properties as CFDictionary)
        guard CGImageDestinationFinalize(destination) else {
            throw ConversionError.conversionFailed("CGImageDestinationFinalize failed")
        }

        progressHandler(1.0)
        return outputURL
    }
}`,
  },
  {
    name: 'build_dmg.sh',
    path: 'Converta/build_dmg.sh',
    language: 'bash',
    content: `#!/usr/bin/env bash
# Converta — macOS Standalone Application (.app) & DMG Distribution Builder
set -euo pipefail

APP_NAME="Converta"
BUILD_DIR="$(pwd)/build"
APP_PATH="\${BUILD_DIR}/Release/\${APP_NAME}.app"
DMG_PATH="\${BUILD_DIR}/\${APP_NAME}.dmg"
DMG_STAGING="\${BUILD_DIR}/dmg_staging"

echo ">>> [1/5] Compiling Swift Codebase..."
xcodebuild -project "\${APP_NAME}.xcodeproj" -scheme "\${APP_NAME}" -configuration Release build

echo ">>> [2/5] Creating DMG Staging Directory & Applications Shortcut..."
mkdir -p "\${DMG_STAGING}"
cp -R "\${APP_PATH}" "\${DMG_STAGING}/"
ln -s /Applications "\${DMG_STAGING}/Applications"

echo ">>> [3/5] Packaging DMG with hdiutil..."
hdiutil create -volname "\${APP_NAME}" -srcfolder "\${DMG_STAGING}" -ov -format UDZO "\${DMG_PATH}"

echo ">>> [4/5] Gatekeeper Code Signing & Notarization..."
# codesign --deep --force --verify --verbose --sign "Developer ID Application: Your Team" "\${DMG_PATH}"
# xcrun notarytool submit "\${DMG_PATH}" --keychain-profile "CONVERTA_NOTARY" --wait
# xcrun stapler staple "\${DMG_PATH}"

echo "✓ Distribution installer created: \${DMG_PATH}"`,
  },
  {
    name: 'Package.swift',
    path: 'Converta/Package.swift',
    language: 'swift',
    content: `// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "Converta",
    platforms: [.macOS(.v14)],
    products: [
        .executable(name: "Converta", targets: ["Converta"]),
        .library(name: "ConvertaCore", targets: ["ConvertaCore"])
    ],
    targets: [
        .target(name: "ConvertaCore", path: "Converta", exclude: ["App/ConvertaApp.swift", "Resources"]),
        .executableTarget(name: "Converta", dependencies: ["ConvertaCore"], path: "Converta/App"),
        .testTarget(name: "ConvertaTests", dependencies: ["ConvertaCore"], path: "Tests/ConvertaTests")
    ]
)`,
  },
];

export const XcodeProjectViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FileNode>(NATIVE_FILES[0]);
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden">
      {/* Distribution & Deliverables Header */}
      <div className="flex items-center justify-between pb-5 border-b border-white/10 shrink-0">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Apple className="w-5 h-5 text-indigo-400" />
            Native macOS Deliverables Suite
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete native Swift 5.9 / SwiftUI codebase, Xcode project, and DMG packaging pipeline.
          </p>
        </div>

        {/* 1-Click Direct Downloads */}
        <div className="flex items-center space-x-2.5">
          <a
            href="/Converta.dmg"
            download="Converta.dmg"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:brightness-110 active:scale-95 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Converta.dmg</span>
          </a>

          <a
            href="/Converta-macOS-Xcode-Project.zip"
            download="Converta-macOS-Xcode-Project.zip"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-slate-200 font-semibold text-xs border border-white/15 transition-all"
          >
            <FolderTree className="w-4 h-4 text-indigo-400" />
            <span>Xcode Project (.zip)</span>
          </a>
        </div>
      </div>

      {/* Main Split View: File Tree + Source Viewer */}
      <div className="flex-1 flex mt-5 rounded-2xl border border-white/10 overflow-hidden bg-slate-950/70 shadow-2xl">
        {/* File Navigator */}
        <div className="w-64 bg-slate-900/90 border-r border-white/10 flex flex-col p-3 select-none shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
            Xcode Project Structure
          </span>

          <div className="space-y-1 overflow-y-auto flex-1">
            {NATIVE_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center space-x-2 transition-colors ${
                    isSelected
                      ? 'bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                  <span className="truncate">{file.name}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-white/10 space-y-1.5 text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target: macOS 14.0+ Sonoma</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Notarization: Notarytool ready</span>
            </div>
          </div>
        </div>

        {/* Code Content & Action Bar */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0b0e14]">
          <div className="h-10 px-4 bg-slate-900/70 border-b border-white/10 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">{selectedFile.path}</span>
            <button
              onClick={copyCode}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <pre className="flex-1 p-5 overflow-auto text-xs font-mono text-slate-200 leading-relaxed selection:bg-indigo-600/50">
            <code>{selectedFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
