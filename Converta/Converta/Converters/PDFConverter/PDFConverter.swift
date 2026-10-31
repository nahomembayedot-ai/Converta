import Foundation
import CoreGraphics
#if canImport(PDFKit)
import PDFKit
#endif
#if canImport(AppKit)
import AppKit
#endif

public final class PDFConverter {
    public static let shared = PDFConverter()

    private init() {}

    /// Converts images into a single combined PDF document.
    public func convertImagesToPDF(
        imageURLs: [URL],
        outputURL: URL,
        progressHandler: @escaping (Double) -> Void
    ) async throws -> URL {
        #if canImport(PDFKit)
        let pdfDoc = PDFDocument()
        let count = Double(imageURLs.count)

        for (index, url) in imageURLs.enumerated() {
            guard let image = NSImage(contentsOf: url),
                  let page = PDFPage(image: image) else { continue }
            pdfDoc.insert(page, at: pdfDoc.pageCount)
            progressHandler(Double(index + 1) / count * 0.9)
        }

        guard pdfDoc.pageCount > 0 else {
            throw ConversionError.invalidInputFile("No valid images could be read for PDF creation.")
        }

        guard pdfDoc.write(to: outputURL) else {
            throw ConversionError.conversionFailed("Could not write PDF document to disk.")
        }

        progressHandler(1.0)
        return outputURL
        #else
        throw ConversionError.unsupportedFormat("PDFKit not available on this platform.")
        #endif
    }

    /// Converts PDF pages into individual image files (PNG / JPEG).
    public func convertPDFToImages(
        sourceURL: URL,
        format: FileType,
        dpi: Int = 300,
        progressHandler: @escaping (Double) -> Void
    ) async throws -> [URL] {
        #if canImport(PDFKit)
        guard let pdfDoc = PDFDocument(url: sourceURL) else {
            throw ConversionError.invalidInputFile("Cannot load PDF document from \(sourceURL.lastPathComponent)")
        }

        let totalPages = pdfDoc.pageCount
        guard totalPages > 0 else {
            throw ConversionError.corruptedFile("PDF has 0 pages.")
        }

        let outDir = sourceURL.deletingLastPathComponent().appendingPathComponent("\(sourceURL.deletingPathExtension().lastPathComponent)-pages", isDirectory: true)
        try? FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)

        var generatedFiles: [URL] = []

        for i in 0..<totalPages {
            guard let page = pdfDoc.page(at: i) else { continue }
            let pageRect = page.bounds(for: .mediaBox)
            let scale = CGFloat(dpi) / 72.0
            let targetSize = CGSize(width: pageRect.width * scale, height: pageRect.height * scale)

            let image = NSImage(size: targetSize)
            image.lockFocus()
            if let context = NSGraphicsContext.current?.cgContext {
                context.setFillColor(CGColor(gray: 1.0, alpha: 1.0))
                context.fill(CGRect(origin: .zero, size: targetSize))
                context.scaleBy(x: scale, y: scale)
                page.draw(with: .mediaBox, to: context)
            }
            image.unlockFocus()

            let pageFileURL = outDir.appendingPathComponent("page_\(i + 1).\(format.fileExtension)")
            if let tiffData = image.tiffRepresentation,
               let bitmap = NSBitmapImageRep(data: tiffData),
               let outData = bitmap.representation(using: format == .png ? .png : .jpeg, properties: [:]) {
                try outData.write(to: pageFileURL)
                generatedFiles.append(pageFileURL)
            }

            progressHandler(Double(i + 1) / Double(totalPages))
        }

        return generatedFiles
        #else
        throw ConversionError.unsupportedFormat("PDFKit not available.")
        #endif
    }

    /// Merges multiple PDF files into one consolidated PDF.
    public func mergePDFs(
        sourceURLs: [URL],
        outputURL: URL,
        progressHandler: @escaping (Double) -> Void
    ) async throws -> URL {
        #if canImport(PDFKit)
        let mergedDoc = PDFDocument()
        let count = Double(sourceURLs.count)

        for (index, url) in sourceURLs.enumerated() {
            if let doc = PDFDocument(url: url) {
                for pageIndex in 0..<doc.pageCount {
                    if let page = doc.page(at: pageIndex) {
                        mergedDoc.insert(page, at: mergedDoc.pageCount)
                    }
                }
            }
            progressHandler(Double(index + 1) / count * 0.9)
        }

        guard mergedDoc.write(to: outputURL) else {
            throw ConversionError.conversionFailed("Failed to write merged PDF.")
        }

        progressHandler(1.0)
        return outputURL
        #else
        throw ConversionError.unsupportedFormat("PDFKit not available.")
        #endif
    }
}
