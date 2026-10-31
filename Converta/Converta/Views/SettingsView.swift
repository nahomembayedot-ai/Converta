import SwiftUI

public struct SettingsView: View {
    @ObservedObject private var manager = ConversionManager.shared

    public var body: some View {
        Form {
            Section(header: Text("Image Output Quality").font(.system(size: 12, weight: .bold))) {
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text("Compression Quality")
                        Spacer()
                        Text("\(Int(manager.currentSettings.imageQuality * 100))%")
                            .foregroundColor(.secondary)
                    }
                    Slider(value: $manager.currentSettings.imageQuality, in: 0.1...1.0, step: 0.05)
                }

                Toggle("Preserve EXIF & Color Profiles", isOn: $manager.currentSettings.preserveMetadata)
            }

            Section(header: Text("Video Settings (FFmpeg / AVFoundation)").font(.system(size: 12, weight: .bold))) {
                Picker("Resolution Preset", selection: $manager.currentSettings.videoResolution) {
                    Text("Original Resolution").tag("original")
                    Text("1080p Full HD").tag("1080p")
                    Text("720p HD").tag("720p")
                    Text("480p SD").tag("480p")
                }

                Toggle("Mute Audio in Converted Video", isOn: $manager.currentSettings.muteAudio)
            }

            Section(header: Text("Audio Quality").font(.system(size: 12, weight: .bold))) {
                Picker("Audio Bitrate", selection: $manager.currentSettings.audioBitrateKbps) {
                    Text("128 kbps (Standard)").tag(128)
                    Text("192 kbps (High)").tag(192)
                    Text("256 kbps (Premium)").tag(256)
                    Text("320 kbps (Maximum)").tag(320)
                }

                Picker("Sample Rate", selection: $manager.currentSettings.audioSampleRateHz) {
                    Text("44.1 kHz (CD Audio)").tag(44100)
                    Text("48.0 kHz (Studio)").tag(48000)
                }
            }

            Section(header: Text("General Preferences").font(.system(size: 12, weight: .bold))) {
                Toggle("Overwrite Existing Destination Files", isOn: $manager.currentSettings.overwriteExisting)
            }
        }
        .formStyle(.grouped)
        .padding(20)
    }
}
