import SwiftUI

/// Outer ring displaying available output format tokens when a category is selected.
public struct FormatOrbRingView: View {
    public let category: FileCategory
    public let selectedFormat: FileType?
    public let onSelectFormat: (FileType) -> Void

    public var body: some View {
        let formats = category.supportedFormats
        let count = formats.count

        GeometryReader { proxy in
            let center = CGPoint(x: proxy.size.width / 2, y: proxy.size.height / 2)
            let orbitRadius = min(proxy.size.width, proxy.size.height) * 0.44

            ZStack {
                // Orbital dashed guide line
                Circle()
                    .stroke(
                        category.themeColor.opacity(0.25),
                        style: StrokeStyle(lineWidth: 1.5, dash: [4, 6])
                    )
                    .frame(width: orbitRadius * 2, height: orbitRadius * 2)

                ForEach(Array(formats.enumerated()), id: \.element.id) { index, format in
                    let angle = Angle.degrees(Double(index) / Double(max(count, 1)) * 360.0 - 90.0)
                    let x = center.x + CGFloat(cos(angle.radians)) * orbitRadius
                    let y = center.y + CGFloat(sin(angle.radians)) * orbitRadius
                    let isSelected = selectedFormat == format

                    Button {
                        withAnimation(.spring(response: 0.35, dampingFraction: 0.7)) {
                            onSelectFormat(format)
                        }
                    } label: {
                        VStack(spacing: 2) {
                            Text(format.rawValue)
                                .font(.system(size: 11, weight: .bold, design: .rounded))
                                .foregroundColor(isSelected ? .white : .primary)
                        }
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(
                            Capsule()
                                .fill(isSelected ? category.themeColor : Color(NSColor.windowBackgroundColor).opacity(0.85))
                                .overlay(
                                    Capsule()
                                        .stroke(isSelected ? Color.white.opacity(0.5) : category.themeColor.opacity(0.4), lineWidth: 1)
                                )
                                .shadow(color: isSelected ? category.themeColor.opacity(0.6) : Color.black.opacity(0.2), radius: isSelected ? 8 : 3, x: 0, y: 2)
                        )
                    }
                    .buttonStyle(.plain)
                    .position(x: x, y: y)
                    .scaleEffect(isSelected ? 1.15 : 1.0)
                    .animation(.spring(response: 0.3), value: isSelected)
                }
            }
        }
    }
}
