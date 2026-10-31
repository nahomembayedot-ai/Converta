import Foundation

public final class ArchiveConverter {
    public static let shared = ArchiveConverter()

    private init() {}

    /// Archives input files into ZIP or TAR using native macOS ditto/tar tools.
    public func createArchive(
        sourceURLs: [URL],
        targetType: FileType,
        settings: ConversionSettings,
        progressHandler: @escaping (Double) -> Void
    ) async throws -> URL {
        guard let first = sourceURLs.first else {
            throw ConversionError.invalidInputFile("No input files to archive.")
        }

        let outDir = settings.outputDirectory ?? first.deletingLastPathComponent()
        let archiveName = sourceURLs.count == 1 ? first.deletingPathExtension().lastPathComponent : "Converta_Archive"
        let outputURL = outDir.appendingPathComponent("\(archiveName).\(targetType.fileExtension)")

        progressHandler(0.2)

        let process = Process()
        if targetType == .zip {
            process.executableURL = URL(fileURLWithPath: "/usr/bin/ditto")
            var args = ["-c", "-k", "--sequesterRsrc", "--keepParent"]
            for url in sourceURLs {
                args.append(url.path)
            }
            args.append(outputURL.path)
            process.arguments = args
        } else {
            // TAR / GZ
            process.executableURL = URL(fileURLWithPath: "/usr/bin/tar")
            var args = [targetType == .gzip ? "-czf" : "-cf", outputURL.path]
            for url in sourceURLs {
                args.append(url.path)
            }
            process.arguments = args
        }

        try process.run()
        progressHandler(0.6)
        process.waitUntilExit()

        if process.terminationStatus == 0 {
            progressHandler(1.0)
            return outputURL
        } else {
            throw ConversionError.processExecutionFailed("Archive creation exited with status \(process.terminationStatus)")
        }
    }
}
