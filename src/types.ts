import type { ReactNode, RefObject } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import type { ScreenWalkthroughTheme } from './theme';

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Placement = 'auto' | 'top' | 'bottom';
export type ResolvedPlacement = Exclude<Placement, 'auto'>;

export type ScreenWalkthroughTarget = {
  measureInWindow: (
    callback: (x: number, y: number, width: number, height: number) => void
  ) => void;
};

export type ScreenWalkthroughRef = {
  open: () => void;
  close: () => void;
  refreshPosition: () => void;
  measureTarget: () => void;
};

export type ScreenWalkthroughProps = {
  children?: ReactNode;
  onNext?: () => void;
  onPrevious?: () => void;
  onClose?: () => void;
  visible?: boolean;
  targetKey?: string | number | null;
  contentTitle?: string;
  contentDesc?: string;
  nextBtnText?: string;
  previousBtnText?: string;
  hidePrevious?: boolean;
  placement?: Placement;
  backgroundColor?: string;
  width?: number;
  maxWidth?: number;
  minWidth?: number;
  offset?: number;
  edgePadding?: number;
  targetPadding?: number;
  targetBorderRadius?: number;
  targetOffsetX?: number;
  targetOffsetY?: number;
  targetRef?: RefObject<ScreenWalkthroughTarget | null>;
  prepareTarget?: () => void | Promise<void>;
  prepareTargetDelayMs?: number;
  measurementRetryDelayMs?: number;
  measurementRetryCount?: number;
  overlayColor?: string;
  showPulse?: boolean;
  closeOnBackdropPress?: boolean;
  disableArrow?: boolean;
  theme?: DeepPartial<ScreenWalkthroughTheme>;
  renderHeader?: () => ReactNode;
  renderContent?: () => ReactNode;
  renderFooter?: () => ReactNode;
  parentViewStyle?: ViewStyle;
  parentWrapperStyle?: StyleProp<ViewStyle>;
  childViewStyle?: ViewStyle;
  tooltipStyle?: ViewStyle;
  modalContentContainer?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  contentContainerHeaderStyle?: ViewStyle;
  contentContainerDescStyle?: ViewStyle;
  contentContainerBtnContainerStyle?: ViewStyle;
  contentTitleTextStyle?: TextStyle;
  contentDescTextStyle?: TextStyle;
  nextBtnTextStyle?: TextStyle;
  previousBtnTextStyle?: TextStyle;
};
