import { View, StyleSheet, Animated } from "react-native";
import { useEffect, useRef } from "react";

interface WaveformProps {
  style?: any;
  waveColor?: string;
  active?: boolean;
  duration?: number;
}

export function Waveform({
  style,
  waveColor = "#000",
  active = false,
}: WaveformProps) {
  const barHeights = useRef(
    [...Array(20)].map(() => 0.5 + Math.random() * 0.5)
  ).current;
  const animations = useRef(
    barHeights.map(() => new Animated.Value(1))
  ).current;

  useEffect(() => {
    let animationRefs: Animated.CompositeAnimation[] = [];

    if (active) {
      animations.forEach((anim, index) => {
        const delay = index * 50; // 각 막대마다 약간의 딜레이
        const animation = Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1.5,
              duration: 500,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        );
        animationRefs.push(animation);
        animation.start();
      });
    } else {
      // 모든 애니메이션을 정적인 상태로 설정
      animations.forEach((anim) => {
        anim.stopAnimation();
        anim.setValue(1);
      });
    }

    return () => {
      // 모든 애니메이션 중지
      animationRefs.forEach((anim) => anim.stop());
      animations.forEach((anim) => {
        anim.stopAnimation();
        anim.setValue(1);
      });
    };
  }, [active, animations]);

  return (
    <View style={[styles.container, style]}>
      {barHeights.map((height, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              backgroundColor: waveColor,
              transform: [
                {
                  scaleY: animations[i].interpolate({
                    inputRange: [1, 1.5],
                    outputRange: [height, height * 1.5],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 40,
  },
  bar: {
    width: 3,
    height: 20,
    borderRadius: 2,
  },
});
