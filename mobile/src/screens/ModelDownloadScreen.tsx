import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";

import { detectDeviceTier, type DeviceTier, formatSize } from "../services/device-tier";
import {
  startDownload,
  pauseDownload,
  resumeDownload,
  cancelDownload,
  areModelsDownloaded,
  type DownloadProgress,
  type DownloadStatus,
  type DownloadError,
} from "../services/model-downloader";

interface Props {
  onComplete: () => void;
  onBack?: () => void;
}

type ScreenPhase =
  | "detecting"
  | "ready"
  | "cellular-warning"
  | "downloading"
  | "paused"
  | "completed"
  | "error";

export default function ModelDownloadScreen({ onComplete, onBack }: Props) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<ScreenPhase>("detecting");
  const [tier, setTier] = useState<DeviceTier>("mid");
  const [downloadSize, setDownloadSize] = useState("");
  const [modelList, setModelList] = useState("");
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [error, setError] = useState<DownloadError | null>(null);

  const onProgress = useCallback((p: DownloadProgress) => {
    setProgress(p);
  }, []);

  const onStatus = useCallback(
    (status: DownloadStatus, err?: DownloadError) => {
      switch (status) {
        case "downloading":
          setPhase("downloading");
          setError(null);
          break;
        case "paused":
          setPhase("paused");
          break;
        case "completed":
          setPhase("completed");
          setTimeout(() => onComplete(), 800);
          break;
        case "error":
          setPhase("error");
          if (err) setError(err);
          break;
        default:
          break;
      }
    },
    [onComplete],
  );

  useEffect(() => {
    const init = async () => {
      const result = detectDeviceTier();
      setTier(result.tier);
      setDownloadSize(result.downloadSizeLabel);
      setModelList(result.modelNamesLabel);

      if (result.tier === "unsupported") {
        setPhase("error");
        setError({ code: "unknown_error", message: t("deviceTierResult.error") });
        return;
      }

      const alreadyDownloaded = await areModelsDownloaded(result.models);
      if (alreadyDownloaded) {
        setPhase("completed");
        setTimeout(() => onComplete(), 400);
        return;
      }

      setPhase("ready");
    };

    init();

    return () => {
      cancelDownload();
    };
  }, [t, onComplete]);

  const handleStartDownload = useCallback(() => {
    const result = detectDeviceTier();
    startDownload(result.models, onProgress, onStatus);
  }, [onProgress, onStatus]);

  const handlePause = useCallback(() => {
    pauseDownload();
  }, []);

  const handleResume = useCallback(() => {
    resumeDownload();
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    setPhase("ready");
  }, []);

  const tierLabel =
    tier === "high" ? t("deviceTierResult.highPerformance") : t("deviceTierResult.standard");
  const tierDescription =
    tier === "high"
      ? t("deviceTierResult.highDescription")
      : t("deviceTierResult.standardDescription");

  return (
    <View style={styles.container} accessibilityLabel={t("modelDownload.title")}>
      <View style={styles.content}>
        {/* Detecting */}
        {phase === "detecting" && (
          <>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.title}>{t("deviceTierResult.loading")}</Text>
          </>
        )}

        {/* Ready — show device info + download button */}
        {(phase === "ready" || phase === "cellular-warning") && (
          <>
            <View style={styles.iconWrap}>
              <Text style={styles.icon}>{"\u2705"}</Text>
            </View>
            <Text style={styles.title}>{t("deviceTierResult.title")}</Text>
            <View style={styles.tierBadge}>
              <Text style={styles.tierBadgeText}>{tierLabel}</Text>
            </View>
            <Text style={styles.description}>{tierDescription}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {t("deviceTierResult.downloadSize", { size: downloadSize })}
              </Text>
              <Text style={styles.infoLabel}>
                {t("deviceTierResult.modelNames", { models: modelList })}
              </Text>
            </View>
            <Text style={styles.consent}>{t("deviceTierResult.consentText")}</Text>

            {phase === "cellular-warning" && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  {t("deviceTierResult.cellularWarning", { size: downloadSize })}
                </Text>
                <View style={styles.warningButtons}>
                  <Pressable
                    style={styles.secondaryBtn}
                    onPress={() => setPhase("ready")}
                    accessibilityRole="button"
                  >
                    <Text style={styles.secondaryBtnText}>
                      {t("deviceTierResult.cellularCancel")}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={styles.primaryBtn}
                    onPress={handleStartDownload}
                    accessibilityRole="button"
                  >
                    <Text style={styles.primaryBtnText}>
                      {t("deviceTierResult.cellularProceed")}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            {phase !== "cellular-warning" && (
              <Pressable
                style={styles.primaryBtn}
                onPress={handleStartDownload}
                accessibilityRole="button"
                accessibilityLabel={t("deviceTierResult.downloadNow")}
              >
                <Text style={styles.primaryBtnText}>{t("deviceTierResult.downloadNow")}</Text>
              </Pressable>
            )}

            <Pressable
              style={styles.textLink}
              onPress={() => {
                cancelDownload();
                onComplete();
              }}
              accessibilityRole="button"
            >
              <Text style={styles.textLinkText}>{t("deviceTierResult.downloadLater")}</Text>
            </Pressable>

            {onBack && (
              <Pressable style={styles.backLink} onPress={onBack} accessibilityRole="button">
                <Text style={styles.backLinkText}>
                  {"\u2190"} {t("common.back")}
                </Text>
              </Pressable>
            )}
          </>
        )}

        {/* Downloading */}
        {(phase === "downloading" || phase === "paused") && (
          <>
            <Text style={styles.title}>{t("modelDownload.title")}</Text>
            {progress && (
              <>
                <Text style={styles.fileName}>
                  {phase === "downloading"
                    ? t("modelDownload.progress", { fileName: progress.fileName })
                    : t("modelDownload.paused")}
                </Text>
                <View style={styles.progressBarWrapper}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${Math.min(100, progress.percent)}%` },
                      phase === "paused" && styles.progressBarPaused,
                    ]}
                  />
                </View>
                <Text style={styles.percentText}>
                  {t("modelDownload.progressPercent", { percent: progress.percent })}
                </Text>
                <Text style={styles.sizeText}>
                  {formatSize(progress.bytesWritten)} / {formatSize(progress.totalBytes)}
                </Text>
              </>
            )}
            {!progress && (
              <ActivityIndicator size="large" color="#2563EB" style={styles.marginTop} />
            )}

            <View style={styles.actionRow}>
              {phase === "downloading" && (
                <Pressable
                  style={styles.secondaryBtn}
                  onPress={handlePause}
                  accessibilityRole="button"
                >
                  <Text style={styles.secondaryBtnText}>{t("modelDownload.paused")}</Text>
                </Pressable>
              )}
              {phase === "paused" && (
                <Pressable
                  style={styles.primaryBtn}
                  onPress={handleResume}
                  accessibilityRole="button"
                >
                  <Text style={styles.primaryBtnText}>{t("modelDownload.resuming")}</Text>
                </Pressable>
              )}
            </View>
          </>
        )}

        {/* Error */}
        {phase === "error" && error && (
          <>
            <View style={styles.iconWrap}>
              <Text style={styles.icon}>{"\u26A0\uFE0F"}</Text>
            </View>
            <Text style={styles.title}>{t("common.retry")}</Text>
            <Text style={styles.errorText}>
              {error.code
                ? t(`modelDownload.errors.${error.code}`, {
                    needed: downloadSize ? parseFloat(downloadSize) / 1024 : undefined,
                  })
                : error.message}
            </Text>
            <Pressable style={styles.primaryBtn} onPress={handleRetry} accessibilityRole="button">
              <Text style={styles.primaryBtnText}>{t("modelDownload.retry")}</Text>
            </Pressable>
            {onBack && (
              <Pressable style={styles.textLink} onPress={onBack} accessibilityRole="button">
                <Text style={styles.textLinkText}>{t("common.goBack")}</Text>
              </Pressable>
            )}
          </>
        )}

        {/* Completed */}
        {phase === "completed" && (
          <>
            <View style={styles.iconWrap}>
              <Text style={styles.icon}>{"\u2705"}</Text>
            </View>
            <Text style={styles.title}>{t("modelDownload.completed")}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0F4FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  icon: { fontSize: 40 },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  tierBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  tierBadgeText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2563EB",
  },
  infoRow: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
  },
  consent: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  warningBox: {
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: "100%",
  },
  warningText: {
    fontSize: 14,
    color: "#C2410C",
    textAlign: "center",
    marginBottom: 12,
  },
  warningButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    minWidth: 200,
    alignItems: "center",
  },
  primaryBtnText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  secondaryBtn: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  textLink: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  textLinkText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  backLink: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  backLinkText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  fileName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 16,
    textAlign: "center",
  },
  progressBarWrapper: {
    width: "100%",
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBarFill: {
    height: 12,
    backgroundColor: "#2563EB",
    borderRadius: 6,
  },
  progressBarPaused: {
    backgroundColor: "#9CA3AF",
  },
  percentText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  sizeText: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 24,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  marginTop: {
    marginTop: 24,
    marginBottom: 24,
  },
});
