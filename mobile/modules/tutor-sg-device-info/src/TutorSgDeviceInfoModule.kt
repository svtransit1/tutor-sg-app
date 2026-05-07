package expo.modules.tutorsgdeviceinfo
import android.app.ActivityManager
import android.content.Context
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
class TutorSgDeviceInfoModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("TutorSgDeviceInfo")
    Function("getDeviceInfo") {
      val ctx = appContext.reactContext ?: throw IllegalStateException("No React context")
      mapOf("totalRAM" to getTotalRAMGB(ctx), "chipset" to getChipset(), "npuAvailable" to hasNNAPI())
    }
  }
  private fun getTotalRAMGB(ctx: Context): Long {
    val am = ctx.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager ?: return 8
    val mi = ActivityManager.MemoryInfo(); am.getMemoryInfo(mi)
    return mi.totalMem / (1024 * 1024 * 1024)
  }
  private fun getChipset(): String {
    val soc = Build.SOC_MODEL; if (soc.isNotEmpty() && soc != "unknown") return soc
    val hw = Build.HARDWARE; if (hw.isNotEmpty() && hw != "unknown") return hw
    return "${Build.MANUFACTURER} ${Build.MODEL}"
  }
  private fun hasNNAPI(): Boolean {
    return if (Build.VERSION.SDK_INT >= 29) { try { Class.forName("android.neuralnetworks.NeuralNetworks").getMethod("getDeviceCount").invoke(null) as? Int ?: 0 > 0 } catch (_: Exception) { false } } else false
  }
}
