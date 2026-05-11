import type { ReactNode } from 'react';
import {
  Pressable,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import styles from '../styles';
import type { InAppTourTheme } from '../theme';

export type ScreenTourFooterProps = {
  hidePrevious?: boolean;
  nextText: string;
  nextTextStyle?: StyleProp<TextStyle>;
  onNext?: () => void;
  onPrevious?: () => void;
  previousText: string;
  previousTextStyle?: StyleProp<TextStyle>;
  render?: () => ReactNode;
  style?: StyleProp<ViewStyle>;
  theme: InAppTourTheme;
};

function ScreenTourFooter({
  hidePrevious,
  nextText,
  nextTextStyle,
  onNext,
  onPrevious,
  previousText,
  previousTextStyle,
  render,
  style,
  theme,
}: ScreenTourFooterProps) {
  const actionTextStyle = {
    color: theme.colors.accent,
    fontSize: theme.typography.actionSize,
    fontWeight: theme.typography.actionWeight,
    lineHeight: theme.typography.actionLineHeight,
  };

  if (render) {
    return <>{render()}</>;
  }

  return (
    <View style={[styles.footer, hidePrevious && styles.footerAlignEnd, style]}>
      {!hidePrevious ? (
        <Pressable
          onPress={onPrevious}
          style={[styles.button, styles.secondaryButton]}
        >
          <Text style={[actionTextStyle, previousTextStyle]}>
            {previousText}
          </Text>
        </Pressable>
      ) : null}
      <Pressable onPress={onNext} style={[styles.button, styles.primaryButton]}>
        <Text style={[actionTextStyle, nextTextStyle]}>{nextText}</Text>
      </Pressable>
    </View>
  );
}

export default ScreenTourFooter;
