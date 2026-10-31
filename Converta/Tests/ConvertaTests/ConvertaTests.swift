import XCTest
@testable import ConvertaCore

final class ConvertaTests: XCTestCase {

    func testFileTypeDetection() {
        let pngURL = URL(fileURLWithPath: "/tmp/sample.png")
        XCTAssertEqual(FileType.detect(from: pngURL), .png)

        let heicURL = URL(fileURLWithPath: "/tmp/photo.heic")
        XCTAssertEqual(FileType.detect(from: heicURL), .heic)

        let movURL = URL(fileURLWithPath: "/tmp/movie.mov")
        XCTAssertEqual(FileType.detect(from: movURL), .mov)

        let wavURL = URL(fileURLWithPath: "/tmp/audio.wav")
        XCTAssertEqual(FileType.detect(from: wavURL), .wav)

        let csvURL = URL(fileURLWithPath: "/tmp/data.csv")
        XCTAssertEqual(FileType.detect(from: csvURL), .csv)
    }

    func testCategoryMapping() {
        XCTAssertEqual(FileType.png.category, .images)
        XCTAssertEqual(FileType.mp4.category, .video)
        XCTAssertEqual(FileType.mp3.category, .audio)
        XCTAssertEqual(FileType.docx.category, .documents)
        XCTAssertEqual(FileType.pdf.category, .pdf)
        XCTAssertEqual(FileType.zip.category, .archives)
        XCTAssertEqual(FileType.json.category, .developerTools)
    }

    func testRecommendedTargets() {
        let heicRecommendations = FileDetectionService.shared.getRecommendedTargets(for: .heic)
        XCTAssertTrue(heicRecommendations.contains(.jpg))
        XCTAssertTrue(heicRecommendations.contains(.png))
        XCTAssertTrue(heicRecommendations.contains(.webp))

        let movRecommendations = FileDetectionService.shared.getRecommendedTargets(for: .mov)
        XCTAssertTrue(movRecommendations.contains(.mp4))
        XCTAssertTrue(movRecommendations.contains(.webm))
    }

    func testConversionSettingsDefaults() {
        let settings = ConversionSettings()
        XCTAssertEqual(settings.imageQuality, 0.85, accuracy: 0.01)
        XCTAssertEqual(settings.videoResolution, "original")
        XCTAssertEqual(settings.audioBitrateKbps, 256)
        XCTAssertTrue(settings.preserveMetadata)
        XCTAssertFalse(settings.overwriteExisting)
    }

    func testConversionJobCreation() {
        let testURL = URL(fileURLWithPath: "/tmp/test.png")
        let job = ConversionJob(
            sourceURL: testURL,
            sourceFileType: .png,
            targetFileType: .webp,
            sourceFileSize: 1024
        )

        XCTAssertEqual(job.status, .queued)
        XCTAssertEqual(job.progress, 0.0)
        XCTAssertEqual(job.sourceFileName, "test.png")
        XCTAssertEqual(job.targetFileType, .webp)
    }
}
