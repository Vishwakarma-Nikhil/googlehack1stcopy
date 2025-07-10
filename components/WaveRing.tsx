import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

const WaveRing = ({ delay = 0 }) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const timeout = setTimeout(() => {
      scale.value = withRepeat(
        withTiming(2, {
          duration: 2000,
          easing: Easing.out(Easing.quad),
        }),
        -1,
        false
      );

      opacity.value = withRepeat(
        withTiming(0, {
          duration: 2000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    }, delay);

    return () => clearTimeout(timeout);
  }, []);

  const ringStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return <Animated.View style={[styles.ring, ringStyle]} />;
};

const styles = StyleSheet.create({
  ring: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: "#00A8E1",
  },
});

export default WaveRing;
