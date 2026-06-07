import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SG } from '@/constants/colors';

const VISIBLE_MS = 3200;

interface ToastProps {
  message: string | null;
  onHide: () => void;
}

// Toast simples e cross-platform (Android/iOS). Aparece no rodapé,
// some sozinho após alguns segundos e avisa o pai via onHide.
export function Toast({ message, onHide }: ToastProps) {
  const insets = useSafeAreaInsets();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    if (!message) return;

    opacity.value = withTiming(1, { duration: 220 });
    translateY.value = withTiming(0, { duration: 220 });

    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 260 });
      translateY.value = withTiming(20, { duration: 260 }, finished => {
        if (finished) runOnJS(onHide)();
      });
    }, VISIBLE_MS);

    return () => clearTimeout(timer);
  }, [message]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!message) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.toast, { bottom: insets.bottom + 90 }, style]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: SG.surface2,
    borderWidth: 1,
    borderColor: SG.accent,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  text: {
    color: SG.text,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
});
