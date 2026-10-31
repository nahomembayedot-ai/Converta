import Foundation
import UniformTypeIdentifiers

/// Represents discrete file formats supported by Converta.
public enum FileType: String, CaseIterable, Identifiable, Codable {
    // Images
    case png = "PNG"
    case jpg = "JPG"
    case jpeg = "JPEG"
    case webp = "WEBP"
    case heic = "HEIC"
    case tiff = "TIFF"
    case bmp = "BMP"
    case gif = "GIF"
    case ico = "ICO"
    case svg = "SVG"

    // Video
    case mp4 = "MP4"
    case mov = "MOV"
    case mkv = "MKV"
    case avi = "AVI"
    case webm = "WEBM"
    case videoGif = "GIF Video"

    // Audio
    case mp3 = "MP3"
    case wav = "WAV"
    case flac = "FLAC"
    case aac = "AAC"
    case m4a = "M4A"
    case ogg = "OGG"
    case aiff = "AIFF"

    // Documents
    case docx = "DOCX"
    case doc = "DOC"
    case txt = "TXT"
    case rtf = "RTF"
    case odt = "ODT"
    case xlsx = "XLSX"
    case csv = "CSV"
    case pptx = "PPTX"

    // PDF operations
    case pdf = "PDF"
    case pdfToImages = "PDF to PNG/JPG"
    case imagesToPdf = "Images to PDF"
    case mergePdf = "Merge PDFs"
    case splitPdf = "Split PDF"
    case compressPdf = "Compress PDF"

    // Archives
    case zip = "ZIP"
    case tar = "TAR"
    case gzip = "GZ"
    case sevenZip = "7Z"

    // Developer Tools
    case json = "JSON"
    case xml = "XML"
    case yaml = "YAML"
    case html = "HTML"
    case markdown = "MD"

    public var id: String { rawValue }

    public var category: FileCategory {
        switch self {
        case .png, .jpg, .jpeg, .webp, .heic, .tiff, .bmp, .gif, .ico, .svg:
            return .images
        case .mp4, .mov, .mkv, .avi, .webm, .videoGif:
            return .video
        case .mp3, .wav, .flac, .aac, .m4a, .ogg, .aiff:
            return .audio
        case .docx, .doc, .txt, .rtf, .odt, .xlsx, .csv, .pptx:
            return .documents
        case .pdf, .pdfToImages, .imagesToPdf, .mergePdf, .splitPdf, .compressPdf:
            return .pdf
        case .zip, .tar, .gzip, .sevenZip:
            return .archives
        case .json, .xml, .yaml, .html, .markdown:
            return .developerTools
        }
    }

    public var fileExtension: String {
        switch self {
        case .png: return "png"
        case .jpg: return "jpg"
        case .jpeg: return "jpeg"
        case .webp: return "webp"
        case .heic: return "heic"
        case .tiff: return "tiff"
        case .bmp: return "bmp"
        case .gif, .videoGif: return "gif"
        case .ico: return "ico"
        case .svg: return "svg"
        case .mp4: return "mp4"
        case .mov: return "mov"
        case .mkv: return "mkv"
        case .avi: return "avi"
        case .webm: return "webm"
        case .mp3: return "mp3"
        case .wav: return "wav"
        case .flac: return "flac"
        case .aac: return "aac"
        case .m4a: return "m4a"
        case .ogg: return "ogg"
        case .aiff: return "aiff"
        case .docx: return "docx"
        case .doc: return "doc"
        case .txt: return "txt"
        case .rtf: return "rtf"
        case .odt: return "odt"
        case .xlsx: return "xlsx"
        case .csv: return "csv"
        case .pptx: return "pptx"
        case .pdf, .imagesToPdf, .mergePdf, .splitPdf, .compressPdf: return "pdf"
        case .pdfToImages: return "zip"
        case .zip: return "zip"
        case .tar: return "tar"
        case .gzip: return "tar.gz"
        case .sevenZip: return "7z"
        case .json: return "json"
        case .xml: return "xml"
        case .yaml: return "yaml"
        case .html: return "html"
        case .markdown: return "md"
        }
    }

    public static func detect(from url: URL) -> FileType? {
        let ext = url.pathExtension.lowercased()
        switch ext {
        case "png": return .png
        case "jpg", "jpeg": return .jpg
        case "webp": return .webp
        case "heic", "heif": return .heic
        case "tiff", "tif": return .tiff
        case "bmp": return .bmp
        case "gif": return .gif
        case "ico": return .ico
        case "svg": return .svg
        case "mp4", "m4v": return .mp4
        case "mov": return .mov
        case "mkv": return .mkv
        case "avi": return .avi
        case "webm": return .webm
        case "mp3": return .mp3
        case "wav": return .wav
        case "flac": return .flac
        case "aac": return .aac
        case "m4a": return .m4a
        case "ogg": return .ogg
        case "aiff", "aif": return .aiff
        case "docx": return .docx
        case "doc": return .doc
        case "txt": return .txt
        case "rtf": return .rtf
        case "odt": return .odt
        case "xlsx": return .xlsx
        case "csv": return .csv
        case "pptx": return .pptx
        case "pdf": return .pdf
        case "zip": return .zip
        case "tar": return .tar
        case "gz", "gzip": return .gzip
        case "7z": return .sevenZip
        case "json": return .json
        case "xml": return .xml
        case "yaml", "yml": return .yaml
        case "html", "htm": return .html
        case "md", "markdown": return .markdown
        default: return nil
        }
    }
}
