import Foundation
import UniformTypeIdentifiers

public final class FileDetectionService {
    public static let shared = FileDetectionService()

    private init() {}

    /// Automatically detects the FileType, file size, and recommended targets from a file URL.
    public func analyzeFile(at url: URL) -> (fileType: FileType?, size: Int64, recommendedTargets: [FileType]) {
        let fileType = FileType.detect(from: url)
        var size: Int64 = 0

        if let attrs = try? FileManager.default.attributesOfItem(atPath: url.path),
           let fileSize = attrs[.size] as? Int64 {
            size = fileSize
        }

        let recommended = getRecommendedTargets(for: fileType)
        return (fileType, size, recommended)
    }

    public func getRecommendedTargets(for type: FileType?) -> [FileType] {
        guard let type = type else {
            return [.png, .jpg, .pdf, .mp4, .mp3, .zip]
        }

        switch type {
        case .heic, .tiff, .bmp:
            return [.jpg, .png, .webp]
        case .png:
            return [.webp, .jpg, .pdf, .ico]
        case .jpg, .jpeg:
            return [.png, .webp, .pdf]
        case .webp:
            return [.png, .jpg]
        case .gif:
            return [.mp4, .webp, .png]
        case .svg:
            return [.png, .pdf]
        case .ico:
            return [.png, .ico]

        case .mov:
            return [.mp4, .webm, .videoGif, .mp3]
        case .mp4:
            return [.mov, .webm, .videoGif, .mp3]
        case .mkv, .avi:
            return [.mp4, .mov, .mp3]
        case .webm:
            return [.mp4, .mov]
        case .videoGif:
            return [.mp4, .webp]

        case .wav:
            return [.mp3, .aac, .flac]
        case .flac:
            return [.mp3, .wav, .m4a]
        case .mp3:
            return [.wav, .m4a, .ogg]
        case .m4a, .aac:
            return [.mp3, .wav]
        case .ogg, .aiff:
            return [.mp3, .wav]

        case .pdf:
            return [.pdfToImages, .compressPdf, .splitPdf]
        case .docx, .doc:
            return [.pdf, .txt, .html]
        case .txt, .rtf:
            return [.pdf, .docx, .html]
        case .csv:
            return [.json, .xlsx, .html]
        case .json:
            return [.csv, .yaml, .xml]
        case .xml:
            return [.json, .yaml]
        case .yaml:
            return [.json, .xml]
        case .markdown:
            return [.html, .pdf, .txt]
        default:
            return type.category.supportedFormats.filter { $0 != type }
        }
    }
}
