import Foundation
#if canImport(AppKit)
import AppKit
#endif

public final class DocumentConverter {
    public static let shared = DocumentConverter()

    private init() {}

    public func convert(
        sourceURL: URL,
        targetType: FileType,
        settings: ConversionSettings,
        progressHandler: @escaping (Double) -> Void
    ) async throws -> URL {
        progressHandler(0.2)
        let outDir = settings.outputDirectory ?? sourceURL.deletingLastPathComponent()
        let baseName = sourceURL.deletingPathExtension().lastPathComponent
        let outputURL = outDir.appendingPathComponent("\(baseName)-converted.\(targetType.fileExtension)")

        let rawData = try Data(contentsOf: sourceURL)
        let rawString = String(data: rawData, encoding: .utf8) ?? ""

        progressHandler(0.5)

        switch targetType {
        case .txt:
            // Convert any document/markdown to plain text
            let plainText = rawString
                .replacingOccurrences(of: "<[^>]+>", with: "", options: .regularExpression)
            try plainText.write(to: outputURL, atomically: true, encoding: .utf8)

        case .html:
            // Wrap text or Markdown in HTML document
            let html = """
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"><title>\(baseName)</title></head>
            <body style="font-family: -apple-system, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px;">
            \(rawString.replacingOccurrences(of: "\n", with: "<br>\n"))
            </body>
            </html>
            """
            try html.write(to: outputURL, atomically: true, encoding: .utf8)

        case .markdown:
            try rawString.write(to: outputURL, atomically: true, encoding: .utf8)

        case .json:
            // If CSV, convert CSV rows to JSON array
            if sourceURL.pathExtension.lowercased() == "csv" {
                let lines = rawString.components(separatedBy: .newlines).filter { !$0.trimmingCharacters(in: .whitespaces).isEmpty }
                guard let headerLine = lines.first else { throw ConversionError.invalidInputFile("Empty CSV") }
                let headers = headerLine.components(separatedBy: ",").map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
                var records: [[String: String]] = []
                for line in lines.dropFirst() {
                    let cols = line.components(separatedBy: ",").map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
                    var row: [String: String] = [:]
                    for (i, h) in headers.enumerated() {
                        row[h] = i < cols.count ? cols[i] : ""
                    }
                    records.append(row)
                }
                let jsonData = try JSONSerialization.data(withJSONObject: records, options: [.prettyPrinted])
                try jsonData.write(to: outputURL)
            } else {
                try rawString.write(to: outputURL, atomically: true, encoding: .utf8)
            }

        case .csv:
            // If JSON array, convert to CSV
            if let obj = try? JSONSerialization.jsonObject(with: rawData) as? [[String: Any]], let first = obj.first {
                let headers = Array(first.keys).sorted()
                var csv = headers.joined(separator: ",") + "\n"
                for row in obj {
                    let rowStr = headers.map { "\((row[$0] ?? ""))" }.joined(separator: ",")
                    csv += rowStr + "\n"
                }
                try csv.write(to: outputURL, atomically: true, encoding: .utf8)
            } else {
                try rawString.write(to: outputURL, atomically: true, encoding: .utf8)
            }

        default:
            try rawData.write(to: outputURL)
        }

        progressHandler(1.0)
        return outputURL
    }
}
