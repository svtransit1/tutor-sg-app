import { formatSize } from "../device-tier";

describe("formatSize", () => {
  it('returns "0 MB" for 0 bytes', () => {
    expect(formatSize(0)).toBe("0 MB");
  });

  it("returns MB for values under 1 GB", () => {
    expect(formatSize(1_048_576)).toBe("1 MB");
    expect(formatSize(500_000_000)).toBe("477 MB");
  });

  it("returns GB for values 1 GB and above", () => {
    expect(formatSize(1_073_741_824)).toBe("1.0 GB");
    expect(formatSize(2_500_000_000)).toBe("2.3 GB");
  });
});

describe("download types", () => {
  it("DownloadStatus includes idle, detecting, ready, downloading, paused, verifying, completed, error", () => {
    const statuses: Array<import("../model-downloader").DownloadStatus> = [
      "idle",
      "detecting",
      "ready",
      "downloading",
      "paused",
      "verifying",
      "completed",
      "error",
    ];
    expect(statuses).toHaveLength(8);
  });

  it("DownloadErrorCode includes all error types", () => {
    const codes: Array<import("../model-downloader").DownloadErrorCode> = [
      "connectivity_lost",
      "disk_insufficient",
      "cdn_unreachable",
      "hash_mismatch",
      "download_stuck",
      "unknown_error",
    ];
    expect(codes).toHaveLength(6);
  });
});

describe("detectDeviceTier", () => {
  it("returns a valid tier, models array, and labels", () => {
    const { detectDeviceTier } = require("../device-tier");
    const result = detectDeviceTier();
    expect(["high", "mid", "unsupported"]).toContain(result.tier);
    expect(Array.isArray(result.models)).toBe(true);
    expect(typeof result.downloadSizeLabel).toBe("string");
    expect(typeof result.modelNamesLabel).toBe("string");
  });
});
