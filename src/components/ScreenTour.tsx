import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import styles from '../styles';
import ScreenTourArrow from './ScreenTourArrow';
import ScreenTourBackdrop from './ScreenTourBackdrop';
import ScreenTourContent from './ScreenTourContent';
import ScreenTourFooter from './ScreenTourFooter';
import ScreenTourHeader from './ScreenTourHeader';
import ScreenTourHighlight from './ScreenTourHighlight';
import type { AnimatedViewStyle } from './types';

const AnimatedView = Animated.createAnimatedComponent(View);

export type ScreenTourRootProps = {
  backgroundColor: string;
  children?: ReactNode;
  contentAnimatedStyle?: AnimatedViewStyle;
  entranceStyle?: AnimatedViewStyle;
  positionStyle?: AnimatedViewStyle;
  shadowColor: string;
  style?: StyleProp<ViewStyle>;
  width: number;
};

function ScreenTourRoot({
  backgroundColor,
  children,
  contentAnimatedStyle,
  entranceStyle,
  positionStyle,
  shadowColor,
  style,
  width,
}: ScreenTourRootProps) {
  return (
    <AnimatedView
      style={[
        styles.card,
        entranceStyle,
        positionStyle,
        style,
        {
          backgroundColor,
          shadowColor,
          width,
        },
      ]}
    >
      <AnimatedView style={[styles.cardInner, contentAnimatedStyle]}>
        {children}
      </AnimatedView>
    </AnimatedView>
  );
}

const ScreenTour = Object.assign(ScreenTourRoot, {
  Arrow: ScreenTourArrow,
  Backdrop: ScreenTourBackdrop,
  Content: ScreenTourContent,
  Footer: ScreenTourFooter,
  Header: ScreenTourHeader,
  Highlight: ScreenTourHighlight,
});

export default ScreenTour;
