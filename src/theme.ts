export type ScreenWalkthroughTheme = {
  colors: {
    overlay: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    white: string;
    shadow: string;
  };
  typography: {
    titleSize: number;
    titleLineHeight: number;
    titleWeight: '500' | '600' | '700';
    bodySize: number;
    bodyLineHeight: number;
    bodyWeight: '400' | '500';
    actionSize: number;
    actionLineHeight: number;
    actionWeight: '500' | '600' | '700';
  };
};

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export const defaultTheme: ScreenWalkthroughTheme = {
  colors: {
    overlay: 'rgba(6, 15, 24, 0.68)',
    surface: '#FFFFFF',
    textPrimary: '#101828',
    textSecondary: '#667085',
    accent: '#0A9E4A',
    white: '#FFFFFF',
    shadow: '#000000',
  },
  typography: {
    titleSize: 16,
    titleLineHeight: 24,
    titleWeight: '700',
    bodySize: 15,
    bodyLineHeight: 28,
    bodyWeight: '400',
    actionSize: 15,
    actionLineHeight: 22,
    actionWeight: '700',
  },
};

export function mergeTheme(
  theme?: DeepPartial<ScreenWalkthroughTheme>
): ScreenWalkthroughTheme {
  return {
    colors: {
      ...defaultTheme.colors,
      ...theme?.colors,
    },
    typography: {
      ...defaultTheme.typography,
      ...theme?.typography,
    },
  };
}
