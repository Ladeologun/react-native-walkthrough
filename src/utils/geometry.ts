import type { EdgeInsets } from 'react-native-safe-area-context';

import {
  DEFAULT_CARD_MAX_HEIGHT_RATIO,
  MIN_CARD_GAP,
  MIN_FALLBACK_TARGET,
} from '../constants';
import type { Placement, Rect, ResolvedPlacement } from '../types';

type PaddedTargetOptions = {
  edgePadding: number;
  screenHeight: number;
  screenWidth: number;
  targetOffsetX: number;
  targetOffsetY: number;
  targetPadding: number;
};

type TooltipLayoutOptions = {
  cardHeight?: number;
  cardWidth: number;
  edgePadding: number;
  insets: Pick<EdgeInsets, 'bottom' | 'top'>;
  offset: number;
  paddedTarget: Rect;
  placement: Placement;
  screenHeight: number;
  screenWidth: number;
};

export type TooltipLayout = {
  arrowCenterX: number;
  cardLeft: number;
  cardTop: number;
  effectiveCardHeight: number;
  maxCardHeight: number;
  resolvedPlacement: ResolvedPlacement;
};

export function clamp(value: number, min: number, max: number) {
  'worklet';

  return Math.min(Math.max(value, min), max);
}

export function getAdaptiveBorderRadius(width: number, height: number) {
  return clamp(Math.min(width, height) * 0.22, 8, 16);
}

export function buildRoundedRectPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  'worklet';

  const safeWidth = Math.max(width, MIN_FALLBACK_TARGET);
  const safeHeight = Math.max(height, MIN_FALLBACK_TARGET);
  const clampedRadius = clamp(radius, 0, Math.min(safeWidth, safeHeight) / 2);
  const right = x + safeWidth;
  const bottom = y + safeHeight;

  return [
    `M${x + clampedRadius},${y}`,
    `H${right - clampedRadius}`,
    `A${clampedRadius},${clampedRadius} 0 0 1 ${right},${y + clampedRadius}`,
    `V${bottom - clampedRadius}`,
    `A${clampedRadius},${clampedRadius} 0 0 1 ${right - clampedRadius},${bottom}`,
    `H${x + clampedRadius}`,
    `A${clampedRadius},${clampedRadius} 0 0 1 ${x},${bottom - clampedRadius}`,
    `V${y + clampedRadius}`,
    `A${clampedRadius},${clampedRadius} 0 0 1 ${x + clampedRadius},${y}`,
    'Z',
  ].join(' ');
}

export function getPaddedTargetRect(
  targetRect: Rect,
  {
    edgePadding,
    screenHeight,
    screenWidth,
    targetOffsetX,
    targetOffsetY,
    targetPadding,
  }: PaddedTargetOptions
) {
  const maxWidth = screenWidth - edgePadding * 2;
  const width = clamp(
    targetRect.width + targetPadding * 2,
    MIN_FALLBACK_TARGET,
    maxWidth
  );
  const maxHeight = screenHeight - edgePadding * 2;
  const height = clamp(
    targetRect.height + targetPadding * 2,
    MIN_FALLBACK_TARGET,
    maxHeight
  );
  const x = clamp(
    targetRect.x - targetPadding + targetOffsetX,
    0,
    Math.max(0, screenWidth - width)
  );
  const y = clamp(
    targetRect.y - targetPadding + targetOffsetY,
    0,
    Math.max(0, screenHeight - height)
  );

  return {
    height,
    width,
    x,
    y,
  };
}

export function getTooltipLayout({
  cardHeight,
  cardWidth,
  edgePadding,
  insets,
  offset,
  paddedTarget,
  placement,
  screenHeight,
  screenWidth,
}: TooltipLayoutOptions): TooltipLayout {
  const availableAbove = paddedTarget.y - insets.top - edgePadding - offset;
  const availableBelow =
    screenHeight -
    (paddedTarget.y + paddedTarget.height) -
    insets.bottom -
    edgePadding -
    offset;
  const resolvedPlacement: ResolvedPlacement =
    placement === 'auto'
      ? availableBelow >= availableAbove
        ? 'bottom'
        : 'top'
      : placement;
  const maxCardHeight = Math.max(
    180,
    Math.min(
      screenHeight * DEFAULT_CARD_MAX_HEIGHT_RATIO,
      (resolvedPlacement === 'bottom' ? availableBelow : availableAbove) -
        MIN_CARD_GAP
    )
  );
  const effectiveCardHeight = Math.min(
    cardHeight ?? maxCardHeight,
    maxCardHeight
  );
  const cardLeft = clamp(
    paddedTarget.x + paddedTarget.width / 2 - cardWidth / 2,
    edgePadding,
    screenWidth - cardWidth - edgePadding
  );
  const desiredTop =
    resolvedPlacement === 'bottom'
      ? paddedTarget.y + paddedTarget.height + offset
      : paddedTarget.y - effectiveCardHeight - offset;
  const cardTop = clamp(
    desiredTop,
    insets.top + edgePadding,
    screenHeight - maxCardHeight - insets.bottom - edgePadding
  );
  const arrowCenterX = clamp(
    paddedTarget.x + paddedTarget.width / 2 - cardLeft - 9,
    18,
    cardWidth - 36
  );

  return {
    arrowCenterX,
    cardLeft,
    cardTop,
    effectiveCardHeight,
    maxCardHeight,
    resolvedPlacement,
  };
}
