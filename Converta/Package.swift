// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "Converta",
    platforms: [
        .macOS(.v14)
    ],
    products: [
        .executable(
            name: "Converta",
            targets: ["Converta"]
        ),
        .library(
            name: "ConvertaCore",
            targets: ["ConvertaCore"]
        )
    ],
    dependencies: [],
    targets: [
        .target(
            name: "ConvertaCore",
            path: "Converta",
            exclude: ["App/ConvertaApp.swift", "Resources"]
        ),
        .executableTarget(
            name: "Converta",
            dependencies: ["ConvertaCore"],
            path: "Converta/App"
        ),
        .testTarget(
            name: "ConvertaTests",
            dependencies: ["ConvertaCore"],
            path: "Tests/ConvertaTests"
        )
    ]
)
