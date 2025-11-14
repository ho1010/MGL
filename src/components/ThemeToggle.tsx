import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useTheme} from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const {theme, themeMode, toggleTheme} = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.SURFACE,
          borderColor: theme.colors.DIVIDER,
          ...theme.shadows.sm,
        },
      ]}
      onPress={toggleTheme}
      activeOpacity={0.7}>
      <Icon
        name={themeMode === 'dark' ? 'light-mode' : 'dark-mode'}
        size={24}
        color={theme.colors.PRIMARY}
      />
      <Text style={[styles.text, {color: theme.colors.TEXT_PRIMARY}]}>
        {themeMode === 'dark' ? '라이트 모드' : '다크 모드'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ThemeToggle;

