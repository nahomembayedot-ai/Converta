import Foundation
import SwiftUI

/// Main conversion categories supported by the Converta circular radial wheel.
public enum FileCategory: String, CaseIterable, Identifiable, Codable {
    case images = "Images"
    case video = "Video"
    case audio = "Audio"
    case documents = "Documents"
    case pdf = "PDF"
    case archives = "Archives"
    case developerTools = "Developer Tools"
    case otherFormats = "Other Formats"

    public var id: String { rawValue }

    public var iconName: String {
        switch self {
        case .images: return "photo.on.rectangle.angled"
        case .video: return "film.stack"
        case .audio: return "waveform"
        case .documents: return "doc.text.fill"
        case .pdf: return "doc.richtext.fill"
        case .archives: return "archivebox.fill"
        case .developerTools: return "chevron.left.forwardslash.chevron.right"
        case .otherFormats: return "ellipsis.circle.fill"
        }
    }

    public var description: String {
        switch self {
        case .images: return "Convert PNG, JPG, WEBP, HEIC, TIFF, BMP, GIF, SVG, ICO"
        case .video: return "High efficiency MP4, MOV, MKV, AVI, WEBM, animated GIF"
        case .audio: return "Lossless & compressed MP3, WAV, FLAC, AAC, M4A, OGG, AIFF"
        case .documents: return "Standard Office & text: DOCX, DOC, TXT, RTF, ODT, XLSX, CSV"
        case .pdf: return "PDF to Images, Images to PDF, Merge, Split & Compress"
        case .archives: return "ZIP, TAR, GZIP, 7Z creation and extraction"
        case .developerTools: return "Transform JSON, YAML, XML, CSV, Markdown & HTML"
        case .otherFormats: return "Specialized vector, font, and binary conversions"
        }
    }

    public var themeColor: Color {
        switch self {
        case .images: return Color.indigo
        case .video: return Color.purple
        case .audio: return Color.pink
        case .documents: return Color.blue
        case .pdf: return Color.red
        case .archives: return Color.orange
        case .developerTools: return Color.cyan
        case .otherFormats: return Color.teal
        }
    }

    public var supportedFormats: [FileType] {
        FileType.allCases.filter { $0.category == self }
    }
}
