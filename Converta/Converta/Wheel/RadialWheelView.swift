import SwiftUI

public struct RadialWheelView: View {
    @Binding public var selectedCategory: FileCategory?
    @Binding public var selectedFormat: FileType?
    public var onFileDropped: (URL) -> Void
    public var onSelectFormat: (FileType) -> Void

    @State private var hoveredCategory: FileCategory?
    @State private var isTargeted: Bool = false
    @State private var rotationAngle: Double = 0.0

    private let categories = FileCategory.allCases

    public init(
        selectedCategory: Binding<FileCategory?>,
        selectedFormat: Binding<FileType?>,
        onFileDropped: @escaping (URL) -> Void,
        onSelectFormat: @escaping (FileType) -> Void
    ) {
        self._selectedCategory = selectedCategory
        self._selectedFormat = selectedFormat
        self.onFileDropped = onFileDropped
        self.onSelectFormat = onSelectFormat
    }

    public var body: some View {
        GeometryReader { geometry in
            let wheelSize = min(geometry.size.width, geometry.size.height) * 0.78
            let center = CGPoint(x: geometry.size.width / 2, y: geometry.size.height / 2)
            let segmentAngle = 360.0 / Double(categories.count)

            ZStack {
                // Background Ambient Glow
                if let activeCat = selectedCategory ?? hoveredCategory {
                    Circle()
                        .fill(activeCat.themeColor.opacity(0.18))
                        .frame(width: wheelSize * 1.15, height: wheelSize * 1.15)
                        .blur(radius: 35)
                }

                // Outer Radial Ring of Format Options (when category is selected)
                if let category = selectedCategory {
                    FormatOrbRingView(
                        category: category,
                        selectedFormat: selectedFormat,
                        onSelectFormat: onSelectFormat
                    )
                    .frame(width: wheelSize * 1.3, height: wheelSize * 1.3)
                    .transition(.scale.combined(with: .opacity))
                }

                // Main Segmented Wheel
                ZStack {
                    ForEach(Array(categories.enumerated()), id: \.element.id) { index, category in
                        let startAngle = Angle.degrees(Double(index) * segmentAngle - 90.0)
                        let endAngle = Angle.degrees(Double(index + 1) * segmentAngle - 90.0)
                        let isSelected = selectedCategory == category
                        let isHovered = hoveredCategory == category

                        let midAngle = Angle.degrees((startAngle.degrees + endAngle.degrees) / 2.0)
                        let labelRadius = (wheelSize / 2.0) * 0.72
                        let labelX = center.x + CGFloat(cos(midAngle.radians)) * labelRadius
                        let labelY = center.y + CGFloat(sin(midAngle.radians)) * labelRadius

                        // Segment Slice
                        WheelSegmentShape(
                            startAngle: startAngle,
                            endAngle: endAngle,
                            innerRadiusRatio: 0.52
                        )
                        .fill(
                            LinearGradient(
                                colors: [
                                    isSelected ? category.themeColor : (isHovered ? category.themeColor.opacity(0.35) : Color(NSColor.controlBackgroundColor).opacity(0.8)),
                                    isSelected ? category.themeColor.opacity(0.8) : (isHovered ? category.themeColor.opacity(0.15) : Color(NSColor.controlBackgroundColor).opacity(0.4))
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .overlay(
                            WheelSegmentShape(
                                startAngle: startAngle,
                                endAngle: endAngle,
                                innerRadiusRatio: 0.52
                            )
                            .stroke(
                                isSelected ? Color.white.opacity(0.6) : (isHovered ? category.themeColor : Color.white.opacity(0.1)),
                                lineWidth: isSelected ? 2 : 1
                            )
                        )
                        .frame(width: wheelSize, height: wheelSize)
                        .scaleEffect(isSelected ? 1.04 : (isHovered ? 1.02 : 1.0))
                        .shadow(
                            color: isSelected ? category.themeColor.opacity(0.5) : (isHovered ? category.themeColor.opacity(0.3) : .clear),
                            radius: isSelected ? 12 : 6
                        )
                        .onHover { hovering in
                            withAnimation(.easeInOut(duration: 0.2)) {
                                hoveredCategory = hovering ? category : nil
                            }
                        }
                        .onTapGesture {
                            withAnimation(.spring(response: 0.4, dampingFraction: 0.75)) {
                                if selectedCategory == category {
                                    selectedCategory = nil
                                } else {
                                    selectedCategory = category
                                }
                            }
                        }

                        // Category Icon & Title inside Segment
                        VStack(spacing: 3) {
                            Image(systemName: category.iconName)
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(isSelected ? .white : (isHovered ? category.themeColor : .secondary))

                            Text(category.rawValue)
                                .font(.system(size: 10, weight: isSelected ? .bold : .medium))
                                .foregroundColor(isSelected ? .white : .primary)
                        }
                        .position(x: labelX, y: labelY)
                    }
                }
                .frame(width: wheelSize, height: wheelSize)

                // Central Hub (Drop target & Center Action Area)
                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color(NSColor.windowBackgroundColor),
                                    Color(NSColor.controlBackgroundColor)
                                ],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                        .overlay(
                            Circle()
                                .stroke(
                                    isTargeted ? Color.accentColor : Color.white.opacity(0.15),
                                    lineWidth: isTargeted ? 3 : 1.5
                                )
                        )
                        .shadow(color: Color.black.opacity(0.35), radius: 15, x: 0, y: 5)
                        .frame(width: wheelSize * 0.46, height: wheelSize * 0.46)

                    VStack(spacing: 6) {
                        Image(systemName: isTargeted ? "arrow.down.doc.fill" : "circle.dashed.inset.filled")
                            .font(.system(size: 26, weight: .medium))
                            .foregroundColor(isTargeted ? .accentColor : (selectedCategory?.themeColor ?? .secondary))
                            .scaleEffect(isTargeted ? 1.2 : 1.0)

                        Text(isTargeted ? "Drop File Here" : (selectedCategory?.rawValue ?? "Drop File or Select"))
                            .font(.system(size: 11, weight: .bold))
                            .multilineTextAlignment(.center)
                            .foregroundColor(.primary)

                        Text("Click segment or drop")
                            .font(.system(size: 9))
                            .foregroundColor(.secondary)
                    }
                    .padding(8)
                }
                .onDrop(of: [.fileURL], isTargeted: $isTargeted) { providers in
                    guard let provider = providers.first else { return false }
                    _ = provider.loadObject(ofClass: URL.self) { url, _ in
                        if let url = url {
                            DispatchQueue.main.async {
                                onFileDropped(url)
                            }
                        }
                    }
                    return true
                }
            }
            .frame(width: geometry.size.width, height: geometry.size.height)
        }
    }
}
