import type { ReactNode, RefObject } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import type { InAppTourTheme } from './theme';

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Placement = 'auto' | 'top' | 'bottom';
export type ResolvedPlacement = Exclude<Placement, 'auto'>;

export type InAppTourTarget = {
  measureInWindow: (
    callback: (x: number, y: number, width: number, height: number) => void
  ) => void;
};

export type InAppTourRef = {
  open: () => void;
  close: () => void;
  refreshPosition: () => void;
  measureTarget: () => void;
};

export type InAppTourProps = {
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
  targetRef?: RefObject<InAppTourTarget | null>;
  prepareTarget?: () => void | Promise<void>;
  prepareTargetDelayMs?: number;
  measurementRetryDelayMs?: number;
  measurementRetryCount?: number;
  overlayColor?: string;
  showPulse?: boolean;
  closeOnBackdropPress?: boolean;
  disableArrow?: boolean;
  theme?: Partial<InAppTourTheme>;
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
