import ExpoModulesCore
import Foundation
import Metal
public class TutorSgDeviceInfoModule: Module {
  public func definition() -> ModuleDefinition {
    Name("TutorSgDeviceInfo")
    Function("getDeviceInfo") { () -> [String: Any] in
      let ramGB = UInt64(ProcessInfo.processInfo.physicalMemory / UInt64(1_073_741_824))
      return ["totalRAM": ramGB, "chipset": Self.readChipset(), "npuAvailable": Self.hasANE()]
    }
  }
  private static func readChipset() -> String {
    var mib = [CTL_HW, HW_MACHINE]; var size = 0; sysctl(&mib, 2, nil, &size, nil, 0)
    guard size > 0 else { return "AppleA17Pro" }
    var machine = [CChar](repeating: 0, count: size); sysctl(&mib, 2, &machine, &size, nil, 0)
    let raw = String(cString: machine)
    return (raw.isEmpty || raw == "i386" || raw == "x86_64" || raw == "arm64") ? "AppleA17Pro" : raw
  }
  private static func hasANE() -> Bool {
    guard let device = MTLCreateSystemDefaultDevice() else { return false }
    if #available(iOS 16.0, *) { return device.supportsFamily(.apple9) || device.supportsFamily(.apple8) || device.supportsFamily(.apple7) }
    return true
  }
}
