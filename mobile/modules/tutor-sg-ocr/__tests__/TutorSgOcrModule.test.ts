import { requireNativeModule } from "expo-modules-core";
import { recognizeText, isOcrAvailable } from "../src/TutorSgOcrModule";
import type { NativeTutorSgOcrModule } from "../src/TutorSgOcrModule";
import type { OcrResult } from "../src/TutorSgOcr.types";

// ---------------------------------------------------------------
// Mock the native module
// ---------------------------------------------------------------
jest.mock("expo-modules-core", () => {
  const mockNativeModule: NativeTutorSgOcrModule = {
    recognizeText: jest.fn(),
    isOcrAvailable: jest.fn(),
  };

  return {
    requireNativeModule: jest.fn(() => mockNativeModule),
  };
});

const mockRequireNativeModule = jest.mocked(requireNativeModule);
const mockNativeModule = mockRequireNativeModule() as jest.Mocked<NativeTutorSgOcrModule>;

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------
function makeFakeResult(overrides: Partial<OcrResult> = {}): OcrResult {
  return {
    fullText: "Hello world\nLine two",
    blocks: [
      {
        text: "Hello world",
        boundingBox: { x: 0.1, y: 0.1, width: 0.8, height: 0.1 },
        confidence: 0.95,
      },
      {
        text: "Line two",
        boundingBox: { x: 0.1, y: 0.25, width: 0.6, height: 0.08 },
        confidence: 0.88,
      },
    ],
    imageSize: { width: 1920, height: 1080 },
    error: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------
// Tests
// ---------------------------------------------------------------
beforeEach(() => {
  jest.clearAllMocks();
});

describe("recognizeText", () => {
  it("calls the native module with the image path and returns the result", async () => {
    const fakeResult = makeFakeResult();
    mockNativeModule.recognizeText.mockResolvedValue(fakeResult);

    const result = await recognizeText("file:///path/to/photo.jpg");

    expect(mockNativeModule.recognizeText).toHaveBeenCalledTimes(1);
    expect(mockNativeModule.recognizeText).toHaveBeenCalledWith(
      "file:///path/to/photo.jpg",
      undefined
    );
    expect(result).toEqual(fakeResult);
  });

  it("passes options to the native module", async () => {
    const fakeResult = makeFakeResult();
    mockNativeModule.recognizeText.mockResolvedValue(fakeResult);

    const options = {
      minConfidence: 0.6,
      recognitionLanguages: ["en"] as const,
      recognitionLevel: "fast" as const,
    };

    const result = await recognizeText("file:///photo.jpg", options);

    expect(mockNativeModule.recognizeText).toHaveBeenCalledWith(
      "file:///photo.jpg",
      options
    );
    expect(result).toEqual(fakeResult);
  });

  it("rejects when the native module throws", async () => {
    const nativeError = new Error("Vision request failed");
    mockNativeModule.recognizeText.mockRejectedValue(nativeError);

    await expect(recognizeText("file:///bad.jpg")).rejects.toThrow(
      "Vision request failed"
    );
  });

  it("handles the error field in result gracefully", async () => {
    const errorResult = makeFakeResult({
      fullText: "",
      blocks: [],
      error: "Failed to load image",
    });
    mockNativeModule.recognizeText.mockResolvedValue(errorResult);

    const result = await recognizeText("file:///missing.jpg");

    expect(result.error).toBe("Failed to load image");
    expect(result.fullText).toBe("");
    expect(result.blocks).toHaveLength(0);
  });
});

describe("isOcrAvailable", () => {
  it("returns true when native module says true", () => {
    mockNativeModule.isOcrAvailable.mockReturnValue(true);
    expect(isOcrAvailable()).toBe(true);
  });

  it("returns false when native module says false", () => {
    mockNativeModule.isOcrAvailable.mockReturnValue(false);
    expect(isOcrAvailable()).toBe(false);
  });

  it("returns false when native module is unavailable", () => {
    mockRequireNativeModule.mockImplementationOnce(() => {
      throw new Error("Module not found");
    });
    expect(isOcrAvailable()).toBe(false);
  });
});

describe("public API exports", () => {
  it("exports recognizeText and isOcrAvailable from index", async () => {
    const mod = await import("../src/index");
    expect(mod.recognizeText).toBeDefined();
    expect(mod.isOcrAvailable).toBeDefined();
  });
});
