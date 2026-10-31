import Foundation
import AVFoundation

public final class AudioConverter {
    public static let shared = AudioConverter()

    private init() {}

    public func convert(
        sourceURL: URL,
        targetType: FileType,
        settings: ConversionSettings,
        progressHandler: @escaping (Double) -> Void
    ) async throws -> URL {
        let outDir = settings.outputDirectory ?? sourceURL.deletingLastPathComponent()
        let baseName = sourceURL.deletingPathExtension().lastPathComponent
        let outputURL = outDir.appendingPathComponent("\(baseName)-converted.\(targetType.fileExtension)")

        progressHandler(0.2)

        // If target is M4A / AAC, we can use native AVAssetExportSession
        if targetType == .m4a || targetType == .aac {
            let asset = AVAsset(url: sourceURL)
            guard let exportSession = AVAssetExportSession(asset: asset, presetName: AVAssetExportPresetAppleM4A) else {
                throw ConversionError.conversionFailed("Unable to create AVAssetExportSession for audio.")
            }

            exportSession.outputURL = outputURL
            exportSession.outputFileType = .m4a

            await exportSession.export()

            if exportSession.status == .completed {
                progressHandler(1.0)
                return outputURL
            }
        }

        // Use FFmpeg for MP3, WAV, FLAC, OGG, AIFF
        let ffmpegPaths = ["/opt/homebrew/bin/ffmpeg", "/usr/local/bin/ffmpeg", "/usr/bin/ffmpeg"]
        guard let ffmpeg = ffmpegPaths.first(where: { FileManager.default.isExecutableFile(atPath: $0) }) else {
            throw ConversionError.unsupportedFormat("FFmpeg is needed for \(targetType.rawValue) audio conversion.")
        }

        progressHandler(0.4)
        var args = ["-y", "-i", sourceURL.path]

        switch targetType {
        case .mp3:
            args.append(contentsOf: ["-b:a", "\(settings.audioBitrateKbps)k"])
        case .flac:
            args.append(contentsOf: ["-c:a", "flac"])
        case .wav:
            args.append(contentsOf: ["-c:a", "pcm_s16le"])
        case .ogg:
            args.append(contentsOf: ["-c:a", "libvorbis", "-qscale:a", "5"])
        case .aiff:
            args.append(contentsOf: ["-c:a", "pcm_s16be"])
        default:
            break
        }

        args.append(contentsOf: ["-ar", "\(settings.audioSampleRateHz)", outputURL.path])

        let process = Process()
        process.executableURL = URL(fileURLWithPath: ffmpeg)
        process.arguments = args
        let pipe = Pipe()
        process.standardError = pipe

        try process.run()
        progressHandler(0.7)
        process.waitUntilExit()

        if process.terminationStatus == 0 {
            progressHandler(1.0)
            return outputURL
        } else {
            let data = pipe.fileHandleForReading.readDataToEndOfFile()
            let errStr = String(data: data, encoding: .utf8) ?? "FFmpeg audio conversion error"
            throw ConversionError.processExecutionFailed(errStr)
        }
    }
}
