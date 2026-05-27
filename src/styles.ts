import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
  },
  modalRoot: {
    flex: 1,
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  highlightRing: {
    position: 'absolute',
    borderWidth: 1.5,
    backgroundColor: 'transparent',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 5,
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 2.5,
    backgroundColor: 'transparent',
    borderCurve: 'continuous',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.42,
    shadowRadius: 18,
    elevation: 6,
  },
  smokeRipple: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderCurve: 'continuous',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.34,
    shadowRadius: 26,
    elevation: 5,
  },
  smokeRippleInner: {
    borderWidth: 2.5,
  },
  smokeRippleMid: {
    borderWidth: 3.5,
  },
  smokeRippleOuter: {
    borderWidth: 4.5,
  },
  card: {
    position: 'absolute',
    borderRadius: 12,
    paddingTop: 12,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 14,
  },
  cardInner: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  headerSlot: {
    paddingHorizontal: 12,
    paddingBottom: 6,
  },
  bodyScrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  contentTitle: {
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
  },
  footerAlignEnd: {
    justifyContent: 'flex-end',
  },
  button: {
    minHeight: 36,
    paddingHorizontal: 4,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
  },
  primaryButton: {
    backgroundColor: 'transparent',
  },
  arrow: {
    position: 'absolute',
    width: 24,
    height: 22,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  fallbackBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default styles;
