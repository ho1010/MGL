import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated} from 'react-native';

interface ColorTransitionViewProps {
  children: React.ReactNode;
  fromColor: string;
  toColor: string;
  duration?: number;
  style?: any;
}

const ColorTransitionView: React.FC<ColorTransitionViewProps> = ({
  children,
  fromColor,
  toColor,
  duration = 300,
  style,
}) => {
  const colorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(colorAnim, {
      toValue: 1,
      duration,
      useNativeDriver: false,
    }).start();
  }, [toColor, duration]);

  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [fromColor, toColor],
  });

  return (
    <Animated.View style={[styles.container, {backgroundColor}, style]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});

export default ColorTransitionView;

