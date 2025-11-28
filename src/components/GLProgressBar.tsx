import React from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {COLORS, GL_COLOR_MAP} from '../constants';
import {GLSafetyLevel} from '../constants';
import {useTheme} from '../contexts/ThemeContext';

interface GLProgressBarProps {
  currentGL: number;
  targetGL?: number;
  height?: number;
  showLabel?: boolean;
}

const GLProgressBar: React.FC<GLProgressBarProps> = ({
  currentGL,
  targetGL = 80,
  height = 32,
  showLabel = true,
}) => {
  const {theme} = useTheme();
  const progressAnim = React.useRef(new Animated.Value(0)).current;
  const [isOverTarget, setIsOverTarget] = React.useState(false);

  React.useEffect(() => {
    const percentage = Math.min((currentGL / targetGL) * 100, 100);
    setIsOverTarget(currentGL > targetGL);

    Animated.spring(progressAnim, {
      toValue: percentage,
      tension: 50,
      friction: 7,
      useNativeDriver: false,
    }).start();
  }, [currentGL, targetGL]);

  // GL 안전도에 따른 색상 결정
  const getProgressColor = () => {
    if (currentGL <= 10) return GL_COLOR_MAP[GLSafetyLevel.SAFE];
    if (currentGL < 20) return GL_COLOR_MAP[GLSafetyLevel.MODERATE];
    return GL_COLOR_MAP[GLSafetyLevel.HIGH_RISK];
  };

  const progressColor = getProgressColor();
  const backgroundColor = isOverTarget
    ? theme.colors.SURFACE_VARIANT
    : '#F5F5F5'; // 더 밝은 회색 배경

  const widthInterpolate = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text
            style={[
              styles.label,
              {color: theme.colors.TEXT_PRIMARY},
              theme.typography.h5,
            ]}>
            일일 GL: {currentGL} / {targetGL}
          </Text>
          {isOverTarget && (
            <Text
              style={[
                styles.warningText,
                {color: theme.colors.DANGER},
                theme.typography.body1,
              ]}>
              목표 초과! (+{currentGL - targetGL})
            </Text>
          )}
        </View>
      )}
      <View
        style={[
          styles.progressBarContainer,
          {height, backgroundColor},
          isOverTarget && {
            borderWidth: 2,
            borderColor: theme.colors.DANGER,
          },
        ]}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: widthInterpolate,
              backgroundColor: progressColor,
              height,
            },
          ]}
        />
        {!isOverTarget && currentGL > 0 && (
          <View
            style={[
              styles.targetMarker,
              {
                left: '100%',
                backgroundColor: theme.colors.TEXT_SECONDARY,
                opacity: 0.3,
              },
            ]}
          />
        )}
      </View>
      {showLabel && (
        <View style={styles.infoContainer}>
          <Text
            style={[
              styles.infoText,
              {color: theme.colors.TEXT_SECONDARY},
              theme.typography.body2,
            ]}>
            {isOverTarget
              ? `목표보다 ${currentGL - targetGL} 초과`
              : `목표까지 ${targetGL - currentGL} 남음`}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
  },
  warningText: {
    fontWeight: '600',
  },
  progressBarContainer: {
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    borderRadius: 4,
    height: '100%',
  },
  targetMarker: {
    position: 'absolute',
    width: 3,
    height: '100%',
  },
  infoContainer: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  infoText: {
    fontSize: 13,
  },
});

export default GLProgressBar;
