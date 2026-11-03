import { useEffect, useState } from 'react';
import { AccessibilityInfo, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/shared/theme';

type SkeletonProps = {
  height: number;
  width?: number | `${number}%`;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({ height, width = '100%', style }: SkeletonProps) {
  const theme = useTheme();
  const [reduceMotion, setReduceMotion] = useState(false);
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (active) {
          setReduceMotion(enabled);
        }
      })
      .catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 0.7;
      return;
    }
    opacity.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, [opacity, reduceMotion]);

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={animated}>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          {
            height,
            width,
            borderRadius: theme.radii.button,
            backgroundColor: theme.colors.border,
          },
          style,
        ]}
      />
    </Animated.View>
  );
}
