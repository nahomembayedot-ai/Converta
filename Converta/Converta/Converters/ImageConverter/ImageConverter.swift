import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers
#if canImport(AppKit)
import AppKit
#endif

public final class ImageConverter {
    public static let shared = ImageConverter()

    private init() {}

    /// Converts an image to the target format with quality and dimension settings.
    public func convert(
        sourceURL: URL,
        targetType: FileType,
        settings: ConversionSettings,
        progressHandler: @escaping (Double) -> Void
    ) async throws -> URL {
        progressHandler(0.1)

        guard let source = CGImageSourceCreateWithURL(sourceURL as CFURL, nil) else {
            throw ConversionError.invalidInputFile("Cannot read image source from \(sourceURL.lastPathComponent)")
        }

        let count = CGImageSourceGetCount(source)
        guard count > 0, let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
            throw ConversionError.corruptedFile("No valid image frame found.")
        }

        progressHandler(0.35)

        // Determine output directory & filename
        let outDir = settings.outputDirectory ?? sourceURL.deletingLastPathComponent()
        let baseName = sourceURL.deletingPathExtension().lastPathComponent
        let outputURL = outDir.appendingPathComponent("\(baseName)-converted.\(targetType.fileExtension)")

        // Map target type to UTType identifier
        let uti: CFString
        switch targetType {
        case .png:
            uti = UTType.png.identifier as CFString
        case .jpg, .jpeg:
            uti = UTType.jpeg.identifier as CFString
        case .webp:
            uti = (UTType("org.webmproject.webp") ?? UTType.jpeg).identifier as CFString
        case .heic:
            uti = UTType.heic.identifier as CFString
        case .tiff:
            uti = UTType.tiff.identifier as CFString
        case .bmp:
            uti = UTType.bmp.identifier as CFString
        case .gif:
            uti = UTType.gif.identifier as CFString
        case .ico:
            uti = UTType.ico.identifier as CFString
        default:
            uti = UTType.png.identifier as CFString
        }

        guard let destination = CGImageDestinationCreateWithURL(outputURL as CFURL, uti, 1, nil) else {
            throw ConversionError.unsupportedFormat("Failed to create destination for \(targetType.rawValue)")
        }

        progressHandler(0.6)

        // Apply quality and metadata properties
        var properties = [CFString: Any]()
        properties[kCGImageDestinationLossyCompressionQuality] = settings.imageQuality

        if settings.preserveMetadata, let metadata = CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [CFString: Any] {
            properties[kCGImageDestinationMergeMetadata] = kCFBooleanTrue
            properties[kCGImagePropertyExifDictionary] = metadata[kCGImagePropertyExifDictionary]
        }

        CGImageDestinationAddImage(destination, image, properties as CFDictionary)

        progressHandler(0.85)

        guard CGImageDestinationFinalize(destination) else {
            throw ConversionError.conversionFailed("CGImageDestinationFinalize failed for \(targetType.rawValue)")
        }

        progressHandler(1.0)
        return outputURL
    }
}

public enum ConversionError: LocalizedError {
    case invalidInputFile(String)
    case corruptedFile(String)
    case unsupportedFormat(String)
    case conversionFailed(String)
    case processExecutionFailed(String)
    case cancelled

    public var errorDescription: String? {
        switch self {
        case .invalidInputFile(let msg): return "Invalid input file: \(msg)"
        case .corruptedFile(let msg): return "Corrupted file: \(msg)"
        case .unsupportedFormat(let msg): return "Unsupported format: \(msg)"
        case .conversionFailed(let msg): return "Conversion failed: \(msg)"
        case .processExecutionFailed(let msg): return "Engine error: \(msg)"
        case .cancelled: return "Operation cancelled by user."
        }
    }
}
