import { ExpoConfig, ConfigContext } from "expo/config";

const VARIANTS = ["development", "preview", "production"] as const;
type Variant = (typeof VARIANTS)[number];

function getVariant(): Variant {
  const v = process.env.APP_VARIANT;
  if (VARIANTS.includes(v as Variant)) return v as Variant;
  return "production";
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = getVariant();
  const suffix = variant !== "production" ? `.${variant}` : "";
  const displayName =
    variant === "production" ? "tutor-sg" : `tutor-sg (${variant})`;

  return {
    ...config,
    name: displayName,
    slug: config.slug ?? "tutor-sg",
    ios: {
      ...config.ios,
      bundleIdentifier: `com.aaas.tutorsg${suffix}`,
      googleServicesFile:
        variant === "production"
          ? "./GoogleService-Info.plist"
          : `./GoogleService-Info-${variant}.plist`,
    },
    android: {
      ...config.android,
      package: `com.aaas.tutorsg${suffix}`,
      googleServicesFile:
        variant === "production"
          ? "./google-services.json"
          : `./google-services-${variant}.json`,
    },
    updates: {
      ...config.updates,
      url: `https://u.expo.dev/${config.extra?.eas?.projectId ?? ""}`,
    },
    plugins: [
      "expo-secure-store",
      "expo-router",
    ],
    extra: {
      ...config.extra,
      appVariant: variant,
    },
  };
};
