import { useCallback, useMemo, useRef, useState, type ElementRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type HostInstance,
  type LayoutChangeEvent,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { InAppTour, type InAppTourRef } from 'react-native-inapp-tour';

type StepKey =
  | 'heroBadge'
  | 'settingsFab'
  | 'primaryCta'
  | 'insightsCard'
  | 'metricRow'
  | 'bottomBanner';

type StepConfig = {
  description: string;
  nextText: string;
  placement?: 'auto' | 'top' | 'bottom';
  targetBorderRadius: number;
  targetPadding: number;
  title: string;
};

const STEP_ORDER: StepKey[] = [
  'heroBadge',
  'settingsFab',
  'primaryCta',
  'insightsCard',
  'metricRow',
  'bottomBanner',
];

const STEP_CONFIG: Record<StepKey, StepConfig> = {
  heroBadge: {
    title: 'Start near the top',
    description:
      'This compact badge helps test how the tour behaves close to the safe area.',
    nextText: 'Next',
    placement: 'bottom',
    targetBorderRadius: 999,
    targetPadding: 4,
  },
  settingsFab: {
    title: 'Highlight floating actions',
    description:
      'This step validates a small circular target anchored near the top-right edge.',
    nextText: 'Next',
    placement: 'bottom',
    targetBorderRadius: 999,
    targetPadding: 8,
  },
  primaryCta: {
    title: 'Wrap your main CTA',
    description:
      'Buttons are a common first-run target, so this step checks spacing around a rounded control.',
    nextText: 'Next',
    targetBorderRadius: 999,
    targetPadding: 4,
  },
  insightsCard: {
    title: 'Highlight rich content',
    description:
      'This larger card is useful for validating the tooltip distance when space gets tight.',
    nextText: 'Next',
    targetBorderRadius: 22,
    targetPadding: 6,
  },
  metricRow: {
    title: 'Handle wide horizontal groups',
    description:
      'This step battle-tests a wider target that spans across the layout instead of a single control.',
    nextText: 'Next',
    targetBorderRadius: 18,
    targetPadding: 6,
  },
  bottomBanner: {
    title: 'Finish at the bottom',
    description:
      'Ending on a lower section helps verify scroll preparation and placement near the home indicator.',
    nextText: 'Done',
    targetBorderRadius: 26,
    targetPadding: 6,
  },
};

export default function App() {
  const scrollRef = useRef<ElementRef<typeof ScrollView> | null>(null);
  const heroBadgeRef = useRef<HostInstance | null>(null);
  const settingsFabRef = useRef<HostInstance | null>(null);
  const primaryCtaRef = useRef<HostInstance | null>(null);
  const insightsCardRef = useRef<HostInstance | null>(null);
  const metricRowRef = useRef<HostInstance | null>(null);
  const bottomBannerRef = useRef<HostInstance | null>(null);
  const tourRef = useRef<InAppTourRef>(null);
  const sectionOffsetsRef = useRef<Record<StepKey, number>>({
    heroBadge: 0,
    settingsFab: 0,
    primaryCta: 0,
    insightsCard: 0,
    metricRow: 0,
    bottomBanner: 0,
  });
  const [step, setStep] = useState<StepKey | null>(null);

  const registerSection = (key: StepKey) => (event: LayoutChangeEvent) => {
    sectionOffsetsRef.current[key] = event.nativeEvent.layout.y;
  };

  const prepareTarget = useCallback(async () => {
    if (!step) {
      return;
    }

    const y = Math.max(sectionOffsetsRef.current[step] - 140, 0);

    scrollRef.current?.scrollTo({
      y,
      animated: true,
    });
  }, [step]);

  const targetRef = useMemo(() => {
    switch (step) {
      case 'heroBadge':
        return heroBadgeRef;
      case 'settingsFab':
        return settingsFabRef;
      case 'primaryCta':
        return primaryCtaRef;
      case 'insightsCard':
        return insightsCardRef;
      case 'metricRow':
        return metricRowRef;
      case 'bottomBanner':
        return bottomBannerRef;
      default:
        return heroBadgeRef;
    }
  }, [step]);

  const stepConfig = step ? STEP_CONFIG[step] : null;

  const goToNextStep = useCallback(() => {
    if (!step) {
      return;
    }

    const currentIndex = STEP_ORDER.indexOf(step);
    const nextStep = STEP_ORDER[currentIndex + 1];

    setStep(nextStep ?? null);
  }, [step]);

  const goToPreviousStep = useCallback(() => {
    if (!step) {
      return;
    }

    const currentIndex = STEP_ORDER.indexOf(step);
    const previousStep = STEP_ORDER[currentIndex - 1];

    setStep(previousStep ?? step);
  }, [step]);

  return (
    <SafeAreaProvider>
      <View style={styles.screen}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View
            onLayout={registerSection('heroBadge')}
            style={styles.heroSection}
          >
            <View
              ref={heroBadgeRef}
              collapsable={false}
              style={styles.heroBadge}
            >
              <Text style={styles.heroBadgeText}>New onboarding flow</Text>
            </View>

            <Pressable
              ref={settingsFabRef}
              collapsable={false}
              style={styles.settingsFab}
              onPress={() => setStep('settingsFab')}
            >
              <Text style={styles.settingsFabIcon}>⚙</Text>
            </Pressable>

            <Text style={styles.heading}>react-native-inapp-tour</Text>
            <Text style={styles.subtitle}>
              A smooth in-app spotlight walkthrough for React Native, now with
              more varied example targets.
            </Text>
          </View>

          <View
            onLayout={registerSection('primaryCta')}
            style={styles.centerSection}
          >
            <Pressable
              ref={primaryCtaRef}
              collapsable={false}
              style={styles.primaryButton}
              onPress={() => setStep('heroBadge')}
            >
              <Text style={styles.primaryButtonText}>Start battle test</Text>
            </Pressable>
          </View>

          <View
            ref={insightsCardRef}
            collapsable={false}
            onLayout={registerSection('insightsCard')}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Insights</Text>
            <Text style={styles.cardBody}>
              Use this section for a second guided step to validate motion,
              placement, and content wrapping across a wider target.
            </Text>
          </View>

          <View
            ref={metricRowRef}
            collapsable={false}
            onLayout={registerSection('metricRow')}
            style={styles.metricRow}
          >
            <View style={styles.metricTile}>
              <Text style={styles.metricValue}>18%</Text>
              <Text style={styles.metricLabel}>Faster setup</Text>
            </View>
            <View style={styles.metricTile}>
              <Text style={styles.metricValue}>4.9</Text>
              <Text style={styles.metricLabel}>User rating</Text>
            </View>
            <View style={styles.metricTile}>
              <Text style={styles.metricValue}>12k</Text>
              <Text style={styles.metricLabel}>Active tours</Text>
            </View>
          </View>

          <View
            ref={bottomBannerRef}
            collapsable={false}
            onLayout={registerSection('bottomBanner')}
            style={styles.bottomBanner}
          >
            <Text style={styles.bottomBannerEyebrow}>Final checkpoint</Text>
            <Text style={styles.bottomBannerTitle}>
              Bottom anchored content
            </Text>
            <Text style={styles.bottomBannerBody}>
              Keep this section near the bottom to test arrow placement and
              scroll preparation on smaller screens.
            </Text>
          </View>
        </ScrollView>

        {!!step && stepConfig ? (
          <InAppTour
            ref={tourRef}
            visible
            closeOnBackdropPress={false}
            contentDesc={stepConfig.description}
            contentTitle={stepConfig.title}
            hidePrevious={step === STEP_ORDER[0]}
            nextBtnText={stepConfig.nextText}
            onClose={() => setStep(null)}
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
            placement={stepConfig.placement ?? 'auto'}
            prepareTarget={prepareTarget}
            prepareTargetDelayMs={320}
            previousBtnText="Back"
            targetBorderRadius={stepConfig.targetBorderRadius}
            targetKey={step}
            targetPadding={stepConfig.targetPadding}
            targetRef={targetRef}
          />
        ) : null}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F5F7',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 140,
  },
  heroSection: {
    position: 'relative',
    minHeight: 240,
    alignItems: 'center',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#D9FBE8',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 28,
  },
  heroBadgeText: {
    color: '#067647',
    fontSize: 13,
    fontWeight: '700',
  },
  settingsFab: {
    position: 'absolute',
    top: 8,
    right: 0,
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: '#1683FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 8,
  },
  settingsFabIcon: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#101828',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: '#667085',
    textAlign: 'center',
    maxWidth: 320,
  },
  centerSection: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 36,
  },
  primaryButton: {
    backgroundColor: '#0A9E4A',
    borderRadius: 999,
    paddingHorizontal: 26,
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 28,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#101828',
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 24,
    color: '#667085',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  metricTile: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 14,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  metricValue: {
    color: '#101828',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  metricLabel: {
    color: '#667085',
    fontSize: 13,
    lineHeight: 18,
  },
  bottomBanner: {
    backgroundColor: '#101828',
    borderRadius: 28,
    padding: 24,
    minHeight: 200,
  },
  bottomBannerEyebrow: {
    color: '#98A2B3',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  bottomBannerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
  },
  bottomBannerBody: {
    color: '#D0D5DD',
    fontSize: 15,
    lineHeight: 24,
  },
});
