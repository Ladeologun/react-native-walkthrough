import { describe, expect, it, jest } from '@jest/globals';

jest.mock('../ScreenWalkthrough', () => 'ScreenWalkthrough');

import { ScreenWalkthrough, defaultTheme } from '../index';
import { mergeTheme } from '../theme';
import { getPaddedTargetRect, getTooltipLayout } from '../utils/geometry';

describe('public API', () => {
  it('exports ScreenWalkthrough', () => {
    expect(ScreenWalkthrough).toBe('ScreenWalkthrough');
  });

  it('exposes the default theme tokens expected by the walkthrough UI', () => {
    expect(defaultTheme.colors.accent).toBe('#0A9E4A');
    expect(defaultTheme.colors.overlay).toBe('rgba(6, 15, 24, 0.68)');
    expect(defaultTheme.typography.titleWeight).toBe('700');
  });
});

describe('mergeTheme', () => {
  it('merges partial theme overrides without dropping defaults', () => {
    const mergedTheme = mergeTheme({
      colors: {
        ...defaultTheme.colors,
        accent: '#FF6B00',
      },
      typography: {
        ...defaultTheme.typography,
        bodyLineHeight: 24,
      },
    });

    expect(mergedTheme.colors.accent).toBe('#FF6B00');
    expect(mergedTheme.colors.surface).toBe(defaultTheme.colors.surface);
    expect(mergedTheme.typography.bodyLineHeight).toBe(24);
    expect(mergedTheme.typography.titleSize).toBe(
      defaultTheme.typography.titleSize
    );
    expect(defaultTheme.colors.accent).toBe('#0A9E4A');
  });
});

describe('geometry helpers', () => {
  it('pads and clamps the target rect within the screen bounds', () => {
    const paddedTarget = getPaddedTargetRect(
      {
        x: -8,
        y: 580,
        width: 40,
        height: 18,
      },
      {
        edgePadding: 16,
        screenHeight: 640,
        screenWidth: 360,
        targetOffsetX: 4,
        targetOffsetY: -6,
        targetPadding: 12,
      }
    );

    expect(paddedTarget).toEqual({
      x: 0,
      y: 562,
      width: 64,
      height: 42,
    });
  });

  it('prefers bottom placement when there is more room below the target', () => {
    const tooltipLayout = getTooltipLayout({
      cardHeight: 220,
      cardWidth: 280,
      edgePadding: 16,
      insets: {
        top: 20,
        bottom: 24,
      },
      offset: 18,
      paddedTarget: {
        x: 48,
        y: 120,
        width: 72,
        height: 48,
      },
      placement: 'auto',
      screenHeight: 844,
      screenWidth: 390,
    });

    expect(tooltipLayout.resolvedPlacement).toBe('bottom');
    expect(tooltipLayout.cardTop).toBe(186);
    expect(tooltipLayout.cardLeft).toBe(16);
    expect(tooltipLayout.arrowCenterX).toBe(59);
  });

  it('uses top placement when the target is close to the bottom edge', () => {
    const tooltipLayout = getTooltipLayout({
      cardHeight: 220,
      cardWidth: 280,
      edgePadding: 16,
      insets: {
        top: 20,
        bottom: 24,
      },
      offset: 18,
      paddedTarget: {
        x: 60,
        y: 680,
        width: 90,
        height: 64,
      },
      placement: 'auto',
      screenHeight: 844,
      screenWidth: 390,
    });

    expect(tooltipLayout.resolvedPlacement).toBe('top');
    expect(tooltipLayout.cardTop).toBeCloseTo(365.12);
    expect(tooltipLayout.cardLeft).toBe(16);
    expect(tooltipLayout.arrowCenterX).toBe(80);
  });
});
