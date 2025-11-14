import React, {useEffect, useRef} from 'react';
import {Text, StyleSheet, Animated} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';

interface AnimatedGLValueProps {
  value: number;
  style?: any;
  size?: 'large' | 'medium' | 'small';
}

const AnimatedGLValue: React.FC<AnimatedGLValueProps> = ({
  value,
  style,
  size = 'large',
}) => {
  const {theme} = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 숫자 카운팅 애니메이션
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(animatedValue, {
          toValue: value,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [value]);

  const fontSize = size === 'large' ? 64 : size === 'medium' ? 48 : 36;
  const fontWeight = 'bold';

  const displayValue = animatedValue.interpolate({
    inputRange: [0, value],
    outputRange: [0, value],
  });

  return (
    <Animated.Text
      style={[
        styles.text,
        {
          fontSize,
          fontWeight,
          color: theme.colors.TEXT_PRIMARY,
          transform: [{scale: scaleAnim}],
        },
        style,
      ]}>
      {Math.round(displayValue as any)}
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
  },
});

export default AnimatedGLValue;

