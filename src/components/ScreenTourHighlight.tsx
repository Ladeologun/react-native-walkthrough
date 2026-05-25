import { Platform, View } from 'react-native';
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
  const ringGlowStyle =
    Platform.OS === 'android'
      ? {
          elevation: 0,
          shadowOpacity: 0,
          shadowRadius: 0,
        }
      : {
          shadowColor: tintColor,
        };

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
          },
          ringGlowStyle,
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
