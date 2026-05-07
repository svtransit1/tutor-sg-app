package com.aaas.tutorsg.devicetier

import android.app.ActivityManager
import android.content.Context
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class DeviceTierModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("DeviceTierModule")

    Function("getTotalMemory") {
      val context = appContext.reactContext ?: return@Function 0
      val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager
      val memoryInfo = ActivityManager.MemoryInfo()
      activityManager?.getMemoryInfo(memoryInfo)
      val memBytes = memoryInfo.totalMem
      val gb = memBytes / (1024L * 1024L * 1024L)
      gb.toInt()
    }

    Function("getChipset") {
      var chipset = Build.HARDWARE
      if (chipset.isBlank()) {
        chipset = Build.MODEL
      }
      if (chipset.isBlank()) {
        chipset = "Unknown"
      }
      chipset
    }

    Function("isNPUAvailable") {
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q
    }
  }
}
