import { Pressable } from 'react-native';
import Animated, { type AnimatedProps } from 'react-native-reanimated';
import Svg, { Defs, Mask, Path, Rect, type PathProps } from 'react-native-svg';

import styles from '../styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export type ScreenTourBackdropProps = {
  hasTarget: boolean;
  height: number;
  holeAnimatedProps: AnimatedProps<PathProps>['animatedProps'];
  onPress: () => void;
  overlayColor: string;
  width: number;
};

function ScreenTourBackdrop({
  hasTarget,
  height,
  holeAnimatedProps,
  onPress,
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
        <Defs>
          <Mask id="tour-hole-mask">
            <Rect fill="#FFFFFF" height={height} width={width} x={0} y={0} />
            <AnimatedPath animatedProps={holeAnimatedProps} fill="#000000" />
          </Mask>
        </Defs>
        <Rect
          fill={overlayColor}
          height={height}
          mask="url(#tour-hole-mask)"
          width={width}
          x={0}
          y={0}
        />
      </Svg>
    </AnimatedPressable>
  );
}

export default ScreenTourBackdrop;
