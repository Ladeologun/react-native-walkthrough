import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import styles from '../styles';

export type ScreenTourHeaderProps = {
  children?: ReactNode;
  render?: () => ReactNode;
  style?: StyleProp<ViewStyle>;
};

function ScreenTourHeader({ children, render, style }: ScreenTourHeaderProps) {
  const content = children ?? render?.();

  if (content === undefined || content === null) {
    return null;
  }

  return <View style={[styles.headerSlot, style]}>{content}</View>;
}

export default ScreenTourHeader;
