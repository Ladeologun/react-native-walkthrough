import {
  ScrollView,
  Text,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import type { ReactNode } from 'react';

import styles from '../styles';
import type { InAppTourTheme } from '../theme';

export type ScreenTourContentProps = {
  description?: string;
  descriptionTextStyle?: StyleProp<TextStyle>;
  render?: () => ReactNode;
  style?: StyleProp<ViewStyle>;
  theme: InAppTourTheme;
  title?: string;
  titleTextStyle?: StyleProp<TextStyle>;
};

function ScreenTourContent({
  description,
  descriptionTextStyle,
  render,
  style,
  theme,
  title,
  titleTextStyle,
}: ScreenTourContentProps) {
  return (
    <ScrollView
      bounces={false}
      contentContainerStyle={[styles.bodyScrollContent, style]}
      showsVerticalScrollIndicator={false}
    >
      {title ? (
        <Text
          style={[
            {
              color: theme.colors.textPrimary,
              fontSize: theme.typography.titleSize,
              fontWeight: theme.typography.titleWeight,
              lineHeight: theme.typography.titleLineHeight,
            },
            styles.contentTitle,
            titleTextStyle,
          ]}
        >
          {title}
        </Text>
      ) : null}
      {render ? (
        render()
      ) : description ? (
        <Text
          style={[
            {
              color: theme.colors.textSecondary,
              fontSize: theme.typography.bodySize,
              fontWeight: theme.typography.bodyWeight,
              lineHeight: theme.typography.bodyLineHeight,
            },
            descriptionTextStyle,
          ]}
        >
          {description}
        </Text>
      ) : null}
    </ScrollView>
  );
}

export default ScreenTourContent;
