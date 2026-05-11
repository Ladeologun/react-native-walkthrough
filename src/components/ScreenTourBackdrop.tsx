import { Pressable } from 'react-native';
import Animated, { type AnimatedProps } from 'react-native-reanimated';
import Svg, { Path, type PathProps } from 'react-native-svg';

import styles from '../styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export type ScreenTourBackdropProps = {
  hasTarget: boolean;
  height: number;
  onPress: () => void;
  overlayAnimatedProps: AnimatedProps<PathProps>['animatedProps'];
  overlayColor: string;
  width: number;
};

function ScreenTourBackdrop({
  hasTarget,
  height,
  onPress,
  overlayAnimatedProps,
  overlayColor,
  width,
}: ScreenTourBackdropProps) {
  if (!hasTarget) {
    return (
      <Pressable
        onPress={onPress}
        style={[styles.fallbackBackdrop, { backgroundColor: overlayColor }]}
      />
    );
  }

  return (
    <AnimatedPressable onPress={onPress} style={styles.overlayTouchable}>
      <Svg height={height} width={width} viewBox={`0 0 ${width} ${height}`}>
        <AnimatedPath
          animatedProps={overlayAnimatedProps}
          fill={overlayColor}
          fillRule="evenodd"
        />
      </Svg>
    </AnimatedPressable>
  );
}

export default ScreenTourBackdrop;
