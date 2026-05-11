import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import styles from '../styles';
import type { ResolvedPlacement } from '../types';
import type { AnimatedViewStyle } from './types';

const AnimatedView = Animated.createAnimatedComponent(View);

export type ScreenTourArrowProps = {
  backgroundColor: string;
  disabled?: boolean;
  entranceStyle: AnimatedViewStyle;
  placement: ResolvedPlacement;
  positionStyle: AnimatedViewStyle;
  shadowColor: string;
};

function ScreenTourArrow({
  backgroundColor,
  disabled,
  entranceStyle,
  placement,
  positionStyle,
  shadowColor,
}: ScreenTourArrowProps) {
  if (disabled) {
    return null;
  }

  return (
    <AnimatedView
      pointerEvents="none"
      style={[
        styles.arrow,
        entranceStyle,
        positionStyle,
        {
          shadowColor,
        },
      ]}
    >
      <Svg
        height={22}
        width={24}
        viewBox="0 0 24 22"
        style={{
          transform: [
            {
              rotate: placement === 'bottom' ? '0deg' : '180deg',
            },
          ],
        }}
      >
        <Path
          d="M1.6 21C4.3 20.5 7 17.2 8.9 14.3C10 12.6 11 10.7 12 8.8C13 10.7 14 12.6 15.1 14.3C17 17.2 19.7 20.5 22.4 21H1.6Z"
          fill={backgroundColor}
        />
      </Svg>
    </AnimatedView>
  );
}

export default ScreenTourArrow;
