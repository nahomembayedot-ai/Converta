import SwiftUI

public struct HistoryView: View {
    @ObservedObject private var manager = ConversionManager.shared
    @State private var searchText: String = ""

    public var filteredJobs: [ConversionJob] {
        if searchText.isEmpty {
            return manager.history
        }
        return manager.history.filter {
            $0.sourceFileName.localizedCaseInsensitiveContains(searchText) ||
            $0.targetFileType.rawValue.localizedCaseInsensitiveContains(searchText)
        }
    }

    public var body: some View {
        VStack(spacing: 0) {
            // Search & Stats Toolbar
            HStack {
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(.secondary)
                    TextField("Search conversions...", text: $searchText)
                        .textFieldStyle(.plain)
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(Color(NSColor.controlBackgroundColor))
                .cornerRadius(8)
                .frame(maxWidth: 320)

                Spacer()

                Text("\(manager.history.count) items")
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 14)

            Divider().opacity(0.4)

            if filteredJobs.isEmpty {
                VStack(spacing: 12) {
                    Spacer()
                    Image(systemName: "clock.arrow.circlepath")
                        .font(.system(size: 44))
                        .foregroundColor(.secondary.opacity(0.4))
                    Text("No Conversion History")
                        .font(.system(size: 14, weight: .semibold))
                    Text("Files you convert will appear here for fast access.")
                        .font(.system(size: 11))
                        .foregroundColor(.secondary)
                    Spacer()
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                List {
                    ForEach(filteredJobs) { job in
                        HStack(spacing: 16) {
                            Image(systemName: job.targetFileType.category.iconName)
                                .font(.system(size: 18))
                                .foregroundColor(job.targetFileType.category.themeColor)
                                .frame(width: 32, height: 32)
                                .background(job.targetFileType.category.themeColor.opacity(0.15))
                                .cornerRadius(8)

                            VStack(alignment: .leading, spacing: 2) {
                                Text(job.sourceFileName)
                                    .font(.system(size: 12, weight: .semibold))
                                    .lineLimit(1)

                                HStack(spacing: 8) {
                                    Text("\(job.sourceFileType?.rawValue ?? "Unknown") → \(job.targetFileType.rawValue)")
                                        .font(.system(size: 10, weight: .bold))
                                        .foregroundColor(.accentColor)

                                    if let comp = job.completedAt {
                                        Text(comp, style: .time)
                                            .font(.system(size: 10))
                                            .foregroundColor(.secondary)
                                    }
                                }
                            }

                            Spacer()

                            if let dest = job.destinationURL {
                                Button("Finder") {
                                    manager.revealInFinder(url: dest)
                                }
                                .buttonStyle(.bordered)
                                .controlSize(.small)

                                Button("Open") {
                                    manager.openFile(url: dest)
                                }
                                .buttonStyle(.borderedProminent)
                                .controlSize(.small)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }
                .listStyle(.inset)
            }
        }
    }
}
