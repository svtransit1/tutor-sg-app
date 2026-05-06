const { withProjectBuildGradle, withAndroidGradleProperties, withPodfile } = require("@expo/config-plugins");

/**
 * Expo Config Plugin for tutor-sg-ocr.
 *
 * Steps performed:
 * 1. Ensures the iOS Podfile targets iOS 16.0+ (required by Apple Vision OCR).
 * 2. Ensures Android minSdkVersion is at least 30.
 *
 * @param {import('@expo/config-plugins').ExpoConfig} config
 * @returns {import('@expo/config-plugins').ExpoConfig}
 */
function withTutorSgOcr(config) {
  // iOS: set minimum deployment target to 16.0 for Apple Vision support
  config = withPodfile(config, async (podfileConfig) => {
    const podfile = podfileConfig.modResults.contents;
    if (!podfile.includes("platform :ios, '16.0'")) {
      const updated = podfile.replace(
        /platform\s+:ios,\s*'[\d.]+'/,
        "platform :ios, '16.0'"
      );
      if (updated === podfile) {
        podfileConfig.modResults.contents =
          podfile.replace(
            /^require_relative\s+'\.\.\/node_modules\/@expo\/config-plugins'/m,
            `$&\nplatform :ios, '16.0'`
          );
      } else {
        podfileConfig.modResults.contents = updated;
      }
    }
    return podfileConfig;
  });

  // Android: ensure minSdkVersion is at least 30
  config = withAndroidGradleProperties(config, (propertiesConfig) => {
    const existing = propertiesConfig.modResults.find(
      (p) => p.type === "property" && p.key === "android.minSdkVersion"
    );
    if (!existing) {
      propertiesConfig.modResults.push({
        type: "property",
        key: "android.minSdkVersion",
        value: "30",
      });
    }
    return propertiesConfig;
  });

  return config;
}

module.exports = withTutorSgOcr;
