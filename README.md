# react-native-inapp-tour

A shape-aware React Native in-app tour component for onboarding, guided product education, and spotlight walkthroughs.

## Installation


```sh
npm install react-native-inapp-tour
```

You also need these peer dependencies in your app:

```sh
npm install react-native-reanimated react-native-safe-area-context react-native-svg
```


## Usage


```tsx
import React, { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { InAppTour, type InAppTourRef } from 'react-native-inapp-tour';

export default function Example() {
  const buttonRef = useRef<View>(null);
  const tourRef = useRef<InAppTourRef>(null);
  const [visible, setVisible] = useState(true);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Pressable
        ref={buttonRef}
        style={{ padding: 16, borderRadius: 24, backgroundColor: '#0A9E4A' }}
      >
        <Text style={{ color: '#fff' }}>Tap me</Text>
      </Pressable>

      <InAppTour
        ref={tourRef}
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

## Current capabilities

- shape-aware spotlight cutout
- animated tooltip and target transitions
- safe-area-aware placement
- controlled or imperative open/close usage
- async `prepareTarget` support for scroll-then-highlight flows
- target calibration with `targetOffsetX` and `targetOffsetY`


## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
