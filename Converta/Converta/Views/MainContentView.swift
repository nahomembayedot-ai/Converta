import SwiftUI
import UniformTypeIdentifiers

public struct MainContentView: View {
    @StateObject private var manager = ConversionManager.shared
    @State private var selectedFile: URL?
    @State private var selectedCategory: FileCategory?
    @State private var selectedFormat: FileType?
    @State private var detectedType: FileType?
    @State private var recommendedFormats: [FileType] = []
    @State private var currentTab: AppTab = .wheel
    @State private var showSettingsModal: Bool = false
    @State private var showFilePicker: Bool = false

    public enum AppTab: String, CaseIterable {
        case wheel = "Wheel"
        case history = "History"
        case settings = "Settings"
        case about = "About"
    }

    public init() {}

    public var body: some View {
        ZStack {
            // macOS Vibrant Window Background
            Color(NSColor.windowBackgroundColor)
                .ignoresSafeArea()

            VStack(spacing: 0) {
                // Header Bar
                headerBar

                Divider().opacity(0.4)

                // Main Content View based on Tab
                Group {
                    switch currentTab {
                    case .wheel:
                        wheelWorkspaceView
                    case .history:
                        HistoryView()
                    case .settings:
                        SettingsView()
                    case .about:
                        AboutView()
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }

            // In-flight conversion sheet
            if manager.isConverting || (manager.activeJob != nil && manager.activeJob?.status != .queued) {
                ConversionProgressSheet()
                    .transition(.opacity.combined(with: .scale(scale: 0.96)))
            }
        }
        .frame(minWidth: 880, minHeight: 640)
    }

    private var headerBar: some View {
        HStack(spacing: 16) {
            // App Branding
            HStack(spacing: 8) {
                Image(systemName: "circle.circle.fill")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(.accentColor)
                VStack(alignment: .leading, spacing: 1) {
                    Text("Converta")
                        .font(.system(size: 13, weight: .bold))
                    Text("macOS Radial Converter")
                        .font(.system(size: 10))
                        .foregroundColor(.secondary)
                }
            }

            Spacer()

            // Segmented Navigation
            Picker("", selection: $currentTab) {
                ForEach(AppTab.allCases, id: \.self) { tab in
                    Text(tab.rawValue).tag(tab)
                }
            }
            .pickerStyle(.segmented)
            .frame(width: 280)

            Spacer()

            // Quick Actions
            Button {
                let openPanel = NSOpenPanel()
                openPanel.allowsMultipleSelection = false
                openPanel.canChooseDirectories = false
                openPanel.canChooseFiles = true
                if openPanel.runModal() == .OK, let url = openPanel.url {
                    handleSelectedFile(url: url)
                }
            } label: {
                Label("Open File...", systemImage: "folder.badge.plus")
                    .font(.system(size: 12, weight: .medium))
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.regular)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(Color(NSColor.windowBackgroundColor).opacity(0.85))
    }

    private var wheelWorkspaceView: some View {
        HStack(spacing: 24) {
            // Left / Center: Interactive Radial Wheel
            VStack(spacing: 12) {
                RadialWheelView(
                    selectedCategory: $selectedCategory,
                    selectedFormat: $selectedFormat,
                    onFileDropped: { url in
                        handleSelectedFile(url: url)
                    },
                    onSelectFormat: { format in
                        self.selectedFormat = format
                    }
                )
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
            .padding(.leading, 16)

            // Right: Selected File & Conversion Inspector Card
            VStack(alignment: .leading, spacing: 16) {
                Text("Conversion Setup")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.secondary)

                if let file = selectedFile {
                    fileInspectorCard(file: file)
                } else {
                    emptyInspectorCard
                }

                Spacer()
            }
            .frame(width: 300)
            .padding(.trailing, 20)
            .padding(.vertical, 20)
        }
    }

    private func fileInspectorCard(file: URL) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 12) {
                Image(systemName: selectedCategory?.iconName ?? "doc.fill")
                    .font(.system(size: 28))
                    .foregroundColor(.accentColor)
                VStack(alignment: .leading, spacing: 3) {
                    Text(file.lastPathComponent)
                        .font(.system(size: 12, weight: .semibold))
                        .lineLimit(1)
                    Text(file.pathExtension.uppercased())
                        .font(.system(size: 10, weight: .bold))
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.accentColor.opacity(0.15))
                        .cornerRadius(4)
                }
            }
            .padding(.bottom, 6)

            if !recommendedFormats.isEmpty {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Recommended Formats")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(.secondary)

                    FlowLayout(spacing: 6) {
                        ForEach(recommendedFormats, id: \.id) { format in
                            Button {
                                selectedFormat = format
                                selectedCategory = format.category
                            } label: {
                                Text(format.rawValue)
                                    .font(.system(size: 11, weight: .bold))
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 4)
                                    .background(selectedFormat == format ? Color.accentColor : Color(NSColor.controlBackgroundColor))
                                    .foregroundColor(selectedFormat == format ? .white : .primary)
                                    .cornerRadius(6)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }

            if let target = selectedFormat {
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text("Target Format:")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundColor(.secondary)
                        Text(target.rawValue)
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(.accentColor)
                    }
                }

                Button {
                    Task {
                        await manager.startConversion(
                            sourceURL: file,
                            targetType: target
                        )
                    }
                } label: {
                    HStack {
                        Image(systemName: "arrow.triangle.2.circlepath")
                        Text("Convert to \(target.rawValue)")
                    }
                    .font(.system(size: 13, weight: .bold))
                    .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
            } else {
                Text("Select a target format from the wheel or recommendations to begin.")
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)
            }
        }
        .padding(16)
        .background(Color(NSColor.controlBackgroundColor).opacity(0.7))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.white.opacity(0.1), lineWidth: 1)
        )
    }

    private var emptyInspectorCard: some View {
        VStack(spacing: 12) {
            Image(systemName: "arrow.down.circle")
                .font(.system(size: 32))
                .foregroundColor(.secondary.opacity(0.5))

            Text("No File Selected")
                .font(.system(size: 13, weight: .medium))

            Text("Drag and drop a file onto the circular wheel or click 'Open File' in the toolbar.")
                .font(.system(size: 11))
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(24)
        .background(Color(NSColor.controlBackgroundColor).opacity(0.4))
        .cornerRadius(12)
    }

    private func handleSelectedFile(url: URL) {
        self.selectedFile = url
        let (type, _, recommended) = FileDetectionService.shared.analyzeFile(at: url)
        self.detectedType = type
        self.recommendedFormats = recommended
        if let type = type {
            self.selectedCategory = type.category
        }
        if let first = recommended.first {
            self.selectedFormat = first
        }
    }
}

// Simple FlowLayout for SwiftUI format tags
public struct FlowLayout: Layout {
    public var spacing: CGFloat = 6

    public init(spacing: CGFloat = 6) {
        self.spacing = spacing
    }

    public func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let width = proposal.width ?? 300
        var height: CGFloat = 0
        var currentX: CGFloat = 0
        var currentY: CGFloat = 0
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if currentX + size.width > width && currentX > 0 {
                currentX = 0
                currentY += rowHeight + spacing
                rowHeight = 0
            }
            rowHeight = max(rowHeight, size.height)
            currentX += size.width + spacing
        }
        height = currentY + rowHeight
        return CGSize(width: width, height: height)
    }

    public func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var currentX: CGFloat = bounds.minX
        var currentY: CGFloat = bounds.minY
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if currentX + size.width > bounds.maxX && currentX > bounds.minX {
                currentX = bounds.minX
                currentY += rowHeight + spacing
                rowHeight = 0
            }
            subview.place(at: CGPoint(x: currentX, y: currentY), proposal: .unspecified)
            rowHeight = max(rowHeight, size.height)
            currentX += size.width + spacing
        }
    }
}
