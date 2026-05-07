import ExpoModulesCore
import MachO

public class DeviceTierModule: Module {
  public func definition() -> ModuleDefinition {
    Name("DeviceTierModule")

    Function("getTotalMemory") {
      let physicalMemory = ProcessInfo.processInfo.physicalMemory
      let gb = Double(physicalMemory) / (1024.0 * 1024.0 * 1024.0)
      return Int(round(gb))
    }

    Function("getChipset") {
      var size = 0
      sysctlbyname("machdep.cpu.brand_string", nil, &size, nil, 0)
      var chipset = [CChar](repeating: 0, count: size)
      sysctlbyname("machdep.cpu.brand_string", &chipset, &size, nil, 0)
      return String(cString: chipset).trimmingCharacters(in: .whitespacesAndNewlines)
    }

    Function("isNPUAvailable") {
      if #available(iOS 16.0, *) {
        let device = MTLCreateSystemDefaultDevice()
        return device?.supportsFamily(.apple8) ?? false
      }
      return false
    }
  }
}
