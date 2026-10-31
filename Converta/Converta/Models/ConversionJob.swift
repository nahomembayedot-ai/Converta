import Foundation

public enum JobStatus: String, Codable {
    case queued
    case converting
    case completed
    case failed
    case cancelled
}

public struct ConversionJob: Identifiable, Codable {
    public let id: UUID
    public let sourceURL: URL
    public let sourceFileName: String
    public let sourceFileSize: Int64
    public let sourceFileType: FileType?
    public let targetFileType: FileType
    public var status: JobStatus
    public var progress: Double // 0.0 to 1.0
    public var destinationURL: URL?
    public var destinationFileSize: Int64?
    public var errorMessage: String?
    public let createdAt: Date
    public var completedAt: Date?

    public init(
        id: UUID = UUID(),
        sourceURL: URL,
        sourceFileType: FileType?,
        targetFileType: FileType,
        sourceFileSize: Int64
    ) {
        self.id = id
        self.sourceURL = sourceURL
        self.sourceFileName = sourceURL.lastPathComponent
        self.sourceFileSize = sourceFileSize
        self.sourceFileType = sourceFileType
        self.targetFileType = targetFileType
        self.status = .queued
        self.progress = 0.0
        self.createdAt = Date()
    }
}
