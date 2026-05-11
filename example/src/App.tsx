import { useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type HostInstance,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { InAppTour, type InAppTourRef } from 'react-native-inapp-tour';

export default function App() {
  const primaryTargetRef = useRef<HostInstance | null>(null);
  const secondaryTargetRef = useRef<HostInstance | null>(null);
  const tourRef = useRef<InAppTourRef>(null);
  const [step, setStep] = useState<'primary' | 'secondary' | null>('primary');

  const targetRef = step === 'primary' ? primaryTargetRef : secondaryTargetRef;

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Text style={styles.heading}>react-native-inapp-tour</Text>
        <Text style={styles.subtitle}>
          A smooth in-app spotlight walkthrough for React Native.
        </Text>

        <Pressable
          ref={primaryTargetRef}
          style={styles.primaryButton}
          onPress={() => setStep('primary')}
        >
          <Text style={styles.primaryButtonText}>Start tour</Text>
        </Pressable>

        <View ref={secondaryTargetRef} collapsable={false} style={styles.card}>
          <Text style={styles.cardTitle}>Insights</Text>
          <Text style={styles.cardBody}>
            Use this section for a second guided step to validate motion and
            placement.
          </Text>
        </View>

        {!!step && (
          <InAppTour
            ref={tourRef}
            visible={!!step}
            targetKey={step}
            targetRef={targetRef}
            contentTitle={
              step === 'primary'
                ? 'Kick off the tour'
                : 'Highlight rich content'
            }
            contentDesc={
              step === 'primary'
                ? 'This first target shows how the tour wraps a primary CTA.'
                : 'This second step demonstrates spotlighting a larger content block.'
            }
            hidePrevious={step === 'primary'}
            previousBtnText="Back"
            nextBtnText={step === 'primary' ? 'Next' : 'Done'}
            targetBorderRadius={step === 'primary' ? 999 : 18}
            targetPadding={step === 'primary' ? 2 : 4}
            onPrevious={() => setStep('primary')}
            onNext={() => {
              if (step === 'primary') {
                setStep('secondary');
                return;
              }

              setStep(null);
            }}
            onClose={() => setStep(null)}
            closeOnBackdropPress={false}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F5F7',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#101828',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#667085',
    textAlign: 'center',
    marginBottom: 28,
  },
  primaryButton: {
    backgroundColor: '#0A9E4A',
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 14,
    marginBottom: 32,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
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
});
