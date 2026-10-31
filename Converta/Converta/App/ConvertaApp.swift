import SwiftUI
#if canImport(AppKit)
import AppKit
#endif

@main
struct ConvertaApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        WindowGroup {
            MainContentView()
                .frame(minWidth: 880, minHeight: 640)
        }
        .windowStyle(.hiddenTitleBar)
        .windowToolbarStyle(.unified(showsTitle: false))
        .commands {
            SidebarCommands()
            CommandGroup(replacing: .newItem) {
                Button("Open File...") {
                    let openPanel = NSOpenPanel()
                    openPanel.canChooseFiles = true
                    openPanel.canChooseDirectories = false
                    openPanel.allowsMultipleSelection = false
                    if openPanel.runModal() == .OK, let url = openPanel.url {
                        NotificationCenter.default.post(name: NSNotification.Name("ConvertaOpenFile"), object: url)
                    }
                }
                .keyboardShortcut("o", modifiers: .command)
            }
        }

        #if os(macOS)
        Settings {
            SettingsView()
                .frame(width: 480, height: 380)
        }
        #endif
    }
}

class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        NSWindow.allowsAutomaticWindowTabbing = false
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }
}
