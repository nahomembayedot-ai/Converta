import SwiftUI

public struct AboutView: View {
    public var body: some View {
        VStack(spacing: 18) {
            Spacer()

            Image(systemName: "circle.circle.fill")
                .font(.system(size: 64))
                .foregroundColor(.accentColor)
                .shadow(color: Color.accentColor.opacity(0.4), radius: 16)

            VStack(spacing: 4) {
                Text("Converta")
                    .font(.system(size: 22, weight: .bold, design: .rounded))
                Text("Version 1.0.0 (Build 100)")
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)
            }

            Text("Fast, efficient and private macOS file format conversion utility inspired by the circular wheel interaction model.")
                .font(.system(size: 12))
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .frame(maxWidth: 420)

            Divider()
                .frame(maxWidth: 320)

            VStack(spacing: 6) {
                Text("Native macOS Technologies")
                    .font(.system(size: 11, weight: .bold))

                HStack(spacing: 12) {
                    badge(text: "Swift 5.9+")
                    badge(text: "SwiftUI")
                    badge(text: "PDFKit")
                    badge(text: "ImageIO")
                    badge(text: "AVFoundation")
                    badge(text: "FFmpeg")
                }
            }

            VStack(spacing: 4) {
                Text("100% Offline & Private")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(.green)
                Text("Files are processed strictly locally on your Mac. No cloud uploads.")
                    .font(.system(size: 10))
                    .foregroundColor(.secondary)
            }

            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(32)
    }

    private func badge(text: String) -> some View {
        Text(text)
            .font(.system(size: 10, weight: .semibold))
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(Color(NSColor.controlBackgroundColor))
            .cornerRadius(4)
    }
}
