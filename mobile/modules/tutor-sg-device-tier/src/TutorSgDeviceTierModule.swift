import ExpoModulesCore
import Foundation
import UIKit

public class TutorSgDeviceTierModule: Module {
  public func definition() -> ModuleDefinition {
    Name("TutorSgDeviceTier")

    AsyncFunction("getTotalMemory") {
      let physicalMemory = ProcessInfo.processInfo.physicalMemory
      let ramGB = Int(Double(physicalMemory) / 1_073_741_824.0)
      return ramGB
    }

    AsyncFunction("getChipset") {
      return Self.currentChipset()
    }

    AsyncFunction("isNPUAvailable") {
      return Self.currentIsNPUAvailable()
    }

    AsyncFunction("getDeviceInfo") {
      let physicalMemory = ProcessInfo.processInfo.physicalMemory
      let ramGB = Int(Double(physicalMemory) / 1_073_741_824.0)
      return [
        "totalRAM": ramGB,
        "chipset": Self.currentChipset(),
        "npuAvailable": Self.currentIsNPUAvailable(),
      ] as [String: Any]
    }
  }

  static func currentChipset() -> String {
    var sysinfo = utsname()
    uname(&sysinfo)
    let model = withUnsafePointer(to: &sysinfo.machine) {
      $0.withMemoryRebound(to: CChar.self, capacity: Int(_SYS_NAMELEN)) {
        String(cString: $0)
      }
    }
    return chipsetForModel(model)
  }

  static func currentIsNPUAvailable() -> Bool {
    return true
  }

  static func chipsetForModel(_ model: String) -> String {
    switch model {
    case "iPhone18,3", "iPhone18,4": return "A20 Pro"
    case "iPhone18,1", "iPhone18,2": return "A20"
    case "iPhone17,4", "iPhone17,5": return "A19 Pro"
    case "iPhone17,1", "iPhone17,2", "iPhone17,3": return "A19"
    case "iPhone16,1", "iPhone16,2": return "A18 Pro"
    case "iPhone15,2", "iPhone15,3": return "A17 Pro"
    case "iPhone15,4", "iPhone15,5": return "A16 Bionic"
    case "iPhone14,7", "iPhone14,8": return "A16 Bionic"
    case "iPhone14,5", "iPhone14,4": return "A16 Bionic"
    case "iPhone15,1": return "A16 Bionic"
    case "iPhone14,2", "iPhone14,3": return "A15 Bionic"
    case "iPhone14,6": return "A15 Bionic"
    case "iPhone13,2", "iPhone13,3": return "A15 Bionic"
    case "iPhone13,1", "iPhone13,4": return "A15 Bionic"
    case "iPhone12,8": return "A15 Bionic"
    case "iPhone14,1": return "A14 Bionic"
    case "iPhone13,2": return "A14 Bionic"
    case "iPhone12,1": return "A13 Bionic"
    case "iPhone12,3", "iPhone12,5": return "A13 Bionic"
    case "iPhone11,8": return "A12 Bionic"
    case "iPhone11,2": return "A12 Bionic"
    case "iPhone10,3", "iPhone10,6": return "A11 Bionic"
    case "iPhone10,1", "iPhone10,4": return "A11 Bionic"
    case let m where m.hasPrefix("iPad16"): return "M4"
    case let m where m.hasPrefix("iPad14"): return "M2"
    case let m where m.hasPrefix("iPad13"): return "M1"
    default: return model
    }
  }
}
