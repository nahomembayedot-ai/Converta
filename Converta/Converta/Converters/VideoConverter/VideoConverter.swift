import Foundation
import AVFoundation

public final class VideoConverter {
    public static let shared = VideoConverter()

    private init() {}

    /// Checks if a local or system ffmpeg binary is available.
    public var isFFmpegAvailable: Bool {
        if let path = Bundle.main.path(forResource: "ffmpeg", ofType: nil), FileManager.default.isExecutableFile(atPath: path) {
            return true
        }
        let systemPaths = ["/opt/homebrew/bin/ffmpeg", "/usr/local/bin/ffmpeg", "/usr/bin/ffmpeg"]
        return systemPaths.contains { FileManager.default.isExecutableFile(atPath: $0) }
    }

    public var ffmpegPath: String? {
        if let path = Bundle.main.path(forResource: "ffmpeg", ofType: nil), FileManager.default.isExecutableFile(atPath: path) {
            return path
        }
        let systemPaths = ["/opt/homebrew/bin/ffmpeg", "/usr/local/bin/ffmpeg", "/usr/bin/ffmpeg"]
        return systemPaths.first { FileManager.default.isExecutableFile(atPath: $0) }
    }

    /// Converts video using native AVAssetExportSession or FFmpeg fallback.
    public func convert(
        sourceURL: URL,
        targetType: FileType,
        settings: ConversionSettings,
        progressHandler: @escaping (Double) -> Void
    ) async throws -> URL {
        let outDir = settings.outputDirectory ?? sourceURL.deletingLastPathComponent()
        let baseName = sourceURL.deletingPathExtension().lastPathComponent
        let outputURL = outDir.appendingPathComponent("\(baseName)-converted.\(targetType.fileExtension)")

        // If target is MP4 or MOV, we can use Apple AVFoundation natively!
        if (targetType == .mp4 || targetType == .mov) && !settings.muteAudio {
            let asset = AVAsset(url: sourceURL)
            let preset: String
            switch settings.videoResolution {
            case "1080p": preset = AVAssetExportPreset1920x1080
            case "720p": preset = AVAssetExportPreset1280x720
            case "480p": preset = AVAssetExportPreset640x480
            default: preset = AVAssetExportPresetHighestQuality
            }

            guard let exportSession = AVAssetExportSession(asset: asset, presetName: preset) else {
                throw ConversionError.conversionFailed("Unable to create AVAssetExportSession.")
            }

            exportSession.outputURL = outputURL
            exportSession.outputFileType = targetType == .mp4 ? .mp4 : .mov
            exportSession.shouldOptimizeForNetworkUse = true

            // Progress timer
            let timer = Timer.scheduledTimer(withTimeInterval: 0.2, repeats: true) { _ in
                progressHandler(Double(exportSession.progress))
            }

            await exportSession.export()
            timer.invalidate()

            if exportSession.status == .completed {
                progressHandler(1.0)
                return outputURL
            } else if let error = exportSession.error {
                // If AVAssetExportSession failed, try FFmpeg if available
                if !isFFmpegAvailable {
                    throw ConversionError.conversionFailed(error.localizedDescription)
                }
            }
        }

        // Use FFmpeg for MKV, AVI, WEBM, GIF, or advanced presets
        guard let ffmpeg = ffmpegPath else {
            throw ConversionError.unsupportedFormat("FFmpeg is required for \(targetType.rawValue) conversion. Install via Homebrew: brew install ffmpeg")
        }

        progressHandler(0.2)
        var arguments = ["-y", "-i", sourceURL.path]

        if settings.muteAudio {
            arguments.append("-an")
        }

        switch settings.videoResolution {
        case "1080p":
            arguments.append(contentsOf: ["-vf", "scale=-2:1080"])
        case "720p":
            arguments.append(contentsOf: ["-vf", "scale=-2:720"])
        case "480p":
            arguments.append(contentsOf: ["-vf", "scale=-2:480"])
        default:
            break
        }

        if targetType == .videoGif {
            arguments.append(contentsOf: ["-vf", "fps=15,scale=480:-1:flags=lanczos"])
        }

        arguments.append(outputURL.path)

        let process = Process()
        process.executableURL = URL(fileURLWithPath: ffmpeg)
        process.arguments = arguments

        let pipe = Pipe()
        process.standardError = pipe

        try process.run()
        progressHandler(0.6)
        process.waitUntilExit()

        if process.terminationStatus == 0 {
            progressHandler(1.0)
            return outputURL
        } else {
            let data = pipe.fileHandleForReading.readDataToEndOfFile()
            let errStr = String(data: data, encoding: .utf8) ?? "Unknown FFmpeg error"
            throw ConversionError.processExecutionFailed(errStr)
        }
    }
}
