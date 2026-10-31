import SwiftUI

/// Custom SwiftUI Shape rendering an annular sector (radial pie slice)
/// with inner radius, outer radius, start and end angles, and gap spacing.
public struct WheelSegmentShape: Shape {
    public var startAngle: Angle
    public var endAngle: Angle
    public var innerRadiusRatio: CGFloat // e.g. 0.45
    public var angularPadding: Angle = .degrees(1.5)

    public var animatableData: AnimatablePair<Double, Double> {
        get { AnimatablePair(startAngle.radians, endAngle.radians) }
        set {
            startAngle = .radians(newValue.first)
            endAngle = .radians(newValue.second)
        }
    }

    public func path(in rect: CGRect) -> Path {
        var path = Path()
        let center = CGPoint(x: rect.midX, y: rect.midY)
        let outerRadius = min(rect.width, rect.height) / 2.0
        let innerRadius = outerRadius * innerRadiusRatio

        let effectiveStart = startAngle + angularPadding
        let effectiveEnd = endAngle - angularPadding

        guard effectiveEnd > effectiveStart else { return path }

        path.addArc(
            center: center,
            radius: outerRadius,
            startAngle: effectiveStart,
            endAngle: effectiveEnd,
            clockwise: false
        )

        path.addArc(
            center: center,
            radius: innerRadius,
            startAngle: effectiveEnd,
            endAngle: effectiveStart,
            clockwise: true
        )

        path.closeSubpath()
        return path
    }
}
