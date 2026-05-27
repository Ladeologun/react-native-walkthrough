# @ladeologun/react-native-walkthrough

A shape-aware React Native walkthrough component for onboarding, feature education, and spotlight flows.

It highlights a target, dims the rest of the screen, and shows a tooltip card that can follow the target across different layouts.

## Demo

Watch the example app in action here:

- [walkthrough-demo.mov](./example/walkthrough-demo.mov)

<video src="./example/walkthrough-demo.mov" controls muted playsinline></video>

## What You Get

- target spotlight with animated highlight ring
- optional smokey ripple halo for a more cinematic spotlight reveal
- automatic tooltip placement above or below the target
- support for controlled and imperative usage
- optional scroll preparation before measurement
- target measurement retries for unstable layouts
- customizable text, styles, colors, spacing, and theme tokens
- render hooks for fully custom header, content, and footer UI

## Installation

```sh
npm install @ladeologun/react-native-walkthrough
```

Install the peer dependencies too:

```sh
npm install react-native-reanimated react-native-safe-area-context react-native-svg
```

## Requirements

- `react-native-reanimated`
- `react-native-safe-area-context`
- `react-native-svg`

Your app should already be set up correctly for Reanimated and Safe Area Context.

## Basic Usage

```tsx
import React, { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  ScreenWalkthrough,
  type ScreenWalkthroughRef,
} from '@ladeologun/react-native-walkthrough';

export default function Example() {
  const buttonRef = useRef<View>(null);
  const walkthroughRef = useRef<ScreenWalkthroughRef>(null);
  const [visible, setVisible] = useState(true);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Pressable
        ref={buttonRef}
        style={{ padding: 16, borderRadius: 24, backgroundColor: '#0A9E4A' }}
      >
        <Text style={{ color: '#fff' }}>Tap me</Text>
      </Pressable>

      <ScreenWalkthrough
        ref={walkthroughRef}
        visible={visible}
        targetRef={buttonRef}
        contentTitle="Welcome"
        contentDesc="This is the action your users should learn first."
        nextBtnText="Done"
        hidePrevious
        onNext={() => setVisible(false)}
      />
    </View>
  );
}
```

## Two Usage Patterns

### Controlled

Use the `visible` prop when your app state decides when the walkthrough opens or closes.

```tsx
<ScreenWalkthrough
  visible={visible}
  targetRef={targetRef}
  contentTitle="Profile"
  contentDesc="This is where users manage their account."
  onClose={() => setVisible(false)}
/>
```

### Imperative

Use the ref methods when you want to open, close, or re-measure from code.

```tsx
const walkthroughRef = useRef<ScreenWalkthroughRef>(null);

walkthroughRef.current?.open();
walkthroughRef.current?.refreshPosition();
walkthroughRef.current?.close();
```

## How Targeting Works

You usually provide a `targetRef` that points to the element to highlight.

```tsx
const targetRef = useRef<View>(null);

<Pressable ref={targetRef} collapsable={false} />

<ScreenWalkthrough targetRef={targetRef} />
```

Notes:

- set `collapsable={false}` on native targets you want to measure reliably
- `targetRef` should point to a host/native view that supports `measureInWindow`
- if you pass `children` directly into `ScreenWalkthrough`, the wrapper can act as the measurement target when `targetRef` is omitted

## Multi-Step Walkthroughs

This library does not manage step arrays for you. Instead, you control the current step in your own state and update:

- `targetRef`
- `targetKey`
- `contentTitle`
- `contentDesc`
- `nextBtnText`
- `hidePrevious`
- callbacks like `onNext` and `onPrevious`

Use `targetKey` when the highlighted element changes between steps so the component knows it should re-measure.

## Scroll-Then-Highlight Flows

If your target may be off-screen, use `prepareTarget`.

```tsx
<ScreenWalkthrough
  targetRef={targetRef}
  prepareTarget={async () => {
    scrollRef.current?.scrollTo({ y: 500, animated: true });
  }}
  prepareTargetDelayMs={320}
/>
```

This is especially useful for:

- `ScrollView`
- `FlatList`
- tabbed or collapsible layouts
- screens where the target is created after user navigation

## Exports

The library exports:

- `ScreenWalkthrough`
- `defaultTheme`
- `ScreenWalkthroughProps`
- `ScreenWalkthroughRef`
- `ScreenWalkthroughTarget`
- `ScreenWalkthroughTheme`
- `Placement`
- `Rect`

## Ref Methods

### `ScreenWalkthroughRef`

```ts
type ScreenWalkthroughRef = {
  open: () => void;
  close: () => void;
  refreshPosition: () => void;
  measureTarget: () => void;
};
```

What they do:

- `open()`: opens the walkthrough imperatively
- `close()`: closes the walkthrough imperatively
- `refreshPosition()`: re-measures if the walkthrough is visible
- `measureTarget()`: forces target measurement

## Props Reference

### Content and flow

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `visible` | `boolean` | uncontrolled | Controls visibility when you use the component in controlled mode. |
| `contentTitle` | `string` | `undefined` | Title shown in the tooltip card. |
| `contentDesc` | `string` | `undefined` | Description shown in the tooltip card. |
| `nextBtnText` | `string` | `"Next"` | Next button label. |
| `previousBtnText` | `string` | `"Previous"` | Previous button label. |
| `hidePrevious` | `boolean` | `false` | Hides the previous button and right-aligns the footer. |
| `onNext` | `() => void` | `undefined` | Called when the next button is pressed. |
| `onPrevious` | `() => void` | `undefined` | Called when the previous button is pressed. |
| `onClose` | `() => void` | `undefined` | Called when the walkthrough closes. |
| `closeOnBackdropPress` | `boolean` | `true` | Closes the walkthrough when the dimmed backdrop is tapped. |

### Targeting and measurement

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `targetRef` | `RefObject<ScreenWalkthroughTarget \| null>` | `undefined` | Ref to the view that should be highlighted. |
| `targetKey` | `string \| number \| null` | `undefined` | Triggers re-measurement when the active target changes. Useful in multi-step flows. |
| `prepareTarget` | `() => void \| Promise<void>` | `undefined` | Runs before measuring the target. Use it for scrolling or pre-layout work. |
| `prepareTargetDelayMs` | `number` | `260` | Wait time after `prepareTarget` before measurement starts. |
| `measurementRetryDelayMs` | `number` | `80` | Delay used between measurement retries. |
| `measurementRetryCount` | `number` | `8` | Maximum number of measurement retries. |
| `targetPadding` | `number` | `2` | Extra space added around the measured target. |
| `targetBorderRadius` | `number` | `18` | Border radius used for the highlight cutout. |
| `targetOffsetX` | `number` | `0` | Horizontal offset applied to the measured target. |
| `targetOffsetY` | `number` | `0` | Vertical offset applied to the measured target. |

### Placement and layout

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `placement` | `'auto' \| 'top' \| 'bottom'` | `'auto'` | Tooltip placement. `auto` chooses the side with more room. |
| `width` | `number` | `320` | Preferred tooltip width. |
| `minWidth` | `number` | `280` | Minimum tooltip width after clamping. |
| `maxWidth` | `number` | `360` | Maximum tooltip width after clamping. |
| `offset` | `number` | `18` | Distance between target and tooltip card. |
| `edgePadding` | `number` | `16` | Minimum spacing from screen edges. |
| `disableArrow` | `boolean` | `false` | Hides the directional arrow. |

### Appearance

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `backgroundColor` | `string` | theme surface color | Background color of the tooltip card and arrow. |
| `overlayColor` | `string` | theme overlay color | Dimmed screen overlay color. |
| `showPulse` | `boolean` | `true` | Enables the inner pulse ring when ripple is enabled. |
| `showRipple` | `boolean` | `false` | Master toggle for all ripple motion. When `false`, both the pulse ring and ripple halo are disabled. |
| `rippleColor` | `string` | theme ripple color | Overrides the ripple halo and pulse color without affecting button/action text colors. |
| `theme` | `Partial<ScreenWalkthroughTheme>` | `defaultTheme` | Design tokens for colors and typography. |

### Render hooks

| Prop | Type | Description |
| --- | --- | --- |
| `renderHeader` | `() => ReactNode` | Replaces the header slot. |
| `renderContent` | `() => ReactNode` | Replaces the default title/description content block. |
| `renderFooter` | `() => ReactNode` | Replaces the default footer buttons. |

If you provide a render hook, that slot becomes fully yours.

### Style hooks

| Prop | Applies To |
| --- | --- |
| `parentViewStyle` | Outer wrapper that contains walkthrough children. |
| `parentWrapperStyle` | Additional wrapper styling around walkthrough children. |
| `childViewStyle` | Inner wrapper around the rendered children. |
| `tooltipStyle` | Tooltip card container. |
| `modalContentContainer` | Extra style merged onto the tooltip card root. |
| `contentContainerStyle` | Main content area inside the card. |
| `contentContainerHeaderStyle` | Header slot container. |
| `contentContainerDescStyle` | Content slot container. |
| `contentContainerBtnContainerStyle` | Footer slot container. |
| `contentTitleTextStyle` | Title text style. |
| `contentDescTextStyle` | Description text style. |
| `nextBtnTextStyle` | Next button text style. |
| `previousBtnTextStyle` | Previous button text style. |

## Theme Reference

### `ScreenWalkthroughTheme`

```ts
type ScreenWalkthroughTheme = {
  colors: {
    overlay: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    white: string;
    shadow: string;
    highlight: string;
    ripple: string;
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
```

### `defaultTheme`

```ts
const defaultTheme = {
  colors: {
    overlay: 'rgba(6, 15, 24, 0.68)',
    surface: '#FFFFFF',
    textPrimary: '#101828',
    textSecondary: '#667085',
    accent: '#0A9E4A',
    white: '#FFFFFF',
    shadow: '#000000',
    highlight: '#FFFFFF',
    ripple: 'rgba(255, 255, 255, 0.22)',
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
```

### Example theme override

```tsx
<ScreenWalkthrough
  targetRef={targetRef}
  contentTitle="Theme override"
  contentDesc="Use the theme prop to change colors and typography tokens."
  theme={{
    colors: {
      accent: '#D94841',
      surface: '#FFF8F6',
      ripple: 'rgba(217, 72, 65, 0.22)',
    },
    typography: {
      titleSize: 18,
      bodyLineHeight: 24,
    },
  }}
/>
```

### Example ripple override

```tsx
<ScreenWalkthrough
  targetRef={targetRef}
  showRipple
  rippleColor="rgba(34, 197, 94, 0.9)"
/>
```

Notes:

- `rippleColor` only affects the ripple and pulse effect
- action text still uses `theme.colors.accent` by default
- you can also override button text directly with `nextBtnTextStyle` and `previousBtnTextStyle`

## Full Example

```tsx
import React, { useCallback, useRef, useState, type ElementRef } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  ScreenWalkthrough,
  type ScreenWalkthroughRef,
} from '@ladeologun/react-native-walkthrough';

export default function Example() {
  const scrollRef = useRef<ElementRef<typeof ScrollView> | null>(null);
  const firstRef = useRef<View>(null);
  const secondRef = useRef<View>(null);
  const walkthroughRef = useRef<ScreenWalkthroughRef>(null);
  const [step, setStep] = useState<'first' | 'second' | null>('first');

  const targetRef = step === 'first' ? firstRef : secondRef;

  const prepareTarget = useCallback(async () => {
    if (step === 'second') {
      scrollRef.current?.scrollTo({ y: 500, animated: true });
    }
  }, [step]);

  return (
    <SafeAreaProvider>
      <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 24 }}>
        <Pressable ref={firstRef} collapsable={false}>
          <Text>First target</Text>
        </Pressable>

        <View style={{ height: 600 }} />

        <Pressable ref={secondRef} collapsable={false}>
          <Text>Second target</Text>
        </Pressable>

        {step ? (
          <ScreenWalkthrough
            ref={walkthroughRef}
            visible
            targetRef={targetRef}
            targetKey={step}
            contentTitle={step === 'first' ? 'Step one' : 'Step two'}
            contentDesc="You control each step from your own state."
            nextBtnText={step === 'first' ? 'Next' : 'Done'}
            hidePrevious={step === 'first'}
            prepareTarget={prepareTarget}
            prepareTargetDelayMs={320}
            previousBtnText="Back"
            onPrevious={() => setStep('first')}
            onNext={() => setStep(step === 'first' ? 'second' : null)}
            onClose={() => setStep(null)}
          />
        ) : null}
      </ScrollView>
    </SafeAreaProvider>
  );
}
```

## Tips

- use `targetKey` for step changes
- use `prepareTarget` when the target may be off-screen
- call `refreshPosition()` after layout changes
- pass `collapsable={false}` on target views for more reliable measurement
- tune `targetPadding`, `edgePadding`, and `offset` to match your design

## Troubleshooting

### The wrong area is being highlighted

- make sure `targetRef` points to a native host view
- add `collapsable={false}` to the target
- adjust `targetOffsetX` and `targetOffsetY`
- call `refreshPosition()` after layout changes

### The target is inside a scroll view

- use `prepareTarget`
- increase `prepareTargetDelayMs` if the scroll animation needs more time

### The tooltip is too close to the screen edge

- increase `edgePadding`
- reduce `width`
- lower `minWidth`

### The tooltip is too close to the target

- increase `offset`

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
