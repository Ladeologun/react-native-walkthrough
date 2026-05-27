import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  InteractionManager,
  Modal,
  Platform,
  StatusBar,
  View,
  type LayoutChangeEvent,
  type HostInstance,
  useWindowDimensions,
} from 'react-native';
import {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ScreenTour from './components/ScreenTour';
import {
  DEFAULT_CARD_WIDTH,
  DEFAULT_EDGE_PADDING,
  DEFAULT_OFFSET,
  DEFAULT_TARGET_PADDING,
  MIN_FALLBACK_TARGET,
  MODAL_CLOSE_LINGER_MS,
  STEP_TRANSITION_MS,
} from './constants';
import styles from './styles';
import { mergeTheme } from './theme';
import type {
  ScreenWalkthroughProps,
  ScreenWalkthroughRef,
  Rect,
} from './types';
import {
  buildRoundedRectPath,
  clamp,
  getAdaptiveBorderRadius,
  getPaddedTargetRect,
  getTooltipLayout,
} from './utils/geometry';

export type { ScreenWalkthroughProps, ScreenWalkthroughRef } from './types';

const ANDROID_STATUSBAR_OFFSET =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

const ScreenWalkthrough = forwardRef<
  ScreenWalkthroughRef,
  ScreenWalkthroughProps
>(
  (
    {
      children,
      onNext,
      onPrevious,
      onClose,
      visible,
      targetKey,
      contentTitle,
      contentDesc,
      nextBtnText = 'Next',
      previousBtnText = 'Previous',
      hidePrevious = false,
      placement = 'auto',
      backgroundColor,
      width,
      maxWidth = 360,
      minWidth = 280,
      offset = DEFAULT_OFFSET,
      edgePadding = DEFAULT_EDGE_PADDING,
      targetPadding = DEFAULT_TARGET_PADDING,
      targetBorderRadius = 18,
      targetOffsetX = 0,
      targetOffsetY = 0,
      targetRef,
      prepareTarget,
      prepareTargetDelayMs = 260,
      measurementRetryDelayMs = 80,
      measurementRetryCount = 8,
      overlayColor,
      showPulse = true,
      showRipple = false,
      rippleColor,
      closeOnBackdropPress = true,
      disableArrow = false,
      theme,
      renderHeader,
      renderContent,
      renderFooter,
      parentViewStyle,
      parentWrapperStyle,
      childViewStyle,
      tooltipStyle,
      modalContentContainer,
      contentContainerStyle,
      contentContainerHeaderStyle,
      contentContainerDescStyle,
      contentContainerBtnContainerStyle,
      contentTitleTextStyle,
      contentDescTextStyle,
      nextBtnTextStyle,
      previousBtnTextStyle,
    },
    ref
  ) => {
    const resolvedTheme = useMemo(() => mergeTheme(theme), [theme]);
    const wrapperRef = useRef<HostInstance | null>(null);
    const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const retryFrameRef = useRef<number | null>(null);
    const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const prepareSequenceRef = useRef(0);
    const measurementSequenceRef = useRef(0);

    const [internalVisible, setInternalVisible] = useState(false);
    const [shouldRenderModal, setShouldRenderModal] = useState(false);
    const [targetRect, setTargetRect] = useState<Rect | null>(null);
    const [cardHeight, setCardHeight] = useState<number | null>(null);

    const insets = useSafeAreaInsets();
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();

    const cardEntrance = useSharedValue(0);
    const pulse = useSharedValue(0);
    const targetX = useSharedValue(0);
    const targetY = useSharedValue(0);
    const targetWidth = useSharedValue(MIN_FALLBACK_TARGET);
    const targetHeight = useSharedValue(MIN_FALLBACK_TARGET);
    const cardX = useSharedValue(0);
    const cardY = useSharedValue(0);
    const cardMaxHeightValue = useSharedValue(180);
    const arrowX = useSharedValue(0);
    const arrowY = useSharedValue(0);
    const contentMotion = useSharedValue(1);
    const isVisible = visible ?? internalVisible;

    const clearMeasurementRetry = useCallback(() => {
      measurementSequenceRef.current += 1;

      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      if (retryFrameRef.current !== null) {
        cancelAnimationFrame(retryFrameRef.current);
        retryFrameRef.current = null;
      }
    }, []);

    const isRectStable = useCallback((nextRect: Rect, previousRect: Rect) => {
      return (
        Math.abs(nextRect.x - previousRect.x) <= 1 &&
        Math.abs(nextRect.y - previousRect.y) <= 1 &&
        Math.abs(nextRect.width - previousRect.width) <= 1 &&
        Math.abs(nextRect.height - previousRect.height) <= 1
      );
    }, []);

    const clearCloseTimeout = useCallback(() => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    }, []);

    const startPulseAnimation = useCallback(
      (nextVisible: boolean) => {
        cancelAnimation(pulse);

        if (!nextVisible || !showRipple) {
          pulse.value = withTiming(0, { duration: 120 });
          return;
        }

        pulse.value = 0;
        pulse.value = withRepeat(
          withSequence(
            withTiming(1, {
              duration: 1900,
              easing: Easing.out(Easing.cubic),
            }),
            withTiming(0, { duration: 0 })
          ),
          -1,
          false
        );
      },
      [pulse, showRipple]
    );

    const setVisibleWithAnimation = useCallback(
      (nextVisible: boolean) => {
        setInternalVisible(nextVisible);
        cardEntrance.value = withTiming(nextVisible ? 1 : 0, {
          duration: nextVisible ? 280 : 180,
          easing: nextVisible
            ? Easing.out(Easing.cubic)
            : Easing.in(Easing.quad),
        });

        startPulseAnimation(nextVisible);
      },
      [cardEntrance, startPulseAnimation]
    );

    const measureTarget = useCallback(
      (attempt = 0, previousRect?: Rect | null, stabilityPasses = 0) => {
        const measurementTarget = targetRef?.current ?? wrapperRef.current;
        const measurementSequence =
          attempt === 0 && stabilityPasses === 0
            ? measurementSequenceRef.current + 1
            : measurementSequenceRef.current;

        if (attempt === 0 && stabilityPasses === 0) {
          measurementSequenceRef.current = measurementSequence;
        }

        if (!measurementTarget) {
          const retryDelay =
            attempt >= measurementRetryCount
              ? Math.max(320, measurementRetryDelayMs * 4)
              : measurementRetryDelayMs * (attempt + 1);
          const nextAttempt =
            attempt >= measurementRetryCount ? 0 : attempt + 1;

          clearMeasurementRetry();
          retryTimeoutRef.current = setTimeout(() => {
            retryFrameRef.current = requestAnimationFrame(() => {
              measureTarget(nextAttempt, previousRect, stabilityPasses);
            });
          }, retryDelay);
          return;
        }

        measurementTarget.measureInWindow(
          (x: number, y: number, widthValue: number, heightValue: number) => {
            if (measurementSequenceRef.current !== measurementSequence) {
              return;
            }

            const hasUsableDimensions =
              widthValue >= MIN_FALLBACK_TARGET &&
              heightValue >= MIN_FALLBACK_TARGET;

            if (hasUsableDimensions) {
              const nextRect = {
                height: heightValue,
                width: widthValue,
                x,
                y: y + ANDROID_STATUSBAR_OFFSET,
              };
              const nextStabilityPasses =
                previousRect && isRectStable(nextRect, previousRect)
                  ? stabilityPasses + 1
                  : 1;

              if (nextStabilityPasses >= 2) {
                setTargetRect(nextRect);
                return;
              }

              clearMeasurementRetry();
              retryFrameRef.current = requestAnimationFrame(() => {
                measureTarget(attempt, nextRect, nextStabilityPasses);
              });
              return;
            }

            if (attempt >= measurementRetryCount) {
              clearMeasurementRetry();
              retryTimeoutRef.current = setTimeout(
                () => {
                  retryFrameRef.current = requestAnimationFrame(() => {
                    measureTarget(0, previousRect, 0);
                  });
                },
                Math.max(320, measurementRetryDelayMs * 4)
              );
              return;
            }

            clearMeasurementRetry();
            retryTimeoutRef.current = setTimeout(
              () => {
                retryFrameRef.current = requestAnimationFrame(() => {
                  measureTarget(attempt + 1, previousRect, stabilityPasses);
                });
              },
              measurementRetryDelayMs * (attempt + 1)
            );
          }
        );
      },
      [
        clearMeasurementRetry,
        isRectStable,
        measurementRetryCount,
        measurementRetryDelayMs,
        targetRef,
      ]
    );

    const prepareAndMeasureTarget = useCallback(async () => {
      const currentSequence = prepareSequenceRef.current + 1;
      prepareSequenceRef.current = currentSequence;

      try {
        if (prepareTarget) {
          await prepareTarget();
        }

        if (prepareTargetDelayMs > 0) {
          await new Promise<void>((resolve) => {
            setTimeout(() => {
              resolve();
            }, prepareTargetDelayMs);
          });
        }

        await new Promise<void>((resolve) => {
          InteractionManager.runAfterInteractions(() => {
            resolve();
          });
        });
      } catch {
        return;
      }

      if (prepareSequenceRef.current !== currentSequence) {
        return;
      }

      requestAnimationFrame(() => {
        if (prepareSequenceRef.current !== currentSequence) {
          return;
        }

        measureTarget();
      });
    }, [measureTarget, prepareTarget, prepareTargetDelayMs]);

    const queueTargetMeasurement = useCallback(() => {
      prepareAndMeasureTarget().catch(() => undefined);
    }, [prepareAndMeasureTarget]);

    const open = useCallback(() => {
      clearCloseTimeout();
      setShouldRenderModal(true);
      setInternalVisible(true);
      setVisibleWithAnimation(true);
      queueTargetMeasurement();
    }, [clearCloseTimeout, queueTargetMeasurement, setVisibleWithAnimation]);

    const close = useCallback(() => {
      prepareSequenceRef.current += 1;
      clearMeasurementRetry();
      setInternalVisible(false);
      setVisibleWithAnimation(false);
      clearCloseTimeout();
      closeTimeoutRef.current = setTimeout(() => {
        setShouldRenderModal(false);
      }, MODAL_CLOSE_LINGER_MS);
      onClose?.();
    }, [
      clearCloseTimeout,
      clearMeasurementRetry,
      onClose,
      setVisibleWithAnimation,
    ]);

    const refreshPosition = useCallback(() => {
      if (isVisible) {
        requestAnimationFrame(() => {
          measureTarget();
        });
      }
    }, [isVisible, measureTarget]);

    useImperativeHandle(
      ref,
      () => ({
        close,
        measureTarget: () => {
          measureTarget();
        },
        open,
        refreshPosition,
      }),
      [close, measureTarget, open, refreshPosition]
    );

    useEffect(() => {
      if (visible === undefined) {
        return;
      }

      if (visible) {
        clearCloseTimeout();
        setShouldRenderModal(true);
        setVisibleWithAnimation(true);
        queueTargetMeasurement();
        return;
      }

      clearMeasurementRetry();
      prepareSequenceRef.current += 1;
      setVisibleWithAnimation(false);
      clearCloseTimeout();
      closeTimeoutRef.current = setTimeout(() => {
        setShouldRenderModal(false);
      }, MODAL_CLOSE_LINGER_MS);
    }, [
      clearCloseTimeout,
      clearMeasurementRetry,
      queueTargetMeasurement,
      setVisibleWithAnimation,
      visible,
    ]);

    useEffect(() => {
      return () => {
        clearMeasurementRetry();
        clearCloseTimeout();
      };
    }, [clearCloseTimeout, clearMeasurementRetry]);

    useEffect(() => {
      refreshPosition();
    }, [
      screenHeight,
      screenWidth,
      refreshPosition,
      targetKey,
      targetRef,
      isVisible,
    ]);

    useEffect(() => {
      if (!isVisible || !shouldRenderModal) {
        return;
      }

      queueTargetMeasurement();
    }, [isVisible, queueTargetMeasurement, shouldRenderModal, targetKey]);

    useEffect(() => {
      if (!isVisible || !shouldRenderModal) {
        return;
      }

      startPulseAnimation(true);
    }, [isVisible, shouldRenderModal, startPulseAnimation, targetKey]);

    const fallbackTargetRect = useMemo<Rect>(
      () => ({
        height: MIN_FALLBACK_TARGET,
        width: MIN_FALLBACK_TARGET,
        x: screenWidth / 2 - 1,
        y: screenHeight / 2 - 1,
      }),
      [screenHeight, screenWidth]
    );

    const activeTargetRect = targetRect ?? fallbackTargetRect;
    const paddedTarget = useMemo(
      () =>
        getPaddedTargetRect(activeTargetRect, {
          edgePadding,
          screenHeight,
          screenWidth,
          targetOffsetX,
          targetOffsetY,
          targetPadding,
        }),
      [
        activeTargetRect,
        edgePadding,
        screenHeight,
        screenWidth,
        targetOffsetX,
        targetOffsetY,
        targetPadding,
      ]
    );

    const resolvedTargetBorderRadius = useMemo(() => {
      if (typeof targetBorderRadius === 'number') {
        return targetBorderRadius;
      }

      return getAdaptiveBorderRadius(paddedTarget.width, paddedTarget.height);
    }, [paddedTarget.height, paddedTarget.width, targetBorderRadius]);

    const rippleScaleConfig = useMemo(() => {
      const baseSize = Math.max(
        paddedTarget.width,
        paddedTarget.height,
        MIN_FALLBACK_TARGET
      );
      const toScale = (outset: number, min: number, max: number) =>
        clamp(1 + (outset * 2) / baseSize, min, max);

      return {
        pulse: {
          start: toScale(2, 1.02, 1.08),
          end: toScale(10, 1.1, 1.28),
        },
        inner: {
          start: toScale(5, 1.05, 1.16),
          end: toScale(12, 1.12, 1.34),
        },
        mid: {
          start: toScale(8, 1.08, 1.22),
          end: toScale(16, 1.16, 1.44),
        },
        outer: {
          start: toScale(11, 1.12, 1.28),
          end: toScale(20, 1.22, 1.56),
        },
      };
    }, [paddedTarget.height, paddedTarget.width]);

    const computedCardWidth = useMemo(() => {
      const preferredWidth = width ?? DEFAULT_CARD_WIDTH;
      const upperBound = Math.min(maxWidth, screenWidth - edgePadding * 2);

      return clamp(preferredWidth, Math.min(minWidth, upperBound), upperBound);
    }, [edgePadding, maxWidth, minWidth, screenWidth, width]);

    const {
      arrowCenterX,
      cardLeft,
      cardTop,
      effectiveCardHeight,
      maxCardHeight,
      resolvedPlacement,
    } = useMemo(
      () =>
        getTooltipLayout({
          cardHeight: cardHeight ?? undefined,
          cardWidth: computedCardWidth,
          edgePadding,
          insets,
          offset,
          paddedTarget,
          placement,
          screenHeight,
          screenWidth,
        }),
      [
        computedCardWidth,
        cardHeight,
        edgePadding,
        insets,
        offset,
        paddedTarget,
        placement,
        screenHeight,
        screenWidth,
      ]
    );

    useEffect(() => {
      if (!shouldRenderModal) {
        return;
      }

      const animationConfig = {
        duration: STEP_TRANSITION_MS,
        easing: Easing.out(Easing.cubic),
      };

      targetX.value = withTiming(paddedTarget.x, animationConfig);
      targetY.value = withTiming(paddedTarget.y, animationConfig);
      targetWidth.value = withTiming(paddedTarget.width, animationConfig);
      targetHeight.value = withTiming(paddedTarget.height, animationConfig);
      cardX.value = withTiming(cardLeft, animationConfig);
      cardY.value = withTiming(cardTop, animationConfig);
      cardMaxHeightValue.value = withTiming(maxCardHeight, animationConfig);
      arrowX.value = withTiming(cardLeft + arrowCenterX, animationConfig);
      arrowY.value = withTiming(
        resolvedPlacement === 'bottom'
          ? cardTop - 21
          : cardTop - 1 + effectiveCardHeight,
        animationConfig
      );
    }, [
      arrowCenterX,
      arrowX,
      arrowY,
      cardLeft,
      cardMaxHeightValue,
      cardTop,
      cardX,
      cardY,
      effectiveCardHeight,
      maxCardHeight,
      paddedTarget.height,
      paddedTarget.width,
      paddedTarget.x,
      paddedTarget.y,
      resolvedPlacement,
      shouldRenderModal,
      targetHeight,
      targetWidth,
      targetX,
      targetY,
    ]);

    useEffect(() => {
      if (!isVisible || !shouldRenderModal) {
        return;
      }

      contentMotion.value = 0;
      contentMotion.value = withTiming(1, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      });
    }, [
      contentDesc,
      contentMotion,
      contentTitle,
      hidePrevious,
      isVisible,
      nextBtnText,
      previousBtnText,
      shouldRenderModal,
    ]);

    const cardAnimatedStyle = useAnimatedStyle(
      () => ({
        opacity: cardEntrance.value,
        transform: [
          {
            translateY: interpolate(
              cardEntrance.value,
              [0, 1],
              [resolvedPlacement === 'bottom' ? -10 : 10, 0]
            ),
          },
          {
            scale: interpolate(cardEntrance.value, [0, 1], [0.96, 1]),
          },
        ],
      }),
      [resolvedPlacement]
    );

    const ringAnimatedStyle = useAnimatedStyle(() => ({
      opacity: interpolate(cardEntrance.value, [0, 1], [0, 1]),
      transform: [
        { scale: interpolate(cardEntrance.value, [0, 1], [0.94, 1]) },
      ],
    }));

    const pulseAnimatedStyle = useAnimatedStyle(
      () => ({
        opacity:
          showRipple && showPulse
            ? interpolate(pulse.value, [0, 0.08, 0.55, 1], [0, 0.82, 0.46, 0])
            : 0,
        transform: [
          {
            scale: interpolate(
              pulse.value,
              [0, 1],
              [rippleScaleConfig.pulse.start, rippleScaleConfig.pulse.end]
            ),
          },
        ],
      }),
      [rippleScaleConfig.pulse.end, rippleScaleConfig.pulse.start]
    );

    const smokeRippleInnerAnimatedStyle = useAnimatedStyle(
      () => ({
        opacity: showRipple
          ? interpolate(pulse.value, [0, 0.1, 0.62, 1], [0, 0.58, 0.36, 0])
          : 0,
        transform: [
          {
            scale: interpolate(
              pulse.value,
              [0, 1],
              [rippleScaleConfig.inner.start, rippleScaleConfig.inner.end]
            ),
          },
        ],
      }),
      [rippleScaleConfig.inner.end, rippleScaleConfig.inner.start]
    );

    const smokeRippleMidAnimatedStyle = useAnimatedStyle(
      () => ({
        opacity: showRipple
          ? interpolate(pulse.value, [0, 0.16, 0.72, 1], [0, 0.44, 0.24, 0])
          : 0,
        transform: [
          {
            scale: interpolate(
              pulse.value,
              [0, 1],
              [rippleScaleConfig.mid.start, rippleScaleConfig.mid.end]
            ),
          },
        ],
      }),
      [rippleScaleConfig.mid.end, rippleScaleConfig.mid.start]
    );

    const smokeRippleOuterAnimatedStyle = useAnimatedStyle(
      () => ({
        opacity: showRipple
          ? interpolate(pulse.value, [0, 0.22, 0.82, 1], [0, 0.34, 0.16, 0])
          : 0,
        transform: [
          {
            scale: interpolate(
              pulse.value,
              [0, 1],
              [rippleScaleConfig.outer.start, rippleScaleConfig.outer.end]
            ),
          },
        ],
      }),
      [rippleScaleConfig.outer.end, rippleScaleConfig.outer.start]
    );

    const contentAnimatedStyle = useAnimatedStyle(() => ({
      opacity: interpolate(contentMotion.value, [0, 1], [0.72, 1]),
      transform: [
        {
          translateY: interpolate(contentMotion.value, [0, 1], [10, 0]),
        },
      ],
    }));

    const highlightPositionAnimatedStyle = useAnimatedStyle(() => ({
      height: targetHeight.value,
      left: targetX.value,
      top: targetY.value,
      width: targetWidth.value,
    }));

    const arrowPositionAnimatedStyle = useAnimatedStyle(() => ({
      left: arrowX.value,
      top: arrowY.value,
    }));

    const holeAnimatedProps = useAnimatedProps(() => {
      const holePath = buildRoundedRectPath(
        targetX.value,
        targetY.value,
        targetWidth.value,
        targetHeight.value,
        resolvedTargetBorderRadius
      );

      return {
        d: holePath,
      };
    }, [resolvedTargetBorderRadius, screenHeight, screenWidth]);

    const cardPositionAnimatedStyle = useAnimatedStyle(() => ({
      left: cardX.value,
      maxHeight: cardMaxHeightValue.value,
      top: cardY.value,
    }));

    const handleCardLayout = useCallback((event: LayoutChangeEvent) => {
      const nextHeight = event.nativeEvent.layout.height;

      setCardHeight((currentHeight) => {
        if (
          currentHeight !== null &&
          Math.abs(currentHeight - nextHeight) < 1
        ) {
          return currentHeight;
        }

        return nextHeight;
      });
    }, []);

    const closeIfAllowed = useCallback(() => {
      if (closeOnBackdropPress) {
        close();
      }
    }, [close, closeOnBackdropPress]);

    const hasMeasuredTarget = targetRect !== null;
    const tourBackgroundColor = backgroundColor ?? resolvedTheme.colors.surface;
    const tourOverlayColor = overlayColor ?? resolvedTheme.colors.overlay;
    const resolvedRippleColor = rippleColor ?? resolvedTheme.colors.ripple;

    return (
      <>
        {children ? (
          <View
            ref={wrapperRef}
            collapsable={false}
            onLayout={refreshPosition}
            style={[styles.wrapper, parentWrapperStyle, parentViewStyle]}
          >
            <View collapsable={false} style={childViewStyle}>
              {children}
            </View>
          </View>
        ) : null}

        <Modal
          animationType="none"
          onRequestClose={close}
          statusBarTranslucent
          transparent
          visible={shouldRenderModal}
        >
          <View style={styles.modalRoot}>
            <ScreenTour.Backdrop
              hasTarget={hasMeasuredTarget}
              height={screenHeight}
              holeAnimatedProps={holeAnimatedProps}
              onPress={closeIfAllowed}
              overlayColor={tourOverlayColor}
              width={screenWidth}
            />

            {hasMeasuredTarget ? (
              <ScreenTour.Highlight
                borderRadius={resolvedTargetBorderRadius}
                highlightStyle={highlightPositionAnimatedStyle}
                pulseStyle={pulseAnimatedStyle}
                pulseTintColor={resolvedRippleColor}
                ringStyle={ringAnimatedStyle}
                smokeStyles={[
                  smokeRippleInnerAnimatedStyle,
                  smokeRippleMidAnimatedStyle,
                  smokeRippleOuterAnimatedStyle,
                ]}
                smokeTintColor={resolvedRippleColor}
                tintColor={resolvedTheme.colors.highlight}
              />
            ) : null}

            <ScreenTour.Arrow
              backgroundColor={tourBackgroundColor}
              disabled={disableArrow || !hasMeasuredTarget}
              entranceStyle={cardAnimatedStyle}
              placement={resolvedPlacement}
              positionStyle={arrowPositionAnimatedStyle}
              shadowColor={resolvedTheme.colors.shadow}
            />

            <ScreenTour
              backgroundColor={tourBackgroundColor}
              contentAnimatedStyle={contentAnimatedStyle}
              entranceStyle={cardAnimatedStyle}
              onLayout={handleCardLayout}
              positionStyle={cardPositionAnimatedStyle}
              shadowColor={resolvedTheme.colors.shadow}
              style={[tooltipStyle, modalContentContainer]}
              width={computedCardWidth}
            >
              <ScreenTour.Header
                render={renderHeader}
                style={contentContainerHeaderStyle}
              />

              <ScreenTour.Content
                description={contentDesc}
                descriptionTextStyle={contentDescTextStyle}
                render={renderContent}
                style={[contentContainerStyle, contentContainerDescStyle]}
                theme={resolvedTheme}
                title={contentTitle}
                titleTextStyle={contentTitleTextStyle}
              />

              <ScreenTour.Footer
                hidePrevious={hidePrevious}
                nextText={nextBtnText}
                nextTextStyle={nextBtnTextStyle}
                onNext={onNext}
                onPrevious={onPrevious}
                previousText={previousBtnText}
                previousTextStyle={previousBtnTextStyle}
                render={renderFooter}
                style={contentContainerBtnContainerStyle}
                theme={resolvedTheme}
              />
            </ScreenTour>
          </View>
        </Modal>
      </>
    );
  }
);

export default ScreenWalkthrough;
