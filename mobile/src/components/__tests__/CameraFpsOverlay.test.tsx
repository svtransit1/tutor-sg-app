import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { CameraFpsOverlay } from '@/components/CameraFpsOverlay';
import type { FpsMetrics } from '@/hooks/useFpsMonitor';

beforeAll(() => { (global as Record<string, unknown>).__DEV__ = true; });
afterAll(() => { delete (global as Record<string, unknown>).__DEV__; });

describe('CameraFpsOverlay', () => {
  it('renders FPS badge', () => { render(<CameraFpsOverlay metrics={{ currentFps: 45, isLowFps: false }} />); expect(screen.getByText('45 FPS')).toBeTruthy(); });
  it('renders 0 FPS', () => { render(<CameraFpsOverlay metrics={{ currentFps: 0, isLowFps: false }} />); expect(screen.getByText('0 FPS')).toBeTruthy(); });
  it('renders warning', () => { const r = render(<CameraFpsOverlay metrics={{ currentFps: 20, isLowFps: true }} />); expect(r.getByText('20 FPS')).toBeTruthy(); });
  it('updates on change', () => { const r = render(<CameraFpsOverlay metrics={{ currentFps: 60, isLowFps: false }} />); expect(r.getByText('60 FPS')).toBeTruthy(); r.rerender(<CameraFpsOverlay metrics={{ currentFps: 22, isLowFps: true }} />); expect(r.getByText('22 FPS')).toBeTruthy(); });
  it('null in release', () => { (global as Record<string, unknown>).__DEV__ = false; const r = render(<CameraFpsOverlay metrics={{ currentFps: 60, isLowFps: false }} />); expect(r.toJSON()).toBeNull(); (global as Record<string, unknown>).__DEV__ = true; });
  it('accessible label', () => { render(<CameraFpsOverlay metrics={{ currentFps: 30, isLowFps: false }} />); expect(screen.getByLabelText('30 frames per second')).toBeTruthy(); });
  it('accessible label + warning', () => { render(<CameraFpsOverlay metrics={{ currentFps: 18, isLowFps: true }} />); expect(screen.getByLabelText('18 frames per second, low frame rate warning')).toBeTruthy(); });
  it('high FPS', () => { render(<CameraFpsOverlay metrics={{ currentFps: 120, isLowFps: false }} />); expect(screen.getByText('120 FPS')).toBeTruthy(); });
});
