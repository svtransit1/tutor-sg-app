# Camera Guide Frame Design Decision

**Date:** 2026-05-08  
**Author:** Flutter  
**Issue:** AAAS-544 / M2-76  

## Decision

Camera guide frame overlay implemented as a standalone React Native component (`CameraGuideFrame`) using absolute-positioned View panels for the semi-transparent cutout + corner L-brackets.

## Rationale

1. **No SVG dependency** — React Native Views avoid adding `react-native-svg` as a dep. The cutout effect is achieved with 4 overlay panels (top, middle-left, middle-right, bottom) rather than a mask layer, which is simpler and more performant.

2. **Prop-driven alignment** — `isAligned: boolean` prop allows easy wiring to any edge-detection source (OCR pipeline, native module, or manual toggle for dev).

3. **Aspect ratio** — Guide frame matches ~1.414:1 (standard A4/worksheet proportion), capped at 65% screen height to leave room for camera controls.

## Visual references

- Aligned state: green (#34C759) L-brackets + glow border + green dot + "Perfect! Worksheet is aligned"
- Unaligned state: blue (#4A90D9/#64B5F6) L-brackets + "Fit the worksheet in the frame"
- Default behavior: overlay renders on top of CameraView, not as a child element
