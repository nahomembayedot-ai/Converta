import Foundation

public struct ConversionSettings: Codable, Equatable {
    // General
    public var outputDirectory: URL?
    public var overwriteExisting: Bool = false

    // Image Settings
    public var imageQuality: Double = 0.85
    public var resizeImage: Bool = false
    public var maxDimension: Int = 2048
    public var preserveMetadata: Bool = true
    public var rotateDegrees: Int = 0

    // Video Settings
    public var videoResolution: String = "original" // original, 1080p, 720p, 480p
    public var videoBitrateMbps: Double = 5.0
    public var videoFps: Int = 30
    public var muteAudio: Bool = false

    // Audio Settings
    public var audioBitrateKbps: Int = 256 // 128, 192, 256, 320
    public var audioSampleRateHz: Int = 44100 // 44100, 48000
    public var normalizeAudio: Bool = false

    // PDF Settings
    public var pdfDpi: Int = 300
    public var compressPdf: Bool = true

    public init(outputDirectory: URL? = nil) {
        self.outputDirectory = outputDirectory
    }
}
