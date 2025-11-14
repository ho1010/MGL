import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {GLSafetyLevel} from '../types';
import {GL_COLOR_MAP, COLORS} from '../constants';

interface GLBadgeProps {
  gl: number;
  safetyLevel: GLSafetyLevel;
}

const GLBadge: React.FC<GLBadgeProps> = ({gl, safetyLevel}) => {
  return (
    <View style={[styles.badge, {backgroundColor: GL_COLOR_MAP[safetyLevel]}]}>
      <Text style={styles.glValue}>{gl}</Text>
      <Text style={styles.label}>GL</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  glValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  label: {
    fontSize: 12,
    color: COLORS.WHITE,
    marginTop: 4,
  },
});

export default GLBadge;

