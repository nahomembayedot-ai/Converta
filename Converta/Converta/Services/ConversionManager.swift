import Foundation
import Combine
#if canImport(AppKit)
import AppKit
#endif

@MainActor
public final class ConversionManager: ObservableObject {
    public static let shared = ConversionManager()

    @Published public var jobs: [ConversionJob] = []
    @Published public var activeJob: ConversionJob?
    @Published public var isConverting: Bool = false
    @Published public var history: [ConversionJob] = []
    @Published public var currentSettings: ConversionSettings = ConversionSettings()

    private var cancellables = Set<AnyCancellable>()

    private init() {
        loadHistory()
    }

    /// Queues and executes a conversion for a given file URL and target format.
    public func startConversion(
        sourceURL: URL,
        targetType: FileType,
        settings: ConversionSettings? = nil
    ) async {
        let (fileType, size, _) = FileDetectionService.shared.analyzeFile(at: sourceURL)
        var job = ConversionJob(
            sourceURL: sourceURL,
            sourceFileType: fileType,
            targetFileType: targetType,
            sourceFileSize: size
        )

        job.status = .converting
        self.activeJob = job
        self.isConverting = true

        let activeSettings = settings ?? self.currentSettings

        do {
            let outURL: URL
            let progressHandler: (Double) -> Void = { [weak self] progress in
                Task { @MainActor in
                    self?.activeJob?.progress = progress
                }
            }

            switch targetType.category {
            case .images:
                outURL = try await ImageConverter.shared.convert(
                    sourceURL: sourceURL,
                    targetType: targetType,
                    settings: activeSettings,
                    progressHandler: progressHandler
                )
            case .pdf:
                if targetType == .imagesToPdf {
                    let out = activeSettings.outputDirectory?.appendingPathComponent("images.pdf") ?? sourceURL.deletingPathExtension().appendingPathExtension("pdf")
                    outURL = try await PDFConverter.shared.convertImagesToPDF(
                        imageURLs: [sourceURL],
                        outputURL: out,
                        progressHandler: progressHandler
                    )
                } else {
                    outURL = try await PDFConverter.shared.convert(
                        sourceURL: sourceURL,
                        targetType: targetType,
                        settings: activeSettings,
                        progressHandler: progressHandler
                    )
                }
            case .video:
                outURL = try await VideoConverter.shared.convert(
                    sourceURL: sourceURL,
                    targetType: targetType,
                    settings: activeSettings,
                    progressHandler: progressHandler
                )
            case .audio:
                outURL = try await AudioConverter.shared.convert(
                    sourceURL: sourceURL,
                    targetType: targetType,
                    settings: activeSettings,
                    progressHandler: progressHandler
                )
            case .documents, .developerTools:
                outURL = try await DocumentConverter.shared.convert(
                    sourceURL: sourceURL,
                    targetType: targetType,
                    settings: activeSettings,
                    progressHandler: progressHandler
                )
            case .archives:
                outURL = try await ArchiveConverter.shared.createArchive(
                    sourceURLs: [sourceURL],
                    targetType: targetType,
                    settings: activeSettings,
                    progressHandler: progressHandler
                )
            case .otherFormats:
                outURL = try await DocumentConverter.shared.convert(
                    sourceURL: sourceURL,
                    targetType: targetType,
                    settings: activeSettings,
                    progressHandler: progressHandler
                )
            }

            job.destinationURL = outURL
            if let destAttrs = try? FileManager.default.attributesOfItem(atPath: outURL.path),
               let destSize = destAttrs[.size] as? Int64 {
                job.destinationFileSize = destSize
            }
            job.status = .completed
            job.progress = 1.0
            job.completedAt = Date()

            self.activeJob = job
            self.history.insert(job, at: 0)
            self.saveHistory()
            self.isConverting = false

        } catch {
            job.status = .failed
            job.errorMessage = error.localizedDescription
            self.activeJob = job
            self.isConverting = false
        }
    }

    public func revealInFinder(url: URL) {
        #if canImport(AppKit)
        NSWorkspace.shared.activateFileViewerSelecting([url])
        #endif
    }

    public func openFile(url: URL) {
        #if canImport(AppKit)
        NSWorkspace.shared.open(url)
        #endif
    }

    private func saveHistory() {
        if let data = try? JSONEncoder().encode(Array(history.prefix(50))) {
            UserDefaults.standard.set(data, forKey: "converta_history")
        }
    }

    private func loadHistory() {
        if let data = UserDefaults.standard.data(forKey: "converta_history"),
           let saved = try? JSONDecoder().decode([ConversionJob].self, from: data) {
            self.history = saved
        }
    }
}

// Extension to support general PDF conversion delegation
extension PDFConverter {
    func convert(
        sourceURL: URL,
        targetType: FileType,
        settings: ConversionSettings,
        progressHandler: @escaping (Double) -> Void
    ) async throws -> URL {
        if targetType == .pdfToImages {
            let images = try await convertPDFToImages(sourceURL: sourceURL, format: .png, dpi: settings.pdfDpi, progressHandler: progressHandler)
            guard let first = images.first else { throw ConversionError.conversionFailed("No images generated") }
            return first
        }
        return sourceURL
    }
}
