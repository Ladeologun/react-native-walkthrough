import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import styles from '../styles';
import type { AnimatedViewStyle } from './types';

const AnimatedView = Animated.createAnimatedComponent(View);

export type ScreenTourHighlightProps = {
  borderRadius: number;
  highlightStyle: AnimatedViewStyle;
  pulseStyle: AnimatedViewStyle;
  ringStyle: AnimatedViewStyle;
  tintColor: string;
};

function ScreenTourHighlight({
  borderRadius,
  highlightStyle,
  pulseStyle,
  ringStyle,
  tintColor,
}: ScreenTourHighlightProps) {
  return (
    <>
      <AnimatedView
        pointerEvents="none"
        style={[
          styles.highlightRing,
          ringStyle,
          highlightStyle,
          {
            borderColor: tintColor,
            borderRadius,
            shadowColor: tintColor,
          },
        ]}
      />
      <AnimatedView
        pointerEvents="none"
        style={[
          styles.pulseRing,
          styles.pulseRingTint,
          pulseStyle,
          highlightStyle,
          {
            borderRadius: borderRadius + 2,
          },
        ]}
      />
    </>
  );
}

export default ScreenTourHighlight;
