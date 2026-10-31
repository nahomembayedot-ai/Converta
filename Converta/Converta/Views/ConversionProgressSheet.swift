import SwiftUI

public struct ConversionProgressSheet: View {
    @ObservedObject private var manager = ConversionManager.shared

    public var body: some View {
        if let job = manager.activeJob {
            ZStack {
                Color.black.opacity(0.4)
                    .ignoresSafeArea()

                VStack(spacing: 20) {
                    if job.status == .converting {
                        convertingView(job: job)
                    } else if job.status == .completed {
                        completedView(job: job)
                    } else if job.status == .failed {
                        failedView(job: job)
                    }
                }
                .padding(28)
                .frame(width: 440)
                .background(Color(NSColor.windowBackgroundColor))
                .cornerRadius(16)
                .shadow(color: Color.black.opacity(0.3), radius: 24, x: 0, y: 12)
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Color.white.opacity(0.15), lineWidth: 1)
                )
            }
        }
    }

    private func convertingView(job: ConversionJob) -> some View {
        VStack(spacing: 16) {
            ProgressView(value: job.progress, total: 1.0)
                .progressViewStyle(.linear)

            HStack {
                Text("Converting to \(job.targetFileType.rawValue)...")
                    .font(.system(size: 13, weight: .semibold))
                Spacer()
                Text("\(Int(job.progress * 100))%")
                    .font(.system(size: 12, weight: .bold, design: .monospaced))
                    .foregroundColor(.secondary)
            }

            Text(job.sourceFileName)
                .font(.system(size: 11))
                .foregroundColor(.secondary)
                .lineLimit(1)
        }
    }

    private func completedView(job: ConversionJob) -> some View {
        VStack(spacing: 16) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 44))
                .foregroundColor(.green)

            Text("Conversion Completed!")
                .font(.system(size: 15, weight: .bold))

            if let dest = job.destinationURL {
                Text(dest.lastPathComponent)
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)
                    .lineLimit(1)

                HStack(spacing: 12) {
                    Button("Open File") {
                        manager.openFile(url: dest)
                    }
                    .buttonStyle(.bordered)

                    Button("Reveal in Finder") {
                        manager.revealInFinder(url: dest)
                    }
                    .buttonStyle(.borderedProminent)
                }
            }

            Button("Done") {
                manager.activeJob = nil
            }
            .buttonStyle(.plain)
            .foregroundColor(.secondary)
            .font(.system(size: 12))
            .padding(.top, 4)
        }
    }

    private func failedView(job: ConversionJob) -> some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 40))
                .foregroundColor(.red)

            Text("Conversion Failed")
                .font(.system(size: 14, weight: .bold))

            Text(job.errorMessage ?? "An error occurred during conversion.")
                .font(.system(size: 11))
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)

            Button("Dismiss") {
                manager.activeJob = nil
            }
            .buttonStyle(.bordered)
        }
    }
}
