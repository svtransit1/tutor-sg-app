plugins {
  id("com.android.library")
  id("org.jetbrains.kotlin.android")
  id("expo-module-gradle-plugin")
}

android {
  namespace = "expo.modules.tutorsgocr"
  compileSdk = 35

  defaultConfig {
    minSdk = 30
    targetSdk = 35
  }

  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
  }

  kotlinOptions {
    jvmTarget = "17"
  }
}

dependencies {
  implementation(project(":expo-modules-core"))

  // ML Kit Text Recognition — on-device, no network dependency
  // https://developers.google.com/ml-kit/vision/text-recognition
  implementation("com.google.mlkit:text-recognition:16.0.1")
}
