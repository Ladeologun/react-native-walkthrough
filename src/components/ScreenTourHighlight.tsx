import { Platform, View } from 'react-native';
import Animated from 'react-native-reanimated';

import styles from '../styles';
import type { AnimatedViewStyle } from './types';

const AnimatedView = Animated.createAnimatedComponent(View);

export type ScreenTourHighlightProps = {
  borderRadius: number;
  highlightStyle: AnimatedViewStyle;
  pulseStyle: AnimatedViewStyle;
  pulseTintColor: string;
  ringStyle: AnimatedViewStyle;
  smokeStyles: AnimatedViewStyle[];
  smokeTintColor: string;
  tintColor: string;
};

function ScreenTourHighlight({
  borderRadius,
  highlightStyle,
  pulseStyle,
  pulseTintColor,
  ringStyle,
  smokeStyles,
  smokeTintColor,
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
  const rippleGlowStyle =
    Platform.OS === 'android'
      ? {
          elevation: 8,
          shadowOpacity: 0,
          shadowRadius: 0,
        }
      : {
          shadowColor: pulseTintColor,
        };
  const smokeGlowStyle =
    Platform.OS === 'android'
      ? {
          elevation: 6,
          shadowOpacity: 0,
          shadowRadius: 0,
        }
      : {
          shadowColor: smokeTintColor,
        };
  const smokeRippleVariants = [
    styles.smokeRippleInner,
    styles.smokeRippleMid,
    styles.smokeRippleOuter,
  ];
  return (
    <>
      {smokeStyles.map((smokeStyle, index) => (
        <AnimatedView
          key={`smoke-ripple-${index}`}
          pointerEvents="none"
          style={[
            styles.smokeRipple,
            smokeRippleVariants[index] ?? styles.smokeRippleOuter,
            smokeStyle,
            highlightStyle,
            {
              borderColor: smokeTintColor,
              borderRadius: borderRadius + 10 + index * 8,
            },
            smokeGlowStyle,
          ]}
        />
      ))}
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
          pulseStyle,
          highlightStyle,
          {
            borderColor: pulseTintColor,
            borderRadius: borderRadius + 2,
          },
          rippleGlowStyle,
        ]}
      />
    </>
  );
}

export default ScreenTourHighlight;
